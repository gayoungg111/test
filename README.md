# 키워드 이슈 보고서 + 이메일 발송 서비스

키워드를 입력하면 **최근 7일** 이내 이슈를 Tavily Search로 수집하고, **Gemini API**로 보고서를 생성한 뒤 SMTP로 이메일을 발송하는 웹 서비스입니다.

## 기능

- 키워드(복수) 입력 및 태그 관리
- Tavily Search API로 최근 7일 이슈 수집
- Gemini로 한국어 보고서 생성 (요약, 주요 이슈, 시사점)
- HTML 보고서 미리보기
- SMTP 이메일 발송 (개발 모드에서는 파일 저장만)
- Vercel 배포 지원 (환경 변수로 API 키 관리)

## 사전 준비

- Python 3.11+
- Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/apikey)
- [Tavily API Key](https://tavily.com/)
- (선택) Gmail SMTP 앱 비밀번호

## Vercel 배포 (권장)

1. GitHub 저장소를 Vercel에 연결
2. Vercel 대시보드 → **Settings → Environment Variables**에 아래 값 추가

| 변수 | 설명 |
|------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 |
| `GEMINI_MODEL` | (선택) 기본값 `gemini-2.0-flash` |
| `TAVILY_API_KEY` | Tavily Search API 키 |
| `SMTP_ENABLED` | `true` / `false` |
| `SMTP_HOST` | 예: `smtp.gmail.com` |
| `SMTP_PORT` | 예: `587` |
| `SMTP_USER` | SMTP 계정 |
| `SMTP_PASSWORD` | SMTP 앱 비밀번호 |
| `SMTP_FROM` | 발신 이메일 |

3. Deploy 실행

Vercel에서는 프론트엔드와 Python API(`/api`)가 같은 도메인에서 동작하므로, 프론트엔드용 `VITE_*` 환경 변수는 **필수가 아닙니다**. API 키는 서버리스 함수에서만 사용됩니다.

## 로컬 개발 설정

```bash
cd backend
copy .env.example .env
```

`.env` 파일 예시:

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
TAVILY_API_KEY=tvly-...

SMTP_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=app-password
SMTP_FROM=your@gmail.com
```

`SMTP_ENABLED=false`이면 이메일은 발송하지 않고 `backend/output/`에 HTML 파일만 저장합니다.

## 로컬 실행

### 백엔드

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

- UI: http://localhost:5173
- Vite 프록시가 `/api` 요청을 백엔드(8000)로 전달합니다.

## API

### `POST /api/reports`

요청:

```json
{
  "keywords": ["AI 규제", "반도체"],
  "recipient_email": "user@example.com",
  "send_email": true
}
```

응답:

```json
{
  "report_id": "uuid",
  "title": "최근 7일 AI 규제·반도체 이슈 보고서",
  "generated_at": "2026-06-12T...",
  "summary": "...",
  "issues": [],
  "insights": "...",
  "html_content": "<html>...</html>",
  "email_sent": true
}
```

## 프로젝트 구조

```
api/
  index.py              # Vercel serverless entry (Mangum)
  requirements.txt
backend/
  app/
    main.py
    config.py
    models/schemas.py
    routers/report.py
    services/
      search_service.py
      report_service.py   # Gemini API
      email_service.py
frontend/
  src/
    App.tsx
    api/client.ts
    components/
vercel.json
```

## Gmail SMTP 설정

1. Google 계정에서 2단계 인증 활성화
2. 앱 비밀번호 생성
3. Vercel(또는 `.env`)에 `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` 설정
4. `SMTP_ENABLED=true`로 변경

## 문제 해결

- `GEMINI_API_KEY가 설정되지 않았습니다`: Vercel 환경 변수 또는 `.env`에 Gemini 키 추가
- `TAVILY_API_KEY가 설정되지 않았습니다`: Vercel 환경 변수 또는 `.env`에 Tavily 키 추가
- 이메일 미발송: `SMTP_ENABLED=false` 상태이거나 SMTP 자격 증명 확인
- Vercel 배포 후 404: `vercel.json`의 `/api` rewrite 설정 확인
