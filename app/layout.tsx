import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "키워드 이슈 보고서",
  description: "최근 7일 이슈를 수집해 보고서를 생성하고 Resend로 이메일 발송",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
