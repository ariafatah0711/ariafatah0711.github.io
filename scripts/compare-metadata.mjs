import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parse } from "parse5";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  await readFile(path.join(root, "docs/migration/jekyll-routes.json"), "utf8")
);

function routeFile(directory, route) {
  if (route === "/") return path.join(directory, "index.html");
  const relative = route.slice(1);
  if (route.endsWith("/")) return path.join(directory, relative, "index.html");
  if (path.extname(relative)) return path.join(directory, relative);
  return path.join(directory, `${relative}.html`);
}

function findElements(node, name, result = []) {
  if (node.nodeName === name) result.push(node);
  for (const child of node.childNodes || []) findElements(child, name, result);
  return result;
}

function text(node) {
  return (node.childNodes || []).map((child) => child.value || text(child)).join("");
}

function metadata(html) {
  const document = parse(html);
  const title = findElements(document, "title").map(text)[0] || "";
  const metas = findElements(document, "meta").map((node) =>
    Object.fromEntries((node.attrs || []).map((attr) => [attr.name, attr.value]))
  );
  const pick = (key, value) => metas.find((meta) => meta[key] === value)?.content || "";
  return {
    title,
    description: pick("name", "description"),
    ogTitle: pick("property", "og:title"),
    ogDescription: pick("property", "og:description"),
    ogUrl: pick("property", "og:url")
  };
}

const differences = [];
for (const route of manifest.routes.filter((item) => item.endsWith("/") || !path.extname(item))) {
  try {
    const legacy = metadata(await readFile(routeFile(path.join(root, "_site"), route), "utf8"));
    const migrated = metadata(await readFile(routeFile(path.join(root, "dist"), route), "utf8"));
    for (const key of Object.keys(legacy)) {
      if (legacy[key] !== migrated[key]) differences.push(`${route} ${key}`);
    }
  } catch {
    // Route presence is reported by compare-builds and audit-routes.
  }
}

if (differences.length) {
  console.error(`Metadata differences:\n${differences.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("No comparable metadata differences found.");
}
