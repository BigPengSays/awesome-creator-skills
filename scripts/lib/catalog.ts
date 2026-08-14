import { readFileSync, writeFileSync } from "node:fs";
import { parse, stringify } from "yaml";
import type {
  Catalog,
  RejectedCatalog,
  SeenCatalog,
  Skill,
  StarsCache,
  Taxonomy,
} from "./types.ts";
import {
  REJECTED_YAML,
  SEEN_YAML,
  SKILLS_YAML,
  STARS_YAML,
  TAXONOMY_YAML,
} from "./paths.ts";

function readYaml<T>(path: string, fallback: T): T {
  try {
    const parsed = parse(readFileSync(path, "utf8")) as T | null;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadCatalog(): Catalog {
  const data = readYaml<Catalog>(SKILLS_YAML, { skills: [] });
  data.skills ??= [];
  return data;
}

export function saveCatalog(catalog: Catalog): void {
  writeFileSync(SKILLS_YAML, stringify(catalog, { lineWidth: 0, aliasDuplicateObjects: false }));
}

export function loadTaxonomy(): Taxonomy {
  return readYaml<Taxonomy>(TAXONOMY_YAML, {
    platforms: {},
    content_types: {},
    formats: {},
  });
}

export function loadStars(): StarsCache {
  return readYaml<StarsCache>(STARS_YAML, {});
}

export function saveStars(stars: StarsCache): void {
  writeFileSync(STARS_YAML, stringify(stars, { lineWidth: 0, aliasDuplicateObjects: false }));
}

export function loadRejected(): RejectedCatalog {
  const data = readYaml<RejectedCatalog>(REJECTED_YAML, { rejected: [] });
  data.rejected ??= [];
  return data;
}

export function saveRejected(data: RejectedCatalog): void {
  writeFileSync(REJECTED_YAML, stringify(data, { lineWidth: 0, aliasDuplicateObjects: false }));
}

export function loadSeen(): SeenCatalog {
  const data = readYaml<SeenCatalog>(SEEN_YAML, { seen: [] });
  data.seen ??= [];
  return data;
}

export function saveSeen(data: SeenCatalog): void {
  writeFileSync(SEEN_YAML, stringify(data, { lineWidth: 0, aliasDuplicateObjects: false }));
}

export function upsertSkill(catalog: Catalog, skill: Skill): void {
  const index = catalog.skills.findIndex((item) => item.id === skill.id);
  if (index >= 0) catalog.skills[index] = skill;
  else catalog.skills.push(skill);
  catalog.skills.sort((a, b) => a.id.localeCompare(b.id));
}

export function candidateKey(repo: string, path: string): string {
  return `${repo.replace(/\/+$/, "")}#${path.replace(/^\/+/, "")}`;
}

export function isRejected(repo: string, path: string): boolean {
  const key = candidateKey(repo, path);
  return loadRejected().rejected.some((item) => candidateKey(item.repo, item.path) === key);
}

export function isCataloged(repo: string, path: string): boolean {
  const key = candidateKey(repo, path);
  return loadCatalog().skills.some((item) => candidateKey(item.source.repo, item.source.path) === key);
}
