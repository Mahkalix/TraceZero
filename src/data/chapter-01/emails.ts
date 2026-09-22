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
};

export const emails: CaseEmail[] = [
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
];

export const phishingEmailId = "mail-004";
