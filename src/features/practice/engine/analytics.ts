import type { PracticeTopic, QuestionResult, SessionAnalytics, TopicAnalytics } from "../types";

const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export function calculateAnalytics(results: QuestionResult[], sessionDurationMs: number): SessionAnalytics {
  const durations = results.map((result) => result.durationMs);
  const correctResults = results.filter((result) => result.isCorrect);
  const topicNames: PracticeTopic[] = ["tables", "squares", "cubes"];
  const topics: TopicAnalytics[] = topicNames.flatMap((topic) => {
    const values = results.filter((result) => result.topic === topic);
    return values.length ? [{ topic, total: values.length, correct: values.filter((value) => value.isCorrect).length, averageTimeMs: average(values.map((value) => value.durationMs)) }] : [];
  });
  return {
    total: results.length,
    correct: correctResults.length,
    incorrect: results.length - correctResults.length,
    accuracy: results.length ? (correctResults.length / results.length) * 100 : 0,
    totalDurationMs: Math.max(0, sessionDurationMs),
    averageTimeMs: average(durations),
    fastestMs: durations.length ? Math.min(...durations) : 0,
    slowestMs: durations.length ? Math.max(...durations) : 0,
    averageCorrectMs: average(correctResults.map((result) => result.durationMs)),
    questionsPerMinute: sessionDurationMs > 0 ? results.length / (sessionDurationMs / 60_000) : 0,
    topics,
  };
}
