import { NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "issue-report-nextjs",
    search_provider: "google_search",
    gemini_model: env.geminiModel(),
    gemini_api_key_configured: Boolean(
      process.env.GEMINI_API_KEY || process.env.gemini_api_key,
    ),
  });
}
