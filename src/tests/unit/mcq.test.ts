import { describe, expect, it } from "vitest";
import { generateMcqChoices } from "@/features/practice/generators/mcq";

const seeded = (seed = 1) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };

describe("MCQ option generator", () => {
  it.each([
    ["tables", 136, [17, 8]], ["squares", 196, [14]], ["cubes", 512, [8]],
  ] as const)("creates four unique safe options for %s", (topic, answer, operands) => {
    const choices = generateMcqChoices(topic, answer, operands, seeded());
    expect(choices).toHaveLength(4);
    expect(new Set(choices).size).toBe(4);
    expect(choices.filter((choice) => choice === answer)).toHaveLength(1);
    expect(choices.every(Number.isSafeInteger)).toBe(true);
    expect(choices.every((choice) => choice >= 0)).toBe(true);
  });

  it("randomizes the correct-answer position", () => {
    const positions = new Set(Array.from({ length: 20 }, (_, index) => generateMcqChoices("tables", 136, [17, 8], seeded(index + 1)).indexOf(136)));
    expect(positions.size).toBeGreaterThan(1);
  });

  it("uses bounded fallback choices for zero", () => {
    expect(generateMcqChoices("squares", 0, [0], () => 0.5)).toHaveLength(4);
  });
});
