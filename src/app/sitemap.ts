import type { MetadataRoute } from "next";

const SITE_URL = "https://ttt2-theta.vercel.app";

// 공개 페이지만 포함한다. dashboard·admin·api·사용자별 경로는 절대 넣지 않는다.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/profile`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
