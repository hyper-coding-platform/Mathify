"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { calculateAnalytics } from "@/features/practice/engine/analytics";
import type { PracticeConfiguration, QuestionResult } from "@/features/practice/types";
import { formatSeconds } from "@/lib/format-time";
import { ShareResultsButton } from "./ShareResultsButton";

type Filter = "all" | "correct" | "incorrect";
type Sort = "original" | "fastest" | "slowest";
const modeLabel = (mode: PracticeConfiguration["answerMode"]) => mode === "mcq" ? "With Options" : "Without Options";

export function ResultsScreen({ configuration, results, sessionDurationMs, onAgain, onChange }: { configuration: PracticeConfiguration; results: QuestionResult[]; sessionDurationMs: number; onAgain: () => void; onChange: () => void }) {
  const analytics = useMemo(() => calculateAnalytics(results, sessionDurationMs), [results, sessionDurationMs]);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("original");
  const review = useMemo(() => {
    const indexed = results.map((result, index) => ({ result, index }));
    const filtered = indexed.filter(({ result }) => filter === "all" || (filter === "correct" ? result.isCorrect : !result.isCorrect));
    return sort === "original" ? filtered : [...filtered].sort((a, b) => sort === "fastest" ? a.result.durationMs - b.result.durationMs : b.result.durationMs - a.result.durationMs);
  }, [filter, results, sort]);

  const stats = [
    ["Correct", `${analytics.correct}/${analytics.total}`], ["Average time", formatSeconds(analytics.averageTimeMs)],
    ["Fastest", formatSeconds(analytics.fastestMs)], ["Questions/min", analytics.questionsPerMinute.toFixed(1)],
  ];
  const topicLabel = configuration.topic === "mixed" ? "Mixed Practice" : configuration.topic[0].toUpperCase() + configuration.topic.slice(1);
  const answerModeLabel = modeLabel(configuration.answerMode);

  return <main className="shell"><div className="results-container">
    <header className="results-head"><div><p className="eyebrow">Session complete</p><h1>Nice work — here are your results</h1><p>Mode: <strong>{answerModeLabel}</strong> · {topicLabel}</p></div><div className="score-ring" style={{ "--score": `${analytics.accuracy}%` } as React.CSSProperties}><strong>{analytics.accuracy.toFixed(0)}%</strong></div></header>
    <div className="stat-grid">{stats.map(([label, value]) => <div className="card stat" key={label}><span>{label}</span><strong className="tabular">{value}</strong></div>)}</div>
    <div className="analytics-grid">
      <section className="card panel"><h2>Performance details</h2>{[
        ["Incorrect answers", analytics.incorrect], ["Total session time", formatSeconds(analytics.totalDurationMs)], ["Slowest question", formatSeconds(analytics.slowestMs)], ["Avg. correct time", formatSeconds(analytics.averageCorrectMs)],
      ].map(([label, value]) => <div className="topic-line" key={label}><strong>{label}</strong><span className="tabular">{value}</span></div>)}
        <h2 style={{ marginTop: 18 }}>Topic breakdown</h2>{analytics.topics.map((topic) => <div className="topic-line" key={topic.topic}><strong>{topic.topic}</strong><span>{topic.correct}/{topic.total} correct</span><span>Average time</span><span className="tabular">{formatSeconds(topic.averageTimeMs)}</span></div>)}
      </section>
      <section className="card panel"><h2>Question review</h2><div className="review-tools"><label className="sr-only" htmlFor="review-filter">Filter answers</label><select id="review-filter" value={filter} onChange={(event) => setFilter(event.target.value as Filter)}><option value="all">All answers</option><option value="correct">Correct</option><option value="incorrect">Incorrect</option></select><label className="sr-only" htmlFor="review-sort">Sort answers</label><select id="review-sort" value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="original">Original order</option><option value="fastest">Fastest first</option><option value="slowest">Slowest first</option></select></div>
        {review.map(({ result, index }) => <details className="review-item" key={result.questionId}><summary><span className={`status-icon ${result.isCorrect ? "correct" : "incorrect"}`}>{result.isCorrect ? <Check size={15} /> : <X size={15} />}</span><span><span className="review-expression">{index + 1}. {result.expression}</span><span className="review-meta"> · {result.topic}</span></span><span className="review-meta tabular">{formatSeconds(result.durationMs)}</span></summary><div className="review-body">{result.answerMode === "typing" ? <p>Your answer: <strong>{result.userAnswer}</strong> · Correct answer: <strong>{result.correctAnswer}</strong></p> : <><p>Selected: <strong>{result.selectedOption}</strong> · Correct: <strong>{result.correctAnswer}</strong></p><div className="review-options">{result.choices?.map((choice, optionIndex) => <div key={choice} className={`review-option ${choice === result.selectedOption ? "chosen" : ""} ${choice === result.correctAnswer ? "correct-choice" : ""}`}>{String.fromCharCode(65 + optionIndex)}. {choice}{choice === result.selectedOption ? " · selected" : ""}{choice === result.correctAnswer ? " · correct" : ""}</div>)}</div></>}</div></details>)}
        {review.length === 0 && <p className="note">No questions match this filter.</p>}
      </section>
    </div>
    <div className="action-row"><button type="button" className="primary" onClick={onAgain}><RotateCcw size={18} aria-hidden="true" /> Practice Again</button><ShareResultsButton analytics={analytics} topic={topicLabel} mode={answerModeLabel} /><button type="button" className="secondary" onClick={onChange}><SlidersHorizontal size={18} aria-hidden="true" /> Adjust Practice</button></div>
  </div></main>;
}
