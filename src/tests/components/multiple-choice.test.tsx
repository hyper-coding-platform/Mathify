import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultipleChoiceInput } from "@/components/practice/MultipleChoiceInput";

describe("MultipleChoiceInput", () => {
  it("requires a selection and permits changing it", async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    render(<MultipleChoiceInput choices={[12, 14, 16, 18]} disabled={false} onSubmit={submit} />);
    await user.click(screen.getByRole("button", { name: /submit & next/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Select an option");
    await user.click(screen.getByRole("button", { name: /A\s*12/i }));
    await user.click(screen.getByRole("button", { name: /C\s*16/i }));
    await user.click(screen.getByRole("button", { name: /submit & next/i }));
    expect(submit).toHaveBeenCalledWith(16);
  });

  it("supports number-key selection and Enter submission", async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    render(<MultipleChoiceInput choices={[12, 14, 16, 18]} disabled={false} onSubmit={submit} />);
    await user.keyboard("3{Enter}");
    expect(submit).toHaveBeenCalledWith(16);
  });
});
