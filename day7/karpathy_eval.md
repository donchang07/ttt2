# Karpathy Guidelines 평가 — TaskFlow 빌드 (Day 1~7)

작성일: 2026-06-27 · 기준: [karpathy-guidelines/SKILL.md](https://github.com/donchang07/skills/blob/main/karpathy-guidelines/SKILL.md)
4원칙: Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution

## 1. Think Before Coding — A−
**잘함**
- 막막한 결정은 묻고 진행: 제품 선택(TaskFlow vs 본인 아이디어), Supabase 준비 여부, 도메인 통일 방향, blog 라우트 의도
- 트레이드오프·블로커 선제 표면화: secret 키 무효, Claude API 키 미발급, 설계↔적용 DB 불일치, taskflow.app 타인 소유

**부족**
- 가끔 "먼저 실행 후 사후 통지": DB를 적용한 뒤 설계 불일치를 알림 / 도메인을 Vercel URL로 임의 선택했다가 정정됨. 사전 확인이 더 나았음.

## 2. Simplicity First — B+
**잘함**
- 의존성 회피: `cn()` 자체 구현(외부 패키지 X), zod 대신 수동 검증, 로그인 전용(가입 제거), 단일 히어로
- 마이그레이션·RLS 최소 구성

**부족**
- 투기적 산출물: 초반 ttt2 루트 Next 16 스캐폴드가 taskflow로 옮겨가며 고아가 됨(불필요 작업). 일부 문서 장황.

## 3. Surgical Changes — B
**잘함**
- "그 파일만 건드려라" 반복 준수(sitemap/robots/layout 스코프), 삭제 대신 `git mv`·Trash Can 이동

**부족 (최대 감점)**
- Trash Can/.next 백업을 실수로 커밋 → lint 8,311개 폭발 → 사후 untrack·ignore로 수습. 처음부터 .gitignore에 넣었어야 함.

## 4. Goal-Driven Execution — A (최강)
**잘함**
- 매 단계 검증 가능한 성공 기준 + 루프: `typecheck/lint/build`, REST E2E(로그인→팀→생성→조회), **RLS A/B 격리(B가 0건)**, 브라우저 스크린샷, HTTP·sitemap/robots 실측, 보안 어드바이저 점검
- "되는지"를 말로 끝내지 않고 실측으로 닫음

## 종합: B+ / A−
- 최강 축: 검증(Goal-Driven). 최약 축: Surgical(실수 커밋).

## 개선 액션 3
1. 새 폴더/스캐폴드·백업은 **생성 즉시 .gitignore 등록**(Trash Can 사고 방지)
2. DB·도메인 등 되돌리기 어려운 결정은 **적용 전 재확인**
3. 문서 산출물은 **표·핵심 위주로 압축**
