import { MAX_BASE, MAX_QUESTIONS } from "../constants";
import type { IntRange, PracticeConfiguration } from "../types";

export type ValidationErrors = Record<string, string>;

function validateRange(name: string, range: IntRange, max: number, errors: ValidationErrors) {
  if (!Number.isSafeInteger(range.start) || !Number.isSafeInteger(range.end)) errors[name] = "Use whole, finite numbers.";
  else if (range.start < 0 || range.end > max) errors[name] = `Use values from 0 to ${max}.`;
  else if (range.start > range.end) errors[name] = "Start must not exceed end.";
}

export function validateConfiguration(config: PracticeConfiguration): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!Number.isSafeInteger(config.questionCount) || config.questionCount < 1 || config.questionCount > MAX_QUESTIONS) {
    errors.questionCount = `Choose 1–${MAX_QUESTIONS} questions.`;
  }
  if (config.topic === "mixed" && config.enabledTopics.length === 0) errors.enabledTopics = "Select at least one topic.";
  const enabled = config.topic === "mixed" ? config.enabledTopics : [config.topic];
  if (enabled.includes("tables")) {
    validateRange("multiplicand", config.tables.multiplicand, MAX_BASE, errors);
    validateRange("multiplier", config.tables.multiplier, MAX_BASE, errors);
    if (Number.isSafeInteger(config.tables.multiplicand.end) && Number.isSafeInteger(config.tables.multiplier.end) &&
      !Number.isSafeInteger(config.tables.multiplicand.end * config.tables.multiplier.end)) errors.tables = "This range exceeds safe integer arithmetic.";
  }
  if (enabled.includes("squares")) validateRange("squares", config.squares, Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER)), errors);
  if (enabled.includes("cubes")) validateRange("cubes", config.cubes, Math.floor(Math.cbrt(Number.MAX_SAFE_INTEGER)), errors);
  return errors;
}

export const parseIntegerAnswer = (value: string): number | null => {
  if (!/^-?\d+$/.test(value.trim())) return null;
  const answer = Number(value);
  return Number.isSafeInteger(answer) ? answer : null;
};
