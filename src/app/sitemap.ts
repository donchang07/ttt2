import type { MetadataRoute } from "next";

const SITE_URL = "https://ttt2-theta.vercel.app";

// 실제로 존재하는 공개 페이지만 포함한다.
// - 지금은 랜딩('/') 하나. /pricing·/faq 등은 실제로 만들면 그때 추가.
// - dashboard·admin·api·사용자별 페이지는 절대 넣지 않는다.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
