# 키워드 이슈 보고서 + 이메일 발송 서비스

키워드를 입력하면 **최근 7일** 이내 이슈를 Tavily Search로 수집하고, **Gemini API**로 보고서를 생성한 뒤 SMTP로 이메일을 발송하는 웹 서비스입니다.

## 기능

- 키워드(복수) 입력 및 태그 관리
- Tavily Search API로 최근 7일 이슈 수집
- Gemini로 한국어 보고서 생성 (요약, 주요 이슈, 시사점)
- HTML 보고서 미리보기
- SMTP 이메일 발송
- Vercel 배포 + **Vercel 환경 변수로만** API 키 관리

## 사전 준비

- [Google Gemini API Key](https://aistudio.google.com/apikey)
- [Tavily API Key](https://tavily.com/)
- [Vercel](https://vercel.com) 계정
- GitHub 저장소: https://github.com/gayoungg111/test

## Vercel 환경 변수 설정 (필수)

모든 API 키와 SMTP 설정은 **Vercel Dashboard**에서만 관리합니다.  
로컬 `.env` 파일은 사용하지 않습니다.

1. Vercel에서 GitHub 저장소 `gayoungg111/test` Import
2. **Settings → Environment Variables** 이동
3. 아래 변수 등록 (Production / Preview / Development 모두 체크)

| 변수 | 필수 | 설명 |
|------|------|------|
| `GEMINI_API_KEY` | ✅ | Google Gemini API 키 |
| `TAVILY_API_KEY` | ✅ | Tavily Search API 키 |
| `GEMINI_MODEL` | | 기본값 `gemini-2.0-flash` |
| `SMTP_ENABLED` | | `true` / `false` (기본 `false`) |
| `SMTP_HOST` | | 예: `smtp.gmail.com` |
| `SMTP_PORT` | | 예: `587` |
| `SMTP_USER` | | SMTP 계정 |
| `SMTP_PASSWORD` | | SMTP 앱 비밀번호 |
| `SMTP_FROM` | | 발신 이메일 |

4. **Redeploy** 실행 (환경 변수 추가 후 반드시 재배포)

## HTML 확인 페이지

배포 후 아래 URL로 서비스 동작을 확인할 수 있습니다.

| URL | 설명 |
|-----|------|
| `/` | 메인 서비스 (키워드 입력 → 보고서 생성) |
| `/service-check.html` | 배포 확인용 정적 페이지 |
| `/sample-report.html` | 샘플 보고서 HTML 미리보기 |

저장소 내 샘플 파일: [`samples/sample-report.html`](samples/sample-report.html)

참고용 목록: [`vercel.env.example`](vercel.env.example)

## 배포 구조

- 프론트엔드: Vercel Static (`frontend/dist`)
- API: Vercel Python Serverless (`/api` → FastAPI + Mangum)
- API 키는 서버리스 함수에서만 읽히므로 `VITE_*` 변수는 **불필요**

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

## 프로젝트 구조

```
api/
  index.py              # Vercel serverless entry
  requirements.txt
backend/
  app/
    services/
      search_service.py
      report_service.py   # Gemini API
      email_service.py
frontend/
  src/
vercel.json
vercel.env.example
```

## Gmail SMTP 설정 (선택)

1. Google 계정 2단계 인증 활성화
2. 앱 비밀번호 생성
3. Vercel 환경 변수에 SMTP 값 등록
4. `SMTP_ENABLED=true` 설정 후 Redeploy

## 문제 해결

- `GEMINI_API_KEY가 설정되지 않았습니다`: Vercel 환경 변수 확인 후 Redeploy
- `TAVILY_API_KEY가 설정되지 않았습니다`: Vercel 환경 변수 확인 후 Redeploy
- 배포 후 404: `vercel.json`의 `/api` rewrite 확인
