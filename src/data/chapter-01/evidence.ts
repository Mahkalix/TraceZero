export type Evidence = {
  id: string;
  title: string;
  description: string;
  source: string;
};

export const evidenceCatalog: Record<string, Evidence> = {
  E01: {
    id: "E01",
    title: "Pression temporelle",
    description:
      "Le message impose un délai artificiel de dix minutes et menace de suspendre le compte.",
    source: "MAIL / mail-004",
  },
  E02: {
    id: "E02",
    title: "Domaine homographe",
    description:
      "Le lien visible imite le SSO Helix, mais la destination réelle utilise un autre domaine.",
    source: "MAIL / mail-004",
  },
  E03: {
    id: "E03",
    title: "Session réutilisée",
    description:
      "Le même identifiant de session S-4831 apparaît sur deux machines distinctes.",
    source: "NETWORK / auth.log",
  },
  E04: {
    id: "E04",
    title: "Connexion simultanée",
    description:
      "JUDY-LAPTOP et UNKNOWN-WIN utilisent la session de Judy à quelques minutes d'intervalle.",
    source: "NETWORK / auth.log",
  },
  E05: {
    id: "E05",
    title: "Archive ORION",
    description:
      "Une archive nommée orion-export.zip apparaît dans les fichiers récents du poste.",
    source: "TERMINAL / evidence",
  },
  E06: {
    id: "E06",
    title: "Empreinte divergente",
    description:
      "Le SHA-256 de l'archive ne correspond pas à l'empreinte de référence laissée par Judy.",
    source: "TERMINAL / sha256",
  },
};
