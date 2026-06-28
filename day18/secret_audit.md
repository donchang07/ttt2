# 비밀값 점검 (Day18 산출물 A-18-O4)

작성일: 2026-06-28 · 3명령 실측(prod 코드베이스). 값은 기록하지 않고 판정·근거만.

## 명령 1 — service_role 마스터 키 노출
```
grep -rn "service_role" src --include="*.ts" --include="*.tsx"
```
- 결과: **0건** → **통과**. service role 키를 쓰는 코드 자체가 없음. 관리자 동작은 일반 createClient(쿠키 세션) + RLS admin override + SECURITY DEFINER RPC(`admin_delete_user`)로 처리.

## 명령 2 — 브라우저 전송 키 목록
```
grep "NEXT_PUBLIC_" .env.local
```
- 결과: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (2종) → **통과**. 둘 다 공개용 publishable(URL·anon 대체). RLS로 데이터 보호. service/secret 키는 `NEXT_PUBLIC_` 아님.

## 명령 3 — git 추적 여부
```
git ls-files | grep -E "\.env"
```
- 결과: **0건** → **통과**. `.env.local`·`.env*`는 `.gitignore`로 미추적. 코드·문서·캡처에 실제 키 값 없음.

## 종합
- 3명령 모두 **통과**. 노출 발견 0건 → 키 재발급·`git rm --cached`·history 정리 **불필요**.
- 참고(이번 세션 별건): `SUPABASE_SECRET_KEY`는 코드 미사용이나 무효 키였어 재발급·Vercel 교체·재배포 완료(노출이 아닌 갱신).
