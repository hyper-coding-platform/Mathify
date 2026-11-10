"use client";

import { useEffect, useRef, useState } from "react";
import { parseIntegerAnswer } from "@/features/practice/engine/validation";

export function TypingAnswerInput({ disabled, onSubmit }: { disabled: boolean; onSubmit: (answer: number) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!disabled) inputRef.current?.focus({ preventScroll: true }); }, [disabled]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    const answer = parseIntegerAnswer(value);
    if (answer === null) { setError("Enter a valid whole number."); return; }
    setError("");
    onSubmit(answer);
  };

  return (
    <form className="answer-form" onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor="answer">Your answer</label>
      <div className="typing-row">
        <input ref={inputRef} id="answer" className="answer-input tabular" value={value} onChange={(event) => setValue(event.target.value)} inputMode="numeric" autoComplete="off" disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error ? "answer-error" : undefined} placeholder="Type answer" />
        <button className="submit" type="submit" disabled={disabled}>Submit</button>
      </div>
      {error && <p className="error" id="answer-error" role="alert">{error}</p>}
    </form>
  );
}
