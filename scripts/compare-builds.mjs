import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parse } from "parse5";

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  await readFile(path.join(root, "docs/migration/jekyll-routes.json"), "utf8")
);

function routeFile(directory, route) {
  if (route === "/") return path.join(directory, "index.html");
  if (route === "/CNAME") return path.join(directory, "CNAME");
  const relative = route.slice(1);
  if (route.endsWith("/")) return path.join(directory, relative, "index.html");
  if (path.extname(relative)) return path.join(directory, relative);
  return path.join(directory, `${relative}.html`);
}

function attribute(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value || "";
}

function findElement(node, name) {
  if (node.nodeName === name) return node;
  for (const child of node.childNodes || []) {
    const match = findElement(child, name);
    if (match) return match;
  }
}

function domContract(html) {
  const body = findElement(parse(html), "body");
  const result = [];
  function visit(node, depth) {
    if (node.tagName) {
      const markers = [
        attribute(node, "id") && `#${attribute(node, "id")}`,
        attribute(node, "class") && `.${attribute(node, "class").trim().replace(/\s+/g, ".")}`,
        attribute(node, "data-shell") && `[data-shell=${attribute(node, "data-shell")}]`,
        attribute(node, "data-layout") && `[data-layout=${attribute(node, "data-layout")}]`,
        attribute(node, "data-action") && `[data-action=${attribute(node, "data-action")}]`,
        attribute(node, "data-redirect-handler") !== "" && "[data-redirect-handler]"
      ].filter(Boolean).join("");
      result.push(`${depth}:${node.tagName}${markers}`);
    }
    for (const child of node.childNodes || []) visit(child, node.tagName ? depth + 1 : depth);
  }
  visit(body, 0);
  return result;
}

function resourceOrder(html) {
  const document = parse(html);
  const resources = [];
  function visit(node) {
    if (node.tagName === "link" && attribute(node, "rel").split(/\s+/).includes("stylesheet")) {
      resources.push(`style:${attribute(node, "href")}`);
    }
    if (node.tagName === "script" && attribute(node, "src")) {
      resources.push(`script:${attribute(node, "src")}`);
    }
    for (const child of node.childNodes || []) visit(child);
  }
  visit(document);
  return resources;
}

const missing = [];
const differences = [];
for (const route of manifest.routes) {
  const files = {};
  for (const directory of ["_site", "dist"]) {
    const file = routeFile(path.join(root, directory), route);
    try {
      await access(file);
      files[directory] = file;
    } catch {
      missing.push(`${directory}: ${route}`);
    }
  }

  if (files._site?.endsWith(".html") && files.dist?.endsWith(".html")) {
    const legacy = await readFile(files._site, "utf8");
    const migrated = await readFile(files.dist, "utf8");
    const legacyDom = domContract(legacy);
    const migratedDom = domContract(migrated);
    if (JSON.stringify(legacyDom) !== JSON.stringify(migratedDom)) {
      const index = legacyDom.findIndex((item, itemIndex) => item !== migratedDom[itemIndex]);
      differences.push(`${route}: DOM at ${index}: ${legacyDom[index]} != ${migratedDom[index]}`);
    }
    if (JSON.stringify(resourceOrder(legacy)) !== JSON.stringify(resourceOrder(migrated))) {
      differences.push(`${route}: stylesheet/script order`);
    }
  }
}

if (missing.length || differences.length) {
  if (missing.length) console.error(`Route comparison failed:\n${missing.join("\n")}`);
  if (differences.length) console.error(`Rendered contract differences:\n${differences.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Both builds contain ${manifest.routes.length} routes with matching DOM and resource order.`);
}
