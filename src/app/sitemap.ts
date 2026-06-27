import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://taskflow.app";
  return [
    // 실제로 존재하는 공개 페이지만 — 지금은 랜딩(/) 하나
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    // /pricing·/faq 등은 그 페이지를 실제로 만든 뒤 한 줄씩 추가
    // dashboard·admin·api·사용자별 페이지는 절대 넣지 않는다
  ];
}
