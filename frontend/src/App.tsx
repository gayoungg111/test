import { useState } from "react";
import { ReportResponse } from "./api/client";
import ReportForm from "./components/ReportForm";
import ReportPreview from "./components/ReportPreview";
import "./App.css";

function App() {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSuccess = (nextReport: ReportResponse) => {
    setReport(nextReport);
    setError("");
    if (nextReport.email_sent) {
      setSuccess("보고서가 생성되었고 이메일이 발송되었습니다.");
    } else {
      setSuccess(
        "보고서가 생성되었습니다. SMTP가 비활성화되어 이메일은 발송되지 않았습니다.",
      );
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>키워드 이슈 보고서</h1>
        <p>최근 7일 이내 이슈를 수집해 보고서를 생성하고 이메일로 발송합니다.</p>
        <p style={{ marginTop: 12, fontSize: 14 }}>
          <a href="/service-check.html" style={{ color: "#2563eb", marginRight: 16 }}>
            서비스 확인 페이지
          </a>
          <a href="/sample-report.html" style={{ color: "#2563eb" }}>
            샘플 보고서 HTML
          </a>
        </p>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {loading && (
        <div className="card" style={{ marginBottom: 16 }}>
          <strong>처리 중...</strong>
          <p style={{ margin: "8px 0 0", color: "#6b7280" }}>
            이슈 수집 → 보고서 생성 → 이메일 발송 순으로 진행됩니다. (10~30초 소요)
          </p>
        </div>
      )}

      <div className="layout">
        <ReportForm
          onSuccess={handleSuccess}
          onError={setError}
          onLoadingChange={(nextLoading) => {
            setLoading(nextLoading);
            if (nextLoading) {
              setSuccess("");
              setError("");
            }
          }}
        />
        <ReportPreview report={report} />
      </div>
    </div>
  );
}

export default App;
