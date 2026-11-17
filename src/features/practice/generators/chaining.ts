import { randomInt, type RandomSource } from "@/lib/random";
import type { ChainingConfiguration, Question } from "../types";
export function evaluateChain(operands: readonly number[], operations: readonly ("add" | "subtract")[]): number {
  if (operands.length !== operations.length + 1) throw new Error("A chain needs one more operand than operation.");
  return operations.reduce((total, operation, index) => operation === "add" ? total + operands[index + 1] : total - operands[index + 1], operands[0]);
}
export function generateChain(config: ChainingConfiguration, random: RandomSource): Omit<Question, "id" | "choices" | "benchmarkMs"> {
  for (let retry = 0; retry < 200; retry += 1) {
    const operands = [randomInt(config.initial.start, config.initial.end, random)]; const operations: ("add" | "subtract")[] = []; let value = operands[0]; let valid = true;
    for (let index = 1; index < config.operandCount; index += 1) {
      const operand = randomInt(config.operands.start, config.operands.end, random);
      const operation = config.operationMode === "addition" ? "add" : config.operationMode === "subtraction" ? "subtract" : random() < .5 ? "add" : "subtract";
      value = operation === "add" ? value + operand : value - operand; if (!config.allowNegative && value < 0) { valid = false; break; }
      operands.push(operand); operations.push(operation);
    }
    if (!valid || !Number.isSafeInteger(value)) continue;
    const expression = operands.slice(1).reduce((text, operand, index) => `${text} ${operations[index] === "add" ? "+" : "−"} ${operand}`, String(operands[0]));
    return { topic: "chaining", expression, operands, operations, correctAnswer: evaluateChain(operands, operations), identity: `chaining:${operations.join(",")}:${operands.join(",")}`, chainingVariant: config.variant, revealDurationMs: config.variant === "sequential" && config.progression === "automatic" ? (config.operandCount - 1) * config.revealIntervalMs : 0 };
  }
  throw new Error("The selected chaining rules cannot produce a non-negative sequence.");
}
