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

DÉCISION : accent unique `#D3E97A`, matériaux sombres neutres, Manrope pour les textes, Source Code Pro pour les métadonnées et Chakra Petch pour le titre animé. Le fond cyberpunk original est restauré, avec des voiles sombres et le jaune conservé. Les valeurs de couleur, flou et durée sont centralisées dans `_tokens.scss`. Le verre utilise des gris neutres, un flou de 40 px, des reflets blancs et un chrome à 48 % d’opacité. Les emails, le terminal et l’analyse conservent un fond de lecture à 90 %, avec un fallback opaque sans backdrop-filter.

La route d’accueil ouvre directement le dossier 001. Le composant `StationBoot` présente une séquence CSS de cinq secondes dès cette arrivée, une fois par session. Sa direction s’inspire du rythme typographique de [1minus1](https://1minus1.com/) : titre monumental plein/contour, lettres révélées en décalé, monogramme à deux barres, puis ouverture en deux volets sur le bureau. Les textes et les éléments graphiques sont propres à Trace//Zero. Aucun bouton Passer n’est affiché. Les touches Entrée, Échap et Espace permettent toujours d’interrompre la séquence. Un geste pointeur l’interrompt également pour laisser le bureau réagir immédiatement. Aucun bouton de rejeu n’est affiché. La session utilise une clé sessionStorage séparée ; la progression de jeu et son localStorage ne changent pas.

En mouvement réduit, la présentation devient un titre statique de 300 ms, sans glitch ni balayage. Le focus revient au bureau après la séquence. Les preuves et conclusions déclenchent un effet local ponctuel, masqué aux technologies d’assistance et désactivé en mouvement réduit. Aucune animation de backdrop-filter.

HYPOTHÈSE À TESTER : cette séparation entre chrome transparent et lecture opaque préserve l’ambiance sans augmenter la fatigue visuelle.

Les matériaux ont été neutralisés pour retirer la dominante bleue. Les anciens calculs de contraste ne s’appliquent plus à cette palette : **non mesuré** pour les nouveaux fonds et leur composition réelle.

Non vérifiés : lecteur d’écran réel, zoom 200 %, contrastes sur chaque fond et performance sur mobile bas de gamme. Les tests navigateur couvrent Chromium, pas Safari ni Firefox. Les captures ne constituent pas une validation d’accessibilité.

## Direction produit

Le dossier 001 fonctionne sans backend. Les futurs chapitres et la synchronisation multi-appareils restent des extensions du produit.

Fond de l’appartement : image de présentation de [Cyberpunk 2077 — Judy’s Apartment, par RC13](https://steamcommunity.com/sharedfiles/filedetails/?id=2321339181). Cette copie remplace le JPEG tronqué du dépôt ; les visuels du jeu restent la propriété de leurs ayants droit.

Les explications sont disponibles à la demande via « Comment jouer » dans la barre système (icône ? sur mobile). Le guide utilise une boîte de dialogue native, fermable par son bouton, Échap ou un clic sur le fond. Le portrait de Judy a été fourni par l’utilisateur ; son nom utilise Chakra Petch comme le titre de l’intro.
