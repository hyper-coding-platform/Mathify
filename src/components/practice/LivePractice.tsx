"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LogOut, XCircle } from "lucide-react";
import { formatClock } from "@/lib/format-time";
import type { Question, QuestionResult, SessionStatus } from "@/features/practice/types";
import type { TimingController } from "@/features/practice/engine/timing";
import { MultipleChoiceInput } from "./MultipleChoiceInput";
import { TypingAnswerInput } from "./TypingAnswerInput";

function TimerDisplay({ timing, questionKey }: { timing: TimingController; questionKey: string }) {
  const [display, setDisplay] = useState({ session: 0, question: 0 });
  useEffect(() => {
    const update = () => setDisplay({ session: timing.sessionElapsed(), question: timing.questionElapsed() });
    update();
    const interval = window.setInterval(update, 100);
    return () => window.clearInterval(interval);
  }, [timing, questionKey]);
  return <div className="timer-row" aria-label="Timers"><div className="timer"><span>Total time</span><strong className="tabular">{formatClock(display.session)}</strong></div><div className="timer"><span>This question</span><strong className="tabular">{formatClock(display.question)}</strong></div></div>;
}

export function LivePractice({ question, index, total, status, lastResult, timing, onSubmit, onExit }: { question: Question; index: number; total: number; status: SessionStatus; lastResult?: QuestionResult; timing: TimingController; onSubmit: (answer: number) => void; onExit: () => void }) {
  const disabled = status !== "active";
  return <main className="shell"><div className="container">
    <header className="practice-header"><div><strong>SSC Calculation Trainer</strong><div className="progress-copy">Question {index + 1} of {total}</div></div><button type="button" className="exit-button" onClick={onExit}><LogOut size={16} aria-hidden="true" /> Exit</button></header>
    <div className="progress-track" aria-label={`${Math.round(((index + (status === "feedback" ? 1 : 0)) / total) * 100)}% complete`}><div className="progress-fill" style={{ width: `${((index + (status === "feedback" ? 1 : 0)) / total) * 100}%` }} /></div>
    <div className="card">
      <TimerDisplay timing={timing} questionKey={question.id} />
      <section className="question-area" key={question.id}>
        <span className="topic-pill">{question.topic}</span>
        <div className="expression tabular" aria-label={`${question.expression} equals what`}>{question.expression} <span aria-hidden="true">= ?</span></div>
        {question.choices ? <MultipleChoiceInput choices={question.choices} disabled={disabled} onSubmit={onSubmit} /> : <TypingAnswerInput disabled={disabled} onSubmit={onSubmit} />}
        <div className={`feedback ${lastResult?.isCorrect ? "correct" : "incorrect"}`} role="status" aria-live="assertive">
          {status === "feedback" && lastResult && (lastResult.isCorrect ? <><CheckCircle2 size={20} /> Correct</> : <><XCircle size={20} /> Incorrect — correct answer: {lastResult.correctAnswer}</>)}
        </div>
      </section>
    </div>
  </div></main>;
}
