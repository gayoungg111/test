export interface IssueItem {
  title: string;
  date: string;
  source: string;
  url: string;
  summary: string;
}

export interface ReportData {
  title: string;
  summary: string;
  issues: IssueItem[];
  insights: string;
}

export interface ReportResponse extends ReportData {
  report_id: string;
  generated_at: string;
  html_content: string;
  email_sent: boolean;
}
