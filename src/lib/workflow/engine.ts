import "server-only";

export type StepStatus = "ok" | "error" | "skipped";

export type StepResult = {
  stepName: string;
  status: StepStatus;
  durationMs: number;
  errorCode: string | null;
  outputSummary: string;
};

export type WorkflowContext = {
  query: string;
  runId: string;
  results: Record<string, unknown>;
  // supabase 클라이언트 등 부수 입력은 호출부에서 주입(인덱스 시그니처)
  [key: string]: unknown;
};

export type WorkflowStep = {
  name: string;
  timeoutMs: number;
  optional?: boolean;
  run: (ctx: WorkflowContext) => Promise<{ output: unknown; outputSummary: string }>;
};

/** 단계 내부 오류에 코드를 실어 보내는 에러. */
export class StepError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

class TimeoutError extends Error {
  constructor() {
    super("TIMEOUT");
  }
}

/** Promise.race 기반 타임아웃(타이머는 항상 정리). */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError()), ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/** 단계를 순차 실행. 필수 단계 실패 시 이후 단계 중단, 선택 단계 실패는 로그만 남기고 계속. */
export async function runWorkflow(
  steps: WorkflowStep[],
  ctx: WorkflowContext,
): Promise<StepResult[]> {
  const results: StepResult[] = [];
  let halted = false;

  for (const step of steps) {
    if (halted) {
      results.push({
        stepName: step.name,
        status: "skipped",
        durationMs: 0,
        errorCode: "HALTED",
        outputSummary: "이전 필수 단계 실패로 건너뜀",
      });
      continue;
    }

    const start = Date.now();
    try {
      const { output, outputSummary } = await withTimeout(step.run(ctx), step.timeoutMs);
      ctx.results[step.name] = output;
      results.push({
        stepName: step.name,
        status: "ok",
        durationMs: Date.now() - start,
        errorCode: null,
        outputSummary,
      });
    } catch (e) {
      const errorCode =
        e instanceof TimeoutError ? "TIMEOUT" : e instanceof StepError ? e.code : "ERROR";
      results.push({
        stepName: step.name,
        status: step.optional ? "skipped" : "error",
        durationMs: Date.now() - start,
        errorCode,
        outputSummary: step.optional
          ? `선택 단계 실패(계속): ${errorCode}`
          : `필수 단계 실패(중단): ${errorCode}`,
      });
      if (!step.optional) halted = true;
    }
  }

  return results;
}
