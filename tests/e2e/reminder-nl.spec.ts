import { test, expect } from "@playwright/test";

test("create reminder from natural language in chat", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill("demo@voicepilot.dev");
  await page.getByPlaceholder("Password").fill("DemoPass123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.goto("/dashboard/chat");
  await page.getByPlaceholder("Speak or type your request").fill("Remind me tomorrow at 7 PM to call mom");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText(/Reminder|Streaming/i)).toBeVisible();
});
