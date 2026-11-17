"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { calculateAnalytics } from "@/features/practice/engine/analytics";
import { difficultyRecommendation, slowResults, weakAreaResults, wrongResults } from "@/features/practice/engine/recommendations";
import type { PracticeConfiguration, QuestionResult } from "@/features/practice/types";
import { formatSeconds } from "@/lib/format-time";
import { ShareResultsButton } from "./ShareResultsButton";

type Filter = "all" | "correct" | "incorrect" | "slow" | "fast";
type Sort = "original" | "fastest" | "slowest" | "over";
type SpeedStatus = "within" | "over" | "neutral";

function speedStatus(result: QuestionResult): SpeedStatus {
  if (typeof result.benchmarkMs !== "number") return "neutral";
  return result.durationMs <= result.benchmarkMs ? "within" : "over";
}
function speedLabel(status: SpeedStatus) { return status === "within" ? "Within target" : status === "over" ? "Over target" : "No target"; }
function timeDifference(result: QuestionResult) {
  if (typeof result.benchmarkMs !== "number") return null;
  const difference = result.durationMs - result.benchmarkMs;
  return `${difference > 0 ? "+" : difference < 0 ? "−" : "±"}${formatSeconds(Math.abs(difference))}`;
}

export function ResultsScreen({ configuration, results, sessionDurationMs, onAgain, onRetry, onChange }: {
  configuration: PracticeConfiguration; results: QuestionResult[]; sessionDurationMs: number;
  onAgain: () => void; onRetry: (results: QuestionResult[]) => void; onChange: () => void;
}) {
  const analytics = useMemo(() => calculateAnalytics(results, sessionDurationMs), [results, sessionDurationMs]);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("original");
  const review = useMemo(() => {
    const rows = results.map((result, index) => ({ result, index })).filter(({ result }) =>
      filter === "all" ||
      filter === "correct" && result.isCorrect ||
      filter === "incorrect" && !result.isCorrect ||
      filter === "slow" && result.benchmarkMs !== null && result.durationMs > result.benchmarkMs ||
      filter === "fast" && result.benchmarkMs !== null && result.durationMs <= result.benchmarkMs);
    if (sort === "original") return rows;
    return [...rows].sort((a, b) => sort === "fastest"
      ? a.result.durationMs - b.result.durationMs
      : sort === "slowest"
        ? b.result.durationMs - a.result.durationMs
        : Math.max(0, b.result.durationMs - (b.result.benchmarkMs ?? b.result.durationMs)) -
          Math.max(0, a.result.durationMs - (a.result.benchmarkMs ?? a.result.durationMs)));
  }, [filter, results, sort]);

  const topicLabel = configuration.topic === "mixed" ? "Mixed Practice" : configuration.topic[0].toUpperCase() + configuration.topic.slice(1);
  const modeLabel = configuration.answerMode === "mcq" ? "With Options" : "Without Options";
  const stats = [
    ["Correct", `${analytics.correct}/${analytics.total}`],
    ["Average time", formatSeconds(analytics.averageTimeMs)],
    ["Median time", formatSeconds(analytics.medianTimeMs)],
    ["Within target", analytics.withinTargetRate === null ? "N/A" : `${analytics.withinTargetRate.toFixed(0)}%`],
  ];

  return <main className="shell"><div className="results-container">
    <div className="page-toolbar"><ThemeToggle /></div>
    <header className="results-head">
      <div><p className="eyebrow">Session complete</p><h1>Your speed and accuracy review</h1><p>{modeLabel} · {topicLabel}</p></div>
      <div className="score-ring" style={{ "--score": `${analytics.accuracy}%` } as React.CSSProperties}><strong>{analytics.accuracy.toFixed(0)}%</strong></div>
    </header>
    <div className="stat-grid">{stats.map(([label, value]) => <div className="card stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="analytics-grid">
      <section className="card panel">
        <h2>Performance details</h2>
        {[
          ["Total session time", formatSeconds(analytics.totalDurationMs)],
          ["Average benchmark", analytics.averageBenchmarkMs === null ? "N/A" : formatSeconds(analytics.averageBenchmarkMs)],
          ["Avg. correct time", analytics.correct ? formatSeconds(analytics.averageCorrectMs) : "N/A"],
          ["Correct within target", analytics.correctWithinTargetRate === null ? "N/A" : `${analytics.correctWithinTargetRate.toFixed(0)}%`],
          ["Time above target", formatSeconds(analytics.totalTimeAboveBenchmarkMs)],
          ["Normalized duration", analytics.normalizedDurationRatio === null ? "N/A" : `${analytics.normalizedDurationRatio.toFixed(2)}×`],
        ].map(([label, value]) => <div className="topic-line" key={label}><strong>{label}</strong><span>{value}</span></div>)}
        <h2 className="subheading">By topic</h2>
        {analytics.topics.map(topic => <div className="topic-line" key={topic.topic}><strong>{topic.topic}</strong><span>{topic.accuracy.toFixed(0)}% accuracy</span><span>Within target</span><span>{topic.benchmarkEligible ? `${Math.round(topic.withinTarget / topic.benchmarkEligible * 100)}%` : "N/A"}</span></div>)}
        <div className="recommendation"><strong>Recommendation</strong><p>{difficultyRecommendation(results, configuration.difficulty)}</p><small>{results.length < 5 ? "Based on only a few questions." : "Accuracy is prioritized before speed."}</small></div>
      </section>
      <section className="card panel">
        <h2>Question review</h2>
        <p className="speed-legend"><span className="legend-dot within" /> Within target <span className="legend-dot over" /> Over target <span className="legend-dot neutral" /> Target unavailable</p>
        <div className="review-tools">
          <select aria-label="Filter answers" value={filter} onChange={event => setFilter(event.target.value as Filter)}><option value="all">All questions</option><option value="correct">Correct answers</option><option value="incorrect">Incorrect answers</option><option value="fast">Within target</option><option value="slow">Over target</option></select>
          <select aria-label="Sort answers" value={sort} onChange={event => setSort(event.target.value as Sort)}><option value="original">Original order</option><option value="fastest">Fastest first</option><option value="slowest">Slowest first</option><option value="over">Most over target</option></select>
        </div>
        {review.map(({ result, index }) => { const pace = speedStatus(result); const difference = timeDifference(result); return <details className="review-item" key={result.questionId}>
          <summary><span className={`status-icon ${result.isCorrect ? "correct" : "incorrect"}`} aria-label={result.isCorrect ? "Correct answer" : "Incorrect answer"} title={result.isCorrect ? "Correct answer" : "Incorrect answer"}>{result.isCorrect ? <Check size={15} /> : <X size={15} />}</span><span className="review-question"><span className="review-expression">{index + 1}. {result.expression}</span><span className="review-meta">{result.topic}</span></span><span className={`review-time speed-${pace}`} aria-label={`${formatSeconds(result.durationMs)}, ${speedLabel(pace)}`}><strong>{formatSeconds(result.durationMs)}</strong><small>{difference ?? "—"}</small><em>{speedLabel(pace)}</em></span><ChevronDown className="review-chevron" size={17} aria-hidden="true" /></summary>
          <div className="review-body"><dl className="review-details"><div><dt>Your answer</dt><dd>{result.userAnswer}</dd></div><div><dt>Correct answer</dt><dd>{result.correctAnswer}</dd></div><div><dt>Correctness</dt><dd>{result.isCorrect ? "Correct" : "Incorrect"}</dd></div><div><dt>Actual time</dt><dd>{formatSeconds(result.durationMs)}</dd></div><div><dt>Target time</dt><dd>{typeof result.benchmarkMs === "number" ? formatSeconds(result.benchmarkMs) : "Unavailable"}</dd></div><div><dt>Difference</dt><dd>{difference ?? "Unavailable"}</dd></div><div><dt>Speed status</dt><dd>{speedLabel(pace)}</dd></div></dl>{result.choices && <div className="review-options">{result.choices.map(choice => <div key={choice} className={`review-option ${choice === result.userAnswer ? "chosen" : ""} ${choice === result.correctAnswer ? "correct-choice" : ""}`}>{choice}</div>)}</div>}</div>
        </details>; })}
        {!review.length && <p className="note">No questions match this filter.</p>}
      </section>
    </div>
    <div className="retry-row"><button className="secondary" disabled={!wrongResults(results).length} onClick={() => onRetry(wrongResults(results))}>Practice Wrong Answers</button><button className="secondary" disabled={!slowResults(results).length} onClick={() => onRetry(slowResults(results))}>Practice Slow Questions</button><button className="secondary" onClick={() => onRetry(weakAreaResults(results))}>Practice Weak Areas</button></div>
    <div className="action-row"><button className="primary" onClick={onAgain}><RotateCcw size={18} /> Practice Again</button><ShareResultsButton analytics={analytics} topic={topicLabel} mode={modeLabel} /><button className="secondary" onClick={onChange}><SlidersHorizontal size={18} /> Change Configuration</button></div>
  </div></main>;
}
