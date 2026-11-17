import type { Difficulty, PracticeConfiguration } from "./types";
export const MAX_QUESTIONS = 200;
export const MAX_BASE = 1_000_000;
export const FEEDBACK_MS = 550;
export const RELEASE_VERSION = "1.1.0";
export const DEFAULT_CONFIGURATION: PracticeConfiguration = {
  topic: "tables", answerMode: "typing", difficulty: "beginner", questionCount: 10, enabledTopics: ["tables"],
  tables: { multiplicand: { start: 1, end: 20 }, multiplier: { start: 1, end: 10 } }, squares: { start: 1, end: 30 }, cubes: { start: 1, end: 15 },
  addition: { left: { start: 10, end: 99 }, right: { start: 10, end: 99 }, filter: "any" },
  subtraction: { left: { start: 10, end: 99 }, right: { start: 10, end: 99 }, filter: "any", allowNegative: false },
  chaining: { variant: "expression", operandCount: 3, initial: { start: 10, end: 99 }, operands: { start: 1, end: 30 }, operationMode: "mixed", allowNegative: false, progression: "manual", revealIntervalMs: 2000 },
  benchmark: { mode: "recommended", customTargetMs: 5000 },
};
export function applyDifficulty(config: PracticeConfiguration, difficulty: Difficulty): PracticeConfiguration {
  const next = structuredClone(config); next.difficulty = difficulty; if (difficulty === "custom") return next;
  const ranges = difficulty === "beginner" ? [{ start: 10, end: 99 }, { start: 10, end: 99 }] : difficulty === "intermediate" ? [{ start: 100, end: 999 }, { start: 10, end: 99 }] : [{ start: 100, end: 999 }, { start: 100, end: 999 }];
  next.addition.left = { ...ranges[0] }; next.addition.right = { ...ranges[1] }; next.subtraction.left = { ...ranges[0] }; next.subtraction.right = { ...ranges[1] };
  next.chaining.operandCount = difficulty === "beginner" ? 3 : difficulty === "intermediate" ? 4 : 6; return next;
}
