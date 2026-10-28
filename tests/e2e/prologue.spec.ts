import { expect, test } from "@playwright/test";

test("Max découvre le contexte à son rythme puis peut le relire", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/case/001");
  const story = page.getByRole("dialog", { name: "La dernière soirée — prologue" });
  await expect(story).toBeVisible();
  await expect(story.getByRole("heading")).toHaveText("Tu t’appelles Max.");
  await expect(page.locator('.station-content')).toHaveAttribute('inert', '');
  await story.getByRole("button", { name: "Continuer", exact: true }).click();
  await expect(story.getByRole("heading")).toHaveText("Son ordinateur est encore allumé.");
  await story.getByRole("button", { name: "Continuer", exact: true }).click();
  await expect(story.getByRole("heading")).toContainText("20 h 30");
  await story.getByRole("button", { name: "Continuer", exact: true }).click();
  await expect(story).toContainText("Carnet → Pistes");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/prologue-mobile.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await story.getByRole("button", { name: "Entrer dans le bureau" }).click();
  await expect(page.getByRole("main")).toBeFocused();
  await page.reload();
  await expect(story).toHaveCount(0);
  await page.getByRole("button", { name: "Relire le prologue" }).click();
  await expect(story.getByRole("heading")).toHaveText("Tu t’appelles Max.");
  await story.getByRole("button", { name: "Passer le prologue" }).click();
  await expect(page.getByRole("main")).toBeFocused();
});

test("une session existante reçoit le nouveau prologue", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("trace-zero:station-boot:v1", "played"));
  await page.goto("/case/001");
  await expect(page.getByRole("dialog", { name: "La dernière soirée — prologue" })).toBeVisible();
});
