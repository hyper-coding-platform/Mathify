import type { Difficulty, PracticeConfiguration, PracticeTopic } from "../types";
const TARGETS: Record<PracticeTopic, Record<Exclude<Difficulty, "custom">, number>> = {
  tables: { beginner: 4000, intermediate: 3000, advanced: 2000 }, squares: { beginner: 5000, intermediate: 3000, advanced: 2000 },
  cubes: { beginner: 6000, intermediate: 4000, advanced: 3000 }, addition: { beginner: 7000, intermediate: 5000, advanced: 3000 },
  subtraction: { beginner: 8000, intermediate: 5000, advanced: 4000 }, chaining: { beginner: 12000, intermediate: 10000, advanced: 8000 },
};
export function recommendedBenchmarkMs(topic: PracticeTopic, difficulty: Difficulty, operandCount = 2, revealDurationMs = 0): number {
  const resolved = difficulty === "custom" ? "intermediate" : difficulty; let target = TARGETS[topic][resolved];
  if (topic === "chaining") { const baseline = resolved === "beginner" ? 3 : resolved === "intermediate" ? 4 : 6; target = Math.max(4000, target + (operandCount - baseline) * 1500); target = Math.max(target, revealDurationMs + 3000); }
  return target;
}
export function resolveBenchmarkMs(config: PracticeConfiguration, topic: PracticeTopic, operandCount = 2, revealDurationMs = 0): number | null {
  if (config.benchmark.mode === "disabled") return null; if (config.benchmark.mode === "custom") return config.benchmark.customTargetMs;
  return recommendedBenchmarkMs(topic, config.difficulty, operandCount, revealDurationMs);
}
export type BenchmarkStatus = "fast" | "near" | "over";
export function benchmarkStatus(elapsedMs: number, targetMs: number): BenchmarkStatus { if (elapsedMs < targetMs * .8) return "fast"; if (elapsedMs <= targetMs) return "near"; return "over"; }
