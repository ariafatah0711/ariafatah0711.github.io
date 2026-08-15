# Eleventy Parity Notes

## Baseline

- Jekyll checkpoint: `jekyll-final-2026-08-15` at `549f91f`.
- Route contract: `docs/migration/jekyll-routes.json`.
- Asset hashes: `docs/migration/jekyll-assets.sha256`.
- Legacy root sources and the Ruby/Jekyll runtime were removed only after all parity gates passed; the tag retains them for rollback.
- The ignored `_site/` snapshot is used only for local DOM, metadata, and visual comparison. Its development host is normalized during metadata comparison.

## Compatibility Decisions

- Post frontmatter remains unchanged. A build preprocessor writes `/blog/<slug>.html`, while an Eleventy URL transform exposes `/blog/<slug>` to templates.
- Markdown-it adds Kramdown-compatible heading IDs and wraps standalone raw `<a>` blocks like Kramdown. This preserves the browser-rendered DOM without editing post content.
- Post order, previous/next navigation, Atom IDs, JSON Feed SHA-1 IDs, timezone rendering, pagination, tag ordering, and the CV sitemap entry are explicit compatibility behavior.
- `/notes`, `/files`, `/cv/`, `/dicoding_*`, `/itclub/*`, and related root project paths remain delegated deployments on the same custom domain and are excluded from local-file link failures.

## Validation Result

- Node.js 24.19.0: clean Eleventy build and all route/link/asset/endpoint checks passed.
- 43 explicit routes plus `/assets/**` passed.
- 70 public files match the baseline and `dist/` output.
- 43 legacy and migrated routes have matching parsed DOM contracts and stylesheet/script order.
- Comparable title, description, Open Graph metadata, and URL paths match.
- 28 Playwright comparisons passed at 1440x900 and 390x844, light and dark, with zero generated diff images.
- Behavioral smoke tests passed for theme state, Swup/PJAX and back navigation, GitHub profile, Discord Lanyard, music markup, gallery/project modals, Disqus, cache-reset bindings, and link-post redirect data.

## Intentionally Deferred

- Malformed HTML in the GitHub profile layout and repository preview.
- Duplicate `linktreeBox` IDs required by the two persistent shells.
- Remote data inserted through `innerHTML` in the GitHub and Discord scripts.
- Service worker delivery combined with unconditional unregister behavior.
- Existing SEO metadata and absence of canonical links.
- Unpinned runtime CDN dependencies and same-domain delegated project routes.
- The separate `data-cache` branch update workflow and its force-push behavior.

These items must be handled in separate changes after migration parity is approved.

## Owner Cutover

1. Review the local commits on `migration/eleventy` and open a pull request without squashing the Jekyll checkpoint history if rollback granularity is desired.
2. Set GitHub Pages source to **GitHub Actions**.
3. Confirm the `github-pages` environment and branch protection allow deployment from `main`.
4. Confirm all delegated custom-domain routes still resolve before merging.
5. Merge or push only after approval; monitor route, feed, and browser checks after the first deployment.
