import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.setItem("trace-zero:prologue:v1", "read")); });

test("la piste guide Max et conserve les passages en avançant", async ({ page }) => {
  await page.goto("/case/001");
  await expect(page.locator('.app-window .investigation-lead')).toHaveCount(0);
  await page.getByRole("button", { name: "Carnet 0/6" }).click();
  await page.getByRole("button", { name: "Suivre cette piste" }).click();
  const messages = page.locator('[data-app="mail"]');
  await expect(messages.getByRole("heading", { name: "Si on te demande" })).toBeVisible();
  await messages.getByRole("button", { name: "Lire le message de Nora", exact: true }).click();
  await page.getByRole("button", { name: "Carnet 0/6" }).click();
  await expect(page.getByRole("region", { name: "Piste en cours" })).toContainText("1/4 passages");
  await expect(page.getByRole("region", { name: "Piste en cours" })).toContainText("Que savait Nora");
  await page.reload();
  await page.getByRole("button", { name: "Carnet 0/6" }).click();
  await expect(page.getByRole("region", { name: "Piste en cours" })).toContainText("1/4 passages");
  await page.getByRole("button", { name: "Suivre cette piste" }).click();
  await expect(messages.getByRole("heading", { name: "Tu es encore au bureau ?", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Carnet 0/6" }).click();
  await page.getByText("Besoin d’un indice ?", { exact: true }).click();
  await expect(page.getByText(/Lis le passage, puis garde-le/)).toBeVisible();
});

test("l’accueil explique le jeu et le bureau Linux occupe l’écran", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.waitForURL("**/case/001");
  await expect(page.getByRole("dialog", { name: "Démarrage de la station forensic" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Judy Alvarez" })).toBeVisible();
  await page.getByRole("button", { name: "Comment jouer", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Comment jouer", exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/guide.png", fullPage: true });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Comment jouer", exact: true })).toBeFocused();
  await expect(page.getByRole("button", { name: "Rejouer le démarrage" })).toHaveCount(0);
  await expect(page.getByRole("img", { name: "Portrait de Judy Alvarez" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Portrait de Judy Alvarez" })).toHaveJSProperty("complete", true);
  const wallpaper = page.locator(".judy-os__wallpaper");
  const bounds = await wallpaper.boundingBox();
  expect(bounds?.width).toBe(page.viewportSize()?.width);
  expect(bounds?.height).toBe(page.viewportSize()?.height);
  await page.getByRole("button", { name: "Agrandir Dossier", exact: true }).click();
  await expect(page.locator('[data-app="case"]')).toHaveAttribute("data-maximized", "true");
  await page.screenshot({ path: "test-results/bureau-linux.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Messages", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Si on te demande" })).toBeVisible();
  await page.getByRole("button", { name: "Dossier", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Judy Alvarez" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Comment jouer", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Comment jouer", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Fermer les explications" }).click();
  await page.screenshot({ path: "test-results/bureau-mobile.png", fullPage: true });
});

test("le joueur peut terminer tout le parcours du dossier 001", async ({ page }) => {
  await page.goto("/");

  await page.waitForURL("**/case/001");

  await expect(page.locator("img.judy-os__wallpaper")).toHaveAttribute(
    "src",
    "/forensic-workstation.webp",
  );

  await expect(page.getByRole("heading", { name: "Judy Alvarez" })).toBeVisible();
  await page.getByRole("button", { name: "Ouvrir Messages" }).click();

  await expect(page.getByRole("heading", { name: "Si on te demande" })).toBeVisible();
  await expect(page.getByText("BROUILLON / NON ENVOYÉ", { exact: true })).toBeVisible();
  for (const action of ["Lire le message de Nora", "Retrouver le dernier échange avec Nora", "Lire le dernier message envoyé par Judy", "Chercher comment son compte a pu être compromis"]) {
    await page.getByRole("button", { name: "Garder ce passage dans mon carnet", exact: true }).click();
    await page.getByRole("button", { name: action, exact: true }).click();
  }

  await page
    .getByRole("button", {
      name: /ACTION REQUISE/,
    })
    .click();

  await page.getByRole("button", { name: "Analyser ce message" }).click();
  await page.getByRole("checkbox", { name: "pression temporelle" }).check();
  await page.getByRole("checkbox", { name: "domaine ressemblant" }).check();
  await page.locator(".analysis-sheet").screenshot({ path: "test-results/analysis-glass.png" });
  await page.getByRole("button", { name: "Valider l’analyse" }).click();

  await expect(page.getByText("Pression temporelle", { exact: true })).toBeVisible();
  await expect(page.getByText("Domaine homographe")).toBeVisible();

  await page.getByRole("tab", { name: "Hypothèse" }).click();
  await page.getByRole("button", { name: "Valider la conclusion" }).click();

  await expect(page.getByRole("heading", { name: "S-4831" })).toBeVisible();
  await page.getByRole("button", { name: "Confirmer l’anomalie" }).click();

  await expect(page.getByText("Session réutilisée")).toBeVisible();
  await expect(page.getByText("Connexion simultanée")).toBeVisible();

  await page.getByRole("button", { name: "Terminal", exact: true }).click();
  const input = page.getByLabel("judy@trace ~ %");

  await input.fill("ls");
  await input.press("Enter");
  await expect(page.getByText("orion-export.zip", { exact: true })).toBeVisible();

  await input.fill("sha256sum orion-export.zip");
  await input.press("Enter");
  await expect(page.getByText("MISMATCH: reference hash differs")).toBeVisible();
  await expect(page.getByText("Empreinte divergente", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "Dossier", exact: true }).click();
  await expect(page.getByText("Quelqu’un a continué sous son nom.", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Fichiers", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Fichiers" })).toBeVisible();

  await page.getByRole("button", { name: "Timeline", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
  const timelineWindow = page.locator('[data-app="timeline"]');
  await expect(
    timelineWindow.getByText("Empreinte divergente", { exact: true }),
  ).toBeVisible();

  await page.reload();
  await expect(page.getByText("Quelqu’un a continué sous son nom.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Recommencer le dossier", exact: true }).click();
  await page.getByRole("button", { name: "Confirmer le redémarrage" }).click();
  await expect(page.getByRole("button", { name: "Carnet 0/6" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Ouvrir Messages" })).toBeVisible();
});

test("une sauvegarde malformée ne casse pas le bureau", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("trace-zero:case-001", JSON.stringify({
    discoveredEvidenceIds: ["E99", null, "E01", "E01"], currentStep: "bad",
  })));
  await page.goto("/case/001");
  await expect(page.getByRole("button", { name: "Carnet 1/6" })).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "Fichiers", exact: true }).click();
  await page.getByRole("button", { name: /notes.txt/ }).click();
  await expect(page.getByText("Je devrais déjà être au café avec Max.", { exact: false })).toBeVisible();
});

test("un dossier inconnu affiche une page introuvable", async ({ page }) => {
  const response = await page.goto("/case/999");
  expect(response?.status()).toBe(404);
});

test("une fenêtre se déplace fluidement puis peut être rangée", async ({ page }) => {
  await page.goto("/case/001");
  await expect(page.locator('.station-content')).toHaveAttribute('data-boot-phase', 'ready', { timeout: 10000 });

  const handle = page.getByLabel(/Déplacer la fenêtre Dossier/);
  const window = page.locator('[data-app="case"]');
  const before = await window.boundingBox();
  const handleBox = await handle.boundingBox();

  expect(before).not.toBeNull();
  expect(handleBox).not.toBeNull();

  if (!before || !handleBox) return;

  await page.mouse.move(
    handleBox.x + handleBox.width / 2,
    handleBox.y + handleBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    handleBox.x + handleBox.width / 2 + 120,
    handleBox.y + handleBox.height / 2 + 70,
    { steps: 12 },
  );
  await page.mouse.up();

  const after = await window.boundingBox();
  expect(after).not.toBeNull();

  if (!after) return;

  expect(Math.abs(after.x - before.x)).toBeGreaterThan(50);
  expect(Math.abs(after.y - before.y)).toBeGreaterThan(25);

  await page.getByRole("button", { name: "Ranger" }).click();
  expect(await window.getAttribute("style")).toContain(
    "translate3d(0px, 0px, 0px)",
  );
});
