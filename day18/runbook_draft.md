# 장애 대응 런북 초안 (Day18 산출물 A-18-O2)

작성일: 2026-06-28 · 복구(Recovery) 단계. 확인 채널은 Day17 관측세트(activity_logs·Slack 알림·Vercel Logs) 재사용.

---

## 런북 1 — 로그인 불가 / 세션 만료
- **증상**: 로그인 후 `/login`으로 반복 튕김, `/tasks`·`/admin` 접근 실패. 미들웨어가 세션을 못 읽음.
- **원인 후보**
  1. Vercel 환경변수 누락/오타(`NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
  2. Supabase Auth 설정 변경(프로젝트 일시정지·키 회전).
  3. `src/lib/supabase/middleware.ts` 쿠키 처리 오류(세션 미갱신).
- **조치 절차**
  1. Supabase Dashboard → Authentication → Logs에서 로그인 시도·실패 사유 확인.
  2. Vercel Dashboard → Settings → Environment Variables → 위 2개 키 존재·오타 확인(값 노출 주의).
  3. 키 교체했으면 `vercel --prod` 재배포(환경변수는 재배포해야 반영).
  4. 로컬 `pnpm dev` 후 브라우저 콘솔·서버 로그에서 세션 쿠키 갱신 확인.
- **검증 기준**: 신규 가입 계정(Confirm OFF→즉시 세션)·기존 계정 모두 로그인 → `/tasks` 진입 성공.
- **확인 채널**: Supabase Auth Logs / Vercel Deployments / Day17 `activity_logs`(로그인 후 task.* 적재 여부).

---

## 런북 2 — API 응답 없음 / 5xx (RAG·워크플로)
- **증상**: `/notes` 질문·`/api/workflow` 호출이 500으로 실패, 흰 화면 또는 "실패했습니다" 메시지.
- **원인 후보**
  1. LLM 키 만료·한도(`OPENAI_API_KEY` 임베딩 / `ANTHROPIC_API_KEY` 생성).
  2. Supabase 일시 오류·`document_chunks` 접근 실패.
  3. 입력 한계(대용량 PDF 20MB 초과·스캔 이미지 텍스트 0 → 413/422).
- **조치 절차**
  1. Vercel Dashboard → Project → Logs(`vercel logs`)에서 같은 시각 `rag/ask error`·`workflow` `console.error` 스택 확인.
  2. Supabase SQL: `select event_type,count(*) from activity_logs where event_type like 'error%' and created_at >= now()-interval '1 hour' group by event_type;`
  3. 키 한도면 해당 콘솔(OpenAI/Anthropic)에서 사용량·키 상태 확인 → 키 회전 후 Vercel 갱신·재배포.
  4. 입력 한계(413/422)면 사용자 안내 문구로 정상 처리됨 — 장애 아님, 모니터만.
- **검증 기준**: 동일 질문 재요청 200 + 근거 답변 반환. `error.*` 이벤트 증가 멈춤.
- **확인 채널**: Vercel Runtime Logs / Day17 `activity_logs` `error.*` / Slack `sendAlert`(연결 시).

---

## 공통 — 빠른 롤백
- Vercel Dashboard → Deployments → 직전 정상 배포 → **Promote to Production**(또는 `vercel rollback`)로 즉시 복귀.
