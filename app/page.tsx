"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";

import type { ReportResponse } from "@/types/report";

function buildPlainText(report: ReportResponse): string {
  const lines = [
    report.title,
    "",
    `[요약]`,
    report.summary,
    "",
    `[주요 이슈]`,
    ...report.issues.map(
      (issue, index) =>
        `${index + 1}. ${issue.title}\n   ${issue.date} · ${issue.source}\n   ${issue.summary}${issue.url ? `\n   ${issue.url}` : ""}`,
    ),
    "",
    `[트렌드 및 시사점]`,
    report.insights,
  ];
  return lines.join("\n");
}

export default function HomePage() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const addKeyword = () => {
    const value = keywordInput.trim();
    if (!value || keywords.includes(value) || keywords.length >= 10) return;
    setKeywords((prev) => [...prev, value]);
    setKeywordInput("");
  };

  const removeKeyword = (target: string) => {
    setKeywords((prev) => prev.filter((keyword) => keyword !== target));
  };

  const handleKeywordKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addKeyword();
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (keywords.length === 0) {
      alert("키워드를 1개 이상 추가해 주세요.");
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "보고서 생성에 실패했습니다.");
      }

      setReport(data as ReportResponse);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const downloadHtml = () => {
    if (!report) return;
    const blob = new Blob([report.html_content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `issue-report-${report.report_id.slice(0, 8)}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyText = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(buildPlainText(report));
      alert("보고서 내용을 클립보드에 복사했습니다.");
    } catch {
      alert("복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
    }
  };

  return (
    <>
      <nav className="top-nav">
        <div className="brand">
          <svg className="brand-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span>Issue Report</span>
        </div>
        <span className="badge-coral">Beta</span>
      </nav>

      <header className="hero">
        <span className="badge-coral badge-muted">Weekly Brief</span>
        <h1>키워드 이슈 보고서</h1>
        <p>Gemini API로 최근 7일 이내 이슈를 분석해 보고서를 생성합니다.</p>
      </header>

      <main className="app">
        <section className="feature-card">
          <h2 className="card-title">보고서 생성</h2>

          <form onSubmit={handleSubmit}>
            <label htmlFor="keywordInput">키워드</label>
            <div className="row">
              <input
                id="keywordInput"
                type="text"
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder="예: AI 규제"
              />
              <button className="btn-secondary" type="button" onClick={addKeyword}>
                추가
              </button>
            </div>

            <div className="tags">
              {keywords.map((keyword) => (
                <span className="tag" key={keyword}>
                  {keyword}
                  <button type="button" onClick={() => removeKeyword(keyword)} aria-label="remove">
                    ×
                  </button>
                </span>
              ))}
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "보고서 생성 중..." : "보고서 생성"}
            </button>
          </form>

          {report && (
            <div ref={resultsRef} className="results-section visible">
              <h3 className="results-title">{report.title}</h3>
              <p className="results-meta">
                생성 시각: {new Date(report.generated_at).toLocaleString("ko-KR")}
              </p>

              <div className="results-actions">
                <button className="btn-secondary" type="button" onClick={downloadHtml}>
                  HTML 다운로드
                </button>
                <button className="btn-secondary" type="button" onClick={copyText}>
                  텍스트 복사
                </button>
              </div>

              <div className="results-summary">
                <h3>요약</h3>
                <p>{report.summary || "요약 정보가 없습니다."}</p>
              </div>

              <div className="results-issues">
                <h3>주요 이슈</h3>
                <div className="issue-list">
                  {report.issues.length > 0 ? (
                    report.issues.map((issue, index) => (
                      <article className="issue-item" key={`${issue.title}-${index}`}>
                        <h4>{issue.title}</h4>
                        <p className="issue-meta">
                          {issue.date} · {issue.source}
                        </p>
                        <p>{issue.summary}</p>
                        {issue.url ? (
                          <a href={issue.url} target="_blank" rel="noopener noreferrer">
                            원문 보기
                          </a>
                        ) : null}
                      </article>
                    ))
                  ) : (
                    <p style={{ margin: 0, color: "var(--muted)" }}>수집된 이슈가 없습니다.</p>
                  )}
                </div>
              </div>

              <div className="results-insights">
                <h3>트렌드 및 시사점</h3>
                <p>{report.insights || "시사점 정보가 없습니다."}</p>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <strong>키워드 이슈 보고서 서비스</strong>
          Next.js + Gemini API · 최근 7일 이슈 분석
        </div>
      </footer>
    </>
  );
}
