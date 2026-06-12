import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { sendReportEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { generateReport } from "@/lib/gemini";
import { renderReportHtml } from "@/lib/report-html";

export const maxDuration = 60;

interface ReportRequest {
  keywords: string[];
  recipient_email: string;
  send_email?: boolean;
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

    if (!body.recipient_email?.trim()) {
      return NextResponse.json(
        { detail: "수신 이메일을 입력해 주세요." },
        { status: 400 },
      );
    }

    const report = await generateReport(keywords);
    const generatedAt = new Date().toISOString();
    const htmlContent = renderReportHtml(report, keywords, generatedAt);

    let emailSent = false;
    if (body.send_email !== false) {
      emailSent = await sendReportEmail(
        body.recipient_email.trim(),
        report.title,
        htmlContent,
      );
    }

    return NextResponse.json({
      report_id: randomUUID(),
      title: report.title,
      generated_at: generatedAt,
      summary: report.summary,
      issues: report.issues,
      insights: report.insights,
      html_content: htmlContent,
      email_sent: emailSent,
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
    resend_api_key_configured: Boolean(process.env.RESEND_API_KEY || process.env.resend_api_key),
    resend_from_configured: Boolean(process.env.RESEND_FROM_EMAIL || process.env.resend_from_email),
  });
}
