import asyncio
import json
from datetime import datetime, timezone
from html import escape
from uuid import uuid4

from google import genai
from google.genai import types

from app.config import settings
from app.models.schemas import IssueItem, ReportData, ReportResponse
from app.services.search_service import SearchResult


class ReportService:
    SYSTEM_PROMPT = """당신은 뉴스·이슈 분석 전문가입니다.
제공된 검색 결과만을 근거로 최근 이슈 보고서를 작성하세요.
반드시 JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요.

JSON 스키마:
{
  "title": "보고서 제목 (한국어)",
  "summary": "전체 요약 (3~5문장, 한국어)",
  "issues": [
    {
      "title": "이슈 제목",
      "date": "YYYY-MM-DD 또는 원문 날짜",
      "source": "출처",
      "url": "원문 URL",
      "summary": "핵심 내용 2~3문장"
    }
  ],
  "insights": "트렌드 및 시사점 (2~4문장, 한국어)"
}

규칙:
- 검색 결과에 없는 내용을 지어내지 마세요.
- 중복 이슈는 하나로 통합하세요.
- issues는 중요도 순으로 최대 10개까지 작성하세요."""

    def _get_client(self) -> genai.Client:
        return genai.Client(api_key=settings.gemini_api_key)

    async def generate_report(
        self,
        keywords: list[str],
        search_results: list[SearchResult],
    ) -> ReportResponse:
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY가 설정되지 않았습니다.")

        if not search_results:
            report_data = ReportData(
                title=f"최근 7일 {'·'.join(keywords)} 이슈 보고서",
                summary="최근 7일 이내 해당 키워드와 관련된 검색 결과를 찾지 못했습니다.",
                issues=[],
                insights="다른 키워드로 다시 시도해 보세요.",
            )
        else:
            report_data = await self._generate_with_llm(keywords, search_results)

        html_content = self._render_html(report_data, keywords)
        return ReportResponse(
            report_id=uuid4(),
            title=report_data.title,
            generated_at=datetime.now(timezone.utc),
            summary=report_data.summary,
            issues=report_data.issues,
            insights=report_data.insights,
            html_content=html_content,
            email_sent=False,
        )

    async def _generate_with_llm(
        self,
        keywords: list[str],
        search_results: list[SearchResult],
    ) -> ReportData:
        articles_text = "\n\n".join(
            f"[{idx}] 키워드: {item.keyword}\n"
            f"제목: {item.title}\n"
            f"날짜: {item.published_date}\n"
            f"출처: {item.source}\n"
            f"URL: {item.url}\n"
            f"내용: {item.content}"
            for idx, item in enumerate(search_results, start=1)
        )

        user_prompt = (
            f"키워드: {', '.join(keywords)}\n"
            f"분석 기간: 최근 7일\n\n"
            f"검색 결과:\n{articles_text}"
        )
        prompt = f"{self.SYSTEM_PROMPT}\n\n{user_prompt}"

        def _call_gemini() -> str:
            client = self._get_client()
            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3,
                ),
            )
            return response.text or "{}"

        content = await asyncio.to_thread(_call_gemini)
        parsed = json.loads(content)

        issues = [
            IssueItem(
                title=item.get("title", ""),
                date=item.get("date", ""),
                source=item.get("source", ""),
                url=item.get("url", ""),
                summary=item.get("summary", ""),
            )
            for item in parsed.get("issues", [])
        ]

        return ReportData(
            title=parsed.get("title", f"최근 7일 {'·'.join(keywords)} 이슈 보고서"),
            summary=parsed.get("summary", ""),
            issues=issues,
            insights=parsed.get("insights", ""),
        )

    def _render_html(self, report: ReportData, keywords: list[str]) -> str:
        keyword_text = ", ".join(keywords)
        generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        issues_html = ""
        if report.issues:
            issue_blocks = []
            for issue in report.issues:
                issue_blocks.append(
                    f"""
                    <div style="margin-bottom: 20px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h3 style="margin: 0 0 8px; color: #111827; font-size: 16px;">{escape(issue.title)}</h3>
                        <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">
                            {escape(issue.date)} · {escape(issue.source)}
                        </p>
                        <p style="margin: 0 0 8px; color: #374151; line-height: 1.6;">{escape(issue.summary)}</p>
                        <a href="{escape(issue.url)}" style="color: #2563eb; font-size: 13px;">원문 보기</a>
                    </div>
                    """
                )
            issues_html = "".join(issue_blocks)
        else:
            issues_html = '<p style="color: #6b7280;">수집된 이슈가 없습니다.</p>'

        return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>{escape(report.title)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
  <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">키워드: {escape(keyword_text)} · 생성: {generated_at}</p>
    <h1 style="margin: 0 0 24px; color: #111827; font-size: 24px;">{escape(report.title)}</h1>

    <section style="margin-bottom: 28px;">
      <h2 style="margin: 0 0 12px; color: #111827; font-size: 18px;">요약</h2>
      <p style="margin: 0; color: #374151; line-height: 1.7;">{escape(report.summary)}</p>
    </section>

    <section style="margin-bottom: 28px;">
      <h2 style="margin: 0 0 12px; color: #111827; font-size: 18px;">주요 이슈</h2>
      {issues_html}
    </section>

    <section>
      <h2 style="margin: 0 0 12px; color: #111827; font-size: 18px;">트렌드 및 시사점</h2>
      <p style="margin: 0; color: #374151; line-height: 1.7;">{escape(report.insights)}</p>
    </section>
  </div>
</body>
</html>"""
