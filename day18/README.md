# Day 18 — 보안 점검 + 장애 대응 런북

핸드북 Day18(Track A). 보안 운영 3단계(예방·탐지·복구)를 실제 코드·DB로 점검하고, 런북·개인정보방침 초안 작성.

## 산출물
| 항목 | 위치 | 완료기준 |
|---|---|---|
| 보안 점검표(10항목) | [security_checklist.md](./security_checklist.md) | A-18-O1 |
| 비밀값 점검(3명령) | [secret_audit.md](./secret_audit.md) | A-18-O4 |
| 장애 대응 런북(2시나리오) | [runbook_draft.md](./runbook_draft.md) | A-18-O2 |
| 개인정보 처리방침 초안 | [privacy_policy_draft.md](./privacy_policy_draft.md) | A-18-O3 |
| Day19 릴리스 입력 | [day19_release_input.md](./day19_release_input.md) | A-18-O5 |

## 점검 결과 (실측)
- **보안 10항목 전부 통과, 미통과 0** → 코드 수정(단계3) 불필요.
  - RLS 7테이블 on(Supabase), service_role/secret 키 코드 미사용, `.env` git 미추적, API 모두 인증 가드+입력검증+generic 에러, 관리자 경로 서버 role 이중 체크.
- **비밀값 3명령 통과** — 노출 0건, 키 재발급·history 정리 불필요.
- 한계(Day19 권고): Rate Limiting 부재, privacy_policy 연락처·법률 검토, 모바일 레이아웃 육안 점검.

## 비고
- 코드 무변경(점검 통과). 문서 산출물만. 런북 확인 채널은 Day17 관측세트(activity_logs·Slack·Vercel Logs) 재사용.
