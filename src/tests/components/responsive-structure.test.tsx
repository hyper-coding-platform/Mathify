import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigurationScreen } from "@/components/practice/ConfigurationScreen";
import { LivePractice } from "@/components/practice/LivePractice";
import { DEFAULT_CONFIGURATION } from "@/features/practice/constants";
import { TimingController } from "@/features/practice/engine/timing";

afterEach(cleanup);

describe("responsive interface structure", () => {
  it("keeps home identity, actions, and selection groups in distinct regions", () => {
    const { container } = render(<ConfigurationScreen initial={DEFAULT_CONFIGURATION} onStart={vi.fn()} onWhatsNew={vi.fn()} />);
    expect(container.querySelector(".header-primary .brand")).toBeInTheDocument();
    expect(container.querySelector(".header-secondary")).toContainElement(screen.getByRole("link", { name: /study sheets/i }));
    expect(container.querySelectorAll(".module-grid .choice-card")).toHaveLength(7);
    expect(container.querySelectorAll(".difficulty-grid button")).toHaveLength(4);
    expect(container.querySelectorAll(".count-grid button")).toHaveLength(4);
    expect(container.querySelectorAll(".answer-mode-grid button")).toHaveLength(2);
  });

  it("provides compact labelled practice controls and a content-driven question form", () => {
    const timing = new TimingController(() => 1000);
    timing.startSession();
    const { container } = render(<LivePractice question={{ id: "q1", identity: "addition:1:2", topic: "addition", expression: "1 + 2", operands: [1, 2], correctAnswer: 3, benchmarkMs: 7000 }} config={DEFAULT_CONFIGURATION} index={0} total={10} status="active" timing={timing} onSubmit={vi.fn()} onExit={vi.fn()} />);
    expect(screen.getByText("Question 1 of 10")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide timer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enter focus mode" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Exit practice" })).toBeInTheDocument();
    expect(container.querySelector(".question-area .answer-form")).toBeInTheDocument();
  });

  it("keeps the theme action functional after moving it into page toolbars", () => {
    render(<ConfigurationScreen initial={DEFAULT_CONFIGURATION} onStart={vi.fn()} />);
    document.documentElement.dataset.theme = "light";
    fireEvent.click(screen.getByRole("button", { name: "Switch light or dark theme" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
