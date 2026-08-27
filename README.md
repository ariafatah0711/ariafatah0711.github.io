# ariaf.my.id

Personal portfolio and blog built as a static site with Eleventy. The migration from Jekyll preserves the existing Ephesus-based design, URLs, content, CSS, and browser JavaScript.

## Requirements

- Node.js 24 LTS
- npm with lockfile support

Ruby, Bundler, Jekyll, and a global Eleventy installation are not required.

## Development

```bash
npm ci
npm run dev
```

The development server is provided by Eleventy. In a second terminal, run the Tailwind watcher when
adding or changing prefixed utilities:

```bash
npm run dev:css
```

`npm run dev` creates the initial CSS output before starting Eleventy. Production output is never
read from the repository root; it is generated in `dist/`.

## Production Build

```bash
npm run build
```

The production build cleans `dist/`, builds Eleventy, then compiles
`src/assets/css/site.css` to `dist/assets/css/site.css`. Tailwind uses the `tw:` prefix and does not
load Preflight; legacy styles remain authoritative during the incremental migration.

Useful validation commands:

```bash
npm run check
npm run check:visual
npm run check:behavior
```

Visual tests compare the current build with the committed Eleventy fixture in
`tests/fixtures/eleventy-baseline`. Both sites are rendered in the same browser to avoid
cross-platform font-rasterization noise. The historical `compare:*` scripts remain available
only for migration archaeology and are not active validation gates.

## Deployment

`.github/workflows/pages.yml` builds with Node.js 24 and uploads only `dist/` to GitHub Pages. Deployment runs only after a push to `main`; pull requests and manual workflow runs build and validate without deploying.

Before the first production run, set the repository's Pages source to **GitHub Actions**. The custom domain remains `ariaf.my.id` through `public/CNAME`.

## Structure

```text
src/       Eleventy data, templates, content, pages, feeds, and Tailwind CSS input
public/    Byte-preserved static assets and root public files
scripts/   Build, route, link, asset, metadata, and integrity checks
tests/     Playwright Eleventy visual-baseline and behavioral checks
dist/      Generated production site (ignored by Git)
```

Migration evidence and intentionally deferred technical debt are documented in [`docs/migration`](docs/migration/parity-notes.md).

## Theme Credit

The visual foundation is the Ephesus Jekyll Theme by [Hakan Torun](https://hakan.io). This migration changes the static-site engine only; it does not redesign the theme.

## License

This project is available under the [MIT License](LICENSE).
