# Stock Chine by Cherifa

Boutique de mode en ligne (PWA Angular) : hoodies et pulls oversize, cargos, jeans, t-shirts neutres, robes, vestes, ensembles, sneakers et accessoires importés de Chine.

WhatsApp : +86 183 3926 7415 · Paiement Orange Money uniquement : +226 57 49 77 71 · Livraison avion (3-4 semaines) ou bateau (3-4 mois), transport payé à l'arrivée.

Langues : français, anglais, chinois (`src/app/i18n/`).

## Développement

```bash
npm install
npm start          # http://localhost:4200
```

## Mise en ligne (GitHub Pages)

```bash
npm run deploy
```

Compile l'application (base-href `/by-cherifa/`) et publie `dist/stock-chine/browser` sur la branche `gh-pages` (voir `scripts/deploy-gh-pages.mjs`).
Site : https://stock-chine.github.io/by-cherifa/

## Modifier le catalogue

- Articles : `src/app/data/products.data.ts`
- Catégories : `src/app/data/categories.data.ts`
- Numéros / WhatsApp : `src/app/services/shop-info.ts`
- Icônes (Font Awesome) : `src/app/icons.ts`
