import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResultsScreen } from "@/components/analytics/ResultsScreen";
import { ConfigurationScreen } from "@/components/practice/ConfigurationScreen";
import { DEFAULT_CONFIGURATION } from "@/features/practice/constants";
import type { QuestionResult } from "@/features/practice/types";

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("customization dialog", () => {
  it("discards cancelled drafts and restores focus", () => {
    render(<ConfigurationScreen initial={DEFAULT_CONFIGURATION} onStart={vi.fn()} />);
    const opener = screen.getByRole("button", { name: "Customize" });
    opener.focus();
    fireEvent.click(opener);
    const input = screen.getByLabelText("Multiplicand min");
    fireEvent.change(input, { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Customize practice" })).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    fireEvent.click(opener);
    expect(screen.getByLabelText("Multiplicand min")).toHaveValue("1");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("applies valid settings without starting and updates the committed summary", () => {
    const start = vi.fn();
    render(<ConfigurationScreen initial={DEFAULT_CONFIGURATION} onStart={start} />);
    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.change(screen.getByLabelText("Multiplicand min"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply Settings" }));
    expect(start).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("5–20 × 1–10")).toBeInTheDocument();
  });

  it("keeps invalid drafts open with validation feedback", () => {
    render(<ConfigurationScreen initial={DEFAULT_CONFIGURATION} onStart={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.change(screen.getByLabelText("Multiplicand min"), { target: { value: "50" } });
    fireEvent.change(screen.getByLabelText("Multiplicand max"), { target: { value: "20" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply Settings" }));
    expect(screen.getByRole("dialog", { name: "Customize practice" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Start must not exceed end.");
  });

  it("starts once with the latest draft and can reset it", () => {
    vi.useFakeTimers();
    const start = vi.fn();
    render(<ConfigurationScreen initial={DEFAULT_CONFIGURATION} onStart={start} />);
    fireEvent.click(screen.getByRole("button", { name: "Customize" }));
    fireEvent.change(screen.getByLabelText("Multiplicand min"), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: /reset to default/i }));
    expect(screen.getByLabelText("Multiplicand min")).toHaveValue("1");
    fireEvent.change(screen.getByLabelText("Multiplicand min"), { target: { value: "6" } });
    const startButton = within(screen.getByRole("dialog", { name: "Customize practice" })).getByRole("button", { name: "Start Practice" });
    fireEvent.click(startButton); fireEvent.click(startButton);
    vi.runAllTimers();
    expect(start).toHaveBeenCalledTimes(1);
    expect(start.mock.calls[0][0].tables.multiplicand.start).toBe(6);
  });
});

const result = (overrides: Partial<QuestionResult>): QuestionResult => ({
  questionId: "q", topic: "addition", expression: "10 + 5", operands: [10, 5], answerMode: "typing",
  userAnswer: 15, correctAnswer: 15, isCorrect: true, durationMs: 5000, benchmarkMs: 5000, ...overrides,
});

describe("benchmark-aware question review", () => {
  const renderResults = (results: QuestionResult[]) => render(<ResultsScreen configuration={{ ...DEFAULT_CONFIGURATION, topic: "addition" }} results={results} sessionDurationMs={15000} onAgain={vi.fn()} onRetry={vi.fn()} onChange={vi.fn()} />);

  it("separates correctness from exact, over-target, and unavailable speed states", () => {
    const { container } = renderResults([
      result({ questionId: "exact", expression: "10 + 5", durationMs: 5000, benchmarkMs: 5000 }),
      result({ questionId: "over", topic: "subtraction", expression: "12 − 5", userAnswer: 8, correctAnswer: 7, isCorrect: false, durationMs: 7001, benchmarkMs: 7000 }),
      result({ questionId: "none", expression: "20 + 5", durationMs: 1200, benchmarkMs: null }),
    ]);
    expect(container.querySelectorAll(".speed-within")).toHaveLength(1);
    expect(container.querySelectorAll(".speed-over")).toHaveLength(1);
    expect(container.querySelectorAll(".speed-neutral")).toHaveLength(1);
    expect(screen.getAllByLabelText("Correct answer")).toHaveLength(2);
    expect(screen.getByLabelText("Incorrect answer")).toBeInTheDocument();
  });

  it("shows complete expandable details with signed target difference", () => {
    renderResults([result({ questionId: "slow", durationMs: 10500, benchmarkMs: 5000 })]);
    fireEvent.click(screen.getByText("1. 10 + 5"));
    expect(screen.getByText("Speed status")).toBeInTheDocument();
    expect(screen.getAllByText("Over target").length).toBeGreaterThan(0);
    expect(screen.getAllByText("+5.5s").length).toBeGreaterThan(0);
    expect(screen.getByText("Target time")).toBeInTheDocument();
  });

  it("preserves filtering and sorting without mutating source order", () => {
    const results = [result({ questionId: "a", expression: "1 + 1", durationMs: 6000, benchmarkMs: 5000 }), result({ questionId: "b", expression: "2 + 2", durationMs: 1000, benchmarkMs: 5000 })];
    const { container } = renderResults(results);
    fireEvent.change(screen.getByLabelText("Filter answers"), { target: { value: "slow" } });
    expect(container.querySelectorAll(".review-item")).toHaveLength(1);
    expect(screen.getByText("1. 1 + 1")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filter answers"), { target: { value: "all" } });
    fireEvent.change(screen.getByLabelText("Sort answers"), { target: { value: "fastest" } });
    const rows = container.querySelectorAll(".review-item");
    expect(within(rows[0] as HTMLElement).getByText("2. 2 + 2")).toBeInTheDocument();
    expect(results[0].questionId).toBe("a");
  });
});
