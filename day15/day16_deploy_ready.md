# Day16 배포 준비 점검 (Day15 산출물 A-15-O5)

작성일: 2026-06-28 · 4대 안정성 영역 점검(prod 실측 기반). 값 없이 환경변수 **이름만**.

## 안정성 점검
| 영역 | 상태 | 증거(prod 실측) |
|---|---|---|
| **인증(Auth)** | ✅ 통과 | 로그인/회원가입(Confirm OFF), 미들웨어 세션, `/tasks` 미인증 307→/login |
| **RLS** | ✅ 통과 | tasks per-user(A=5/B=0), document_chunks per-user, activity_logs admin-only, account A/B 격리 검증 |
| **관리자 콘솔(Admin)** | ✅ 통과 | RBAC 4종(미인증307/일반307/관리자200/일반 activity_logs 0건), security.is_admin 이중 방어 |
| **RAG 안전** | ✅ 통과 | /notes 임베딩·질문 200, PDF 20MB 가드, 워크플로→Slack(보안 게이트 마스킹) |

## 환경변수 (이름만, 값·키 미기재)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` ⚠️ 현재 무효(`ssb_secret_`, 401) — 재발급 권장. 사용자 삭제는 SECURITY DEFINER RPC로 우회 중
- `ADMIN_PASSWORD`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `SLACK_WEBHOOK_URL`
- (Vercel Production·Preview에 위 키들 등록됨. `.env.local`은 gitignore)

## 출시 전 스캔
- [x] 커밋에 `.env.local`·키·토큰·테스트 녹화 없음
- [x] 커밋 메시지에 실명·회사명 없음
- [x] before/after 기록에 API 키·웹훅·관리자 데이터 없음

## 남은 권고
- Supabase service role 키 재발급(현재 무효).
- 유출 비밀번호 보호(Pro 플랜 전용)는 보류.
