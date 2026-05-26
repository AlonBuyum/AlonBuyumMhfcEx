// tsc compiles .ts only — it does not copy runtime assets. The services read
// their fallback JSON from dist/data/ at runtime, so we copy src/data → dist/data
// after the type compile. Without this, the deployed app 500s when a fallback is hit.
import { cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, "..", "src", "data");
const dest = path.join(here, "..", "dist", "data");

cpSync(src, dest, { recursive: true });
console.log(`[build] copied data assets: ${src} -> ${dest}`);
