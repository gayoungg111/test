import { GoogleGenAI } from "@google/genai";

import { env } from "@/lib/env";
import type { ReportData } from "@/types/report";

const SYSTEM_PROMPT = `당신은 뉴스·이슈 분석 전문가입니다.
Google Search로 수집한 최근 정보를 근거로 보고서를 작성하세요.
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
- 최근 7일 이내 이슈만 다루세요.
- Google Search 결과에 없는 내용을 지어내지 마세요.
- 중복 이슈는 하나로 통합하세요.
- issues는 중요도 순으로 최대 10개까지 작성하세요.`;

function parseReportJson(text: string): Partial<ReportData> {
  try {
    return JSON.parse(text) as Partial<ReportData>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Gemini 응답을 JSON으로 파싱하지 못했습니다.");
    }
    return JSON.parse(match[0]) as Partial<ReportData>;
  }
}

export async function generateReport(keywords: string[]): Promise<ReportData> {
  const apiKey = env.geminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const userPrompt = `키워드: ${keywords.join(", ")}\n분석 기간: 최근 7일\nGoogle Search로 최신 뉴스·이슈를 검색한 뒤 보고서를 작성하세요.`;

  const response = await ai.models.generateContent({
    model: env.geminiModel(),
    contents: `${SYSTEM_PROMPT}\n\n${userPrompt}`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini가 빈 응답을 반환했습니다.");
  }

  const parsed = parseReportJson(text);

  return {
    title: parsed.title || `최근 7일 ${keywords.join("·")} 이슈 보고서`,
    summary: parsed.summary || "",
    issues: (parsed.issues || []).map((issue) => ({
      title: issue.title || "",
      date: issue.date || "",
      source: issue.source || "",
      url: issue.url || "",
      summary: issue.summary || "",
    })),
    insights: parsed.insights || "",
  };
}
