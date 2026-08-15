import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8"
};

async function isFile(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function resolveRequest(directory, url) {
  const pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const relative = pathname.replace(/^\/+/, "");
  const direct = path.resolve(directory, relative);
  if (direct !== directory && !direct.startsWith(`${directory}${path.sep}`)) return;

  const candidates = pathname.endsWith("/")
    ? [path.join(direct, "index.html")]
    : [direct, `${direct}.html`, path.join(direct, "index.html")];
  for (const candidate of candidates) {
    if (await isFile(candidate)) return candidate;
  }
}

export async function startStaticServer(rootDirectory, port) {
  const directory = path.resolve(rootDirectory);
  const server = createServer(async (request, response) => {
    const file = await resolveRequest(directory, request.url || "/");
    if (!file) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": mimeTypes[path.extname(file).toLowerCase()] || "application/octet-stream"
    });
    createReadStream(file).pipe(response);
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  return server;
}

const isCommandLine = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCommandLine) {
  const directory = process.argv[2] || "dist";
  const port = Number(process.argv[3] || 8080);
  const server = await startStaticServer(directory, port);
  console.log(`Serving ${path.resolve(directory)} at http://127.0.0.1:${port}`);
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      server.closeAllConnections?.();
      server.close();
      process.exit(0);
    });
  }
}
