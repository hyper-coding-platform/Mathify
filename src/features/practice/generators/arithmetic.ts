import { randomInt, type RandomSource } from "@/lib/random";
import type { BinaryArithmeticConfiguration, Question } from "../types";

export function additionCarries(a: number, b: number): boolean {
  let left = Math.abs(a), right = Math.abs(b);
  while (left > 0 || right > 0) { if (left % 10 + right % 10 >= 10) return true; left = Math.floor(left / 10); right = Math.floor(right / 10); }
  return false;
}
export function subtractionBorrows(a: number, b: number): boolean {
  let left = Math.abs(a), right = Math.abs(b);
  while (left > 0 || right > 0) { if (left % 10 < right % 10) return true; left = Math.floor(left / 10); right = Math.floor(right / 10); }
  return false;
}
const matches = (hasRegrouping: boolean, filter: BinaryArithmeticConfiguration["filter"]) => filter === "any" || (filter === "with-regrouping" ? hasRegrouping : !hasRegrouping);
export function generateAddition(config: BinaryArithmeticConfiguration, random: RandomSource): Omit<Question, "id" | "choices" | "benchmarkMs"> {
  for (let retry = 0; retry < 160; retry += 1) { const a = randomInt(config.left.start, config.left.end, random), b = randomInt(config.right.start, config.right.end, random); if (matches(additionCarries(a, b), config.filter)) { const [low, high] = a <= b ? [a, b] : [b, a]; return { topic: "addition", expression: `${a} + ${b}`, operands: [a, b], correctAnswer: a + b, identity: `addition:${low}:${high}` }; } }
  throw new Error("The selected addition ranges cannot reliably produce this carrying rule.");
}
export function generateSubtraction(config: BinaryArithmeticConfiguration, random: RandomSource): Omit<Question, "id" | "choices" | "benchmarkMs"> {
  for (let retry = 0; retry < 200; retry += 1) { const a = randomInt(config.left.start, config.left.end, random), b = randomInt(config.right.start, config.right.end, random); if (!config.allowNegative && a < b) continue; if (matches(subtractionBorrows(a, b), config.filter)) return { topic: "subtraction", expression: `${a} − ${b}`, operands: [a, b], correctAnswer: a - b, identity: `subtraction:${a}:${b}` }; }
  throw new Error("The selected subtraction ranges cannot produce a valid question with these rules.");
}
