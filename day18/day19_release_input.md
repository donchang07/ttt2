# Day19 릴리스 전 입력 (Day18 산출물 A-18-O5)

작성일: 2026-06-28 · 릴리스 전 차단 항목 + 최종 점검.

## 릴리스 전 확인 (차단 항목)
- [x] `security_checklist.md` 10항목 통과(미통과 0) — 차단 항목 없음.
- [x] `secret_audit.md` 비밀값 노출 0 & `.env` git 미추적.
- [x] `/admin` 서버 role 체크 동작(미인증307/일반307/관리자200, RLS admin-only) — Day14 실측.
- [x] `runbook_draft.md` 롤백 절차(Vercel Promote/rollback) 명시.
- [x] `privacy_policy_draft.md` "법률 검토 필요" 경고 유지.
- [ ] **Rate Limiting 도입 검토**(전역 요청 제한 부재 — Vercel Firewall/미들웨어). Day19 권고.
- [ ] privacy_policy 문의 연락처 기입(게시 전 필수).

## 최종 점검 4가지
1. [x] 비밀값 노출 없음 — 코드·문서·캡처에 service/secret 키, webhook URL 평문 없음.
2. [x] 시크릿 창에서 관리자 화면 숨김 — 미인증 `/admin` → 307 `/login`(prod 실측).
3. [ ] 모바일 레이아웃 정상 — 릴리스 전 `/`·`/tasks`·`/admin` 모바일 폭 육안 확인(권장).
4. [x] `.env` 미추적 — `git ls-files | grep env` 0건.

## Day19로 넘기는 권고
- Rate Limiting(남용 방지), 모바일 레이아웃 최종 육안 점검, privacy_policy 연락처 확정·법률 검토.
- AI 우선순위(`error.ai_priority_failed`) 구현 시 보안·로깅 재점검.
