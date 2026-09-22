import { expect, test } from "@playwright/test";

test("le joueur peut confirmer la première hypothèse de phishing", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Ouvrir le dossier 001" }).click();

  await expect(
    page.getByRole("heading", { name: "Judy Alvarez · disparition signalée" }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Commencer par les messages" })
    .click();

  await page
    .getByRole("button", {
      name: /security@helix-support\.example.*ACTION REQUISE/s,
    })
    .click();

  await page.getByRole("button", { name: "Analyser ce message" }).click();

  await page
    .getByRole("checkbox", { name: "Pression temporelle artificielle" })
    .check();
  await page
    .getByRole("checkbox", {
      name: "Domaine ressemblant au domaine officiel",
    })
    .check();

  await page.getByRole("button", { name: "Valider l'analyse" }).click();

  await expect(page.getByText("Urgence artificielle")).toBeVisible();
  await expect(page.getByText("Domaine homographe")).toBeVisible();

  await page.getByRole("tab", { name: "Hypothèses" }).click();

  const validate = page.getByRole("button", { name: "Valider la conclusion" });
  await expect(validate).toBeEnabled();
  await validate.click();

  await expect(
    page.getByRole("button", { name: "Hypothèse validée" }),
  ).toBeDisabled();
});
