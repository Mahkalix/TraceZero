export type Evidence = {
  id: string;
  title: string;
  description: string;
};

export const evidenceCatalog: Record<string, Evidence> = {
  E01: {
    id: "E01",
    title: "Urgence artificielle",
    description:
      "Le message impose un délai très court et menace de suspendre le compte de Judy.",
  },
  E02: {
    id: "E02",
    title: "Domaine ressemblant",
    description:
      "Le message et le lien utilisent des domaines qui imitentent l'infrastructure Helix sans être le domaine officiel.",
  },
};
