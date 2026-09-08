// Node ESM resolver hook: lets plain Node run the app's TypeScript sources
// (used by scripts/verify-mock-cart.mjs). Maps the "@/" tsconfig alias onto the
// repo root and fills in the extension-less imports Next.js resolves for us.

import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const EXTENSIONS = ["", ".ts", ".tsx", ".js", ".mjs", "/index.ts", "/index.js"];

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = path.join(ROOT, specifier.slice(2));
    for (const ext of EXTENSIONS) {
      const candidate = `${base}${ext}`;
      if (existsSync(candidate)) {
        return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
    throw new Error(`Cannot resolve "${specifier}" from the "@/" alias`);
  }
  return nextResolve(specifier, context);
}
