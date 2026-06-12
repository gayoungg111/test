from fastapi import APIRouter, HTTPException

from app.models.schemas import ReportRequest, ReportResponse
from app.services.email_service import EmailService
from app.services.report_service import ReportService
from app.services.search_service import SearchService

router = APIRouter(prefix="/api/reports", tags=["reports"])

search_service = SearchService()
report_service = ReportService()
email_service = EmailService()


@router.post("", response_model=ReportResponse)
async def create_report(request: ReportRequest) -> ReportResponse:
    keywords = [keyword.strip() for keyword in request.keywords if keyword.strip()]
    if not keywords:
        raise HTTPException(status_code=400, detail="키워드를 1개 이상 입력해 주세요.")

    try:
        search_results = await search_service.search_keywords(keywords, days=7)
        report = await report_service.generate_report(keywords, search_results)

        if request.send_email:
            email_sent = await email_service.send_report(
                recipient_email=request.recipient_email,
                subject=report.title,
                html_content=report.html_content,
                report_id=str(report.report_id),
            )
            report.email_sent = email_sent

        return report
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"보고서 생성 중 오류: {exc}") from exc
