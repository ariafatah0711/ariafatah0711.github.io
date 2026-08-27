# ariaf.my.id

[![Build and deploy Eleventy to GitHub Pages](https://github.com/ariafatah0711/ariafatah0711.github.io/actions/workflows/pages.yml/badge.svg)](https://github.com/ariafatah0711/ariafatah0711.github.io/actions/workflows/pages.yml)

Personal portfolio, project archive, and technical blog maintained by
[ariafatah0711](https://github.com/ariafatah0711).

[Live website](https://ariaf.my.id) | [Source code](https://github.com/ariafatah0711/ariafatah0711.github.io) | [GitHub profile](https://github.com/ariafatah0711)

## Project History

This repository started as a heavily customized implementation of the
[Ephesus Jekyll Theme](https://github.com/onepase/Ephesus) by
[Hakan Torun](https://hakan.io). Over time, its templates, content, integrations, and frontend
behavior evolved beyond the original theme.

The active codebase is now a full runtime and build-pipeline refactor from Jekyll/Ruby to
Eleventy/Node.js. The migration was completed by ariafatah0711 while preserving the established
URLs, content, visual identity, feeds, and browser behavior.

- **Legacy runtime:** Jekyll, Ruby, and Bundler.
- **Current runtime:** Eleventy 3, Node.js 24, Liquid, and Markdown.
- **Styling:** existing component CSS plus a parity-first Tailwind CSS v4 foundation.
- **Quality gates:** route, link, asset, CSS, endpoint, and Playwright browser checks.
- **Delivery:** GitHub Actions builds and deploys the generated `dist/` directory to GitHub Pages.

The final Jekyll state remains available through the `jekyll-final-2026-08-15` tag for historical
comparison and rollback. Ruby is no longer part of the active development or deployment path.

## Local Development

Requirements:

- Node.js 24
- npm with lockfile support

Install dependencies and start Eleventy:

```bash
npm ci
npm run dev
```

Run the Tailwind watcher in a second terminal when editing prefixed utilities:

```bash
npm run dev:css
```

Tailwind utilities use the `tw:` prefix. Preflight is intentionally disabled so incremental
component migrations do not reset the existing site.

## Build And Validation

```bash
npm run build
npm run check
npm run test
```

Focused browser suites are also available:

```bash
npm run check:visual
npm run check:behavior
```

Production output is generated in `dist/` and is ignored by Git. Visual regression tests compare
the current build with the committed Eleventy fixture in `tests/fixtures/eleventy-baseline`.

## Deployment

The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) installs dependencies
with Node.js 24, runs integrity and browser tests, builds the site, and uploads only `dist/`.
Deployment occurs only from `main`. The custom domain is configured through `public/CNAME`.

## Repository Layout

```text
src/       Eleventy data, layouts, content, pages, feeds, and Tailwind input
public/    Static assets and root public files copied into the production build
scripts/   Build, route, link, asset, metadata, and integrity checks
tests/     Playwright visual-baseline and behavioral tests
docs/      Migration evidence, parity notes, and technical decisions
dist/      Generated production output (ignored by Git)
```

Migration details are documented in
[`docs/migration/parity-notes.md`](docs/migration/parity-notes.md).

## Credits And License

The current Eleventy implementation and ongoing custom development are maintained by
[ariafatah0711](https://github.com/ariafatah0711). The original visual foundation is Ephesus by
[Hakan Torun](https://hakan.io), retained with its original attribution and MIT license.

See [LICENSE](LICENSE) for the complete license text.
