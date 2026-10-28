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

export function isCaseComplete(progress: InvestigationProgress): boolean {
  return ["E01", "E02", "E03", "E04", "E05", "E06"].every((id) =>
    progress.discoveredEvidenceIds.includes(id),
  ) && progress.validatedHypothesisIds.includes("H01");
}

export function parseProgress(value: unknown): InvestigationProgress {
  const data = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const filterIds = (value: unknown, allowed: string[]) => Array.isArray(value)
    ? [...new Set(value.filter((id): id is string => typeof id === "string" && allowed.includes(id)))]
    : [];
  return {
    discoveredEvidenceIds: filterIds(data.discoveredEvidenceIds, ["E01", "E02", "E03", "E04", "E05", "E06"]),
    validatedHypothesisIds: filterIds(data.validatedHypothesisIds, ["H01"]),
    currentStep: ["briefing", "mail", "analysis", "conclusion"].includes(String(data.currentStep))
      ? data.currentStep as InvestigationProgress["currentStep"] : "briefing",
  };
}

export function readProgress(): InvestigationProgress {
  if (typeof window === "undefined") return initialProgress;

  try {
    const raw = window.localStorage.getItem(progressStorageKey);
    if (!raw) return initialProgress;

    return parseProgress(JSON.parse(raw));
  } catch {
    return initialProgress;
  }
}

export function writeProgress(progress: InvestigationProgress): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
