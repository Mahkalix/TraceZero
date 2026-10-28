import { expect, it } from "vitest";
import { notebookState } from "./notebook";
import { initialProgress } from "./progress";

it("ne présente pas de conclusion avant les preuves", () => {
  const state = notebookState(initialProgress);
  expect(state.conclusions).toEqual([]);
  expect(state.missing).toHaveLength(2);
  expect(state.sentMessage).toBeNull();
});

it("actualise les manques et attend la validation de l’hypothèse", () => {
  expect(notebookState({ ...initialProgress, discoveredEvidenceIds: ["E01"] }).missing).toEqual(["Domaine homographe"]);
  const supported = { ...initialProgress, discoveredEvidenceIds: ["E01", "E02"] };
  expect(notebookState(supported).missing).toEqual([]);
  expect(notebookState(supported).conclusions).toEqual([]);
  expect(notebookState({ ...supported, validatedHypothesisIds: ["H01"] }).conclusions).toHaveLength(1);
});

it("recoupe le message seulement après les preuves réseau et efface tout au redémarrage", () => {
  const state = notebookState({ ...initialProgress, storyClueIds: ["mail-sent"], discoveredEvidenceIds: ["E03", "E04", "E05", "E06"] });
  expect(state.sentMessage).toContain("autre machine");
  expect(state.conclusions).toHaveLength(3);
  expect(notebookState(initialProgress).conclusions).toEqual([]);
});
