import { expect, test } from "@playwright/test";

test("completes an MCQ session, reviews results, and retains no history", async ({ page }) => {
  await page.goto("/");
  const themeToggle = page.getByRole("button", { name: "Switch light or dark theme" });
  await themeToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await themeToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: /Pick an option/ }).click();
  await page.getByRole("button", { name: "5", exact: true }).click();
  await page.getByRole("button", { name: /Start Practice/ }).click();
  await expect(page.getByText("Question 1 of 5")).toBeVisible();
  for (let index = 0; index < 5; index += 1) {
    const choices = page.getByRole("group", { name: "Answer choices" });
    await expect(choices.getByRole("button")).toHaveCount(5);
    await choices.getByRole("button").first().click();
    await choices.getByRole("button", { name: /Submit & Next/ }).click();
    if (index < 4) await expect(page.getByText(`Question ${index + 2} of 5`)).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: /here are your results/i })).toBeVisible();
  await expect(page.getByText(/Mode:/).getByText("With Options")).toBeVisible();
  await expect(page.locator(".review-item")).toHaveCount(5);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Share Results" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("ssc-practice-result.png");
  await expect(page.getByText("Result card downloaded — share it anywhere.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Topic" })).toBeVisible();
});
