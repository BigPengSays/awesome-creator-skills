import "./env.ts";
import { createWriteStream } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface GithubRepo {
  owner: string;
  repo: string;
}

export function parseGithubRepo(url: string): GithubRepo | null {
  try {
    const cleaned = url.trim().replace(/\.git$/, "");
    const parsed = new URL(cleaned);
    if (!["github.com", "www.github.com"].includes(parsed.hostname)) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    const match = url.trim().match(/^([\w.-]+)\/([\w.-]+)$/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  }
}

export function githubRepoKey(repoUrl: string): string | null {
  const parsed = parseGithubRepo(repoUrl);
  return parsed ? `${parsed.owner}/${parsed.repo}` : null;
}

export function githubRepoUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}`;
}

export function githubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "awesome-creator-skills",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function githubJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { headers: githubHeaders() });
  if (!res.ok) {
    console.warn(`GitHub API ${res.status} ${url}`);
    return null;
  }
  return (await res.json()) as T;
}

export async function getRepoStars(owner: string, repo: string): Promise<number | null> {
  const stats = await getRepoStats(owner, repo);
  return stats?.stars ?? null;
}

export interface RepoStats {
  stars: number;
  pushed_at?: string;
}

export async function getRepoStats(owner: string, repo: string): Promise<RepoStats | null> {
  const data = await githubJson<{ stargazers_count: number; pushed_at?: string }>(
    `https://api.github.com/repos/${owner}/${repo}`,
  );
  if (data && typeof data.stargazers_count === "number") {
    return { stars: data.stargazers_count, pushed_at: data.pushed_at };
  }
  const [stars, pushed_at] = await Promise.all([
    fetchShieldsStars(owner, repo),
    fetchLatestCommitDate(owner, repo),
  ]);
  if (stars == null && !pushed_at) return null;
  return { stars: stars ?? 0, pushed_at };
}

async function fetchShieldsStars(owner: string, repo: string): Promise<number | null> {
  try {
    const res = await fetch(`https://img.shields.io/github/stars/${owner}/${repo}.json`, {
      headers: { "User-Agent": "awesome-creator-skills" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { value?: string; message?: string };
    const raw = data.value ?? data.message ?? "";
    const match = raw.trim().match(/^([\d.]+)\s*([kKmMbB])?$/);
    if (!match) {
      const n = Number(raw.replace(/,/g, ""));
      return Number.isFinite(n) ? n : null;
    }
    const base = Number(match[1]);
    const suffix = (match[2] || "").toLowerCase();
    const factor = suffix === "k" ? 1_000 : suffix === "m" ? 1_000_000 : suffix === "b" ? 1_000_000_000 : 1;
    return Math.round(base * factor);
  } catch {
    return null;
  }
}

async function fetchLatestCommitDate(owner: string, repo: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://github.com/${owner}/${repo}/commits.atom`, {
      headers: { "User-Agent": "awesome-creator-skills", Accept: "application/atom+xml" },
    });
    if (!res.ok) return undefined;
    const xml = await res.text();
    const match = xml.match(/<updated>([^<]+)<\/updated>/);
    return match?.[1];
  } catch {
    return undefined;
  }
}

export async function getRepoLicense(owner: string, repo: string): Promise<string | undefined> {
  const data = await githubJson<{ license?: { spdx_id?: string } }>(
    `https://api.github.com/repos/${owner}/${repo}`,
  );
  const spdx = data?.license?.spdx_id;
  return spdx && spdx !== "NOASSERTION" ? spdx : undefined;
}

export async function lsRemoteSha(repoUrl: string, ref: string): Promise<string> {
  if (/^[0-9a-f]{40}$/i.test(ref)) return ref.toLowerCase();
  const gitUrl = repoUrl.endsWith(".git") ? repoUrl : `${repoUrl.replace(/\/$/, "")}.git`;
  const { stdout } = await execFileAsync("git", ["ls-remote", gitUrl, ref, `refs/heads/${ref}`, `refs/tags/${ref}`], {
    timeout: 30_000,
  });
  const line = stdout
    .split("\n")
    .map((item) => item.trim())
    .find(Boolean);
  if (!line) throw new Error(`Could not resolve ${ref} on ${repoUrl}`);
  return line.split(/[\s\t]+/)[0].toLowerCase();
}

export async function downloadTarball(
  owner: string,
  repo: string,
  ref: string,
  destDir: string,
): Promise<string> {
  await mkdir(destDir, { recursive: true });
  const url = `https://codeload.github.com/${owner}/${repo}/tar.gz/${encodeURIComponent(ref)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "awesome-creator-skills",
      ...(process.env.GITHUB_TOKEN || process.env.GH_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN || process.env.GH_TOKEN}` }
        : {}),
    },
  });
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download tarball ${url}: ${res.status} ${res.statusText}`);
  }
  const tarPath = join(destDir, "source.tar.gz");
  await pipeline(
    Readable.fromWeb(res.body as import("node:stream/web").ReadableStream),
    createWriteStream(tarPath),
  );
  const extractDir = join(destDir, "extract");
  await mkdir(extractDir, { recursive: true });
  await execFileAsync("tar", ["-xzf", tarPath, "-C", extractDir]);
  const entries = await readdir(extractDir, { withFileTypes: true });
  const top = entries.find((entry) => entry.isDirectory());
  if (!top) throw new Error(`Tarball from ${owner}/${repo}@${ref} had no directory`);
  return join(extractDir, top.name);
}
