import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";

const SITE_URL = "https://ttt2-theta.vercel.app";
const HERO_DESCRIPTION =
  "5~15인 팀 PM이 흩어진 할 일을 모아 AI 근거로 우선순위를 정하는 태스크 관리 SaaS";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[48rem] flex-col items-center justify-center px-6 text-center">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "TaskFlow",
          description: HERO_DESCRIPTION,
          url: SITE_URL,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "ko",
        }}
      />

      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        팀의 오늘 우선순위를 30초 안에
      </h1>
      <p className="mt-5 max-w-[34rem] text-base text-foreground/60 sm:text-lg">
        {HERO_DESCRIPTION}
      </p>
      <Link
        href="/login"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-foreground px-7 text-sm font-medium text-background transition-colors hover:opacity-90"
      >
        시작하기
      </Link>
    </main>
  );
}
