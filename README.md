# Trace//Zero

Jeu narratif d'enquête cyber centré sur la disparition de Judy Alvarez.

## Objectif actuel

Construire une vertical slice de 10 minutes :

1. accueil
2. briefing
3. faux bureau
4. messagerie
5. email de phishing
6. analyse
7. première conclusion

## Stack

- Next.js
- TypeScript
- SCSS
- Zod
- Vitest
- Playwright
- PostgreSQL + Prisma plus tard, après validation de la vertical slice

## Principes

- logique d'enquête hors des composants React
- composants sémantiques et navigation clavier
- focus visible
- contraste contrôlé
- respect de `prefers-reduced-motion`
- boutons pour les actions, liens pour la navigation
- aucune commande système réelle
- développement via branches et pull requests vers `main`

## Développement local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.
