# sitemap_plan — TaskFlow

작성일: 2026-06-27 · Day 06 SEO · 구현: `src/app/sitemap.ts`, `src/app/robots.ts`
공개 기준 도메인: `https://ttt2-theta.vercel.app`

## 원칙
- **실제로 존재하는 공개 페이지만** sitemap에 넣는다. 미존재 페이지(/pricing·/faq 등)는 만든 뒤 추가.
- 비공개·인증·내부 경로(dashboard·admin·api·사용자별)는 **절대 넣지 않는다.**
- robots.txt는 크롤러 지침일 뿐 **보안 장치가 아니다** — 비공개는 Auth·RLS·rate limit으로 보호.

## 포함 (현재 sitemap.xml)
| URL | changefreq | priority | 비고 |
|---|---|---|---|
| `https://ttt2-theta.vercel.app/` | weekly | 1.0 | 제품 랜딩(히어로) |

## 제외 (의도적)
| 경로 | 이유 |
|---|---|
| `/login` | 인증 페이지, `robots: { index: false }` |
| `/tasks` | 로그인 전용(보호 라우트), 비공개 |
| `/profile` | 데모 페이지(실서비스 공개 콘텐츠 아님) |
| `/pricing`, `/faq` | 아직 미존재 → 만들면 한 줄씩 추가 |
| `/dashboard/`, `/admin/`, `/api/` | robots disallow + sitemap 제외 |

## robots.txt 규칙 (현재)
```
User-Agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Sitemap: https://ttt2-theta.vercel.app/sitemap.xml
```

## 향후 추가 절차
1. 새 **공개** 페이지(예: `/pricing`)를 실제로 구현.
2. `src/app/sitemap.ts` 배열에 `{ url: \`${base}/pricing\`, lastModified, changeFrequency, priority }` 한 줄 추가.
3. 비공개로 바뀌면 sitemap에서 빼고 해당 페이지 metadata에 `robots: { index: false }`.

## 참고
- 현재 공개 도메인은 Vercel 기본 URL(`ttt2-theta.vercel.app`). 커스텀 도메인을 확보·연결하면 base URL만 교체하면 된다.
