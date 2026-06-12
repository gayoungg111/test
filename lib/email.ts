import { Resend } from "resend";

import { env } from "@/lib/env";

export async function sendReportEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const apiKey = env.resendApiKey();
  const from = env.resendFrom();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY가 설정되지 않았습니다.");
  }

  if (!from) {
    throw new Error("RESEND_FROM_EMAIL이 설정되지 않았습니다.");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`이메일 발송 실패: ${error.message}`);
  }

  return true;
}
