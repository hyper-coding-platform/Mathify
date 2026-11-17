"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Focus, LogOut, XCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { benchmarkStatus } from "@/features/practice/engine/benchmark";
import type { TimingController } from "@/features/practice/engine/timing";
import type { PracticeConfiguration, Question, QuestionResult, SessionStatus } from "@/features/practice/types";
import { formatClock, formatSeconds } from "@/lib/format-time";
import { MultipleChoiceInput } from "./MultipleChoiceInput";
import { TypingAnswerInput } from "./TypingAnswerInput";

function TimerDisplay({ timing, question, hidden }: { timing: TimingController; question: Question; hidden: boolean }) {
  const [display, setDisplay] = useState({ session: 0, question: 0 });

  useEffect(() => {
    const update = () => setDisplay({ session: timing.sessionElapsed(), question: timing.questionElapsed() });
    update();
    const timer = window.setInterval(update, 100);
    return () => window.clearInterval(timer);
  }, [timing, question.id]);

  const pace = question.benchmarkMs === null ? null : benchmarkStatus(display.question, question.benchmarkMs);
  if (hidden) return <div className="timer-hidden">Timer hidden · timing continues</div>;

  return <div className="timer-row" aria-label="Timers">
    <div className="timer"><span>Session</span><strong>{formatClock(display.session)}</strong></div>
    <div className={`timer benchmark-${pace ?? "off"}`}>
      <span>Question · {pace === "fast" ? "on pace" : pace === "near" ? "near target" : pace === "over" ? "over target" : "benchmark off"}</span>
      <strong>{formatSeconds(display.question)}</strong>
      {question.benchmarkMs !== null && <small>Target {formatSeconds(question.benchmarkMs)}</small>}
      <i style={{ width: question.benchmarkMs ? `${Math.min(100, display.question / question.benchmarkMs * 100)}%` : 0 }} />
    </div>
  </div>;
}

function SequentialQuestion({ question, config, disabled, onSubmit }: { question: Question; config: PracticeConfiguration; disabled: boolean; onSubmit: (answer: number) => void }) {
  const operationCount = question.operations?.length ?? 0;
  const [revealed, setRevealed] = useState(0);
  const [countdown, setCountdown] = useState(config.chaining.progression === "automatic" ? 3 : 0);

  useEffect(() => {
    if (config.chaining.progression !== "automatic" || countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [config.chaining.progression, countdown]);

  useEffect(() => {
    if (config.chaining.progression !== "automatic" || countdown > 0 || revealed >= operationCount) return;
    const timer = window.setTimeout(() => setRevealed(value => value + 1), config.chaining.revealIntervalMs);
    return () => window.clearTimeout(timer);
  }, [config.chaining.progression, config.chaining.revealIntervalMs, countdown, operationCount, revealed]);

  return <>
    <div className="chain-display">
      <span>Initial number</span><strong>{question.operands[0]}</strong>
      {countdown > 0 && <p>Starting in {countdown}…</p>}
      {question.operands.slice(1, revealed + 1).map((operand, index) =>
        <div className="chain-step" key={index}>Step {index + 1}: {question.operations?.[index] === "add" ? "+" : "−"}{operand}</div>)}
    </div>
    {revealed < operationCount
      ? config.chaining.progression === "manual" && <button type="button" className="primary chain-next" onClick={() => setRevealed(value => value + 1)}>Show next operation</button>
      : question.choices
        ? <MultipleChoiceInput choices={question.choices} disabled={disabled} onSubmit={onSubmit} />
        : <TypingAnswerInput disabled={disabled} onSubmit={onSubmit} />}
  </>;
}

export function LivePractice({ question, config, index, total, status, lastResult, timing, onSubmit, onExit }: {
  question: Question; config: PracticeConfiguration; index: number; total: number; status: SessionStatus;
  lastResult?: QuestionResult; timing: TimingController; onSubmit: (answer: number) => void; onExit: () => void;
}) {
  const [focus, setFocus] = useState(false);
  const [hideTimer, setHideTimer] = useState(false);
  const disabled = status !== "active";

  return <main className={`shell practice-shell ${focus ? "focus-mode" : ""}`}><div className="container">
    <header className="practice-header">
      <div className="practice-progress"><strong>Question {index + 1} of {total}</strong><span>SSC Calculation Trainer</span></div>
      <div className="practice-actions" aria-label="Practice controls">
        <button type="button" className="icon-button" onClick={() => setHideTimer(value => !value)} aria-label={hideTimer ? "Show timer" : "Hide timer"} title={hideTimer ? "Show timer" : "Hide timer"}>{hideTimer ? <Eye size={18} /> : <EyeOff size={18} />}</button>
        <button type="button" className="icon-button" onClick={() => setFocus(value => !value)} aria-label={focus ? "Exit focus mode" : "Enter focus mode"} title={focus ? "Exit focus mode" : "Enter focus mode"}><Focus size={18} /></button>
        <ThemeToggle compact />
        <button type="button" className="icon-button exit-control" onClick={onExit} aria-label="Exit practice" title="Exit practice"><LogOut size={18} /></button>
      </div>
    </header>
    <div className="progress-track" aria-label={`${Math.round((index + (status === "feedback" ? 1 : 0)) / total * 100)}% complete`}>
      <div className="progress-fill" style={{ width: `${(index + (status === "feedback" ? 1 : 0)) / total * 100}%` }} />
    </div>
    <div className="card practice-card">
      <TimerDisplay timing={timing} question={question} hidden={hideTimer} />
      <section className="question-area" key={question.id}>
        <span className="topic-pill">{question.topic}</span>
        {question.chainingVariant === "sequential"
          ? <SequentialQuestion question={question} config={config} disabled={disabled} onSubmit={onSubmit} />
          : <>
              <div className="expression tabular">{question.expression} <span aria-hidden>= ?</span></div>
              {question.choices
                ? <MultipleChoiceInput choices={question.choices} disabled={disabled} onSubmit={onSubmit} />
                : <TypingAnswerInput disabled={disabled} onSubmit={onSubmit} />}
            </>}
        {status === "feedback" && lastResult && <div className={`feedback ${lastResult.isCorrect ? "correct" : "incorrect"}`} role="status" aria-live="assertive">
          {lastResult.isCorrect
            ? <><CheckCircle2 size={20} /> Correct{lastResult.benchmarkMs !== null && lastResult.durationMs > lastResult.benchmarkMs ? " · beyond target" : ""}</>
            : <><XCircle size={20} /> Incorrect — correct answer: {lastResult.correctAnswer}</>}
        </div>}
      </section>
    </div>
  </div></main>;
}
