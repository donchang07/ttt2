# PRD v1 — TaskFlow

작성일: 2026-06-27 · 입력: [Day01 진단표](../day1/진단표.md), [Day02 시장분석](../day2/시장분석_보고서.md)

## 1. Goal
- **Target User**: 한국 5~15인 스타트업/소규모 팀의 PM·팀리드
- **Problem**: 매일 아침 "오늘 무엇부터 할지" 우선순위 결정에 15분+ 소모하고, 그 근거가 개인 머릿속에만 있어 팀에 공유·합의되지 않는다.
- **Value Proposition**: 팀 태스크를 한곳에 모으고, AI가 우선순위 + 근거를 30초 안에 제시해 팀이 3분 안에 합의한다.
- **Success Metrics**
  - 제품 성과 지표: 주간 `priority_decided`(우선순위 결정 완료 팀 수), AI 추천 채택률(`ai_recommendation_accepted ÷ ai_recommendation_shown`)
  - 구현 완료 기준: 태스크 CRUD + AI 우선순위 추천 동작, 모든 테이블 RLS 적용, `pnpm build·lint·typecheck` 통과
- **핵심 가정**: 5~15인 팀은 "정렬"보다 "근거 있는 추천"에 더 가치를 느낀다 (가정 — 인터뷰 검증 필요).

## 2. Scope
**Must (3~5)**
1. 팀/멤버 구조 + 이메일 인증 로그인
2. 태스크 CRUD (생성·조회·수정·완료·soft delete)
3. AI 우선순위 추천 (근거 텍스트 포함)
4. 팀 단위 데이터 격리(RLS)

**Should**
- 노트(태스크 메모, 추후 RAG 대상)
- 관리자 콘솔(멤버·역할 관리)
- 알림(Slack Webhook)

**Could**
- 우선순위 추천 히스토리/되돌리기
- 사용자 행동 분석 대시보드

**Won't (이번 4주)**
- 결제·구독, 모바일 네이티브 앱, 다국어, 외부 캘린더 연동

## 3. Non-Scope
| 제외 항목 | 이유 | 재검토 조건 |
|---|---|---|
| 결제/구독 | 4주 내 핵심가치 검증이 우선 | 유료 전환 의향 검증 후 |
| 모바일 앱 | 웹으로 가설 검증 충분 | 데스크톱 PMF 확인 후 |
| 다국어 | 초기 타깃이 한국 팀 | 해외 수요 확인 시 |
| 실시간 협업(동시편집) | 구현 비용 큼, 가치 불확실 | 동시편집 니즈 데이터 확보 시 |

## 4. Constraints
- **기간**: 4주 (Day01~20), 1~2인 구현 (공식 문서 확인일: 2026-06-27)
- **인력**: 1인(장동인) + AI 페어 (확인일: 2026-06-27)
- **예산**: Claude API 사용량 기반, 초기 최소 (확인일: 2026-06-27)
- **인증**: Supabase Auth(@supabase/ssr) — 이메일 인증 (확인일: 2026-06-27)
- **데이터**: 모든 테이블 RLS, 팀 단위 격리 (확인일: 2026-06-27)
- **배포**: Vercel(GitHub 자동배포) — 현재 https://ttt2-theta.vercel.app (확인일: 2026-06-27)
- **AI**: Claude API(우선순위 추천·RAG). API 키 미발급 상태 → Day10 전 발급 필요 (확인일: 2026-06-27)

## 5. Risks·Assumptions
### 일정
| 위험 | 확률 | 영향 | 공개 | 완화 | 재확인 |
|---|---|---|---|---|---|
| Must 과대로 4주 초과 | 중 | 상 | 가능 | Must 4개로 고정, Should 이하 후순위 | Day05 |
### 기술
| AI 추천 품질 미달 | 중 | 상 | 가능 | 휴리스틱+LLM 혼합, 근거 텍스트 검증 | Day13 |
### 보안
| RLS 미설정 팀 간 데이터 노출 | 중 | 상 | 가능 | 테이블 생성과 동시 RLS, A/B 검증 | Day04·Day11 |
### 개인정보
| 실제 원문/실명 노출 | 중 | 상 | 불가 | 더미 데이터만 사용 | 매일 |
### 비용
| Claude API 초과 비용 | 중 | 중 | 가능 | 호출 캐싱·상한, 토큰 모니터링 | Day06 |
### 운영
| secret 키 무효로 서버 작업 지연 | 상 | 중 | 가능 | Day11 전 대시보드에서 재발급 | Day11 |
### 데이터
| 스키마 변경 잦아 마이그레이션 충돌 | 중 | 중 | 가능 | 마이그레이션 타임스탬프 규칙, 리뷰 | Day04 |

## 6. 범위 판단표
| 기능명 | MoSCoW | 예상시간 | 포함·제외 이유 | Day04 데이터 영향 |
|---|---|---|---|---|
| 팀/멤버 + 인증 | Must | 1.5일 | 멀티테넌트 기반, RLS 전제 | `teams`, `members` |
| 태스크 CRUD | Must | 2일 | 핵심 데이터, North Star 직접 기여 | `tasks` |
| AI 우선순위 추천 | Must | 2.5일 | 차별점·Value Proposition 핵심 | `tasks`(priority 필드), 이벤트 로그 |
| RLS 격리 | Must | 1일 | 보안 리스크 1순위 | 전 테이블 `team_id` |
| 노트 | Should | 1일 | RAG 확장 대상, 핵심엔 비필수 | `notes` |
| 관리자 콘솔 | Should | 1.5일 | 운영 편의, 초기 검증엔 후순위 | `members.role` |

## 7. Day04 전달표
- **핵심 엔티티**:
  - `teams`(id, name, created_at)
  - `members`(id, team_id★, user_id→auth.users, role[leader/member], created_at)
  - `tasks`(id, team_id★, title, status, priority, ai_reason, created_by→auth.users, deleted_at, created_at, updated_at)
  - `notes`(id, team_id★, task_id→tasks, body, created_by, created_at) — RAG 대상
- **사용자 역할**: `leader`(팀/멤버 관리, 모든 태스크 수정), `member`(본인/팀 태스크 조회·생성, 본인 작성분 수정)
- **저장 데이터**: 태스크 제목·상태·우선순위·AI 근거, 멤버 역할, 노트 본문
- **권한/RLS 경계**: 사용자는 자신이 속한 `team_id`의 데이터만 조회/쓰기 가능 (★ 기준 컬럼 = `team_id`)
- **백로그 후보(Day05)**: 노트, 관리자 콘솔, Slack 알림, 추천 히스토리
- **측정 이벤트**: `priority_decided`, `ai_recommendation_shown`, `ai_recommendation_accepted`, `first_task_created`

---
## 제출 전 점검
- [x] API key·service_role key 없음
- [x] 실명·이메일·전화번호 없음(더미만)
- [x] 실제 계약/고객 정보 없음
- [x] 내부 비공개 수치 없음
