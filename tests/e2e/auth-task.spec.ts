import { test, expect } from "@playwright/test";

test("sign in and create task", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill("demo@voicepilot.dev");
  await page.getByPlaceholder("Password").fill("DemoPass123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.goto("/dashboard/tasks");
  await page.getByPlaceholder("Add a task").fill("E2E Task");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("E2E Task")).toBeVisible();
});
