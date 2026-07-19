# physure-landing

Landing page for [physure](https://github.com/Alexisrx96/physure), built with Astro. One page, no client-side JS.

```bash
pnpm install
pnpm dev      # local dev server
pnpm build    # static output in dist/
```

Production URL: **https://physure.irvintorres.com** — set in `site` in `astro.config.mjs` and in the absolute URLs in `public/robots.txt` and `public/sitemap.xml`. If it ever changes, update all three.

Every claim on the page comes from the physure repo (README, pyproject.toml, docs/UNITS.md, CI config). If the library changes, update the page — honesty is the whole point.
