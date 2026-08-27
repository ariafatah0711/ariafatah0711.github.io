import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { parse } from "parse5";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "dist");
const failures = [];
const stylesheets = new Set();
const checkedImports = new Set();
const tailwindInput = path.join(root, "src/assets/css/site.css");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

function attributes(node) {
  return Object.fromEntries((node.attrs || []).map((attribute) => [attribute.name, attribute.value]));
}

function visit(node, callback) {
  callback(node);
  for (const child of node.childNodes || []) visit(child, callback);
}

function localPath(url, baseUrl) {
  const resolved = new URL(url, baseUrl);
  if (resolved.origin !== "https://eleventy.local") return;
  return decodeURIComponent(resolved.pathname).replace(/^\/+/, "");
}

async function verifyCss(relativePath) {
  if (checkedImports.has(relativePath)) return;
  checkedImports.add(relativePath);

  const absolutePath = path.resolve(output, relativePath);
  if (absolutePath !== output && !absolutePath.startsWith(`${output}${path.sep}`)) {
    failures.push(`${relativePath}: outside dist`);
    return;
  }

  try {
    const info = await stat(absolutePath);
    if (!info.isFile() || info.size === 0) {
      failures.push(`${relativePath}: missing or empty`);
      return;
    }

    const css = await readFile(absolutePath, "utf8");
    const cssUrl = new URL(`/${relativePath.replaceAll("\\", "/")}`, "https://eleventy.local");
    const imports = css.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?/g);
    for (const match of imports) {
      const importedPath = localPath(match[1], cssUrl);
      if (importedPath) await verifyCss(importedPath);
    }
  } catch (error) {
    failures.push(`${relativePath}: ${error.code || error.message}`);
  }
}

for (const htmlPath of (await walk(output)).filter((file) => file.endsWith(".html"))) {
  const relativeHtml = path.relative(output, htmlPath).replaceAll("\\", "/");
  const document = parse(await readFile(htmlPath, "utf8"));
  let baseUrl = new URL(`/${relativeHtml}`, "https://eleventy.local");

  visit(document, (node) => {
    if (node.tagName !== "base") return;
    const href = attributes(node).href;
    if (href) baseUrl = new URL(href, baseUrl);
  });

  visit(document, (node) => {
    if (node.tagName !== "link") return;
    const attrs = attributes(node);
    if (!(attrs.rel || "").split(/\s+/).includes("stylesheet") || !attrs.href) return;
    const stylesheet = localPath(attrs.href, baseUrl);
    if (stylesheet) stylesheets.add(stylesheet);
  });
}

for (const stylesheet of stylesheets) await verifyCss(stylesheet);

try {
  const input = await readFile(tailwindInput, "utf8");
  if (/^\s*@import\s+["']tailwindcss["']/m.test(input) || input.includes("preflight.css")) {
    failures.push("src/assets/css/site.css: Tailwind Preflight import is not allowed");
  }

  const generated = await readFile(path.join(output, "assets/css/site.css"), "utf8");
  if (/box-sizing:border-box;border:0 solid/.test(generated)) {
    failures.push("assets/css/site.css: generated CSS contains the Tailwind Preflight reset");
  }
} catch (error) {
  failures.push(`Tailwind foundation: ${error.code || error.message}`);
}

if (failures.length) {
  console.error(`CSS integrity failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${stylesheets.size} linked stylesheets and ${checkedImports.size} local CSS files.`);
}
