import { shuffle, type RandomSource } from "@/lib/random";
import type { PracticeTopic } from "../types";

const isUsable = (value: number, positiveOnly: boolean) =>
  Number.isSafeInteger(value) && (!positiveOnly || value >= 0);

/** Pure, bounded MCQ generation. The supplied random source makes it deterministic in tests. */
export function generateMcqChoices(
  topic: PracticeTopic,
  correct: number,
  operands: readonly number[],
  random: RandomSource = Math.random,
  operations?: readonly ("add" | "subtract")[],
  allowNegative = false,
): number[] {
  if (!Number.isSafeInteger(correct)) throw new Error("Correct answer must be a safe integer");
  const positiveOnly = !allowNegative && operands.every((value) => value >= 0);
  const candidates: number[] = [];
  const add = (value: number) => {
    if (value !== correct && isUsable(value, positiveOnly) && !candidates.includes(value)) candidates.push(value);
  };

  if (topic === "tables") {
    const [a, b] = operands;
    [correct - a, correct + a, correct - b, correct + b, correct - 10, correct + 10, correct - 1, correct + 1].forEach(add);
    add((a + 1) * b); add(a * (b + 1)); add((a - 1) * b); add(a * (b - 1));
  } else if (topic === "squares") {
    const [n] = operands;
    [correct - n, correct + n, correct - 10, correct + 10, (n - 1) ** 2, (n + 1) ** 2, correct - 1, correct + 1].forEach(add);
  } else if (topic === "cubes") {
    const [n] = operands;
    [correct - n * n, correct + n * n, (n - 1) ** 3, (n + 1) ** 3, correct - 10, correct + 10, correct - 1, correct + 1].forEach(add);
  } else if (topic === "addition") {
    const [a, b] = operands; [correct - 10, correct + 10, correct - 1, correct + 1, a + (b % 10), a + Math.floor(b / 10) * 10].forEach(add);
  } else if (topic === "subtraction") {
    const [a, b] = operands; [correct - 10, correct + 10, correct - 1, correct + 1, a - (b % 10), a - Math.floor(b / 10) * 10].forEach(add);
  } else {
    [correct - 10, correct + 10, correct - 1, correct + 1].forEach(add);
    operations?.forEach((operation, index) => add(correct + (operation === "add" ? -2 : 2) * operands[index + 1]));
  }

  // Bounded deterministic fallback works even for tiny/zero ranges.
  for (let delta = 1; candidates.length < 3 && delta <= 12; delta += 1) {
    add(correct + delta);
    add(correct - delta);
  }
  if (candidates.length < 3) throw new Error("Unable to construct safe MCQ choices");
  return shuffle([correct, ...shuffle(candidates, random).slice(0, 3)], random);
}
