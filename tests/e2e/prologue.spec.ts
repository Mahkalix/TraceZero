import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`les commandes restent fixes sur les quatre pages à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/case/001');
    const next = page.getByRole('button', { name: 'Continuer', exact: true });
    await expect(next).toBeVisible();
    const initial = await next.boundingBox();
    for (let step = 0; step < 3; step++) {
      await next.click();
      const bounds = await page.getByRole('button', { name: step === 2 ? 'Entrer dans le bureau' : 'Continuer', exact: true }).boundingBox();
      expect(bounds?.x).toBeCloseTo(initial!.x, 0);
      expect(bounds?.y).toBeCloseTo(initial!.y, 0);
    }
  });
}

test('le son reste actif dans le bureau et le volume est mémorisé', async ({ page }) => {
  await page.clock.install();
  await page.goto('/case/001');
  await page.getByRole('button', { name: 'Couper le son' }).click();
  await page.getByRole('button', { name: 'Activer le son' }).click();
  await expect(page.getByRole('button', { name: 'Couper le son' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.station-content')).toHaveAttribute('data-boot-phase', 'playing');
  await page.clock.runFor(5100);
  await expect(page.getByRole('button', { name: 'Couper le son' })).toBeVisible();
  await page.getByRole('button', { name: 'Couper le son' }).click();
  await expect(page.getByRole('button', { name: 'Activer le son' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Activer le son' }).click();
  await page.getByRole('button', { name: 'Passer le prologue' }).click();
  await page.getByRole('button', { name: 'Volume de la musique' }).click();
  await expect(page.getByRole('button', { name: 'Couper le son' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('slider', { name: 'Volume', exact: true }).fill('25');
  await expect(page.getByRole('slider')).toHaveValue('25');
  await page.screenshot({ path: 'test-results/desktop-volume.png' });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Volume de la musique' })).toBeFocused();
  await page.reload();
  await page.getByRole('button', { name: 'Volume de la musique' }).click();
  await expect(page.getByRole('slider')).toHaveValue('25');
  await page.getByRole('button', { name: 'Couper le son' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Volume de la musique' }).click();
  await expect(page.getByRole('button', { name: 'Activer le son' })).toBeVisible();
});

test('le crédit et le titre disparaissent ensemble', async ({ page }) => {
  await page.clock.install();
  await page.goto('/case/001');
  await expect(page.locator('.cinema-credit')).toBeVisible();
  const timing = await page.evaluate(() => ['.cinema-composition', '.cinema-credit'].map((selector) => {
    const style = getComputedStyle(document.querySelector(selector)!);
    return [style.animationName, style.animationDuration, style.animationDelay];
  }));
  expect(timing[0]).toEqual(timing[1]);
});

test("le bureau reste masqué entre le titre et le prologue", async ({ page }) => {
  await page.clock.install();
  await page.goto("/case/001");
  await expect(page.locator('.station-content')).toHaveAttribute('data-boot-phase', 'playing');
  await page.clock.runFor(4500);
  await expect(page.locator('.station-content')).toHaveCSS('opacity', '0');
  await expect(page.locator('.station-boot')).toHaveCSS('background-color', 'rgb(17, 17, 18)');
  await page.clock.runFor(600);
  await expect(page.getByRole('dialog', { name: 'La dernière soirée — prologue' })).toBeVisible();
  await expect(page.locator('.station-content')).toHaveCSS('opacity', '0');
  await page.getByRole('button', { name: 'Passer le prologue' }).click();
  await expect(page.locator('.station-content')).toHaveCSS('opacity', '1');
});

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
  await page.getByText("Options du dossier", { exact: true }).click();
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
