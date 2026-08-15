import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parse } from "parse5";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "dist");
const origin = "https://ariaf.my.id";
const delegatedRoutes = new Set([
  "/cisco_aria",
  "/linux_aria",
  "/container_aria",
  "/ctf_aria"
]);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function collectAttributes(node, result = []) {
  if (node.attrs) {
    for (const attribute of node.attrs) {
      if (attribute.name === "href" || attribute.name === "src") {
        result.push(attribute.value);
      } else if (attribute.name === "srcset") {
        for (const candidate of attribute.value.split(",")) {
          result.push(candidate.trim().split(/\s+/)[0]);
        }
      }
    }
  }
  for (const child of node.childNodes || []) collectAttributes(child, result);
  return result;
}

function routeForFile(file) {
  const relative = path.relative(output, file).replaceAll(path.sep, "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -10)}`;
  return `/${relative}`;
}

async function exists(candidate) {
  try {
    return (await stat(candidate)).isFile();
  } catch {
    return false;
  }
}

async function resolvesLocally(pathname) {
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, "");
  if (!decoded) return exists(path.join(output, "index.html"));

  const direct = path.join(output, decoded);
  return await exists(direct)
    || await exists(`${direct}.html`)
    || await exists(path.join(direct, "index.html"));
}

const failures = [];
const htmlFiles = (await walk(output)).filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const document = parse(await readFile(file, "utf8"));
  const sourceRoute = routeForFile(file);
  for (const value of collectAttributes(document)) {
    if (!value || /^(#|mailto:|tel:|javascript:|data:)/i.test(value)) continue;

    let target;
    try {
      target = new URL(value, new URL(sourceRoute, origin));
    } catch {
      failures.push(`${sourceRoute}: invalid URL ${value}`);
      continue;
    }

    if (target.origin !== origin || delegatedRoutes.has(target.pathname)) continue;
    if (!await resolvesLocally(target.pathname)) {
      failures.push(`${sourceRoute}: ${value} -> ${target.pathname}`);
    }
  }
}

if (failures.length) {
  console.error(`Broken local references:\n${[...new Set(failures)].join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Checked local references in ${htmlFiles.length} HTML files.`);
}
