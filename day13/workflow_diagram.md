# 워크플로 다이어그램 (Day13 산출물)

검색 → 요약(자기개선 루프) → 리포트 → (선택)알림. 필수 단계 실패 시 중단, 선택 단계 실패는 계속.

```mermaid
flowchart TD
    A[POST /api/workflow query] --> B{인증}
    B -- 미인증 --> B401[401 반환]
    B -- 인증 --> S1[1. search 검색 timeout 8s]
    S1 -->|결과 0건| ERRNR[NO_RESULTS · 필수 실패 → 중단]
    S1 -->|청크 N개| S2[2. summarize 요약 timeout 15s]

    subgraph LOOP[자기개선 루프 max 3회]
      G[generate 요약 생성] --> E[evaluate 점수 0-100]
      E -->|score >= 75| OUT[조기 종료]
      E -->|score < 75 & i < 3| G
    end
    S2 --> LOOP
    LOOP --> S3[3. report 마크다운 생성 timeout 8s]
    S3 --> S4{4. notify 선택 timeout 5s}
    S4 -->|SLACK_WEBHOOK_URL 있음| GATE[보안 게이트 마스킹] --> SLACK[Slack 전송]
    S4 -->|미설정| SKIP[skipped 생략]
    GATE -->|민감정보 차단/마스킹| SLACK
    S3 --> R[StepResult 배열 + summary + report 반환]
    SLACK --> R
    SKIP --> R
```

- **필수**: search, summarize, report (실패 시 이후 중단)
- **선택**: notify (실패해도 워크플로 성공)
- 각 단계는 `Promise.race` 타임아웃, 결과는 `StepResult{stepName,status,durationMs,errorCode,outputSummary}`로 통일.
