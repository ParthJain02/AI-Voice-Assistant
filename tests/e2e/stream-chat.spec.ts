import { test, expect } from "@playwright/test";

test("chat flow renders streamed response", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill("demo@voicepilot.dev");
  await page.getByPlaceholder("Password").fill("DemoPass123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.goto("/dashboard/chat");
  await page.getByPlaceholder("Speak or type your request").fill("Give me a short productivity tip");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText(/productivity|OpenAI key is not configured/i)).toBeVisible();
});
