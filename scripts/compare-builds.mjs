import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

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

const missing = [];
for (const route of manifest.routes) {
  for (const directory of ["_site", "dist"]) {
    const file = routeFile(path.join(root, directory), route);
    try {
      await access(file);
    } catch {
      missing.push(`${directory}: ${route}`);
    }
  }
}

if (missing.length) {
  console.error(`Route comparison failed:\n${missing.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Both builds contain ${manifest.routes.length} baseline routes.`);
}
