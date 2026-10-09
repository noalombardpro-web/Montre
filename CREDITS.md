# Crédits & licences

## Modèles 3D

Toutes les montres (boîtes, cadrans, bracelets, calibres) sont **générées procéduralement** par le code de ce dépôt (`src/models/procedural/`). Aucun modèle tiers n'est inclus. Les vignettes de la collection (`public/thumbs/`) sont des rendus de ces mêmes modèles, produits par `npm run thumbs`. Les fichiers `public/models/*.glb` sont des exports de ces modèles procéduraux (`npm run export:glb` + `npm run optimize`).

## Marques citées

Rolex, Patek Philippe, Audemars Piguet, Vacheron Constantin, Omega, Tudor, IWC Schaffhausen, Breitling, Zenith, Jaeger-LeCoultre, A. Lange & Söhne, Grand Seiko, Blancpain, Breguet, Cartier et TAG Heuer, ainsi que les noms de modèles et références associés, sont des marques de leurs propriétaires respectifs. Ils sont cités à titre descriptif pour identifier les montres interprétées ; ce projet n'est ni affilié à ces maisons ni approuvé par elles. Aucun logo, couronne, marque figurative ou désignation déposée n'est reproduit sur les modèles 3D, dont les cadrans portent un branding fictif « ATELIER ». Les données techniques proviennent d'informations publiques et sont indicatives.

Si vous ajoutez un modèle tiers (CC0 / CC-BY), indiquez ici : titre, auteur, URL source, licence, modifications.

| Modèle | Auteur | Source | Licence | Modifications |
| --- | --- | --- | --- | --- |
| — | — | — | — | — |

## Éclairage

Studio procédural (`@react-three/drei` `<Lightformer>`) — aucun fichier HDRI.

## Polices

- **Cormorant Garamond** — Christian Thalmann (Catharsis Fonts), SIL Open Font License 1.1, via `@fontsource/cormorant-garamond`.
- **Inter** — Rasmus Andersson, SIL Open Font License 1.1, via `@fontsource-variable/inter`.

## Bibliothèques

| Paquet | Licence |
| --- | --- |
| three.js | MIT |
| @react-three/fiber, @react-three/drei, @react-three/postprocessing | MIT |
| postprocessing | Zlib |
| camera-controls | MIT |
| React, React DOM | MIT |
| Zustand | MIT |
| GSAP | Standard « no charge » license (GreenSock / Webflow) |
| Tailwind CSS | MIT |
| Leva (dev uniquement) | MIT |
| glTF-Transform | MIT |
| meshoptimizer | MIT |
| sharp | Apache-2.0 |
| Playwright, Lighthouse (outillage) | Apache-2.0 |
| Vite, TypeScript | MIT / Apache-2.0 |
