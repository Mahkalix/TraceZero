export type CaseEmail = {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string[];
  displayLink?: string;
  actualLink?: string;
  external?: boolean;
  draft?: boolean;
};

export const emails: CaseEmail[] = [
  {
    id: "draft-max",
    from: "judy.alvarez@helix.example",
    to: "Max · contact personnel",
    subject: "Si on te demande",
    date: "12 oct. · 20:26 · brouillon non envoyé",
    draft: true,
    body: [
      "Max, si on te demande, je suis partie à 20 h 30.",
      "Je sais ce que tu vas dire. Tu m’as déjà couverte une fois et je t’avais promis de ne plus te mêler à mes histoires.",
      "Je dois récupérer quelque chose avant la revue de demain. Après, je t’expliquerai. Garde notre table au café, même si je suis en retard.",
      "Et si Nora t’appelle…",
    ],
  },
  {
    id: "mail-cafe",
    from: "Max · contact personnel",
    to: "judy.alvarez@helix.example",
    subject: "Notre table",
    date: "12 oct. · 17:42",
    body: [
      "21 heures, comme prévu ? Cette fois tu choisis autre chose qu’un café froid et trois excuses.",
      "Tu n’as pas besoin de tout m’expliquer par message. Viens, c’est tout.",
      "Max",
    ],
  },
  {
    id: "mail-001",
    from: "mira.chen@helix.example",
    to: "judy.alvarez@helix.example",
    subject: "Revue ORION demain",
    date: "12 oct. · 18:04",
    body: [
      "Judy,",
      "La revue ORION est maintenue demain à 09:30. J'ai ajouté les points sur l'authentification au document de suivi.",
      "Mira",
    ],
  },
  {
    id: "mail-002",
    from: "buildbot@helix.example",
    to: "judy.alvarez@helix.example",
    subject: "[ORION] pipeline #1842 successful",
    date: "12 oct. · 19:16",
    body: [
      "Pipeline #1842 terminé avec succès.",
      "Branche: feature/session-hardening",
      "Commit: 6f1b7c9",
    ],
  },
  {
    id: "mail-003",
    from: "nora.saad@helix.example",
    to: "judy.alvarez@helix.example",
    subject: "Tu es encore au bureau ?",
    date: "12 oct. · 20:31",
    body: [
      "Je pars. La lumière de ton bureau est encore allumée.",
      "Tu me confirmes que tu fermes en partant ?",
      "Pour tout à l’heure : je ne te demande pas de me croire sur parole. Compare les deux versions d’ORION avant la revue. Tu comprendras pourquoi je ne veux pas signer.",
    ],
  },
  {
    id: "mail-004",
    from: "security@helix-support.example",
    to: "judy.alvarez@helix.example",
    subject: "ACTION REQUISE : session ORION expirée",
    date: "12 oct. · 21:52",
    external: true,
    displayLink: "https://sso.helix.example/renew",
    actualLink: "https://helix-sso.example/login",
    body: [
      "Une anomalie de sécurité a invalidé votre session ORION.",
      "Vous devez confirmer votre identité dans les 10 minutes afin d'éviter la suspension de votre compte.",
      "Utilisez le lien de renouvellement ci-dessous.",
    ],
  },
  {
    id: "mail-005",
    from: "judy.alvarez@helix.example",
    to: "judy.alvarez@helix.example",
    subject: "notes perso",
    date: "12 oct. · 22:07",
    body: [
      "Vérifier les sessions actives demain.",
      "Quelque chose ne colle pas avec le token du laptop.",
      "J’ai gardé l’empreinte de mon export dans reference.sha256. Si le fichier change, il restera au moins un moyen de le voir. Mes notes sont dans notes.txt.",
    ],
  },
  {
    id: "mail-006",
    from: "it-desk@helix.example",
    to: "judy.alvarez@helix.example",
    subject: "Maintenance VPN terminée",
    date: "12 oct. · 22:18",
    body: [
      "La maintenance VPN planifiée est terminée.",
      "Aucune action n'est requise de votre côté.",
    ],
  },
  {
    id: "mail-departure",
    from: "nora.saad@helix.example",
    to: "judy.alvarez@helix.example",
    subject: "Je t’ai vue sortir",
    date: "12 oct. · 22:24",
    body: [
      "Je t’ai vue sortir à 22 h 12, par l’escalier de service. J’étais revenue chercher mon badge.",
      "Tu m’as vue aussi. Pourquoi tu n’as rien dit ?",
      "Tu avais ton sac, mais tu as laissé ton ordinateur allumé. Appelle Max. Le café est fermé maintenant.",
    ],
  },
  {
    id: "mail-sent",
    from: "judy.alvarez@helix.example",
    to: "mira.chen@helix.example",
    subject: "À propos de Nora",
    date: "12 oct. · 22:47 · envoyé",
    body: [
      "Je suis toujours au bureau. J’ai vérifié l’export ORION : il n’y a rien d’anormal.",
      "Nora a mal interprété les résultats. Merci de ne plus lui donner accès au dossier avant la revue.",
      "Judy",
    ],
  },
];

export const phishingEmailId = "mail-004";
