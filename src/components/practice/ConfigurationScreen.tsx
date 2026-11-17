"use client";

import { useRef, useState } from "react";
import { BookOpen, Calculator, Link2, Minus, Play, Plus, Settings2, Shapes } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { applyDifficulty } from "@/features/practice/constants";
import { resolveBenchmarkMs } from "@/features/practice/engine/benchmark";
import type { PracticeConfiguration } from "@/features/practice/types";
import { CustomizationDialog } from "./CustomizationDialog";

const topics = [
  { id: "tables", label: "Multiplication Tables", icon: Calculator },
  { id: "squares", label: "Squares", icon: Shapes },
  { id: "cubes", label: "Cubes", icon: BookOpen },
  { id: "addition", label: "Addition", icon: Plus, new: true },
  { id: "subtraction", label: "Subtraction", icon: Minus, new: true },
  { id: "chaining", label: "Chaining", icon: Link2, new: true },
  { id: "mixed", label: "Mixed Practice", icon: Shapes },
] as const;

const range = (start: number, end: number) => `${start}–${end}`;
function configurationSummary(config: PracticeConfiguration): [string, string][] {
  let numberSummary = "";
  let calculationSummary = "Standard";
  if (config.topic === "tables") numberSummary = `${range(config.tables.multiplicand.start, config.tables.multiplicand.end)} × ${range(config.tables.multiplier.start, config.tables.multiplier.end)}`;
  else if (config.topic === "squares" || config.topic === "cubes") numberSummary = range(config[config.topic].start, config[config.topic].end);
  else if (config.topic === "addition" || config.topic === "subtraction") {
    numberSummary = `${range(config[config.topic].left.start, config[config.topic].left.end)} ${config.topic === "addition" ? "+" : "−"} ${range(config[config.topic].right.start, config[config.topic].right.end)}`;
    calculationSummary = config[config.topic].filter === "any" ? "Any" : config[config.topic].filter === "with-regrouping" ? `With ${config.topic === "addition" ? "carrying" : "borrowing"}` : `Without ${config.topic === "addition" ? "carrying" : "borrowing"}`;
  } else if (config.topic === "chaining") {
    numberSummary = `${config.chaining.operandCount} operands · ${range(config.chaining.operands.start, config.chaining.operands.end)}`;
    calculationSummary = config.chaining.variant === "sequential" ? "Sequential chain" : "Expression chain";
  } else {
    numberSummary = `${config.enabledTopics.length} topics selected`;
    calculationSummary = "Question-specific settings";
  }
  const benchmark = config.topic === "mixed" ? null : resolveBenchmarkMs(config, config.topic, config.topic === "chaining" ? config.chaining.operandCount : 2);
  const benchmarkSummary = config.benchmark.mode === "disabled" ? "Hidden" : benchmark === null ? "Per question" : `${(benchmark / 1000).toFixed(benchmark % 1000 ? 1 : 0)} seconds`;
  return [["Number range", numberSummary], ["Calculation type", calculationSummary], ["Speed target", benchmarkSummary]];
}

export function ConfigurationScreen({ initial, onStart, onWhatsNew }: {
  initial: PracticeConfiguration; onStart: (config: PracticeConfiguration) => void; onWhatsNew?: () => void;
}) {
  const [config, setConfig] = useState<PracticeConfiguration>(initial);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const startingRef = useRef(false);
  const summary = configurationSummary(config);

  const start = (next: PracticeConfiguration) => {
    if (startingRef.current) return;
    startingRef.current = true;
    onStart(next);
  };
  const startFromDialog = (next: PracticeConfiguration) => {
    if (startingRef.current) return;
    startingRef.current = true;
    setConfig(next);
    setCustomizationOpen(false);
    window.setTimeout(() => onStart(next), 0);
  };

  return <main className="shell"><div className="container">
    <header className="home-header">
      <div className="header-primary"><div className="brand"><div className="brand-mark"><Calculator size={24} aria-hidden="true" /></div><div className="brand-copy"><h1>SSC Calculation Trainer</h1><p>Build speed, accuracy and arithmetic recall.</p></div></div><ThemeToggle /></div>
      <nav className="header-secondary" aria-label="Application actions"><button type="button" className="text-button" onClick={onWhatsNew}>What’s new</button><a className="study-link" href="/study"><BookOpen size={16} aria-hidden="true" /> Study sheets</a></nav>
    </header>
    <div className="card configuration-card">
      <section className="section"><p className="eyebrow">Choose a module</p><div className="topic-grid module-grid">{topics.map(({ id, label, icon: Icon, ...item }) => <button type="button" key={id} className={`choice-card ${config.topic === id ? "selected" : ""}`} onClick={() => setConfig(current => ({ ...current, topic: id, enabledTopics: id === "mixed" ? current.enabledTopics : [id] }))} aria-pressed={config.topic === id}><Icon size={21} aria-hidden="true" /><strong>{label}</strong>{"new" in item && <span className="new-badge">New</span>}</button>)}</div></section>
      <section className="section quick-config">
        <div className="field"><span className="field-label">Difficulty</span><div className="selection-grid difficulty-grid">{(["beginner", "intermediate", "advanced", "custom"] as const).map(value => <button type="button" key={value} className={config.difficulty === value ? "selected" : ""} onClick={() => setConfig(current => applyDifficulty(current, value))} aria-pressed={config.difficulty === value}>{value}</button>)}</div></div>
        <div className="field"><span className="field-label">Questions</span><div className="selection-grid count-grid">{[5, 10, 20, 50].map(value => <button type="button" key={value} className={config.questionCount === value ? "selected" : ""} onClick={() => setConfig(current => ({ ...current, questionCount: value }))} aria-pressed={config.questionCount === value}>{value}</button>)}</div></div>
        <div className="field"><span className="field-label">Answer mode</span><div className="selection-grid answer-mode-grid"><button type="button" className={config.answerMode === "typing" ? "selected" : ""} onClick={() => setConfig(current => ({ ...current, answerMode: "typing" }))} aria-pressed={config.answerMode === "typing"}>Without options</button><button type="button" className={config.answerMode === "mcq" ? "selected" : ""} onClick={() => setConfig(current => ({ ...current, answerMode: "mcq" }))} aria-pressed={config.answerMode === "mcq"}>With options</button></div></div>
      </section>
      <section className="section configuration-summary-section">
        <div className="configuration-summary"><div><p className="eyebrow">Current settings</p>{summary.map(([label, value]) => <div className="summary-line" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><button type="button" className="secondary customize-button" onClick={() => setCustomizationOpen(true)}><Settings2 size={17} aria-hidden="true" /> Customize</button></div>
      </section>
      <section className="section start-section"><button className="primary" type="button" onClick={() => start(config)}><Play size={18} fill="currentColor" aria-hidden="true" /> Start Practice</button><p className="note center">Practice data stays in memory and is cleared on reload.</p></section>
    </div>
    <CustomizationDialog open={customizationOpen} committed={config} onCancel={() => setCustomizationOpen(false)} onApply={next => { setConfig(next); setCustomizationOpen(false); }} onStart={startFromDialog} />
  </div></main>;
}
