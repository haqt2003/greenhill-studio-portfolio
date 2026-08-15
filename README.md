# GreenHill Studio Portfolio

A responsive, static portfolio website for GreenHill Studio, built with Astro and TypeScript.

## Local development

Requires Node.js 22.19 or newer.

```sh
npm install
npm run dev
```

The local URL will be printed in the terminal.

## Production check

```sh
npm run build
npm run preview
```

## Deployment

The site is configured for Netlify with `netlify.toml`. Netlify builds the Astro site into `dist/`, serves the security headers from `public/_headers`, and maps `/api/contact` to the Netlify Function in `netlify/functions/contact.mjs`.

## Contact email delivery

The form posts to the server-only `/api/contact` function, which sends a plain-text email through Resend. Configure these secrets in the hosting environment (and in `.env.local` only when testing the function locally):

```sh
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=you@example.com
CONTACT_FROM_EMAIL=GreenHill Studio <hello@your-verified-domain.com>
CONTACT_SITE_ORIGIN=https://your-final-domain.com
```

`CONTACT_TO_EMAIL` is the private inbox receiving enquiries. `CONTACT_FROM_EMAIL` must use a sender domain verified in Resend; visitor replies are routed to the address they entered in the form. Never put any of these values in a `PUBLIC_*` variable or commit a real `.env` file.

## Security

- Security headers are defined for Vercel in `vercel.json` and for compatible static hosts in `public/_headers`.
- The Content Security Policy allows scripts, styles, fonts and images only from this site.
- The contact endpoint checks the exact site origin, validates and limits every field, sends text-only email, uses a honeypot, and applies a small server-side rate limit.
- The endpoint returns generic errors and does not log form bodies, inbox addresses or API keys.
- Real `.env*` files are ignored by Git; only `.env.example` is committed.
- Run `npm audit --omit=dev` before each release.

## Content updates

- Featured projects: `src/data/projects.ts`
- Homepage sections and service copy: `src/pages/index.astro`
- English/Vietnamese project archive: `src/pages/projects.astro`
- Shared metadata and structured data: `src/layouts/BaseLayout.astro`
- Design tokens and responsive styling: `src/styles/global.css`

Before publishing, add the final production domain to `astro.config.mjs`, then add a canonical URL and sitemap integration.
