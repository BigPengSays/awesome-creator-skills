import "./lib/env.ts";
import { parseArgs } from "node:util";
import {
  isCataloged,
  isCatalogedUrl,
  isRejected,
  loadCatalog,
} from "./lib/catalog.ts";
import {
  inferTaxonomy,
  isCreatorSkillText,
  shortenSummary,
  uniqueSkillId,
} from "./lib/creator-match.ts";
import {
  downloadTarball,
  getRepoLicense,
  lsRemoteSha,
  parseGithubRepo,
} from "./lib/github.ts";
import { removePath, resetTmp } from "./lib/paths.ts";
import { extractGithubUrls, listFoundSkills, readTreeLicense, type FoundSkill } from "./lib/scan-skills.ts";
import { generateReadme } from "./generate-readme.ts";
import { refreshStars } from "./refresh-stars.ts";
import { vendorSkill, vendorSkillFromUrl } from "./vendor-skill.ts";

export interface IngestDecision {
  action: "import" | "skip" | "blocked" | "article";
  id?: string;
  repo?: string;
  path?: string;
  url?: string;
  reason: string;
  license?: string;
  platforms?: string[];
  contentTypes?: string[];
  formats?: string[];
  githubUrls?: string[];
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; awesome-creator-skills/1.0; +https://github.com/BigPengSays/awesome-creator-skills)",
        Accept: "text/html,text/plain,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(`Fetch ${res.status} ${url}`);
      return null;
    }
    return await res.text();
  } catch (error) {
    console.warn(`Fetch failed ${url}:`, error);
    return null;
  }
}

async function resolveSha(repoUrl: string, ref: string): Promise<string> {
  try {
    return await lsRemoteSha(repoUrl, ref);
  } catch {
    if (ref === "main") return lsRemoteSha(repoUrl, "master");
    throw new Error(`Could not resolve ${ref} on ${repoUrl}`);
  }
}

function matchText(skill: FoundSkill): string {
  return `${skill.name} ${skill.idHint} ${skill.path} ${skill.description} ${skill.markdown.slice(0, 4000)}`;
}

async function planRepo(
  repoUrl: string,
  decisions: IngestDecision[],
  allowUnknownLicense: boolean,
): Promise<Array<IngestDecision & { action: "import" }>> {
  const parsed = parseGithubRepo(repoUrl);
  if (!parsed) {
    decisions.push({ action: "skip", url: repoUrl, reason: "not a GitHub repo URL" });
    return [];
  }
  const canonical = `https://github.com/${parsed.owner}/${parsed.repo}`;
  const tmp = resetTmp(`ingest-${parsed.owner}-${parsed.repo}`);
  const toImport: Array<IngestDecision & { action: "import" }> = [];
  try {
    const sha = await resolveSha(canonical, "main");
    const extracted = await downloadTarball(parsed.owner, parsed.repo, sha, tmp);
    const found = listFoundSkills(extracted);
    if (found.length === 0) {
      decisions.push({ action: "skip", repo: canonical, reason: "no SKILL.md in repository" });
      return [];
    }
    const license = (await getRepoLicense(parsed.owner, parsed.repo)) || readTreeLicense(extracted);
    const catalog = loadCatalog();
    const existingIds = new Set(catalog.skills.map((skill) => skill.id));

    for (const skill of found) {
      const text = matchText(skill);
      if (!isCreatorSkillText(text)) {
        decisions.push({
          action: "skip",
          repo: canonical,
          path: skill.path,
          id: skill.idHint,
          reason: "not a creator skill",
        });
        continue;
      }
      if (isCataloged(canonical, skill.path) || isCataloged(canonical, skill.path.replace(/^\.\//, ""))) {
        decisions.push({
          action: "skip",
          repo: canonical,
          path: skill.path,
          id: skill.idHint,
          reason: "already in catalog",
        });
        continue;
      }
      if (isRejected(canonical, skill.path)) {
        decisions.push({
          action: "skip",
          repo: canonical,
          path: skill.path,
          id: skill.idHint,
          reason: "rejected",
        });
        continue;
      }
      if (!license && !allowUnknownLicense) {
        decisions.push({
          action: "blocked",
          repo: canonical,
          path: skill.path,
          id: skill.idHint,
          reason: "license unknown; pass --allow-unknown-license after confirming redistribution is allowed",
        });
        continue;
      }
      const tags = inferTaxonomy(text);
      const id = uniqueSkillId(existingIds, skill.idHint, parsed.repo);
      existingIds.add(id);
      const decision: IngestDecision & { action: "import" } = {
        action: "import",
        repo: canonical,
        path: skill.path,
        id,
        license,
        platforms: tags.platforms,
        contentTypes: tags.content_types,
        formats: tags.formats,
        reason: shortenSummary(skill.description || skill.name),
      };
      decisions.push(decision);
      toImport.push(decision);
    }
  } finally {
    removePath(tmp);
  }
  return toImport;
}

function printDecisions(decisions: IngestDecision[]): void {
  for (const item of decisions) {
    const loc = [item.repo, item.path, item.url, item.id].filter(Boolean).join(" ");
    console.log(`${item.action.padEnd(8)} ${loc} — ${item.reason}`);
  }
}

export async function ingestFromUrls(input: {
  urls: string[];
  dryRun?: boolean;
  allowUnknownLicense?: boolean;
  fromDir?: string;
  fromUrl?: string;
  skipReadme?: boolean;
}): Promise<IngestDecision[]> {
  const decisions: IngestDecision[] = [];
  const githubRepos = new Set<string>();

  if (input.fromDir && input.fromUrl) {
    if (isCatalogedUrl(input.fromUrl)) {
      decisions.push({ action: "skip", url: input.fromUrl, reason: "already copied from this URL" });
    } else {
      decisions.push({
        action: "import",
        url: input.fromUrl,
        reason: `copy local skill from ${input.fromDir}`,
      });
      if (!input.dryRun) {
        await vendorSkillFromUrl({ url: input.fromUrl, fromDir: input.fromDir });
      }
    }
  } else if (input.fromDir || input.fromUrl) {
    throw new Error("Use --from-dir together with --url for a non-GitHub copy.");
  }

  for (const raw of input.urls) {
    const parsed = parseGithubRepo(raw);
    if (parsed) {
      githubRepos.add(`https://github.com/${parsed.owner}/${parsed.repo}`);
      continue;
    }
    const body = await fetchPage(raw);
    if (!body) {
      decisions.push({
        action: "article",
        url: raw,
        reason: "ARTICLE_FETCH_REQUIRED: fetch the page (browser / URL-to-markdown) then pass GitHub links or --from-dir",
      });
      continue;
    }
    const extracted = extractGithubUrls(body);
    if (extracted.length === 0) {
      decisions.push({
        action: "article",
        url: raw,
        githubUrls: [],
        reason: "ARTICLE_NO_GITHUB: no GitHub skill links found; if the article embeds SKILL.md, copy it and use --from-dir --url",
      });
      continue;
    }
    decisions.push({
      action: "article",
      url: raw,
      githubUrls: extracted,
      reason: `extracted ${extracted.length} GitHub repo(s)`,
    });
    for (const repo of extracted) githubRepos.add(repo);
  }

  const imports: Array<IngestDecision & { action: "import" }> = [];
  for (const repo of githubRepos) {
    imports.push(...(await planRepo(repo, decisions, Boolean(input.allowUnknownLicense))));
  }

  printDecisions(decisions);

  if (input.dryRun) return decisions;

  for (const item of imports) {
    if (!item.repo || !item.path || !item.id) continue;
    await vendorSkill({
      repo: item.repo,
      path: item.path,
      id: item.id,
      platforms: item.platforms,
      contentTypes: item.contentTypes,
      formats: item.formats,
      license: item.license,
      summary: item.reason,
      sync: true,
    });
  }

  const importedGit = imports.length > 0;
  if (importedGit) await refreshStars();
  if (!input.skipReadme && (importedGit || (input.fromDir && input.fromUrl && !input.dryRun))) {
    await generateReadme();
  }
  return decisions;
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      "dry-run": { type: "boolean", default: false },
      "allow-unknown-license": { type: "boolean", default: false },
      "from-dir": { type: "string" },
      url: { type: "string" },
      "skip-readme": { type: "boolean", default: false },
    },
  });
  if (positionals.length === 0 && !(values["from-dir"] && values.url)) {
    throw new Error(
      "Usage: npm run ingest -- [--dry-run] [--allow-unknown-license] <github-or-article-url...> [--from-dir <skill> --url <page>]",
    );
  }
  await ingestFromUrls({
    urls: positionals,
    dryRun: values["dry-run"],
    allowUnknownLicense: values["allow-unknown-license"],
    fromDir: values["from-dir"],
    fromUrl: values.url,
    skipReadme: values["skip-readme"],
  });
}

const isDirect = process.argv[1]?.endsWith("ingest-from-urls.ts");
if (isDirect) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
