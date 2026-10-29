import type { InvestigationProgress } from "./progress";
import { evidenceCatalog } from "../../data/chapter-01/evidence";

export function notebookState(progress: InvestigationProgress) {
  const has = (id: string) => progress.discoveredEvidenceIds.includes(id);
  const network = has("E03") && has("E04");
  const archive = has("E05") && has("E06");
  const missing = ["E01", "E02"].filter((id) => !has(id)).map((id) => evidenceCatalog[id].title);
  const validated = missing.length === 0 && progress.validatedHypothesisIds.includes("H01");
  const conclusions: string[] = [];
  if (validated) conclusions.push("L’alerte était un piège visant l’accès ORION de Judy.");
  if (network) conclusions.push("Une autre machine utilise sa session. Une activité de son compte ne prouve donc pas sa présence devant le PC.");
  if (network && progress.storyClueIds?.includes("mail-sent")) conclusions.push("Le message de 22 h 47 qui accuse Nora arrive après cette réutilisation. Son auteur reste à établir.");
  if (archive) conclusions.push("L’archive diffère de la référence laissée par Judy. Cela ne révèle ni l’auteur ni l’heure de la modification.");
  return {
    missing,
    conclusions,
    hypothesis: validated
      ? "Les indices de l’alerte étayent un phishing ciblé. Ils ne permettent pas encore d’identifier la personne derrière le message."
      : missing.length
        ? "L’alerte de sécurité pouvait-elle servir à obtenir l’accès de Judy ? Il faut recouper les indices du message avant de conclure."
        : "Le faux domaine et la pression temporelle concordent. Ces éléments permettent de valider la piste du phishing ciblé.",
    sentMessage: network ? "La session est utilisée sur une autre machine avant ce message. Je ne peux plus attribuer ces mots à Judy sur la seule foi de son nom." : null,
  };
}
