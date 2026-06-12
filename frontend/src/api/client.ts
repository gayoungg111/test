export interface IssueItem {
  title: string;
  date: string;
  source: string;
  url: string;
  summary: string;
}

export interface ReportRequest {
  keywords: string[];
  recipient_email: string;
  send_email: boolean;
}

export interface ReportResponse {
  report_id: string;
  title: string;
  generated_at: string;
  summary: string;
  issues: IssueItem[];
  insights: string;
  html_content: string;
  email_sent: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function createReport(
  payload: ReportRequest,
): Promise<ReportResponse> {
  const response = await fetch(`${API_BASE}/api/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : "보고서 생성에 실패했습니다.";
    throw new Error(detail);
  }

  return data as ReportResponse;
}
