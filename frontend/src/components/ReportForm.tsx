import { FormEvent, KeyboardEvent, useState } from "react";
import { createReport, ReportResponse } from "../api/client";

interface ReportFormProps {
  onSuccess: (report: ReportResponse) => void;
  onError: (message: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function ReportForm({
  onSuccess,
  onError,
  onLoadingChange,
}: ReportFormProps) {
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendEmail, setSendEmail] = useState(true);

  const addKeyword = () => {
    const value = keywordInput.trim();
    if (!value || keywords.includes(value) || keywords.length >= 10) {
      return;
    }
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
    onError("");

    if (keywords.length === 0) {
      onError("키워드를 1개 이상 추가해 주세요.");
      return;
    }

    if (!recipientEmail.trim()) {
      onError("수신 이메일을 입력해 주세요.");
      return;
    }

    onLoadingChange(true);
    try {
      const report = await createReport({
        keywords,
        recipient_email: recipientEmail.trim(),
        send_email: sendEmail,
      });
      onSuccess(report);
    } catch (error) {
      onError(error instanceof Error ? error.message : "요청에 실패했습니다.");
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2 style={{ marginTop: 0 }}>보고서 생성</h2>

      <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
        키워드
      </label>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          onKeyDown={handleKeywordKeyDown}
          placeholder="예: AI 규제"
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
          }}
        />
        <button
          type="button"
          onClick={addKeyword}
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: 8,
            background: "#e5e7eb",
            cursor: "pointer",
          }}
        >
          추가
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {keywords.map((keyword) => (
          <span
            key={keyword}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              background: "#eff6ff",
              color: "#1d4ed8",
              borderRadius: 999,
              fontSize: 14,
            }}
          >
            {keyword}
            <button
              type="button"
              onClick={() => removeKeyword(keyword)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#1d4ed8",
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
        수신 이메일
      </label>
      <input
        type="email"
        value={recipientEmail}
        onChange={(event) => setRecipientEmail(event.target.value)}
        placeholder="user@example.com"
        required
        style={{
          width: "100%",
          padding: "10px 12px",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          marginBottom: 16,
        }}
      />

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={sendEmail}
          onChange={(event) => setSendEmail(event.target.checked)}
        />
        생성 후 이메일 발송
      </label>

      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px 16px",
          border: "none",
          borderRadius: 8,
          background: "#2563eb",
          color: "#ffffff",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        보고서 생성
      </button>
    </form>
  );
}
