import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://ttt2-theta.vercel.app";
const SITE_DESCRIPTION =
  "5~15인 팀 PM이 흩어진 할 일을 모아 AI 근거로 우선순위를 정하는 태스크 관리 SaaS";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TaskFlow — 팀의 오늘 우선순위를 30초 안에",
    template: "%s | TaskFlow",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "TaskFlow",
    title: "TaskFlow — 팀의 오늘 우선순위를 30초 안에",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
