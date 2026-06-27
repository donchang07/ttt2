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

**RLS 기준 컬럼 결정** — "데이터가 새면 가장 곤란한 단위" = **팀**(여러 사람이 한 팀 데이터를 공유). 개인 도구였다면 `user_id`, 회사 격리였다면 `org_id`였겠지만, TaskFlow는 팀 협업이므로 기준 컬럼은 **`team_id`** (★). `members`를 경유해 `auth.uid()`의 소속 팀을 판정한다.

### 7-1. 엔티티 × RLS 기준 (Must에 직접 닿는 것만 유지, Non-Scope 테이블 제외)
| 엔티티(저장 명사) | RLS 기준 컬럼 | 주요 저장 컬럼 | 닿는 Must | 비고 |
|---|---|---|---|---|
| `teams` | `id` (멤버십으로 판정) | name | Must 1 | 팀 단위 루트 |
| `members` | `team_id` ★ | user_id→auth.users, role(leader/member) | Must 1 | 멤버십+역할, UNIQUE(team_id,user_id) |
| `tasks` | `team_id` ★ | title, status, priority, ai_reason, created_by→auth.users, deleted_at | Must 2·3 | soft delete, updated_at 트리거 |
| `notes` | `team_id` ★ | task_id→tasks, body, created_by | Should(차기) | RAG 대상, 핵심 슬라이스 외 |

> **제외**: 결제·구독·다국어·모바일 등 Non-Scope 기능에 대응하는 테이블은 만들지 않는다.

### 7-2. 사용자 역할
| 역할 | 권한 범위 |
|---|---|
| `leader` | 팀/멤버 관리, 팀 내 모든 태스크 수정·삭제 |
| `member` | 팀 데이터 조회, 태스크 생성, 본인 작성분 수정 |

### 7-3. 권한 / RLS 경계 (누가 무엇을 보나)
| 작업 | 경계 |
|---|---|
| SELECT | 자신이 속한 `team_id`의 행만 (tasks는 `deleted_at IS NULL`) |
| INSERT | 내 팀 + `created_by = auth.uid()` (서버에서 강제, 폼 입력 신뢰 금지) |
| UPDATE/DELETE | 작성자 또는 같은 팀 `leader` |
| 타 팀 | Default Deny → 0건 |

### 7-4. 측정 이벤트 (Success Metrics 로깅)
| 이벤트(snake_case) | 발생 시점 |
|---|---|
| `priority_decided` | 우선순위 확정 (North Star) |
| `ai_recommendation_shown` / `ai_recommendation_accepted` | AI 추천 표시 / 채택 |
| `first_task_created` | 신규 팀의 7일 내 첫 태스크 (활성화) |

### 7-5. Day05 백로그 후보
노트(RAG), 관리자 콘솔(`members.role`), Slack 알림, 추천 히스토리

---
## 제출 전 점검
- [x] API key·service_role key 없음
- [x] 실명·이메일·전화번호 없음(더미만)
- [x] 실제 계약/고객 정보 없음
- [x] 내부 비공개 수치 없음
