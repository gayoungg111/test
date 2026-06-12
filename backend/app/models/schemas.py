from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class ReportRequest(BaseModel):
    keywords: list[str] = Field(..., min_length=1, max_length=10)
    recipient_email: EmailStr
    send_email: bool = True


class IssueItem(BaseModel):
    title: str
    date: str
    source: str
    url: str
    summary: str


class ReportData(BaseModel):
    title: str
    summary: str
    issues: list[IssueItem]
    insights: str


class ReportResponse(BaseModel):
    report_id: UUID
    title: str
    generated_at: datetime
    summary: str
    issues: list[IssueItem]
    insights: str
    html_content: str
    email_sent: bool
