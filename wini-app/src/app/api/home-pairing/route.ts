import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";
import { parseBody } from "@/lib/validation";

const homePairingSchema = z.object({
  text: z.string().max(500),
  images: z.array(z.string().max(10_000_000)).max(10).optional(),
});

const SYSTEM_PROMPT = `You are WINi, an expert sommelier AI specializing in wine recommendations for home cooking and dining without a wine list.

The user is either cooking at home or dining somewhere without a wine list. Suggest real wines available from Finnish and European retailers (alko.fi, vivino.com, viinilehti.fi, viinikellari.com).

Respond in the SAME language as the user's input (or menu photos). Include a top-level "language" field.

Respond ONLY in valid JSON with this structure:
{
  "language": "en",
  "dishes": [{"id": "d1", "name": "...", "description": "...", "category": "meat|fish|vegetarian|pasta|dessert|appetizer|salad|soup|other"}],
  "otherDishes": [],
  "wines": [{"id": "w1", "name": "...", "type": "red|white|rosé|sparkling", "grape": "...", "region": "...", "vintage": "...", "price_estimate": "€15-25"}],
  "pairings": [{"dish_id": "d1", "wine_id": "w1", "score": 0.95, "reason": "Brief 1-2 sentence reason", "detailed_reason": "Detailed 2-3 sentence explanation", "label": "best_pick|value_pick|wild_one"}]
}

DISH EXTRACTION:
- If the user provides food menu photos (without wine list), extract the most wine-interesting dishes (up to 5).
- If the user types a dish name, use that as the dish.
- Dish names: max 4-5 words (under 40 characters).

WINE RECOMMENDATIONS:
- Suggest REAL wines that are actually available from retail stores.
- Include "price_estimate" on each wine (e.g., "€12-18", "€25-35").
- Prefer wines available at Alko (Finnish state liquor store) or major European retailers.
- Be specific: exact producer name, grape, region, vintage when possible.
- Do not invent fictional wines.

PAIRING MATRIX — Based on the number of dishes:
- 1 dish: up to 5 wines
- 2 dishes: up to 4 wines per dish
- 3 dishes: up to 3 wines per dish
- 4-5 dishes: up to 2 wines per dish

PAIRING LABELS — Assign a label to each pairing:
- "best_pick": Top wine for pure taste match. Exactly 1 per dish. Required.
- "value_pick": Best taste-to-price ratio. 0 or 1 per dish. Recommended for home cooking since prices are known.
- "wild_one": Adventurous/unexpected pairing. 0 or 1 per dish.

QUALITY OVER QUANTITY:
- Only recommend wines you would score ≥ 0.85.
- Every dish must have at least 1 wine pairing.
- Fewer great picks > many decent ones.

WINE DEDUPLICATION:
- If the same wine pairs with multiple dishes, include it ONCE in wines array.
- Create separate pairing entries for each dish-wine combination.

Keep it concise. Short dish descriptions (under 12 words). Reasons 1-2 sentences.`;

export async function POST(request: NextRequest) {
  try {
    const rateLimited = await checkRateLimit("home-pairing", getClientIp(request));
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const parsed = parseBody(homePairingSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { text, images } = parsed.data;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

    // Add food menu images if provided (no wine list)
    if (images) {
      for (const img of images) {
        const match = img.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/);
        if (match) {
          content.push({
            type: "image",
            source: {
              type: "base64",
              media_type: match[1] as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: match[2],
            },
          });
        }
      }
    }

    if (text) {
      content.push({ type: "text", text: `User says: "${text}"` });
    }

    const hasImages = content.some((block) => block.type === "image");
    content.push({
      type: "text",
      text: hasImages
        ? "Analyze these food menu photos (no wine list available). Suggest real wines from retail stores. Return ONLY the JSON object."
        : "Based on my dish description, suggest real wines available from retail stores. Return ONLY the JSON object.",
    });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    if (message.stop_reason === "max_tokens") {
      return NextResponse.json(
        { error: "Response too long — try fewer dishes" },
        { status: 422 }
      );
    }

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    let jsonStr = responseText.trim();
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    if (!jsonStr.startsWith("{")) {
      const braceStart = jsonStr.indexOf("{");
      if (braceStart !== -1) jsonStr = jsonStr.slice(braceStart);
    }

    const data = JSON.parse(jsonStr);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Home pairing error:", error);
    return NextResponse.json(
      { error: "Failed to generate home pairing" },
      { status: 500 }
    );
  }
}
