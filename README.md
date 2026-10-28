# Trace//Zero

Jeu narratif d'enquête cyber centré sur la disparition de Judy Alvarez.

## Dossier 001

Le prototype permet déjà de :

1. ouvrir le dossier 001
2. lire le briefing forensic
3. naviguer dans le faux bureau
4. consulter six emails
5. analyser le message de phishing
6. identifier des indices
7. débloquer E01 et E02
8. valider l'hypothèse H01
9. conserver la progression dans localStorage
10. comparer les sessions réseau et confirmer leur réutilisation
11. inspecter les fichiers et vérifier l’archive avec le terminal simulé
12. reconstruire la chronologie et terminer avec les six preuves et H01
13. reprendre sa partie ou recommencer avec confirmation

Le dossier technique possède une fin jouable. La localisation de Judy et l’identité de l’auteur ne sont pas établies par les preuves : aucun chapitre supplémentaire n’est inclus.

## Stack

- Next.js
- TypeScript
- SCSS
- Zod
- Vitest
- Playwright
- PostgreSQL + Prisma prévus après validation de la vertical slice

## Accessibilité

- HTML sémantique
- contrôles natifs button/input
- navigation clavier
- focus visible
- annonces dynamiques via aria-live
- aria-expanded pour le panneau d'analyse
- aria-pressed et aria-selected pour les états interactifs
- respect de prefers-reduced-motion
- information importante jamais transmise uniquement par couleur

## Développement local

```bash
npm ci
npm run dev
```

Puis ouvrir http://localhost:3000.

## Vérification

Node.js 22 recommandé. Le build télécharge les polices Google et nécessite un accès réseau lors de la première compilation.

```bash
npm run lint
npm test
npm run build
npm run typecheck
npx playwright install chromium
npm run test:e2e
```

GitHub Actions exécute ces contrôles à chaque push et pull request. Les tests navigateur couvrent le parcours complet, la reprise, le redémarrage, les sauvegardes malformées et les dossiers inconnus.

## Sauvegarde et confidentialité

La progression reste dans le navigateur, sous `trace-zero:case-001`. Aucun compte ni serveur de stockage n’est nécessaire. Si le navigateur refuse le stockage, un message avertit le joueur ; la partie continue en mémoire jusqu’à la fermeture de l’onglet. Les commandes du terminal et les liens suspects sont des simulations.

Les versions de PostCSS et Sharp sont corrigées via `overrides` pour conserver Next.js 15 tout en corrigeant les alertes de l’audit. Revalider ces overrides lors d’une migration de Next.js.

## Direction artistique forensic

DÉCISION : accent unique `#D3E97A`, matériaux sombres neutres, Manrope pour les textes et Source Code Pro pour les métadonnées. Les valeurs de couleur, flou et durée sont centralisées dans `_tokens.scss`. La couche `_forensic.scss` distingue les surfaces de lecture à 96 % d’opacité du chrome en verre à 76 %, avec un fallback opaque sans backdrop-filter.

Le composant `StationBoot` présente une séquence CSS de cinq secondes à la première ouverture du bureau par session : lignes de boot, composition du nom, accent, grille, panneaux, balayage unique. Le bouton Passer et les touches Entrée, Échap et Espace l’interrompent. Un geste pointeur l’interrompt également pour laisser le bureau réagir immédiatement. Un bouton discret permet de la rejouer. La session utilise une clé sessionStorage séparée ; la progression de jeu et son localStorage ne changent pas.

En mouvement réduit, la présentation devient un titre statique de 300 ms, sans glitch ni balayage. Le focus revient au bureau après la séquence. Les preuves et conclusions déclenchent un effet local ponctuel, masqué aux technologies d’assistance et désactivé en mouvement réduit. Aucune animation de backdrop-filter.

HYPOTHÈSE À TESTER : cette séparation entre chrome transparent et lecture opaque préserve l’ambiance sans augmenter la fatigue visuelle.

Contrastes calculés par luminance relative sRGB sur des couples **opaques** : `#EDF1F4` sur `#141C25` : 15,12:1 ; `#B5C0CB` sur `#141C25` : 9,30:1 ; `#D3E97A` sur `#141C25` : 12,85:1 ; `#10150B` sur `#D3E97A` : 13,85:1. Ces calculs ne couvrent pas la composition réelle de tous les fonds en verre : **non mesuré** pour chaque fond.

Non vérifiés : lecteur d’écran réel, zoom 200 %, contrastes sur chaque fond et performance sur mobile bas de gamme. Les tests navigateur couvrent Chromium, pas Safari ni Firefox. Les captures ne constituent pas une validation d’accessibilité.

## Direction produit

Le dossier 001 fonctionne sans backend. Les futurs chapitres et la synchronisation multi-appareils restent des extensions du produit.
