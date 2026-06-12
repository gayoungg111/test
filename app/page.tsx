"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";

import type { ReportResponse } from "@/types/report";

export default function HomePage() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [email, setEmail] = useState("");
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

    if (!email.trim()) {
      alert("수신 이메일을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords,
          recipient_email: email.trim(),
          send_email: true,
        }),
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
        <p>최근 7일 이내 이슈를 수집해 보고서를 생성하고 Resend로 이메일 발송합니다.</p>
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

            <label htmlFor="emailInput">수신 이메일</label>
            <input
              id="emailInput"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@example.com"
              required
            />

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "생성 및 발송 중..." : "보고서 생성 및 이메일 발송"}
            </button>
          </form>

          {report && (
            <div ref={resultsRef} className="results-section visible">
              <h3 className="results-title">{report.title}</h3>
              <p className="results-meta">
                생성 시각: {new Date(report.generated_at).toLocaleString("ko-KR")}
                {report.email_sent ? " · 이메일 발송 완료" : " · 이메일 미발송"}
              </p>

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
          Next.js + Gemini + Resend · 최근 7일 이슈 수집
        </div>
      </footer>
    </>
  );
}
