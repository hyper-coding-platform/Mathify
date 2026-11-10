import { randomInt, shuffle, type RandomSource } from "@/lib/random";
import { generateMcqChoices } from "./mcq";
import type { PracticeConfiguration, PracticeTopic, Question } from "../types";

type TopicFactory = (config: PracticeConfiguration, random: RandomSource) => Omit<Question, "id" | "choices">;

const factories: Record<PracticeTopic, TopicFactory> = {
  tables: (config, random) => {
    const a = randomInt(config.tables.multiplicand.start, config.tables.multiplicand.end, random);
    const b = randomInt(config.tables.multiplier.start, config.tables.multiplier.end, random);
    const [low, high] = a <= b ? [a, b] : [b, a];
    return { topic: "tables", expression: `${a} × ${b}`, operands: [a, b], correctAnswer: a * b, identity: `tables:${low}:${high}` };
  },
  squares: (config, random) => {
    const n = randomInt(config.squares.start, config.squares.end, random);
    return { topic: "squares", expression: `${n}²`, operands: [n], correctAnswer: n ** 2, identity: `squares:${n}` };
  },
  cubes: (config, random) => {
    const n = randomInt(config.cubes.start, config.cubes.end, random);
    return { topic: "cubes", expression: `${n}³`, operands: [n], correctAnswer: n ** 3, identity: `cubes:${n}` };
  },
};

function generateForTopic(topic: PracticeTopic, count: number, config: PracticeConfiguration, random: RandomSource): Question[] {
  const questions: Question[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < count; index += 1) {
    let candidate = factories[topic](config, random);
    // A bounded retry gives uniqueness preference without constructing a giant pool.
    for (let retry = 0; retry < 24 && seen.has(candidate.identity); retry += 1) candidate = factories[topic](config, random);
    if (questions.length > 0 && candidate.identity === questions.at(-1)?.identity) {
      for (let retry = 0; retry < 8 && candidate.identity === questions.at(-1)?.identity; retry += 1) candidate = factories[topic](config, random);
    }
    seen.add(candidate.identity);
    questions.push({
      ...candidate,
      id: `${topic}-${index}-${Math.floor(random() * 1_000_000_000)}`,
      choices: config.answerMode === "mcq" ? generateMcqChoices(topic, candidate.correctAnswer, candidate.operands, random) : undefined,
    });
  }
  return questions;
}

export function constructSession(config: PracticeConfiguration, random: RandomSource = Math.random): Question[] {
  const topics = config.topic === "mixed" ? config.enabledTopics : [config.topic];
  const base = Math.floor(config.questionCount / topics.length);
  const extra = config.questionCount % topics.length;
  const questions = topics.flatMap((topic, index) => generateForTopic(topic, base + (index < extra ? 1 : 0), config, random));
  return shuffle(questions, random).map((question, index) => ({ ...question, id: `q-${index + 1}-${question.id}` }));
}

export { factories as topicRegistry };
