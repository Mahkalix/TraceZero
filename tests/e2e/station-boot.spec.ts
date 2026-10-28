import { expect, test } from "@playwright/test";
test.use({ video: { mode: "on", size: { width: 1280, height: 720 } } });

test("démarrage une fois par session, passage clavier et focus sur le bureau", async ({ page }) => {
  await page.clock.install();
  await page.goto("/case/001", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("dialog", { name: "Démarrage de la station forensic" })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeFocused();
  await expect(page.getByRole("button", { name: /Passer/ })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("main")).toBeFocused();
  await page.reload();
  await expect(page.locator('.station-content')).toHaveAttribute("data-boot-phase", "ready");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Rejouer le démarrage" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.getByRole("button", { name: "Rejouer le démarrage" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.getByRole("main")).toBeFocused();
});

test("mouvement réduit : titre statique et aucune longue animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/case/001", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Trace//Zero · Dossier 001 prêt", { exact: true })).toBeVisible();
  await page.clock.runFor(350);
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.getAnimations().filter((a) => {
    const duration = a.effect?.getTiming().duration;
    return typeof duration === "number" && duration >= 400;
  }).length)).toBe(0);
});

test("la séquence naturelle termine après cinq secondes et mémorise la session", async ({ page }) => {
  await page.goto("/case/001", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({ path: "test-results/forensic-boot.png" });
  await expect(page.getByRole("main")).toBeFocused({ timeout: 7000 });
  expect(await page.evaluate(() => sessionStorage.getItem("trace-zero:station-boot:v1"))).toBe("played");
});

test("recharger pendant le boot ne relance pas la séquence", async ({ page }) => {
  await page.goto("/case/001", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.reload();
  await expect(page.locator(".station-content")).toHaveAttribute("data-boot-phase", "ready");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("la composition cinématique reste cadrée sur ordinateur et mobile", async ({ page }) => {
  await page.clock.install();
  await page.goto("/case/001", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("dialog")).toBeVisible();
  const frame = async () => page.evaluate(() => {
    document.getAnimations().forEach((animation) => {
      animation.pause();
      animation.currentTime = 3300;
    });
  });
  await frame();
  await page.screenshot({ path: "test-results/cinematic-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await frame();
  await page.screenshot({ path: "test-results/cinematic-mobile.png" });
  const title = await page.locator(".cinema-title").boundingBox();
  expect(title?.x).toBeGreaterThanOrEqual(0);
  expect((title?.x ?? 0) + (title?.width ?? 0)).toBeLessThanOrEqual(390);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("main")).toBeFocused();
});
