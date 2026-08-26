/** Gera a configuração pública de runtime a partir do .env da raiz. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

async function readEnv() {
  try {
    const source = await readFile(resolve(root, ".env"), "utf8");
    return Object.fromEntries(source.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#") && line.includes("=")).map((line) => {
      const [key, ...parts] = line.split("=");
      return [key.trim(), parts.join("=").trim().replace(/^['"]|['"]$/g, "")];
    }));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

export async function writeRuntimeConfig(destination = resolve(root, "runtime-config.js")) {
  const env = await readEnv();
  const config = {
    githubApiBase: env.DEMANDEX_GITHUB_API_BASE || "https://api.github.com",
    githubProxyUrl: env.DEMANDEX_GITHUB_PROXY_URL || "",
    githubRepositories: (env.DEMANDEX_GITHUB_REPOSITORIES || "ti-hu-org/ti-demandas,ti-hu-org/ti-qualidade").split(",").map((item) => item.trim()).filter(Boolean),
  };
  await writeFile(destination, `window.DEMANDEX_CONFIG = Object.freeze(${JSON.stringify(config)});\n`, "utf8");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await writeRuntimeConfig();
