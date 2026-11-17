"use client";

import { ArrowLeft, BookOpen, Calculator, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const topics = ["tables", "squares", "cubes"] as const;
type StudyTopic = (typeof topics)[number];
const topicLabels: Record<StudyTopic, string> = { tables: "Tables", squares: "Squares", cubes: "Cubes" };

export function StudyPage() {
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(20);
  const [selectedTopics, setSelectedTopics] = useState<StudyTopic[]>(["tables"]);

  const numbers = useMemo(() => {
    const first = Math.min(start, end);
    const last = Math.max(start, end);
    return Array.from({ length: last - first + 1 }, (_, index) => first + index);
  }, [start, end]);

  const updateNumber = (value: string, setter: (value: number) => void) => {
    const next = Number(value);
    if (Number.isFinite(next)) setter(Math.min(MAX_NUMBER, Math.max(MIN_NUMBER, next)));
  };
  const toggleTopic = (topic: StudyTopic) => setSelectedTopics((current) => current.includes(topic)
    ? current.length === 1 ? current : current.filter((item) => item !== topic)
    : [...current, topic]);

  return <main className="shell study-shell"><div className="study-container">
    <header className="study-header">
      <div className="study-toolbar"><a className="back-link" href="/"><ArrowLeft size={16} aria-hidden="true" /> Back to practice</a><ThemeToggle /></div>
      <div className="brand study-brand"><div className="brand-mark"><BookOpen size={24} aria-hidden="true" /></div><div><h1>Study reels</h1><p>Swipe through exactly what you want to revise.</p></div></div>
    </header>

    <section className="card study-controls">
      <div><p className="eyebrow">Build your reel</p><h2>Choose topics and range</h2><p className="note">Select one or more topics, then swipe each card vertically on mobile.</p></div>
      <div className="study-topic-picker" aria-label="Study topics">{topics.map((topic) => <button type="button" key={topic} className={`topic-toggle ${selectedTopics.includes(topic) ? "selected" : ""}`} onClick={() => toggleTopic(topic)} aria-pressed={selectedTopics.includes(topic)}><span className="topic-check">{selectedTopics.includes(topic) && <Check size={13} strokeWidth={3} aria-hidden="true" />}</span>{topicLabels[topic]}</button>)}</div>
      <div className="field-grid">
        <div className="field"><label htmlFor="study-start">Starting number</label><input id="study-start" className="input tabular" type="number" min={MIN_NUMBER} max={MAX_NUMBER} value={start} onChange={(event) => updateNumber(event.target.value, setStart)} /></div>
        <div className="field"><label htmlFor="study-end">Ending number</label><input id="study-end" className="input tabular" type="number" min={MIN_NUMBER} max={MAX_NUMBER} value={end} onChange={(event) => updateNumber(event.target.value, setEnd)} /></div>
      </div>
      <p className="range-summary">{numbers.length} number{numbers.length === 1 ? "" : "s"} · <strong className="tabular">{Math.min(start, end)}-{Math.max(start, end)}</strong> · {selectedTopics.length} reel{selectedTopics.length === 1 ? "" : "s"}</p>
    </section>

    <section className={`study-grid study-grid-${selectedTopics.length}`} aria-label="Generated study reels">
      {selectedTopics.includes("tables") && <StudyReel title="Multiplication tables" subtitle="One table per swipe" numbers={numbers} render={(number) => <>{Array.from({ length: 20 }, (_, index) => <span key={index} className="study-line tabular">{number} × {index + 1} = <strong>{number * (index + 1)}</strong></span>)}</>} />}
      {selectedTopics.includes("squares") && <StudyList title="Squares" subtitle="Centered for easy reading" numbers={numbers} render={(number) => <span className="study-highlight tabular">{number}<sup>2</sup> = <strong>{number ** 2}</strong></span>} />}
      {selectedTopics.includes("cubes") && <StudyList title="Cubes" subtitle="Centered for easy reading" numbers={numbers} render={(number) => <span className="study-highlight tabular">{number}<sup>3</sup> = <strong>{number ** 3}</strong></span>} />}
    </section>
  </div></main>;
}

function StudyReel({ title, subtitle, numbers, render }: { title: string; subtitle: string; numbers: number[]; render: (number: number) => React.ReactNode }) {
  return <article className="card study-card"><header className="study-card-header"><div><h2>{title}</h2><p>{subtitle}</p></div><Calculator size={20} aria-hidden="true" /></header><div className="study-reel" aria-label={`${title} reel`}>{numbers.map((number, index) => <section className="reel-slide" key={number}><div className="reel-position">{index + 1} / {numbers.length}</div><div className="reel-number tabular">{number}</div><div className="number-content">{render(number)}</div><div className="reel-hint">Swipe up for next</div></section>)}</div></article>;
}

function StudyList({ title, subtitle, numbers, render }: { title: string; subtitle: string; numbers: number[]; render: (number: number) => React.ReactNode }) {
  return <article className="card study-card"><header className="study-card-header"><div><h2>{title}</h2><p>{subtitle}</p></div><Calculator size={20} aria-hidden="true" /></header><div className="study-list">{numbers.map((number) => <div className="simple-study-row" key={number}>{render(number)}</div>)}</div></article>;
}
