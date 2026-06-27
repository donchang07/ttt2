import type { MetadataRoute } from "next";

const SITE_URL = "https://taskflow.app";

// robots.txt는 크롤러 지침일 뿐 보안 장치가 아니다.
// 비공개 데이터는 Supabase Auth·RLS·rate limit으로 보호한다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
