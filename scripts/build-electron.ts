import { build, type BuildOptions } from "esbuild";

const OUT_DIR = "electron-dist";

const shared = {
  bundle: true,
  // Dependencies ship in node_modules: some (steam-crypto) read data files next to themselves.
  packages: "external",
  platform: "node",
  format: "esm",
  target: "node24",
  logLevel: "info",
} satisfies BuildOptions;

await Promise.all([
  build({ ...shared, entryPoints: ["server/index.ts"], outfile: `${OUT_DIR}/server.mjs` }),
  build({
    ...shared,
    entryPoints: ["electron/main.ts"],
    outfile: `${OUT_DIR}/main.mjs`,
    external: ["electron"],
  }),
]);
