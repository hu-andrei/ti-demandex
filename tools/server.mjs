/** Servidor estático local em Node.js, sem dependências. */
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8010);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const file = resolve(root, `.${normalize(path === "/" ? "/html/" : path)}`);
  if (!file.startsWith(root)) { response.writeHead(403).end(); return; }
  const target = path.endsWith("/") ? resolve(file, "index.html") : file;
  try { await access(target); response.writeHead(200, { "Content-Type": types[extname(target)] || "application/octet-stream", "Cache-Control": "no-cache" }); createReadStream(target).pipe(response); }
  catch { response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Não encontrado"); }
}).listen(port, host, () => console.log(`Servidor iniciado em http://${host}:${port}/html/`));
