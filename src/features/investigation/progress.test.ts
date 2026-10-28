import { describe, expect, it } from "vitest";
import { initialProgress, isCaseComplete, parseProgress } from "./progress";
import { storyClueIds } from "../../data/chapter-01/story";

describe("progression du dossier", () => {
  it("ignore les sauvegardes invalides", () => {
    for (const value of [null, [], "bad", 12]) expect(parseProgress(value)).toEqual(initialProgress);
    expect(parseProgress({ discoveredEvidenceIds: ["E01", "E01", 6, "E99"], validatedHypothesisIds: ["H99"], currentStep: "invalid" }))
      .toEqual({ ...initialProgress, discoveredEvidenceIds: ["E01"] });
  });
  it("ne termine pas le dossier avec la seule empreinte", () => {
    expect(isCaseComplete({ ...initialProgress, discoveredEvidenceIds: ["E05", "E06"] })).toBe(false);
  });
  it("exige toutes les preuves et la conclusion", () => {
    const evidence = ["E01", "E02", "E03", "E04", "E05", "E06"];
    expect(isCaseComplete({ ...initialProgress, discoveredEvidenceIds: evidence })).toBe(false);
    expect(isCaseComplete({ ...initialProgress, discoveredEvidenceIds: evidence, validatedHypothesisIds: ["H01"] })).toBe(false);
    expect(isCaseComplete({ ...initialProgress, storyClueIds, discoveredEvidenceIds: evidence, validatedHypothesisIds: ["H01"] })).toBe(true);
  });
  it("préserve les passages narratifs valides et migre les anciennes sauvegardes", () => {
    expect(parseProgress({ storyClueIds: ["draft-max", "draft-max", "inconnu", null] }).storyClueIds).toEqual(["draft-max"]);
    expect(parseProgress({ discoveredEvidenceIds: ["E01"] })).toEqual({ ...initialProgress, discoveredEvidenceIds: ["E01"] });
  });
});
