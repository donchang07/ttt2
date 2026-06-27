# metadata_plan — TaskFlow

작성일: 2026-06-27 · Day 06 SEO · 적용 위치: `src/app/layout.tsx`(전역), 동적 페이지는 각 라우트 `generateMetadata`

| 항목 | 값 |
|---|---|
| **제품명** | TaskFlow |
| **공개 기준 URL** | `https://taskflow.app` (지정 공개 도메인) — Vercel에 도메인 연결 필요(미연결 시 OG·canonical 404) |
| **title 기본값** | `TaskFlow — 팀의 오늘 우선순위를 30초 안에` (템플릿 `%s \| TaskFlow`) |
| **description** | `5~15인 팀 PM이 흩어진 할 일을 모아 AI 근거로 우선순위를 정하는 태스크 관리 SaaS` (Day03 PRD 한 줄) |
| **OG 이미지 경로** | `/opengraph-image.png` (1200×630, alt 포함). 공개 가능(브랜드 카피만, 민감정보 없음). **자산은 아직 미생성 → 추가 필요** |
| **동적 metadata 필요 페이지** | 현재 **없음**. 공개 동적 상세 페이지(예: `blog/[slug]`)가 생기면 그 라우트에서 `generateMetadata`로 분리(아래 패턴). 인증/비공개 페이지(`/login`, `/tasks`)는 각 페이지에서 `robots: { index: false }` |
| **metadataBase** | `https://taskflow.app` |

## 동적 페이지 패턴 (향후 blog/[slug] 등 추가 시)
```tsx
// src/app/blog/[slug]/page.tsx
import type { Metadata } from "next";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) {
    return { title: "문서를 찾을 수 없습니다", robots: { index: false, follow: false } };
  }
  return {
    title: post.title,                                   // layout 템플릿으로 "제목 | TaskFlow"
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}
```
- 전역 `metadataBase`가 있으므로 `canonical`·OG `url`은 상대경로로 해석된다.
- `getPublicPost`는 공개(RLS상 누구나 조회 가능) 데이터만 반환해야 한다 — 비공개 데이터로 메타를 만들면 노출 위험.

## 현재 적용 상태 (layout.tsx)
- metadataBase·title(default+template)·description·canonical(`/`)·openGraph(type/locale ko_KR/url/siteName/title/description/images 1200×630+alt) 적용됨.
- `/login`, `/tasks`는 `robots: { index: false }` 설정됨.
