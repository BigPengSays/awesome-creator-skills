import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { parseFrontmatter } from "./files.ts";
import { slugId } from "./creator-match.ts";

const SKIP_NAMES = new Set(["node_modules", ".git", "dist", ".DS_Store", ".tmp"]);

export interface FoundSkill {
  path: string;
  idHint: string;
  name: string;
  description: string;
  markdown: string;
}

export function listFoundSkills(extractedRoot: string): FoundSkill[] {
  const files: string[] = [];
  walkSkillMd(extractedRoot, files);
  return files.map((full) => {
    const dir = full.slice(0, -"SKILL.md".length).replace(/\/+$/, "") || extractedRoot;
    const rel = relative(extractedRoot, dir).replace(/\\/g, "/") || ".";
    const markdown = readFileSync(full, "utf8");
    const frontmatter = parseFrontmatter(markdown);
    const idHint = slugId(frontmatter.name || rel.split("/").filter(Boolean).at(-1) || "skill");
    return {
      path: rel,
      idHint: idHint || "skill",
      name: frontmatter.name || idHint || rel,
      description: frontmatter.description || "",
      markdown,
    };
  });
}

function walkSkillMd(dir: string, files: string[]): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_NAMES.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkSkillMd(full, files);
    else if (entry.isFile() && entry.name === "SKILL.md") files.push(full);
  }
}

export function extractGithubUrls(text: string): string[] {
  const found = new Set<string>();
  const github =
    /https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)(?:\/(?:tree|blob)\/[^\s)"'<>]+)?/gi;
  for (const match of text.matchAll(github)) {
    found.add(`https://github.com/${match[1]}/${match[2]}`.replace(/\.git$/i, ""));
  }
  const skillsSh = /https?:\/\/skills\.sh\/([\w.-]+)\/([\w.-]+)(?:\/[\w.-]+)?/gi;
  for (const match of text.matchAll(skillsSh)) {
    found.add(`https://github.com/${match[1]}/${match[2]}`);
  }
  return [...found];
}

const LICENSE_FILES = ["LICENSE", "LICENSE.md", "LICENSE.txt", "COPYING", "COPYING.md"];

export function readTreeLicense(root: string): string | undefined {
  for (const name of LICENSE_FILES) {
    const full = join(root, name);
    if (!existsSync(full)) continue;
    const text = readFileSync(full, "utf8").slice(0, 800);
    if (/MIT License/i.test(text) || /^\s*MIT\b/m.test(text)) return "MIT";
    if (/Apache License/i.test(text)) return "Apache-2.0";
    if (/BSD 3-Clause/i.test(text)) return "BSD-3-Clause";
    if (/GNU General Public License/i.test(text)) return "GPL-3.0";
    if (/CC-BY-4\.0|Creative Commons Attribution 4/i.test(text)) return "CC-BY-4.0";
    return "see LICENSE file";
  }
  return undefined;
}
