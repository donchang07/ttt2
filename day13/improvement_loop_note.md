# 자기개선 루프 노트 (Day13 산출물)

작성일: 2026-06-28 · 위치: `src/lib/workflow/steps.ts` summarizeStep

## 루프 구조
```
best = {summary:"", score:-1}; feedback = undefined
for i in 0..2 (최대 3회):
  summary = generate(query, chunks, feedback)   # LLM 호출 1
  {score, feedback} = evaluate(summary, chunks) # LLM 호출 2
  best = max(best, {summary, score})
  if score >= 75: break        # 조기 종료
return best.summary, best.score, iterations
```

## 안전 가드
| 가드 | 값 | 의미 |
|---|---|---|
| **minScore** | 75 | 평가 점수 ≥ 75면 즉시 종료(조기 종료) |
| **max_iterations** | 3 | 최대 3회 반복 |
| **LLM 호출 상한** | **6회** | 생성 3 + 평가 3 (반복당 2회) |
| **timeout** | 15s | summarize 단계 전체(엔진의 `Promise.race`) |
| **early exit** | 활성 | 점수 충족 시 남은 반복 건너뜀 |

## 평가 기준 (evaluate)
0~100 정수, 기준 3가지: (1) `[번호]` 인용 존재 (2) 문서 내용 충실 반영 (3) 간결성.
JSON `{"score":N,"feedback":"..."}`으로 받고, 파싱 실패 시 score 0 + "평가 파싱 실패"로 폴백(루프는 계속).

## 설계 의도
- **품질 하한 보장**: 점수 미달이면 피드백을 반영해 재생성 → 점진 개선.
- **비용·지연 상한**: 최대 6회·15s로 폭주 방지. 빠른 `claude-haiku-4-5` 사용으로 6회가 15s 안에 들어오게 함.
- **최선값 보존**: 모든 반복 중 최고 점수 요약을 반환(마지막이 더 나쁠 수 있으므로).
