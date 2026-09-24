# Shreeji Corporate Gift

A React + TypeScript + Vite catalog for corporate gifts, promotional products, custom branding, and bulk quote enquiries.

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm

## Development

```bash
npm ci
npm run dev
```

The local Vite server prints the URL to use (normally `http://localhost:5173`).

## Validation

```bash
npm run lint
npm run build
npm run preview
```

`npm run build` runs the TypeScript project build before creating the production bundle.

## Editing catalog data

- Company contact details: `src/data/company.ts`
- Product catalog, prices, slabs, and printing options: `src/data/products.ts`
- Categories: `src/data/categories.ts`
- Hamper offerings: `src/data/hampers.ts`
- Branding services: `src/data/services.ts`

The catalogue is static and has no checkout or backend. Product and hamper enquiries are sent to WhatsApp using the configured company phone number. Replace the demo pricing notes and placeholder hamper data before publishing.

## Routes

- `/` — landing page
- `/products` — searchable and filterable catalog
- `/products/:slug` — product details and indicative pricing
- `/categories` and `/categories/:slug` — category browsing
- `/hampers` — corporate hampers
- `/custom-branding` — branding services
- `/quote` — quote request form
- `/contact` — contact and business enquiry

The quote cart and favourites are stored in browser `localStorage` under versioned keys.

## Deployment note

The app uses React Router's history API. Configure the static host to rewrite application routes such as `/products/steel-bottle-750ml` to `index.html`; Vite preview and common SPA hosts already provide this fallback.
