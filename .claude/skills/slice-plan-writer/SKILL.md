---
name: slice-plan-writer
description: Create a one-page vertical slice plan from PRD Must item, backlog ID, target table, and RLS rule. Use when the user asks to plan the first or next implementation slice before writing code.
---

# Slice Plan Writer

## What This Skill Does

Creates a one-page implementation plan for a single vertical slice,
expressed as one user action (not a feature name).

## Inputs

- PRD Must item
- Backlog ID
- Target page
- Target table
- Auth/RLS rule
- Expected verification method

## Process

1. Restate the user action in plain Korean.
2. Link the action to one PRD Must item and one backlog ID.
3. Select exactly one target table and one page.
4. Write normal, empty-input, logged-out, and unauthorized cases.
5. List verification commands and manual checks.

## Output

Write slice1_plan.md with this table:

| 항목 | 내용 |
|------|------|
| Slice 이름 |  |
| 연결 PRD |  |
| 백로그 ID |  |
| 테이블 |  |
| 권한 기준 |  |
| 정상 흐름 |  |
| 오류 흐름 |  |
| 완료 증거 |  |

## Safety Rules

- Use dummy examples only; never real customer data.
- Do not include .env.local, API keys, or service role keys.
- Do not modify implementation/source files unless the user explicitly asks.
- If a required input is missing, stop and ask for it instead of guessing.
