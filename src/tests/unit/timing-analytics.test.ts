import { describe, expect, it } from "vitest";
import { TimingController } from "@/features/practice/engine/timing";
import { calculateAnalytics } from "@/features/practice/engine/analytics";
import type { QuestionResult } from "@/features/practice/types";

describe("timing and analytics", () => {
  it("derives elapsed time from a monotonic clock without interval drift", () => {
    let now = 100;
    const timing = new TimingController(() => now);
    timing.startSession(); now = 1350;
    expect(timing.questionElapsed()).toBe(1250);
    now = 1200;
    expect(timing.questionElapsed()).toBe(1100);
  });

  it("computes both accuracy and speed", () => {
    const base = { topic: "tables", expression: "2 × 2", answerMode: "typing", correctAnswer: 4 } as const;
    const results: QuestionResult[] = [
      { ...base, questionId: "1", userAnswer: 4, isCorrect: true, durationMs: 1000 },
      { ...base, questionId: "2", userAnswer: 5, isCorrect: false, durationMs: 3000 },
    ];
    const analytics = calculateAnalytics(results, 5000);
    expect(analytics.accuracy).toBe(50);
    expect(analytics.averageTimeMs).toBe(2000);
    expect(analytics.questionsPerMinute).toBe(24);
    expect(analytics.topics[0]).toMatchObject({ total: 2, correct: 1 });
  });
});
