import { mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const ROOT = join(here, "..", "..");
export const CATALOG_DIR = join(ROOT, "catalog");
export const SKILLS_DIR = join(ROOT, "skills");
export const TMP_DIR = join(ROOT, ".tmp");
export const CANDIDATES_DIR = join(ROOT, "candidates");

export const SKILLS_YAML = join(CATALOG_DIR, "skills.yaml");
export const STARS_YAML = join(CATALOG_DIR, "stars.yaml");
export const TAXONOMY_YAML = join(CATALOG_DIR, "taxonomy.yaml");
export const REJECTED_YAML = join(CATALOG_DIR, "rejected.yaml");
export const SEEN_YAML = join(CATALOG_DIR, "seen.yaml");
export const README_MD = join(ROOT, "README.md");

export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function resetTmp(prefix = "work"): string {
  ensureDir(TMP_DIR);
  const dir = join(TMP_DIR, `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function removePath(path: string): void {
  rmSync(path, { recursive: true, force: true });
}
