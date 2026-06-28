# Day 15 — 사용자 테스트 → PDCA → 개선 커밋

핸드북 Day15(Track A). 실제 세션에서 나온 사용성 발견을 익명화해 1 PDCA 사이클을 완주하고, 오늘의 개선 1건을 커밋.

## 산출물
| 항목 | 위치 |
|---|---|
| 사용자 테스트 요약(익명 T1~T5) | [user_test_summary.md](./user_test_summary.md) |
| 개선 우선순위(2×2) | [improvement_priority.md](./improvement_priority.md) |
| PDCA 카드(4박스) | [pdca_card.md](./pdca_card.md) |
| Day16 배포 준비 점검 | [day16_deploy_ready.md](./day16_deploy_ready.md) |
| 개선 커밋(A-15-O4) | `fix: redirect logged-in users from home to app (user test reflection)` |

## 오늘의 개선 (1건)
- **문제**: 로그인 후에도 홈(마케팅)에 머물러 앱·관리자 메뉴를 못 찾음(T1·T4, 발견성 H).
- **수정**: `src/app/page.tsx` — 로그인 상태면 `/tasks`로 리다이렉트(최소 변경 1파일).
- **before→after**: 마케팅 랜딩 → 로그인 시 앱으로 즉시 진입(메뉴 노출).

## 1사이클 완주
완벽보다 "반영된 1개 개선" — 발견성 잔여분을 닫고, 나머지(PDF·온보딩·메뉴·알림)는 직전 사이클에서 이미 반영됨을 증거로 정리.
