import { describe, expect, it } from "vitest";
import { analyzePhishingSignals } from "./phishing";

describe("analyzePhishingSignals", () => {
  it("refuse une analyse avec moins de deux indices", () => {
    const result = analyzePhishingSignals(["urgency"]);

    expect(result.isEnough).toBe(false);
    expect(result.validCount).toBe(1);
    expect(result.evidenceIds).toEqual(["E01"]);
  });

  it("débloque les preuves liées aux indices réellement identifiés", () => {
    const result = analyzePhishingSignals(["urgency", "domain"]);

    expect(result.isEnough).toBe(true);
    expect(result.evidenceIds).toContain("E01");
    expect(result.evidenceIds).toContain("E02");
  });

  it("ne duplique pas E02 quand plusieurs indices pointent vers le domaine", () => {
    const result = analyzePhishingSignals(["sender", "domain", "link"]);

    expect(result.isEnough).toBe(true);
    expect(result.evidenceIds).toEqual(["E02"]);
  });
});
