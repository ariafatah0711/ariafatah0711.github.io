import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve(import.meta.dirname, "..");
const manifest = await readFile(path.join(root, "docs/migration/jekyll-assets.sha256"), "utf8");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function matchesBaseline(value, expected) {
  if (sha256(value) === expected) return true;
  if (value.includes(0)) return false;

  const normalized = Buffer.from(
    value.toString("utf8").replace(/\r\n|\r|\n/g, "\n").replaceAll("\n", "\r\n"),
    "utf8"
  );
  return sha256(normalized) === expected;
}

const failures = [];
let checked = 0;
for (const line of manifest.split(/\r?\n/)) {
  if (!line.trim()) continue;
  const [expected, sourcePath] = line.split(/  /, 2);
  const publicPath = sourcePath.startsWith("assets/")
    ? path.join("public", sourcePath)
    : path.join("public", sourcePath);
  const outputPath = path.join("dist", sourcePath);

  try {
    const copied = await readFile(path.join(root, publicPath));
    const built = await readFile(path.join(root, outputPath));
    if (!matchesBaseline(copied, expected) || sha256(copied) !== sha256(built)) {
      failures.push(sourcePath);
    }
  } catch (error) {
    failures.push(`${sourcePath}: ${error.code || error.message}`);
  }
  checked += 1;
}

if (failures.length) {
  console.error(`Asset parity failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${checked} baseline, public, and dist asset hashes.`);
}
