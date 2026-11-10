"use client";

import { useMemo, useState } from "react";
import { BookOpen, Calculator, Keyboard, Layers3, Play, Shapes } from "lucide-react";
import { validateConfiguration } from "@/features/practice/engine/validation";
import type { AnswerMode, IntRange, PracticeConfiguration, PracticeTopic, TableRange } from "@/features/practice/types";

const topics = [
  { id: "tables", label: "Multiplication Tables", detail: "Products and recall", icon: Calculator },
  { id: "squares", label: "Squares", detail: "Perfect squares", icon: Shapes },
  { id: "cubes", label: "Cubes", detail: "Perfect cubes", icon: BookOpen },
  { id: "mixed", label: "Mixed Practice", detail: "Balanced topic mix", icon: Layers3 },
] as const;

const numberValue = (value: string) => value === "" ? Number.NaN : Number(value);

function SectionHeader({ number, title, description }: { number: number; title: string; description: string }) {
  return <div className="section-heading"><span className="step-number">{number}</span><div><h2 className="section-title">{title}</h2><p>{description}</p></div></div>;
}

function RangeFields({ value, onChange, prefix }: { value: IntRange; onChange: (next: IntRange) => void; prefix: string }) {
  return <div className="field-grid">
    <div className="field"><label htmlFor={`${prefix}-start`}>Starting number</label><input id={`${prefix}-start`} className="input tabular" inputMode="numeric" value={Number.isNaN(value.start) ? "" : value.start} onChange={(event) => onChange({ ...value, start: numberValue(event.target.value) })} /></div>
    <div className="field"><label htmlFor={`${prefix}-end`}>Ending number</label><input id={`${prefix}-end`} className="input tabular" inputMode="numeric" value={Number.isNaN(value.end) ? "" : value.end} onChange={(event) => onChange({ ...value, end: numberValue(event.target.value) })} /></div>
  </div>;
}

function TablesFields({ value, onChange }: { value: TableRange; onChange: (next: TableRange) => void }) {
  return <div className="field-grid">
    {(["multiplicand", "multiplier"] as const).map((key) => <div key={key} className="range-box" style={{ marginTop: 0 }}><h3>{key === "multiplicand" ? "Multiplicand" : "Multiplier"}</h3><RangeFields prefix={key} value={value[key]} onChange={(next) => onChange({ ...value, [key]: next })} /></div>)}
  </div>;
}

export function ConfigurationScreen({ initial, onStart }: { initial: PracticeConfiguration; onStart: (config: PracticeConfiguration) => void }) {
  const [config, setConfig] = useState<PracticeConfiguration>(initial);
  const [showErrors, setShowErrors] = useState(false);
  const [customCount, setCustomCount] = useState(![5, 10, 20, 50].includes(initial.questionCount));
  const errors = useMemo(() => validateConfiguration(config), [config]);
  const activeTopics: PracticeTopic[] = config.topic === "mixed" ? config.enabledTopics : [config.topic];
  const toggleTopic = (topic: PracticeTopic) => setConfig((current) => ({ ...current, enabledTopics: current.enabledTopics.includes(topic) ? current.enabledTopics.filter((item) => item !== topic) : [...current.enabledTopics, topic] }));
  const submit = () => { setShowErrors(true); if (Object.keys(errors).length === 0) onStart(config); };

  return <main className="shell"><div className="container">
    <header className="brand"><div className="brand-mark"><Calculator size={24} aria-hidden="true" /></div><div><h1>SSC Calculation Trainer</h1><p>Practice faster. Calculate smarter.</p></div></header>
    <div className="card">
      <section className="section"><SectionHeader number={1} title="Topic" description="What do you want to practice?" /><div className="topic-grid">{topics.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={`choice-card ${config.topic === id ? "selected" : ""}`} onClick={() => setConfig((current) => ({ ...current, topic: id, enabledTopics: id === "mixed" ? current.enabledTopics : [id] }))} aria-pressed={config.topic === id}><Icon size={20} aria-hidden="true" /><strong>{label}</strong></button>)}</div></section>
      <section className="section"><SectionHeader number={2} title="Answer style" description="Recall it or pick an option." /><div className="mode-grid">{([
        ["typing", "Type the answer", "Fast recall", Keyboard],
        ["mcq", "Pick an option", "Exam-style choices", Layers3],
      ] as const).map(([id, title, detail, Icon]) => <button type="button" key={id} className={`mode-card ${config.answerMode === id ? "selected" : ""}`} onClick={() => setConfig((current) => ({ ...current, answerMode: id as AnswerMode }))} aria-pressed={config.answerMode === id}><span className="radio-dot" /><Icon size={20} aria-hidden="true" /><span><strong>{title}</strong><small>{detail}</small></span></button>)}</div></section>
      <section className="section"><SectionHeader number={3} title="Number range" description="Choose the numbers to include." />
        {config.topic === "mixed" && <><div className="checks">{(["tables", "squares", "cubes"] as PracticeTopic[]).map((topic) => <button key={topic} type="button" className={`check-chip ${config.enabledTopics.includes(topic) ? "checked" : ""}`} onClick={() => toggleTopic(topic)} aria-pressed={config.enabledTopics.includes(topic)}>{config.enabledTopics.includes(topic) ? "✓" : "+"} {topic[0].toUpperCase() + topic.slice(1)}</button>)}</div>{showErrors && errors.enabledTopics && <p className="error" role="alert">{errors.enabledTopics}</p>}</>}
        {activeTopics.includes("tables") && <div className="range-box"><h3>Tables range</h3><TablesFields value={config.tables} onChange={(tables) => setConfig((current) => ({ ...current, tables }))} />{showErrors && (errors.multiplicand || errors.multiplier || errors.tables) && <p className="error" role="alert">{errors.multiplicand || errors.multiplier || errors.tables}</p>}</div>}
        {activeTopics.includes("squares") && <div className="range-box"><h3>Squares range</h3><RangeFields prefix="squares" value={config.squares} onChange={(squares) => setConfig((current) => ({ ...current, squares }))} />{showErrors && errors.squares && <p className="error" role="alert">{errors.squares}</p>}</div>}
        {activeTopics.includes("cubes") && <div className="range-box"><h3>Cubes range</h3><RangeFields prefix="cubes" value={config.cubes} onChange={(cubes) => setConfig((current) => ({ ...current, cubes }))} />{showErrors && errors.cubes && <p className="error" role="alert">{errors.cubes}</p>}</div>}
        {config.topic === "mixed" && config.questionCount < config.enabledTopics.length && <p className="note">With fewer questions than selected topics, every topic cannot be guaranteed a question.</p>}
      </section>
      <section className="section"><SectionHeader number={4} title="Session length" description="How many questions?" /><div className="count-row">{[5, 10, 20, 50].map((count) => <button type="button" key={count} className={`count-button ${!customCount && config.questionCount === count ? "selected" : ""}`} onClick={() => { setCustomCount(false); setConfig((current) => ({ ...current, questionCount: count })); }}>{count}</button>)}<button type="button" className={`count-button ${customCount ? "selected" : ""}`} onClick={() => setCustomCount(true)}>Custom</button></div>{customCount && <div className="field" style={{ marginTop: 10 }}><label htmlFor="custom-count">Custom count (1–200)</label><input id="custom-count" className="input tabular" inputMode="numeric" value={Number.isNaN(config.questionCount) ? "" : config.questionCount} onChange={(event) => { const questionCount = numberValue(event.target.value); setConfig((current) => ({ ...current, questionCount })); }} /></div>}{showErrors && errors.questionCount && <p className="error" role="alert">{errors.questionCount}</p>}</section>
      <section className="section"><button className="primary" type="button" onClick={submit}><Play size={18} fill="currentColor" aria-hidden="true" /> Start Practice</button><p className="note" style={{ textAlign: "center", marginBottom: 0 }}>Nothing is saved. Refreshing or closing this page discards the session.</p></section>
    </div>
  </div></main>;
}
