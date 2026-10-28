# Trace//Zero

Jeu narratif d'enquête cyber centré sur la disparition de Judy Alvarez.

## La dernière soirée

Musique d’introduction : boucle synthwave originale générée par Web Audio dans `intro-music.ts` (108 BPM, basse, arpège et percussions synthétiques), sans enregistrement ni sample tiers. Activation explicite via « Activer le son », coupure possible pendant le titre et le prologue, arrêt à l’entrée du bureau. Aucun fichier musical externe ni attribution tierce. Les boutons du prologue restent dans une zone fixe ; le texte dispose de son propre défilement sur les petits écrans.

Après le titre animé, un prologue en quatre écrans présente Max, le rendez-vous manqué, le brouillon et l’objectif de l’enquête. Les phrases apparaissent progressivement ; le joueur avance à son rythme, revient en arrière ou passe le prologue. En mouvement réduit, le texte est immédiat. Le bureau reste inactif pendant la lecture. La clé de session `trace-zero:prologue:v1` est distincte du titre et de la progression ; les sessions existantes voient donc le nouveau contexte. « Relire le prologue » dans le dossier permet de le rouvrir. Les pistes et les indices restent dans l’onglet Pistes du carnet.

Le joueur incarne Max, sans genre imposé. Judy a manqué leur rendez-vous au café ; 36 heures plus tard, son ordinateur révèle un brouillon non envoyé : « Max, si on te demande, je suis partie à 20 h 30. » Nora évoque une lumière allumée à 20 h 31, puis un départ à 22 h 12. À 22 h 47, un message envoyé au nom de Judy accuse Nora et affirme que Judy est toujours au bureau.

Quatre passages peuvent être conservés dans le carnet de Max et relus. Les connexions et l’empreinte de l’archive permettent de questionner les messages plutôt que de suivre seulement une procédure technique. La chronologie distingue témoignages, événements enregistrés et vérifications de Max. La fin exige ces quatre passages, les six preuves et H01. Les anciennes sauvegardes conservent leurs preuves ; les passages narratifs restent à découvrir. La DA, le bureau et l’intro sont conservés.

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

Le chapitre possède une fin jouable : une autre machine a repris le compte de Judy avant le message qui accuse Nora. Son départ reste fondé sur le témoignage de Nora ; sa localisation et l’identité de l’auteur ne sont pas établies. Aucun chapitre supplémentaire n’est inclus.

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

DÉCISION : accent unique `#D3E97A`, matériaux sombres neutres, Manrope pour les textes, Source Code Pro pour les métadonnées et Chakra Petch pour le titre animé. Le fond cyberpunk original est restauré, avec des voiles sombres et le jaune conservé. Les valeurs de couleur, flou et durée sont centralisées dans `_tokens.scss`. Le verre utilise des gris neutres, un flou de 40 px, des reflets blancs et un chrome à 28 % d’opacité. Le lecteur de messages utilise un fond à 32 %, et l’analyse un reflet blanc à 4 % sans couche opaque supplémentaire. Le terminal conserve son fond de lecture à 90 %. Un fallback opaque est prévu sans backdrop-filter.

La route d’accueil ouvre directement le dossier 001. Le composant `StationBoot` présente une séquence CSS de cinq secondes dès cette arrivée, une fois par session. Sa direction s’inspire du rythme typographique de [1minus1](https://1minus1.com/) : titre monumental plein/contour, lettres révélées en décalé, monogramme à deux barres, puis ouverture en deux volets sur le bureau. Les textes et les éléments graphiques sont propres à Trace//Zero. Aucun bouton Passer n’est affiché. Les touches Entrée, Échap et Espace permettent toujours d’interrompre la séquence. Un geste pointeur l’interrompt également pour laisser le bureau réagir immédiatement. Aucun bouton de rejeu n’est affiché. La session utilise une clé sessionStorage séparée ; la progression de jeu et son localStorage ne changent pas.

En mouvement réduit, la présentation devient un titre statique de 300 ms, sans glitch ni balayage. Le focus revient au bureau après la séquence. Les preuves et conclusions déclenchent un effet local ponctuel, masqué aux technologies d’assistance et désactivé en mouvement réduit. Aucune animation de backdrop-filter.

HYPOTHÈSE À TESTER : cette séparation entre chrome transparent et lecture opaque préserve l’ambiance sans augmenter la fatigue visuelle.

Les matériaux ont été neutralisés pour retirer la dominante bleue. Les anciens calculs de contraste ne s’appliquent plus à cette palette : **non mesuré** pour les nouveaux fonds et leur composition réelle.

Non vérifiés : lecteur d’écran réel, zoom 200 %, contrastes sur chaque fond et performance sur mobile bas de gamme. Les tests navigateur couvrent Chromium, pas Safari ni Firefox. Les captures ne constituent pas une validation d’accessibilité.

## Direction produit

Le dossier 001 fonctionne sans backend. Les futurs chapitres et la synchronisation multi-appareils restent des extensions du produit.

Fond de l’appartement : image de présentation de [Cyberpunk 2077 — Judy’s Apartment, par RC13](https://steamcommunity.com/sharedfiles/filedetails/?id=2321339181). Cette copie remplace le JPEG tronqué du dépôt ; les visuels du jeu restent la propriété de leurs ayants droit.

Les explications sont disponibles à la demande via « Comment jouer » dans la barre système (icône ? sur mobile). Le guide utilise une boîte de dialogue native, fermable par son bouton, Échap ou un clic sur le fond. Le portrait de Judy a été fourni par l’utilisateur ; son nom utilise Chakra Petch comme le titre de l’intro.

Le fond actif du bureau est `forensic-workstation.webp`, fourni par l’utilisateur. Le portrait et l’intro restent inchangés.
