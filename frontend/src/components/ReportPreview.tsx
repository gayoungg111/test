import { ReportResponse } from "../api/client";

interface ReportPreviewProps {
  report: ReportResponse | null;
}

export default function ReportPreview({ report }: ReportPreviewProps) {
  if (!report) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>보고서 미리보기</h2>
        <p style={{ color: "#6b7280", marginBottom: 0 }}>
          키워드를 입력하고 보고서를 생성하면 결과가 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>보고서 미리보기</h2>
      <p style={{ color: "#6b7280", marginTop: 0 }}>
        생성 시각: {new Date(report.generated_at).toLocaleString("ko-KR")}
      </p>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        <iframe
          title="report-preview"
          srcDoc={report.html_content}
          style={{ width: "100%", minHeight: 720, border: "none" }}
        />
      </div>
    </div>
  );
}
