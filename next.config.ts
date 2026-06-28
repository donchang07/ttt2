import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // PDF 업로드용 서버 액션 본문 한도 상향(기본 1MB)
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
