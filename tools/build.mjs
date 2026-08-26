/** Build estático do portal, sem dependências externas. */
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeRuntimeConfig } from "./runtime-config.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = resolve(root, "dist");

function minifyCss(source) { return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s{2,}/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").trim(); }
function minifyJs(source) { return source.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n{2,}/g, "\n"); }
async function minifyTree(folder, transform) {
  const source = resolve(root, folder); const target = resolve(dist, folder);
  await cp(source, target, { recursive: true });
  const { readdir } = await import("node:fs/promises");
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = resolve(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else await writeFile(file, transform(await readFile(file, "utf8")), "utf8");
    }
  }
  await walk(target);
}
function publishedHtml(source) { return source.replaceAll("../css/", "css/").replaceAll("../js/", "js/").replaceAll("../assets/", "assets/").replaceAll("../runtime-config.js", "runtime-config.js"); }

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all([minifyTree("css", minifyCss), minifyTree("js", minifyJs), cp(resolve(root, "assets"), resolve(dist, "assets"), { recursive: true })]);
for (const page of ["index.html", "issue-form.html"]) await writeFile(resolve(dist, page), publishedHtml(await readFile(resolve(root, "html", page), "utf8")), "utf8");
await cp(resolve(root, "VERSION"), resolve(dist, "VERSION"));
await writeRuntimeConfig(resolve(dist, "runtime-config.js"));
