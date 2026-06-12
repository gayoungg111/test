import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    async def send_report(
        self,
        recipient_email: str,
        subject: str,
        html_content: str,
        report_id: str,
    ) -> bool:
        settings.output_dir.mkdir(parents=True, exist_ok=True)
        output_path = settings.output_dir / f"{report_id}.html"
        output_path.write_text(html_content, encoding="utf-8")
        logger.info("보고서 저장: %s", output_path)

        if not settings.smtp_enabled:
            logger.info(
                "SMTP 비활성화 — 이메일 미발송 (수신: %s, 제목: %s)",
                recipient_email,
                subject,
            )
            return False

        if not settings.smtp_user or not settings.smtp_password:
            raise ValueError("SMTP 설정(SMTP_USER, SMTP_PASSWORD)이 필요합니다.")

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.smtp_from or settings.smtp_user
        message["To"] = recipient_email
        message.attach(MIMEText(html_content, "html", "utf-8"))

        try:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.sendmail(message["From"], recipient_email, message.as_string())
            logger.info("이메일 발송 완료: %s", recipient_email)
            return True
        except smtplib.SMTPException as exc:
            logger.exception("이메일 발송 실패")
            raise RuntimeError(f"이메일 발송에 실패했습니다: {exc}") from exc
