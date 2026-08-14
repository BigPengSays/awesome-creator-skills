import type { Skill, StarsCache } from "./types.ts";
import { githubRepoKey } from "./github.ts";

/** Star weight halves every 21 days of inactivity. 1k★ / 7d outranks 4k★ / 60d. */
export const STAR_HALF_LIFE_DAYS = 21;

export function recencyDecay(pushedAt: string | undefined, now = Date.now()): number {
  if (!pushedAt) return 2 ** (-60 / STAR_HALF_LIFE_DAYS);
  const timestamp = Date.parse(pushedAt);
  if (Number.isNaN(timestamp)) return 2 ** (-60 / STAR_HALF_LIFE_DAYS);
  const ageDays = Math.max(0, (now - timestamp) / 86_400_000);
  return 2 ** (-ageDays / STAR_HALF_LIFE_DAYS);
}

export function rankScore(stars: number, pushedAt: string | undefined, now = Date.now()): number {
  return Math.max(0, stars) * recencyDecay(pushedAt, now);
}

export function scoreFor(skill: Skill, cache: StarsCache, now = Date.now()): number {
  const key = githubRepoKey(skill.source.repo);
  if (!key) return 0;
  const record = cache[key];
  if (!record) return 0;
  return rankScore(record.stars, record.pushed_at, now);
}

export function sortSkills(skills: Skill[], cache: StarsCache, now = Date.now()): Skill[] {
  return [...skills].sort((a, b) => {
    const scoreDiff = scoreFor(b, cache, now) - scoreFor(a, cache, now);
    if (scoreDiff !== 0) return scoreDiff;
    const keyA = githubRepoKey(a.source.repo);
    const keyB = githubRepoKey(b.source.repo);
    const starsA = keyA ? (cache[keyA]?.stars ?? 0) : 0;
    const starsB = keyB ? (cache[keyB]?.stars ?? 0) : 0;
    if (starsB !== starsA) return starsB - starsA;
    return a.id.localeCompare(b.id);
  });
}
