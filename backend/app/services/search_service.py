from dataclasses import dataclass

import httpx

from app.config import settings


@dataclass
class SearchResult:
    title: str
    url: str
    content: str
    published_date: str
    source: str
    keyword: str


class SearchService:
    TAVILY_URL = "https://api.tavily.com/search"

    async def search_keywords(self, keywords: list[str], days: int = 7) -> list[SearchResult]:
        if not settings.tavily_api_key:
            raise ValueError("TAVILY_API_KEY가 설정되지 않았습니다.")

        results: list[SearchResult] = []
        seen_urls: set[str] = set()

        async with httpx.AsyncClient(timeout=30.0) as client:
            for keyword in keywords:
                response = await client.post(
                    self.TAVILY_URL,
                    json={
                        "api_key": settings.tavily_api_key,
                        "query": keyword,
                        "days": days,
                        "max_results": 10,
                        "include_answer": False,
                    },
                )
                response.raise_for_status()
                data = response.json()

                for item in data.get("results", []):
                    url = item.get("url", "")
                    if not url or url in seen_urls:
                        continue

                    seen_urls.add(url)
                    results.append(
                        SearchResult(
                            title=item.get("title", "제목 없음"),
                            url=url,
                            content=item.get("content", ""),
                            published_date=item.get("published_date", "날짜 미상"),
                            source=self._extract_source(url),
                            keyword=keyword,
                        )
                    )

        return results

    @staticmethod
    def _extract_source(url: str) -> str:
        try:
            from urllib.parse import urlparse

            hostname = urlparse(url).hostname or ""
            return hostname.removeprefix("www.")
        except Exception:
            return "unknown"
