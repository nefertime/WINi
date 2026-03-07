import { NextResponse } from "next/server";
import { getConfiguredProviders } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ providers: getConfiguredProviders() });
}
