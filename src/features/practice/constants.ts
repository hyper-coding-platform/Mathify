import type { PracticeConfiguration } from "./types";

export const MAX_QUESTIONS = 200;
export const MAX_BASE = 1_000;
export const FEEDBACK_MS = 550;

export const DEFAULT_CONFIGURATION: PracticeConfiguration = {
  topic: "tables",
  answerMode: "typing",
  questionCount: 10,
  enabledTopics: ["tables"],
  tables: { multiplicand: { start: 1, end: 20 }, multiplier: { start: 1, end: 10 } },
  squares: { start: 1, end: 30 },
  cubes: { start: 1, end: 15 },
};
