import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { translateSchema, parseBody } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `You are a precise JSON translator. Translate the wine pairing JSON to English.

Rules:
- Translate all dish names, descriptions, reasons, and detailed_reasons to English
- Keep proper noun wine names unchanged (e.g., "Chateau Margaux" stays as-is)
- Keep wine regions, grapes, and vintages unchanged
- Maintain the EXACT JSON structure — same keys, same IDs, same scores
- Set "language" to "en"
- Return ONLY valid JSON, no other text`;

export async function POST(request: NextRequest) {
  try {
    const rateLimited = await checkRateLimit("aiGeneral", getClientIp(request));
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const parsed = parseBody(translateSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { data, sourceLanguage } = parsed.data;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Translate this wine pairing JSON from ${sourceLanguage} to English. Return ONLY the JSON object.\n\n${JSON.stringify(data)}`,
        },
      ],
    });

    if (message.stop_reason === "max_tokens") {
      console.error("Translate: response truncated (max_tokens reached)");
      return NextResponse.json(
        { error: "Translation too long" },
        { status: 422 }
      );
    }

    const responseText = message.content
      .filter(
        (block): block is Anthropic.TextBlock => block.type === "text"
      )
      .map((block) => block.text)
      .join("");

    let jsonStr = responseText.trim();
    jsonStr = jsonStr
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    if (!jsonStr.startsWith("{")) {
      const braceStart = jsonStr.indexOf("{");
      if (braceStart !== -1) jsonStr = jsonStr.slice(braceStart);
    }

    const translated = JSON.parse(jsonStr);
    translated.language = "en";
    return NextResponse.json(translated);
  } catch (error) {
    console.error("Translate error:", error);
    return NextResponse.json(
      { error: "Failed to translate" },
      { status: 500 }
    );
  }
}
