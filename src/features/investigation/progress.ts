export type InvestigationProgress = {
  discoveredEvidenceIds: string[];
  validatedHypothesisIds: string[];
  currentStep: "briefing" | "mail" | "analysis" | "conclusion";
};

export const initialProgress: InvestigationProgress = {
  discoveredEvidenceIds: [],
  validatedHypothesisIds: [],
  currentStep: "briefing",
};

export const progressStorageKey = "trace-zero:case-001";

export function readProgress(): InvestigationProgress {
  if (typeof window === "undefined") return initialProgress;

  try {
    const raw = window.localStorage.getItem(progressStorageKey);
    if (!raw) return initialProgress;

    const parsed = JSON.parse(raw) as Partial<InvestigationProgress>;

    return {
      discoveredEvidenceIds: Array.isArray(parsed.discoveredEvidenceIds)
        ? parsed.discoveredEvidenceIds
        : [],
      validatedHypothesisIds: Array.isArray(parsed.validatedHypothesisIds)
        ? parsed.validatedHypothesisIds
        : [],
      currentStep: parsed.currentStep ?? "briefing",
    };
  } catch {
    return initialProgress;
  }
}

export function writeProgress(progress: InvestigationProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
}
