export const storyClues = {
  "draft-max": { title: "20 h 30, la version de Judy", detail: "Judy voulait que je confirme un départ à 20 h 30. Son brouillon s’arrête au prénom de Nora. Pourquoi me demander de la couvrir ?", next: "mail-003", action: "Lire le message de Nora" },
  "mail-003": { title: "Une lumière à 20 h 31", detail: "Nora voit encore de la lumière. Cela ne prouve pas que Judy est là, mais Nora lui demande aussi de comparer deux versions d’ORION.", next: "mail-departure", action: "Retrouver le dernier échange avec Nora" },
  "mail-departure": { title: "Un départ à 22 h 12 ?", detail: "Nora dit avoir vu Judy sortir avec son sac. C’est un témoignage, pas une preuve indépendante. L’ordinateur serait resté allumé.", next: "mail-sent", action: "Lire le dernier message envoyé par Judy" },
  "mail-sent": { title: "Qui écrit à 22 h 47 ?", detail: "Un message au nom de Judy affirme qu’elle est encore au bureau et met Nora en cause. Il contredit son départ rapporté et ses propres doutes sur ORION.", next: "mail-004", action: "Chercher comment son compte a pu être compromis" },
} as const;

export type StoryClueId = keyof typeof storyClues;
export const storyClueIds = Object.keys(storyClues) as StoryClueId[];
