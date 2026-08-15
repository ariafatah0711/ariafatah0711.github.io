# Eleventy visual baseline

This fixture was captured from Eleventy commit `93763de` before the Tailwind foundation was added.
Playwright serves these HTML, CSS, and JavaScript files first, then falls back to the current `dist/`
for immutable fonts and images covered by the non-CSS asset integrity manifest. Rendering both origins
in the same browser keeps the pixel comparison independent of operating-system font rasterization.

Update this fixture only for an intentional, reviewed visual change.
