import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig, lazyPlugins } from "vite-plus";

// Local OpenInventory API (see server/index.ts); only the web port is exposed.
const STORAGE_API_ORIGIN = "http://127.0.0.1:4174";

// https://vite.dev/config/
export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    plugins: ["react", "typescript", "oxc"],
    ignorePatterns: ["src/routeTree.gen.ts"],
    rules: {
      "react/rules-of-hooks": "error",
      // TanStack file routes must export `Route` alongside their components.
      "react/only-export-components": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  resolve: {
    alias: { "~": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  preview: { allowedHosts: [".ts.net"], proxy: { "/api": STORAGE_API_ORIGIN } },
  server: { allowedHosts: [".ts.net"], proxy: { "/api": STORAGE_API_ORIGIN } },
  build: { target: "es2023", sourcemap: false },
  plugins: lazyPlugins(() => [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ]),
});
