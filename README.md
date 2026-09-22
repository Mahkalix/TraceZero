# Trace//Zero

Jeu narratif d'enquête cyber centré sur la disparition de Judy Alvarez.

## Vertical slice actuelle

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
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

## Direction produit

La priorité reste un chemin jouable complet avant l'ajout de la couche PostgreSQL, des logs réseau et du terminal simulé.
