import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { generateReport } from "@/lib/gemini";
import { env } from "@/lib/env";
import { renderReportHtml } from "@/lib/report-html";

export const maxDuration = 60;

interface ReportRequest {
  keywords: string[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReportRequest;
    const keywords = (body.keywords || [])
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    if (keywords.length === 0) {
      return NextResponse.json(
        { detail: "키워드를 1개 이상 입력해 주세요." },
        { status: 400 },
      );
    }

    const report = await generateReport(keywords);
    const generatedAt = new Date().toISOString();
    const htmlContent = renderReportHtml(report, keywords, generatedAt);

    return NextResponse.json({
      report_id: randomUUID(),
      title: report.title,
      generated_at: generatedAt,
      summary: report.summary,
      issues: report.issues,
      insights: report.insights,
      html_content: htmlContent,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "보고서 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "issue-report-nextjs",
    search_provider: "google_search",
    gemini_model: env.geminiModel(),
    gemini_api_key_configured: Boolean(process.env.GEMINI_API_KEY || process.env.gemini_api_key),
  });
}
