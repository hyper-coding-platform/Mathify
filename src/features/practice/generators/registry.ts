import { randomInt, shuffle, type RandomSource } from "@/lib/random";
import { resolveBenchmarkMs } from "../engine/benchmark";
import type { PracticeConfiguration, PracticeTopic, Question } from "../types";
import { generateAddition, generateSubtraction } from "./arithmetic";
import { generateChain } from "./chaining";
import { generateMcqChoices } from "./mcq";
type Candidate = Omit<Question, "id" | "choices" | "benchmarkMs">;
type TopicFactory = (config: PracticeConfiguration, random: RandomSource) => Candidate;
const factories: Record<PracticeTopic, TopicFactory> = {
  tables: (config, random) => { const a = randomInt(config.tables.multiplicand.start, config.tables.multiplicand.end, random), b = randomInt(config.tables.multiplier.start, config.tables.multiplier.end, random), [low, high] = a <= b ? [a, b] : [b, a]; return { topic: "tables", expression: `${a} × ${b}`, operands: [a, b], correctAnswer: a * b, identity: `tables:${low}:${high}` }; },
  squares: (config, random) => { const n = randomInt(config.squares.start, config.squares.end, random); return { topic: "squares", expression: `${n}²`, operands: [n], correctAnswer: n ** 2, identity: `squares:${n}` }; },
  cubes: (config, random) => { const n = randomInt(config.cubes.start, config.cubes.end, random); return { topic: "cubes", expression: `${n}³`, operands: [n], correctAnswer: n ** 3, identity: `cubes:${n}` }; },
  addition: (config, random) => generateAddition(config.addition, random), subtraction: (config, random) => generateSubtraction(config.subtraction, random), chaining: (config, random) => generateChain(config.chaining, random),
};
function generateForTopic(topic: PracticeTopic, count: number, config: PracticeConfiguration, random: RandomSource): Question[] {
  const questions: Question[] = [], seen = new Set<string>();
  for (let index = 0; index < count; index += 1) { let candidate = factories[topic](config, random); for (let retry = 0; retry < 24 && seen.has(candidate.identity); retry += 1) candidate = factories[topic](config, random); seen.add(candidate.identity);
    const benchmarkMs = resolveBenchmarkMs(config, topic, candidate.operands.length, candidate.revealDurationMs);
    questions.push({ ...candidate, benchmarkMs, id: `${topic}-${index}-${Math.floor(random() * 1e9)}`, choices: config.answerMode === "mcq" ? generateMcqChoices(topic, candidate.correctAnswer, candidate.operands, random, candidate.operations, topic === "subtraction" ? Boolean(config.subtraction.allowNegative) : false) : undefined }); }
  return questions;
}
function interleave(questions: Question[], random: RandomSource): Question[] {
  const remaining = shuffle(questions, random), output: Question[] = [];
  while (remaining.length) { const previous = output.at(-1)?.topic; let choices = remaining.map((q, i) => q.topic !== previous ? i : -1).filter(i => i >= 0); if (!choices.length) choices = remaining.map((_, i) => i); const position = choices[Math.floor(random() * choices.length)]; output.push(remaining.splice(position, 1)[0]); }
  return output;
}
export function constructSession(config: PracticeConfiguration, random: RandomSource = Math.random): Question[] {
  const topics = config.topic === "mixed" ? config.enabledTopics : [config.topic]; if (!topics.length) return [];
  const base = Math.floor(config.questionCount / topics.length), extra = config.questionCount % topics.length;
  return interleave(topics.flatMap((topic, index) => generateForTopic(topic, base + (index < extra ? 1 : 0), config, random)), random).map((question, index) => ({ ...question, id: `q-${index + 1}-${question.id}` }));
}
export { factories as topicRegistry };
