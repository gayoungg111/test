# 키워드 이슈 보고서 서비스

Next.js + **Gemini API**만으로 최근 7일 이슈 보고서를 생성합니다.

## 기술 스택

- **Next.js 15** — UI + API Routes
- **Gemini API** — Google Search grounding으로 최근 이슈 수집·보고서 생성
- **Vercel** — 배포

## Vercel 배포

1. GitHub `main` 브랜치 연결
2. **Framework Preset: Next.js** (Dashboard → Settings → General)
3. Build Command / Output Directory **오버라이드 제거** (비워 두면 `vercel.json` + Next.js 기본값 사용)
4. 환경 변수: `gemini_api_key` 또는 `GEMINI_API_KEY`
5. Deployments → **Redeploy**

## Vercel 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `gemini_api_key` 또는 `GEMINI_API_KEY` | ✅ | Google Gemini API 키 |
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

Gemini API 키 설정 상태 확인

### `POST /api/reports`

```json
{
  "keywords": ["AI 규제"]
}
```

생성된 보고서는 화면에 표시되며, **HTML 다운로드**·**텍스트 복사**로 저장할 수 있습니다.

## 프로젝트 구조

```
app/
  page.tsx              # 메인 UI
  api/reports/route.ts  # 보고서 생성 API
lib/
  gemini.ts             # Gemini + Google Search
  report-html.ts        # HTML 렌더링
```

## 참고

- 레거시 Python/Tavily 코드는 제거되었습니다.
- 현재 배포는 **Next.js + Gemini API**만 사용합니다.
