import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are WINi, an expert sommelier AI with deep knowledge of wines worldwide.
Respond ONLY in valid JSON format with this exact structure:
{
  "name": "Wine name",
  "type": "red|white|rosé|sparkling",
  "region": "Region",
  "appellation": "Specific appellation",
  "grape": "Grape variety/varieties",
  "vintage": "Vintage year if known",
  "tasting_notes": "Concise tasting notes: key aromas, palate character, finish (1 sentence, max 25 words)",
  "origin_story": "One punchy sentence about this wine's origin or what makes it distinctive (max 25 words)",
  "food_pairings": ["Pairing 1", "Pairing 2", "Pairing 3"]
}
IMPORTANT: Keep tasting_notes and origin_story SHORT — one sentence each, punchy and essential. No filler.`;

export async function POST(request: NextRequest) {
  try {
    const { wineName, wineType, grape, region } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Tell me about this wine: ${wineName}. Type: ${wineType || "unknown"}. Grape: ${grape || "unknown"}. Region: ${region || "unknown"}.`,
        },
      ],
    });

    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, responseText];
    const jsonStr = jsonMatch[1]?.trim() || responseText.trim();

    const data = JSON.parse(jsonStr);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Wine info error:", error);
    return NextResponse.json(
      { error: "Failed to get wine info" },
      { status: 500 }
    );
  }
}
