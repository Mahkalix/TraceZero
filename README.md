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

## Direction produit

Le dossier 001 fonctionne sans backend. Les futurs chapitres et la synchronisation multi-appareils restent des extensions du produit.
