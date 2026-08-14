import "./lib/env.ts";
import { stringify } from "yaml";
import { loadCatalog, loadStars, saveStars } from "./lib/catalog.ts";
import { generateReadme } from "./generate-readme.ts";
import { getRepoStats, githubRepoKey, parseGithubRepo } from "./lib/github.ts";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function refreshStars(): Promise<boolean> {
  const catalog = loadCatalog();
  const previous = stringify(loadStars());
  const repos = new Map<string, { owner: string; repo: string }>();
  for (const skill of catalog.skills) {
    const parsed = parseGithubRepo(skill.source.repo);
    const key = githubRepoKey(skill.source.repo);
    if (!parsed || !key) continue;
    repos.set(key, parsed);
  }

  const next = loadStars();
  const fetchedAt = new Date().toISOString();
  for (const [key, parsed] of repos) {
    const stats = await getRepoStats(parsed.owner, parsed.repo);
    if (!stats) {
      console.warn(`Could not refresh stats for ${key}`);
      continue;
    }
    next[key] = {
      stars: stats.stars,
      pushed_at: stats.pushed_at,
      fetched_at: fetchedAt,
    };
    console.log(`${key}: ${stats.stars} stars, pushed ${stats.pushed_at ?? "unknown"}`);
    await sleep(150);
  }

  const changed = stringify(next) !== previous;
  if (changed) {
    saveStars(next);
    await generateReadme();
  }
  return changed;
}

async function main(): Promise<void> {
  const changed = await refreshStars();
  console.log(changed ? "Stars cache updated." : "Stars cache unchanged.");
}

const isDirect = process.argv[1]?.endsWith("refresh-stars.ts");
if (isDirect) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
