import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { XMLParser } from "fast-xml-parser";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "dist");
const origin = "https://ariaf.my.id";
const parser = new XMLParser({ ignoreAttributes: false });
const failures = [];
const expectedPostUrls = [
  `${origin}/blog/nxctf`,
  `${origin}/blog/ctf-writeups`
];
const expectedSitemapUrls = [
  ...expectedPostUrls,
  `${origin}/achievements/`
];

const feed = JSON.parse(await readFile(path.join(output, "feed.json"), "utf8"));
if (feed.items?.length !== 26) failures.push(`JSON Feed items: ${feed.items?.length}`);
if (feed.home_page_url !== `${origin}/`) failures.push("JSON Feed home_page_url");
for (const url of expectedPostUrls) {
  if (!feed.items?.some((item) => item.url === url)) failures.push(`JSON Feed missing: ${url}`);
}

const atomSource = await readFile(path.join(output, "atom.xml"), "utf8");
const atom = parser.parse(atomSource);
const entries = Array.isArray(atom.feed?.entry) ? atom.feed.entry : [atom.feed?.entry].filter(Boolean);
if (entries.length !== 26) failures.push(`Atom entries: ${entries.length}`);
for (const url of expectedPostUrls) {
  if (!atomSource.includes(`<id>${url}</id>`)) failures.push(`Atom missing: ${url}`);
}

const sitemap = parser.parse(await readFile(path.join(output, "sitemap.xml"), "utf8"));
const sitemapUrls = (sitemap.urlset?.url || []).map((item) => item.loc);
if (sitemapUrls.length !== 39) failures.push(`Sitemap URLs: ${sitemapUrls.length}`);
if (!sitemapUrls.includes(`${origin}/assets/data/cv.pdf`)) failures.push("Sitemap CV PDF");
for (const url of expectedSitemapUrls) {
  if (!sitemapUrls.includes(url)) failures.push(`Sitemap missing: ${url}`);
}
if (sitemapUrls.some((url) => url.endsWith(".html") && !url.endsWith("404.html"))) {
  failures.push("Sitemap contains unexpected .html URL");
}

const robots = (await readFile(path.join(output, "robots.txt"), "utf8")).trim();
if (robots !== `User-agent: *\nSitemap: ${origin}/sitemap.xml`.replaceAll("\n", process.platform === "win32" ? "\r\n" : "\n")
  && robots.replaceAll("\r\n", "\n") !== `User-agent: *\nSitemap: ${origin}/sitemap.xml`) {
  failures.push("robots.txt content");
}

const cname = (await readFile(path.join(output, "CNAME"), "utf8")).trim();
if (cname !== "ariaf.my.id") failures.push("CNAME content");
JSON.parse(await readFile(path.join(output, "manifest.json"), "utf8"));

const serviceWorker = await readFile(path.join(output, "service-worker.js"), "utf8");
if (!serviceWorker.includes("/assets/js/workbox-sw.js")) failures.push("service worker body");
const homepage = await readFile(path.join(output, "index.html"), "utf8");
if (!homepage.includes("registration.unregister()")) failures.push("service worker unregister behavior");

if (failures.length) {
  console.error(`Endpoint validation failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Validated Atom, JSON Feed, sitemap, robots, manifest, CNAME, and service worker behavior.");
}
