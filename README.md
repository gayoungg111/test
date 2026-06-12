# 키워드 이슈 보고서 서비스

Next.js + **Gemini API + Google Search**로 최근 7일 이슈 보고서를 생성합니다.  
Tavily 등 외부 검색 API는 사용하지 않습니다.

## 기술 스택

- **Next.js 15** — UI + API Routes
- **Gemini API** — 보고서 생성
- **Google Search (Gemini grounding)** — 최근 이슈 검색
- **Vercel** — 배포

## Vercel 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `gemini_api_key` 또는 `GEMINI_API_KEY` | ✅ | Google AI Studio / Gemini API 키 |
| `GEMINI_MODEL` | | 기본값 `gemini-2.5-flash` (`gemini-2.0-flash`는 자동 대체) |

참고: [`vercel.env.example`](vercel.env.example)

## Vercel 배포 설정

Dashboard → **Settings → General → Build & Development Settings**

| 항목 | 값 |
|------|-----|
| Framework Preset | **Next.js** |
| Build / Output / Install Command | Override **OFF** (비움) |

저장 후 **Redeploy → Promote to Production**.

**배포 확인**

- `/version.txt` → `nextjs-gemini-google-search`
- `/api/health` → `"search_provider":"google_search"`
- 메인 화면 → **「보고서 생성」** (이메일 입력 없음)

## 로컬 실행

```bash
npm install
npm run dev
```

## API

### `GET /api/health` · `GET /api/reports`

서비스 상태 및 Gemini API 키 설정 확인

### `POST /api/reports`

```json
{
  "keywords": ["AI 규제"]
}
```

## 프로젝트 구조

```
app/api/reports/route.ts  # 보고서 생성
lib/gemini.ts             # Gemini + Google Search
```
