import "./lib/env.ts";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  candidateKey,
  isCataloged,
  isRejected,
  loadSeen,
  saveSeen,
} from "./lib/catalog.ts";
import { isCreatorSkillText, slugId } from "./lib/creator-match.ts";
import { githubJson, githubRepoUrl, parseGithubRepo } from "./lib/github.ts";
import { CANDIDATES_DIR, ensureDir } from "./lib/paths.ts";
import type { Candidate } from "./lib/types.ts";
import { renderCandidateIssue, type CandidateMeta } from "./lib/issue.ts";
import { notifyFeishu } from "./notify-feishu.ts";

const execFileAsync = promisify(execFile);

const CREATOR_QUERIES = [
  "wechat",
  "xiaohongshu",
  "小红书",
  "公众号",
  "youtube",
  "weibo",
  "bilibili",
  "linkedin",
  "twitter tweet",
  "infographic",
  "copywriting",
];

const AWESOME_README_URLS = [
  "https://raw.githubusercontent.com/VoltAgent/awesome-agent-skills/main/README.md",
  "https://raw.githubusercontent.com/heilcheng/awesome-agent-skills/main/README.md",
];

const MAX_CANDIDATES = 20;

async function searchGithub(query: string): Promise<Candidate[]> {
  const q = `${query} filename:SKILL.md`;
  const data = await githubJson<{
    items?: Array<{
      name: string;
      path: string;
      html_url: string;
      repository: { full_name: string; html_url: string; description?: string | null };
    }>;
  }>(`https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=10`);
  if (!data?.items) return [];
  return data.items.map((item) => {
    const id = slugId(item.path.split("/").at(-2) || item.repository.full_name);
    const summary = item.repository.description || `${item.path} in ${item.repository.full_name}`;
    return {
      id,
      name: id,
      summary,
      repo: item.repository.html_url,
      path: item.path.replace(/\/SKILL\.md$/i, ""),
      reason: `GitHub code search: ${query}`,
      sourceKind: "github-search" as const,
      url: item.html_url,
    };
  });
}

async function searchSkillsSh(query: string): Promise<Candidate[]> {
  try {
    const res = await fetch(`https://skills.sh/api/search?q=${encodeURIComponent(query)}&limit=15`, {
      headers: { "User-Agent": "awesome-creator-skills" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      skills?: Array<{ id: string; skillId?: string; name: string; source: string; installs?: number }>;
    };
    return (data.skills ?? [])
      .filter((skill) => isCreatorSkillText(`${skill.name} ${skill.id} ${skill.source} ${query}`))
      .map((skill) => {
        const source = skill.source || skill.id.split("/").slice(0, 2).join("/");
        const parsed = parseGithubRepo(source);
        const repo = parsed ? githubRepoUrl(parsed.owner, parsed.repo) : `https://github.com/${source}`;
        const skillId = skill.skillId || skill.name || skill.id.split("/").at(-1) || "skill";
        return {
          id: slugId(skillId),
          name: skill.name || skillId,
          summary: `${skill.name} from skills.sh (${skill.installs ?? 0} installs)`,
          repo,
          path: `skills/${skillId}`,
          reason: `skills.sh search: ${query}`,
          sourceKind: "skills.sh" as const,
          url: `https://skills.sh/${skill.id}`,
        };
      });
  } catch (error) {
    console.warn(`skills.sh search failed for ${query}:`, error);
    return [];
  }
}

async function parseAwesomeLists(): Promise<Candidate[]> {
  const found: Candidate[] = [];
  for (const url of AWESOME_README_URLS) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "awesome-creator-skills" } });
      if (!res.ok) continue;
      const text = await res.text();
      for (const line of text.split("\n")) {
        if (!isCreatorSkillText(line)) continue;
        const match = line.match(/https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+)(?:\/tree\/[^)\s]+\/(\S+))?/);
        if (!match) continue;
        const repo = githubRepoUrl(match[1], match[2]);
        const path = match[3]?.replace(/\/SKILL\.md$/i, "") || "skills";
        const id = slugId(match[3]?.split("/").filter(Boolean).at(-1) || match[2]);
        found.push({
          id,
          name: id,
          summary: line.replace(/[#*\-\[\]]/g, " ").slice(0, 200).trim(),
          repo,
          path,
          reason: `awesome list ${url}`,
          sourceKind: "awesome-list",
          url: match[0],
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch ${url}:`, error);
    }
  }
  return found;
}

function dedupe(candidates: Candidate[]): Candidate[] {
  const map = new Map<string, Candidate>();
  for (const candidate of candidates) {
    const key = candidateKey(candidate.repo, candidate.path);
    if (!map.has(key)) map.set(key, candidate);
  }
  return [...map.values()];
}

async function createIssue(candidate: Candidate): Promise<string | undefined> {
  const meta: CandidateMeta = {
    id: candidate.id,
    name: candidate.name,
    summary: candidate.summary,
    repo: candidate.repo,
    path: candidate.path,
    ref: candidate.ref || "main",
  };
  const body = renderCandidateIssue({ ...meta, reason: candidate.reason, stars: candidate.stars, url: candidate.url });
  try {
    await execFileAsync("gh", [
      "label",
      "create",
      "candidate",
      "--description",
      "Skill candidate awaiting review",
      "--color",
      "0E8A16",
    ]).catch(() => undefined);
    const { stdout } = await execFileAsync("gh", [
      "issue",
      "create",
      "--title",
      `candidate: ${candidate.id}`,
      "--label",
      "candidate",
      "--body",
      body,
    ]);
    return stdout.trim();
  } catch (error) {
    console.warn(`Failed to create issue for ${candidate.id}:`, error);
    return undefined;
  }
}

export async function discover(): Promise<Candidate[]> {
  const collected: Candidate[] = [];
  for (const query of CREATOR_QUERIES) {
    collected.push(...(await searchGithub(query)));
    collected.push(...(await searchSkillsSh(query)));
  }
  collected.push(...(await parseAwesomeLists()));

  const seen = loadSeen();
  const seenKeys = new Set(seen.seen.map((item) => item.key));
  const fresh = dedupe(collected)
    .filter((candidate) => isCreatorSkillText(`${candidate.id} ${candidate.summary} ${candidate.reason} ${candidate.path}`))
    .filter((candidate) => !isCataloged(candidate.repo, candidate.path))
    .filter((candidate) => !isRejected(candidate.repo, candidate.path))
    .filter((candidate) => !seenKeys.has(candidateKey(candidate.repo, candidate.path)))
    .slice(0, MAX_CANDIDATES);

  ensureDir(CANDIDATES_DIR);
  const stamp = new Date().toISOString().slice(0, 10);
  writeFileSync(join(CANDIDATES_DIR, `${stamp}.json`), JSON.stringify(fresh, null, 2));

  const issueUrls: string[] = [];
  for (const candidate of fresh) {
    const url = await createIssue(candidate);
    if (url) issueUrls.push(url);
    seen.seen.push({
      key: candidateKey(candidate.repo, candidate.path),
      notified_at: new Date().toISOString(),
      issue_url: url,
    });
  }
  saveSeen(seen);
  await notifyFeishu(fresh, issueUrls);
  console.log(`Discovered ${fresh.length} new candidates.`);
  return fresh;
}

async function main(): Promise<void> {
  mkdirSync(CANDIDATES_DIR, { recursive: true });
  await discover();
}

const isDirect = process.argv[1]?.endsWith("discover.ts");
if (isDirect) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
