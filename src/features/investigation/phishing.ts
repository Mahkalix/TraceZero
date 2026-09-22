export type PhishingSignal = "sender" | "domain" | "link" | "urgency";

const relevantSignals = new Set<PhishingSignal>([
  "sender",
  "domain",
  "link",
  "urgency",
]);

export function analyzePhishingSignals(selected: PhishingSignal[]) {
  const valid = selected.filter((signal) => relevantSignals.has(signal));
  const evidenceIds = new Set<string>();

  if (valid.includes("urgency")) evidenceIds.add("E01");

  if (
    valid.includes("sender") ||
    valid.includes("domain") ||
    valid.includes("link")
  ) {
    evidenceIds.add("E02");
  }

  return {
    validCount: valid.length,
    isEnough: valid.length >= 2,
    evidenceIds: [...evidenceIds],
  };
}
