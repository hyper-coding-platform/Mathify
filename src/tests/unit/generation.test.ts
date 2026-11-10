import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIGURATION } from "@/features/practice/constants";
import { constructSession } from "@/features/practice/generators/registry";
import { validateConfiguration } from "@/features/practice/engine/validation";

describe("question generation", () => {
  it("balances and shuffles mixed topics", () => {
    const questions = constructSession({ ...DEFAULT_CONFIGURATION, topic: "mixed", answerMode: "mcq", questionCount: 20, enabledTopics: ["tables", "squares", "cubes"] });
    const counts = ["tables", "squares", "cubes"].map((topic) => questions.filter((q) => q.topic === topic).length);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    expect(questions.every((q) => q.choices?.length === 4)).toBe(true);
  });

  it("keeps arithmetic correct and ranges bounded", () => {
    const questions = constructSession({ ...DEFAULT_CONFIGURATION, topic: "squares", questionCount: 30 });
    for (const question of questions) {
      expect(question.operands[0]).toBeGreaterThanOrEqual(1);
      expect(question.operands[0]).toBeLessThanOrEqual(30);
      expect(question.correctAnswer).toBe(question.operands[0] ** 2);
    }
  });

  it("rejects unsafe or reversed configuration", () => {
    expect(validateConfiguration({ ...DEFAULT_CONFIGURATION, questionCount: 201 })).toHaveProperty("questionCount");
    expect(validateConfiguration({ ...DEFAULT_CONFIGURATION, tables: { ...DEFAULT_CONFIGURATION.tables, multiplicand: { start: 8, end: 2 } } })).toHaveProperty("multiplicand");
  });
});
