import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIGURATION } from "@/features/practice/constants";
import { initialSessionState, sessionReducer } from "@/features/practice/engine/session-reducer";
import type { Question, QuestionResult } from "@/features/practice/types";

const question: Question = { id: "q1", identity: "squares:2", topic: "squares", expression: "2²", operands: [2], correctAnswer: 4 };
const result: QuestionResult = { questionId: "q1", topic: "squares", expression: "2²", answerMode: "typing", userAnswer: 4, correctAnswer: 4, isCorrect: true, durationMs: 1000 };

describe("session reducer", () => {
  it("starts, submits once, and completes", () => {
    const active = sessionReducer(initialSessionState, { type: "START_SESSION", configuration: DEFAULT_CONFIGURATION, questions: [question] });
    const feedback = sessionReducer(active, { type: "SUBMIT_ANSWER", result });
    expect(feedback.results).toEqual([result]);
    expect(sessionReducer(feedback, { type: "SUBMIT_ANSWER", result })).toBe(feedback);
    const completed = sessionReducer(feedback, { type: "COMPLETE_SESSION", sessionDurationMs: 1200 });
    expect(completed.status).toBe("completed");
  });
});
