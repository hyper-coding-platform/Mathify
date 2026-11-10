"use client";

import { useEffect, useState } from "react";

export function MultipleChoiceInput({ choices, disabled, onSubmit }: { choices: number[]; disabled: boolean; onSubmit: (answer: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  const labels = ["A", "B", "C", "D"];

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (disabled) return;
      if (/^[1-4]$/.test(event.key)) { setSelected(Number(event.key) - 1); setError(""); event.preventDefault(); }
      if (event.key === "Enter") {
        event.preventDefault();
        if (selected === null) setError("Select an option first.");
        else onSubmit(choices[selected]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [choices, disabled, onSubmit, selected]);

  const submit = () => {
    if (disabled) return;
    if (selected === null) { setError("Select an option first."); return; }
    onSubmit(choices[selected]);
  };

  return (
    <div className="answer-form" role="group" aria-label="Answer choices">
      <div className="options-grid">
        {choices.map((choice, index) => (
          <button key={choice} type="button" className={`option ${selected === index ? "selected" : ""}`} onClick={() => { setSelected(index); setError(""); }} disabled={disabled} aria-pressed={selected === index}>
            <span className="option-key">{labels[index]}</span><span className="tabular">{choice}</span>
          </button>
        ))}
      </div>
      <button className="primary mcq-submit" type="button" onClick={submit} disabled={disabled}>Submit &amp; Next</button>
      {error && <p className="error" role="alert">{error}</p>}
      <p className="note">Desktop: press 1–4 to select, then Enter.</p>
    </div>
  );
}
