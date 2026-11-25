import { register } from "node:module";
import { installDom } from "./dom.ts";

// Hooks run on a separate thread: they resolve `~/` and extensionless imports and compile .ts/.tsx
// through esbuild so JSX works under `node --test`. The DOM is installed once per test process.
register("./loader.ts", import.meta.url);
installDom();
