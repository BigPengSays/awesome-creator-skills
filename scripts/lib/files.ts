import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import type { Skill } from "./types.ts";

const SKIP_NAMES = new Set(["node_modules", ".git", "dist", ".DS_Store", "SOURCE.md"]);

export function parseFrontmatter(markdown: string): Record<string, string> {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && !key.includes(" ")) result[key] = value;
  }
  return result;
}

export function copySkillTree(from: string, to: string): void {
  if (!existsSync(from)) throw new Error(`Upstream skill path not found: ${from}`);
  rmSync(to, { recursive: true, force: true });
  mkdirSync(to, { recursive: true });
  copyRecursive(from, to);
}

function copyRecursive(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (SKIP_NAMES.has(entry.name)) continue;
    const src = join(from, entry.name);
    const dest = join(to, entry.name);
    if (entry.isDirectory()) copyRecursive(src, dest);
    else if (entry.isFile() || entry.isSymbolicLink()) cpSync(src, dest);
  }
}

export function listFiles(root: string): string[] {
  const files: string[] = [];
  walk(root, files);
  return files.map((file) => relative(root, file)).sort();
}

function walk(dir: string, files: string[]): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_NAMES.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile()) files.push(full);
  }
}

export function fileFingerprint(root: string): string {
  const parts: string[] = [];
  for (const rel of listFiles(root)) {
    const full = join(root, rel);
    const stat = statSync(full);
    parts.push(`${rel}:${stat.size}:${readFileSync(full, "utf8").length}`);
  }
  return parts.join("|");
}

export function writeSourceMd(skillDir: string, skill: Skill, extra: { fetchedAt: string; author?: string }): void {
  const body =
    skill.source.type === "git"
      ? `# Source

This directory is a mirror. Copyright remains with the original authors.

- Repository: ${skill.source.repo}
- Path: \`${skill.source.path}\`
- Ref: \`${skill.source.ref}\`
- Pinned commit: \`${skill.source.pinned_commit ?? "unknown"}\`
- License: ${skill.license ?? "see upstream repository"}
- Synced at: ${extra.fetchedAt}

Do not edit these files to customize behavior. Local patches belong outside this mirror, or mark the catalog entry \`sync: false\`.
`
      : `# Source

This directory was copied from a non-GitHub page. Copyright remains with the original authors.

- Source URL: ${skill.source.url}
- License: ${skill.license ?? "see original page"}
- Copied at: ${extra.fetchedAt}

This entry is not synced from git (\`sync: false\`).
`;
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(skillDir, "SOURCE.md"), body);
}

export function readSkillMd(skillDir: string): string {
  const path = join(skillDir, "SKILL.md");
  if (!existsSync(path)) throw new Error(`Missing SKILL.md in ${skillDir}`);
  return readFileSync(path, "utf8");
}

export function ensureParent(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
}
