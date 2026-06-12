import type { ReportData } from "@/types/report";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderReportHtml(
  report: ReportData,
  keywords: string[],
  generatedAt: string,
): string {
  const keywordText = keywords.join(", ");

  const issuesHtml =
    report.issues.length > 0
      ? report.issues
          .map(
            (issue) => `
        <div style="margin-bottom: 20px; padding: 20px; border: 1px solid #e6dfd8; border-radius: 12px; background: #f5f0e8;">
          <h3 style="margin: 0 0 8px; color: #141413; font-size: 16px; font-weight: 500;">${escapeHtml(issue.title)}</h3>
          <p style="margin: 0 0 8px; color: #6c6a64; font-size: 13px;">${escapeHtml(issue.date)} · ${escapeHtml(issue.source)}</p>
          <p style="margin: 0 0 8px; color: #3d3d3a; line-height: 1.55;">${escapeHtml(issue.summary)}</p>
          ${issue.url ? `<a href="${escapeHtml(issue.url)}" style="color: #cc785c; font-size: 13px; font-weight: 500; text-decoration: none;">원문 보기</a>` : ""}
        </div>`,
          )
          .join("")
      : '<p style="color: #6c6a64;">수집된 이슈가 없습니다.</p>';

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>${escapeHtml(report.title)}</title></head>
<body style="font-family: Inter, sans-serif; background: #faf9f5; margin: 0; padding: 32px 20px;">
  <div style="max-width: 720px; margin: 0 auto; background: #efe9de; border: 1px solid #e6dfd8; border-radius: 12px; padding: 32px;">
    <p style="margin: 0 0 8px; color: #6c6a64; font-size: 13px;">키워드: ${escapeHtml(keywordText)} · 생성: ${generatedAt}</p>
    <h1 style="margin: 0 0 24px; color: #141413; font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400;">${escapeHtml(report.title)}</h1>
    <section style="margin-bottom: 28px;">
      <h2 style="margin: 0 0 12px; font-size: 18px;">요약</h2>
      <p style="margin: 0; color: #3d3d3a; line-height: 1.55;">${escapeHtml(report.summary)}</p>
    </section>
    <section style="margin-bottom: 28px;">
      <h2 style="margin: 0 0 12px; font-size: 18px;">주요 이슈</h2>
      ${issuesHtml}
    </section>
    <section style="padding: 24px; background: #181715; border-radius: 12px;">
      <h2 style="margin: 0 0 12px; color: #faf9f5; font-size: 18px;">트렌드 및 시사점</h2>
      <p style="margin: 0; color: #a09d96; line-height: 1.55;">${escapeHtml(report.insights)}</p>
    </section>
  </div>
</body>
</html>`;
}
