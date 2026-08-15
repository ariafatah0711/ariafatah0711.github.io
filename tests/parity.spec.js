import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { startStaticServer } from "../scripts/serve-static.mjs";

const baselineOrigin = "http://127.0.0.1:8081";
const currentOrigin = "http://127.0.0.1:8080";
const artifactDirectory = path.resolve(".artifacts/visual");
const baselineDirectory = path.resolve("tests/fixtures/eleventy-baseline");
const profileFixture = JSON.parse(await readFile("src/content/drafts/profile.json", "utf8"));
let baselineServer;
let currentServer;

test.beforeAll(async () => {
  currentServer = await startStaticServer("dist", 8080);
  baselineServer = await startStaticServer(baselineDirectory, 8081, ["dist"]);
});

test.afterAll(async () => {
  for (const server of [currentServer, baselineServer]) {
    server?.closeAllConnections?.();
    await new Promise((resolve) => server?.close(resolve));
  }
});

async function installStableEnvironment(context, theme) {
  await context.addInitScript((selectedTheme) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("theme", selectedTheme);
    Math.random = () => 0.5;
  }, theme);

  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") {
      await route.continue();
    } else if (url.pathname.endsWith("/data/profile.json")) {
      await route.fulfill({ json: profileFixture });
    } else if (url.hostname === "api.lanyard.rest") {
      await route.fulfill({
        json: {
          success: true,
          data: {
            discord_status: "online",
            listening_to_spotify: false,
            activities: []
          }
        }
      });
    } else if (url.hostname === "api.github.com") {
      await route.fulfill({ json: { stargazers_count: 7, forks_count: 2 } });
    } else {
      await route.abort();
    }
  });
}

async function settlePage(page, url) {
  await page.goto(url, { waitUntil: "load" });
  await page.locator("#page-loader").waitFor({ state: "detached", timeout: 5_000 }).catch(() => {});
  await page.addStyleTag({
    content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}canvas{visibility:hidden!important}"
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
}

async function capture(browser, origin, route, viewport, theme) {
  const context = await browser.newContext({ viewport });
  await installStableEnvironment(context, theme);
  const page = await context.newPage();
  await settlePage(page, `${origin}${route}`);
  const image = await page.screenshot({ animations: "disabled" });
  await context.close();
  return image;
}

for (const scenario of [
  { name: "home", route: "/" },
  { name: "about", route: "/about/" },
  { name: "gallery", route: "/gallery/" },
  { name: "projects", route: "/projects/" },
  { name: "tags", route: "/tags/" },
  { name: "404", route: "/404.html" },
  { name: "raw-html-post", route: "/blog/itclub" },
  { name: "post", route: "/blog/praktikum_uiux" }
]) {
  for (const mode of [
    { name: "desktop-light", viewport: { width: 1440, height: 900 }, theme: "light" },
    { name: "desktop-dark", viewport: { width: 1440, height: 900 }, theme: "dark" },
    { name: "mobile-light", viewport: { width: 390, height: 844 }, theme: "light" },
    { name: "mobile-dark", viewport: { width: 390, height: 844 }, theme: "dark" }
  ]) {
    test(`@visual ${scenario.name} ${mode.name}`, async ({ browser }) => {
      await mkdir(artifactDirectory, { recursive: true });
      const baseline = await capture(browser, baselineOrigin, scenario.route, mode.viewport, mode.theme);
      const current = await capture(browser, currentOrigin, scenario.route, mode.viewport, mode.theme);
      const baselinePng = PNG.sync.read(baseline);
      const currentPng = PNG.sync.read(current);
      expect(currentPng.width).toBe(baselinePng.width);
      expect(currentPng.height).toBe(baselinePng.height);

      const diff = new PNG({ width: baselinePng.width, height: baselinePng.height });
      const mismatched = pixelmatch(
        baselinePng.data,
        currentPng.data,
        diff.data,
        baselinePng.width,
        baselinePng.height,
        { threshold: 0.1 }
      );
      const basename = `${scenario.name}-${mode.name}`;
      await writeFile(path.join(artifactDirectory, `${basename}-baseline.png`), baseline);
      await writeFile(path.join(artifactDirectory, `${basename}-current.png`), current);
      if (mismatched) await writeFile(path.join(artifactDirectory, `${basename}-diff.png`), PNG.sync.write(diff));

      const ratio = mismatched / (baselinePng.width * baselinePng.height);
      expect(ratio, `${basename} pixel difference`).toBeLessThanOrEqual(0.005);
    });
  }
}

test("@behavior theme, PJAX, integrations, modals, and reset bindings", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await installStableEnvironment(context, "light");
  const page = await context.newPage();
  const lanyardRequests = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname === "api.lanyard.rest") lanyardRequests.push(url.pathname);
  });

  await settlePage(page, `${currentOrigin}/`);
  await expect(page.locator("#swup")).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => Boolean(window.__swup))).toBe(true);
  await expect(page.locator("#status").first()).toHaveAttribute("data-discord-id", "879547455941779456");
  await expect(page.locator("#status").first()).toContainText("Online");
  await expect.poll(() => lanyardRequests).toEqual(["/v1/users/879547455941779456"]);
  await expect(page.locator("#meeting-js-player")).toHaveCount(1);

  const localPostLink = page.locator('a.post-title[href="/blog/praktikum_uiux"]');
  await expect(localPostLink).toHaveCount(1);
  await expect(page.locator('a.post-title[href="https://docs.ariaf.my.id"]')).toHaveCount(1);
  await localPostLink.click();
  await expect(page).toHaveURL(`${currentOrigin}/blog/praktikum_uiux`);
  await page.goBack();
  await expect(page).toHaveURL(`${currentOrigin}/`);

  const themeToggle = page.locator('.theme-toggle:visible').first();
  await themeToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.locator('a[href="/about"]:visible').first().click();
  await expect(page).toHaveURL(`${currentOrigin}/about`);
  await expect(page.locator('[data-gp-stat="followers"]')).toHaveText("108");
  await page.goBack();
  await expect(page).toHaveURL(`${currentOrigin}/`);

  await settlePage(page, `${currentOrigin}/gallery/`);
  const category = page.locator('.filter-btn[data-category="certificate"]');
  await category.click();
  await expect(category).toHaveClass(/active/);
  await page.locator(".gallery-item .clickable-image").first().dispatchEvent("click");
  await expect(page.locator("#imageModal")).toHaveCSS("display", "flex");

  await settlePage(page, `${currentOrigin}/projects/`);
  await page.locator(".project-thumb-img").first().dispatchEvent("click");
  await expect(page.locator("#projectModal")).toHaveCSS("display", "flex");

  await settlePage(page, `${currentOrigin}/blog/praktikum_uiux`);
  await expect(page.locator("#disqus_thread")).toHaveAttribute("data-disqus-shortname", "ariafatah0711");

  await settlePage(page, `${currentOrigin}/info/`);
  await expect(page.locator('[data-action="reset-local-data"]')).toHaveAttribute("data-bound", "true");
  await expect(page.locator('[data-action="reset-cache"]')).toHaveAttribute("data-bound", "true");

  await settlePage(page, `${currentOrigin}/blog/cisco_aria`);
  await expect(page).toHaveURL(`${currentOrigin}/blog/cisco_aria`);
  await expect(page.locator("[data-redirect-handler]")).toHaveAttribute("data-redirect-url", "./cisco_aria");
  await context.close();
});

test("@behavior linked local stylesheets return HTTP 200", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await installStableEnvironment(context, "light");
  const page = await context.newPage();
  const checked = new Set();
  const failures = [];

  page.on("response", (response) => {
    const request = response.request();
    const url = new URL(response.url());
    if (request.resourceType() !== "stylesheet" || url.origin !== currentOrigin) return;
    checked.add(url.pathname);
    if (response.status() !== 200) failures.push(`${url.pathname}: ${response.status()}`);
  });
  page.on("requestfailed", (request) => {
    const url = new URL(request.url());
    if (request.resourceType() === "stylesheet" && url.origin === currentOrigin) {
      failures.push(`${url.pathname}: ${request.failure()?.errorText || "request failed"}`);
    }
  });

  for (const route of ["/", "/projects/", "/blog/praktikum_uiux", "/tags/", "/404.html", "/gallery/"]) {
    await settlePage(page, `${currentOrigin}${route}`);
  }

  expect(failures).toEqual([]);
  expect(checked.size).toBeGreaterThan(0);
  await context.close();
});
