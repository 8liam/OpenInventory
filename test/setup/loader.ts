import { transform } from "esbuild";
import { existsSync, readFileSync, statSync } from "node:fs";
import type { LoadHook, ResolveHook } from "node:module";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolvePath(fileURLToPath(import.meta.url), "../../..");
const ALIASES = [
  { prefix: "~test/", dir: resolvePath(ROOT, "test") },
  { prefix: "~/", dir: resolvePath(ROOT, "src") },
] as const;
const EXTENSIONS = [".ts", ".tsx"] as const;
const COMPILED = /\.(ts|tsx)$/;

function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile();
}

/** Resolves a path the way the bundler does: exact file, then a known extension, then an index file. */
function withExtension(path: string): string | undefined {
  if (isFile(path)) return path;
  for (const ext of EXTENSIONS) if (isFile(path + ext)) return path + ext;
  for (const ext of EXTENSIONS)
    if (isFile(resolvePath(path, `index${ext}`))) return resolvePath(path, `index${ext}`);
  return undefined;
}

/** Packages that pick their server build under Node but must run as in a browser here. */
const BROWSER_ONLY = ["@tanstack/router-core/isServer"] as const;

export const resolve: ResolveHook = (specifier, context, next) => {
  if ((BROWSER_ONLY as readonly string[]).includes(specifier)) {
    return next(specifier, { ...context, conditions: ["browser", ...context.conditions] });
  }
  const alias = ALIASES.find(({ prefix }) => specifier.startsWith(prefix));
  if (alias) {
    const found = withExtension(resolvePath(alias.dir, specifier.slice(alias.prefix.length)));
    if (found) return next(pathToFileURL(found).href, context);
  }
  if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const found = withExtension(resolvePath(dirname(fileURLToPath(context.parentURL)), specifier));
    if (found) return next(pathToFileURL(found).href, context);
  }
  return next(specifier, context);
};

export const load: LoadHook = async (url, context, next) => {
  if (!url.startsWith("file:") || url.includes("/node_modules/") || !COMPILED.test(url)) {
    return next(url, context);
  }
  const path = fileURLToPath(url);
  const { code } = await transform(readFileSync(path, "utf8"), {
    loader: path.endsWith("x") ? "tsx" : "ts",
    jsx: "automatic",
    format: "esm",
    target: "es2023",
    supported: { "import-attributes": true },
    sourcefile: path,
    sourcemap: "inline",
  });
  return { format: "module", source: code, shortCircuit: true };
};
