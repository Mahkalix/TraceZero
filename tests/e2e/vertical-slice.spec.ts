import { expect, test } from "@playwright/test";

test("le joueur peut terminer tout le parcours du dossier 001", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Entrer dans l’ordinateur de Judy." })).toBeVisible();
  await page.getByRole("link", { name: "Ouvrir le bureau" }).click();

  await expect(page.locator("img.judy-os__wallpaper")).toHaveAttribute(
    "src",
    "/judy-apartment.jpg",
  );

  await expect(page.getByRole("heading", { name: "Judy Alvarez" })).toBeVisible();
  await page.getByRole("button", { name: "Ouvrir Messages" }).click();

  await page
    .getByRole("button", {
      name: /ACTION REQUISE/,
    })
    .click();

  await page.getByRole("button", { name: "Analyser ce message" }).click();
  await page.getByRole("checkbox", { name: "pression temporelle" }).check();
  await page.getByRole("checkbox", { name: "domaine ressemblant" }).check();
  await page.getByRole("button", { name: "Valider l’analyse" }).click();

  await expect(page.getByText("Pression temporelle")).toBeVisible();
  await expect(page.getByText("Domaine homographe")).toBeVisible();

  await page.getByRole("tab", { name: "Hypothèse" }).click();
  await page.getByRole("button", { name: "Valider la conclusion" }).click();

  await expect(page.getByRole("heading", { name: "S-4831" })).toBeVisible();
  await page.getByRole("button", { name: "Confirmer l’anomalie" }).click();

  await expect(page.getByText("Session réutilisée")).toBeVisible();
  await expect(page.getByText("Connexion simultanée")).toBeVisible();

  await page.getByRole("button", { name: "Terminal" }).click();
  const input = page.getByLabel("judy@trace ~ %");

  await input.fill("ls");
  await input.press("Enter");
  await expect(page.getByText("orion-export.zip", { exact: true })).toBeVisible();

  await input.fill("sha256sum orion-export.zip");
  await input.press("Enter");
  await expect(page.getByText("MISMATCH: reference hash differs")).toBeVisible();
  await expect(page.getByText("Empreinte divergente")).toBeVisible();

  await page.getByRole("button", { name: "Dossier" }).click();
  await expect(page.getByText("Piste technique consolidée")).toBeVisible();

  await page.getByRole("button", { name: "Fichiers" }).click();
  await expect(page.getByRole("heading", { name: "Fichiers" })).toBeVisible();

  await page.getByRole("button", { name: "Timeline" }).click();
  await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
  await expect(page.getByText("Empreinte divergente", { exact: true })).toBeVisible();
});

test("une fenêtre se déplace fluidement puis peut être rangée", async ({ page }) => {
  await page.goto("/case/001");

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
  await expect(window).toHaveAttribute(
    "style",
    /translate3d\(0px, 0px, 0\)/,
  );
});
