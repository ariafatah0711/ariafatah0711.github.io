import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "dist");
const manifest = JSON.parse(
  await readFile(path.join(root, "docs/migration/jekyll-routes.json"), "utf8")
);

function routeToCandidates(route) {
  if (route === "/") return [path.join(output, "index.html")];

  const relative = route.slice(1);
  if (route.endsWith("/")) {
    return [path.join(output, relative, "index.html")];
  }

  if (path.extname(relative)) {
    return [path.join(output, relative)];
  }

  return [path.join(output, `${relative}.html`)];
}

const missing = [];
for (const route of manifest.routes) {
  const candidates = routeToCandidates(route);
  try {
    await access(candidates[0]);
  } catch {
    missing.push(`${route} -> ${path.relative(root, candidates[0])}`);
  }
}

try {
  const assets = await readdir(path.join(output, manifest.assetRoutePrefix.slice(1)));
  if (assets.length === 0) missing.push(`${manifest.assetRoutePrefix} -> empty`);
} catch {
  missing.push(`${manifest.assetRoutePrefix} -> missing`);
}

const forbidden = [
  "Dockerfile",
  "docker-compose.yml",
  "start.sh",
  "Gemfile",
  "Gemfile.lock",
  "_config.yml",
  "package.json",
  "package-lock.json",
  "eleventy.config.js"
];
const leaked = [];
for (const file of forbidden) {
  try {
    await access(path.join(output, file));
    leaked.push(file);
  } catch {
    // Expected: build internals must not be public.
  }
}

if (missing.length || leaked.length) {
  if (missing.length) console.error(`Missing routes:\n${missing.join("\n")}`);
  if (leaked.length) console.error(`Leaked build files:\n${leaked.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${manifest.routes.length} routes and ${manifest.assetRoutePrefix}.`);
}
