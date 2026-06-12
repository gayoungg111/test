# 키워드 이슈 보고서 + 이메일 발송 서비스

Next.js + Gemini(Google Search) + Resend로 최근 7일 이슈 보고서를 생성하고 이메일로 발송합니다.

## 기술 스택

- **Next.js 15** — UI + API Routes
- **Gemini API** — Google Search grounding으로 최근 이슈 수집·보고서 생성
- **Resend** — 이메일 발송
- **Vercel** — 배포

## Vercel 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `gemini_api_key` 또는 `GEMINI_API_KEY` | ✅ | Google Gemini API 키 |
| `resend_api_key` 또는 `RESEND_API_KEY` | ✅ | [Resend](https://resend.com) API 키 |
| `RESEND_FROM_EMAIL` 또는 `resend_from_email` | ✅ | 발신 이메일 (Resend에 등록된 도메인) |
| `GEMINI_MODEL` | | 기본값 `gemini-2.0-flash` |

참고: [`vercel.env.example`](vercel.env.example)

## 로컬 실행

```bash
npm install
npm run dev
```

- UI: http://localhost:3000
- API: http://localhost:3000/api/reports

## API

### `GET /api/reports`

환경 변수 설정 상태 확인

### `POST /api/reports`

```json
{
  "keywords": ["AI 규제"],
  "recipient_email": "user@example.com",
  "send_email": true
}
```

## 프로젝트 구조

```
app/
  page.tsx              # 메인 UI
  api/reports/route.ts  # 보고서 생성 + Resend 발송
lib/
  gemini.ts             # Gemini + Google Search
  email.ts              # Resend
  report-html.ts        # HTML 렌더링
```

## Resend 설정

1. [resend.com](https://resend.com)에서 API 키 발급
2. 도메인 인증 또는 테스트용 `onboarding@resend.dev` 사용
3. Vercel에 `RESEND_API_KEY`, `RESEND_FROM_EMAIL` 등록 후 Redeploy

## 참고

- `backend/`, `api/`, `index.html`은 이전 Python 버전(레거시)입니다.
- 현재 Vercel 배포는 **Next.js**를 사용합니다.
