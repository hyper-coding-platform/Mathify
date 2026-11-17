"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw, X } from "lucide-react";
import { applyDifficulty, DEFAULT_CONFIGURATION } from "@/features/practice/constants";
import { validateConfiguration } from "@/features/practice/engine/validation";
import type { IntRange, PracticeConfiguration, PracticeTopic } from "@/features/practice/types";

const allTopics: PracticeTopic[] = ["tables", "squares", "cubes", "addition", "subtraction", "chaining"];
const title = (value: string) => value[0].toUpperCase() + value.slice(1);
const numberValue = (value: string) => value === "" ? Number.NaN : Number(value);

function RangeFields({ value, onChange, prefix, labels = ["Minimum", "Maximum"] }: {
  value: IntRange; onChange: (next: IntRange) => void; prefix: string; labels?: [string, string];
}) {
  return <div className="field-grid">
    <div className="field"><label htmlFor={`${prefix}-start`}>{labels[0]}</label><input id={`${prefix}-start`} className="input tabular" inputMode="numeric" value={Number.isNaN(value.start) ? "" : value.start} onChange={event => onChange({ ...value, start: numberValue(event.target.value) })} /></div>
    <div className="field"><label htmlFor={`${prefix}-end`}>{labels[1]}</label><input id={`${prefix}-end`} className="input tabular" inputMode="numeric" value={Number.isNaN(value.end) ? "" : value.end} onChange={event => onChange({ ...value, end: numberValue(event.target.value) })} /></div>
  </div>;
}

function TopicControls({ topic, draft, update }: { topic: PracticeTopic; draft: PracticeConfiguration; update: (next: PracticeConfiguration) => void }) {
  if (topic === "tables") return <><h3>Number ranges</h3><RangeFields prefix="table-a" value={draft.tables.multiplicand} onChange={multiplicand => update({ ...draft, difficulty: "custom", tables: { ...draft.tables, multiplicand } })} labels={["Multiplicand min", "Multiplicand max"]} /><RangeFields prefix="table-b" value={draft.tables.multiplier} onChange={multiplier => update({ ...draft, difficulty: "custom", tables: { ...draft.tables, multiplier } })} labels={["Multiplier min", "Multiplier max"]} /></>;
  if (topic === "squares" || topic === "cubes") return <><h3>Number range</h3><RangeFields prefix={topic} value={draft[topic]} onChange={range => update({ ...draft, difficulty: "custom", [topic]: range })} /></>;
  if (topic === "addition" || topic === "subtraction") {
    const value = draft[topic];
    return <><h3>Operand ranges</h3><RangeFields prefix={`${topic}-a`} value={value.left} onChange={left => update({ ...draft, difficulty: "custom", [topic]: { ...value, left } })} labels={["First operand min", "First operand max"]} /><RangeFields prefix={`${topic}-b`} value={value.right} onChange={right => update({ ...draft, difficulty: "custom", [topic]: { ...value, right } })} labels={["Second operand min", "Second operand max"]} /><label className="field">Calculation type<select className="input" value={value.filter} onChange={event => update({ ...draft, difficulty: "custom", [topic]: { ...value, filter: event.target.value as typeof value.filter } })}><option value="any">Any</option><option value="with-regrouping">With {topic === "addition" ? "carrying" : "borrowing"}</option><option value="without-regrouping">Without {topic === "addition" ? "carrying" : "borrowing"}</option></select></label>{topic === "subtraction" && <label className="check-label"><input type="checkbox" checked={Boolean(value.allowNegative)} onChange={event => update({ ...draft, difficulty: "custom", subtraction: { ...draft.subtraction, allowNegative: event.target.checked } })} /> Allow negative answers</label>}</>;
  }
  return <><h3>Chain settings</h3><div className="field-grid"><label className="field">Variant<select className="input" value={draft.chaining.variant} onChange={event => update({ ...draft, difficulty: "custom", chaining: { ...draft.chaining, variant: event.target.value as typeof draft.chaining.variant } })}><option value="expression">Expression</option><option value="sequential">Sequential reveal</option></select></label><label className="field">Operand count<input className="input" type="number" min="3" max="10" value={draft.chaining.operandCount} onChange={event => update({ ...draft, difficulty: "custom", chaining: { ...draft.chaining, operandCount: Number(event.target.value) } })} /></label></div><RangeFields prefix="chain-initial" value={draft.chaining.initial} onChange={initial => update({ ...draft, difficulty: "custom", chaining: { ...draft.chaining, initial } })} labels={["Initial number min", "Initial number max"]} /><RangeFields prefix="chain-operands" value={draft.chaining.operands} onChange={operands => update({ ...draft, difficulty: "custom", chaining: { ...draft.chaining, operands } })} labels={["Following operand min", "Following operand max"]} /><label className="field">Operations<select className="input" value={draft.chaining.operationMode} onChange={event => update({ ...draft, difficulty: "custom", chaining: { ...draft.chaining, operationMode: event.target.value as typeof draft.chaining.operationMode } })}><option value="mixed">Addition and subtraction</option><option value="addition">Addition only</option><option value="subtraction">Subtraction only</option></select></label><label className="check-label"><input type="checkbox" checked={draft.chaining.allowNegative} onChange={event => update({ ...draft, difficulty: "custom", chaining: { ...draft.chaining, allowNegative: event.target.checked } })} /> Allow negative intermediate values</label>{draft.chaining.variant === "sequential" && <div className="field-grid"><label className="field">Progression<select className="input" value={draft.chaining.progression} onChange={event => update({ ...draft, difficulty: "custom", chaining: { ...draft.chaining, progression: event.target.value as typeof draft.chaining.progression } })}><option value="manual">Manual</option><option value="automatic">Automatic</option></select></label>{draft.chaining.progression === "automatic" && <label className="field">Reveal interval (seconds)<input className="input" type="number" min="0.5" max="10" step="0.5" value={draft.chaining.revealIntervalMs / 1000} onChange={event => update({ ...draft, difficulty: "custom", chaining: { ...draft.chaining, revealIntervalMs: Number(event.target.value) * 1000 } })} /></label>}</div>}</>;
}

export function CustomizationDialog({ open, committed, onCancel, onApply, onStart }: {
  open: boolean; committed: PracticeConfiguration; onCancel: () => void;
  onApply: (configuration: PracticeConfiguration) => void; onStart: (configuration: PracticeConfiguration) => void;
}) {
  const [draft, setDraft] = useState(committed);
  const [showErrors, setShowErrors] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const startingRef = useRef(false);
  const errors = useMemo(() => validateConfiguration(draft), [draft]);
  const activeTopics = draft.topic === "mixed" ? draft.enabledTopics : [draft.topic];

  useEffect(() => {
    if (!open) return;
    setDraft(structuredClone(committed)); setShowErrors(false); startingRef.current = false;
    restoreFocusRef.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>("button, input, select")?.focus(), 0);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onCancel(); return; }
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [])];
      if (!focusable.length) return;
      const current = focusable.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey ? (current <= 0 ? focusable.length - 1 : current - 1) : (current >= focusable.length - 1 ? 0 : current + 1);
      event.preventDefault(); focusable[next].focus();
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = previousOverflow; restoreFocusRef.current?.focus(); };
  }, [committed, onCancel, open]);

  if (!open) return null;
  const validate = () => { setShowErrors(true); return Object.keys(errors).length === 0; };
  const apply = () => { if (validate()) onApply(draft); };
  const start = () => { if (startingRef.current || !validate()) return; startingRef.current = true; onStart(draft); };
  const reset = () => { const difficulty = committed.difficulty === "custom" ? "beginner" : committed.difficulty; setDraft(applyDifficulty({ ...structuredClone(DEFAULT_CONFIGURATION), topic: committed.topic, enabledTopics: [...committed.enabledTopics], answerMode: committed.answerMode, questionCount: committed.questionCount }, difficulty)); setShowErrors(false); };

  return <div className="customization-backdrop" role="presentation"><div className="customization-dialog" role="dialog" aria-modal="true" aria-labelledby="customization-title" ref={dialogRef}>
    <header className="customization-header"><div><p className="eyebrow">Advanced settings</p><h2 id="customization-title">Customize practice</h2></div><button type="button" className="icon-button" onClick={onCancel} aria-label="Close customization"><X size={19} /></button></header>
    <div className="customization-content">
      {draft.topic === "mixed" && <section className="customization-section"><h3>Topics in the mix</h3><div className="checks">{allTopics.map(topic => <button type="button" key={topic} className={`check-chip ${draft.enabledTopics.includes(topic) ? "checked" : ""}`} onClick={() => setDraft(current => ({ ...current, difficulty: "custom", enabledTopics: current.enabledTopics.includes(topic) ? current.enabledTopics.filter(value => value !== topic) : [...current.enabledTopics, topic] }))} aria-pressed={draft.enabledTopics.includes(topic)}>{title(topic)}</button>)}</div></section>}
      {activeTopics.map(topic => draft.topic === "mixed" ? <details className="customization-topic" key={topic}><summary>{title(topic)}</summary><div className="customization-topic-body"><TopicControls topic={topic} draft={draft} update={setDraft} /></div></details> : <section className="customization-section" key={topic}><TopicControls topic={topic} draft={draft} update={setDraft} /></section>)}
      <section className="customization-section"><h3>Speed benchmark</h3><label className="field">Target display<select className="input" value={draft.benchmark.mode} onChange={event => setDraft(current => ({ ...current, benchmark: { ...current.benchmark, mode: event.target.value as typeof current.benchmark.mode } }))}><option value="recommended">Recommended training target</option><option value="custom">Custom target</option><option value="disabled">Hidden</option></select></label>{draft.benchmark.mode === "custom" && <label className="field">Target seconds<input className="input" type="number" min="0.5" max="120" step="0.5" value={draft.benchmark.customTargetMs / 1000} onChange={event => setDraft(current => ({ ...current, benchmark: { ...current.benchmark, customTargetMs: Number(event.target.value) * 1000 } }))} /></label>}<p className="note">Training targets are product estimates, not official SSC averages.</p></section>
      {showErrors && Object.values(errors).length > 0 && <div className="modal-errors" role="alert"><strong>Check these settings:</strong><ul>{[...new Set(Object.values(errors))].map(error => <li key={error}>{error}</li>)}</ul></div>}
    </div>
    <footer className="customization-footer"><button type="button" className="text-button reset-button" onClick={reset}><RotateCcw size={16} /> Reset to default</button><div className="customization-actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button type="button" className="secondary" onClick={apply}>Apply Settings</button><button type="button" className="primary modal-start" onClick={start}><Play size={17} fill="currentColor" /> Start Practice</button></div></footer>
  </div></div>;
}
