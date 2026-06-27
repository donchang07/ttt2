import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "로그인",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[26rem] flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold">TaskFlow 로그인</h1>
      <p className="mt-1 mb-8 text-sm text-foreground/50">
        팀의 오늘 우선순위를 30초 안에.
      </p>
      <LoginForm />
    </main>
  );
}
