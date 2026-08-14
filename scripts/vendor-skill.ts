import { parseArgs } from "node:util";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadCatalog, saveCatalog, upsertSkill } from "./lib/catalog.ts";
import { copySkillTree, parseFrontmatter, readSkillMd, writeSourceMd } from "./lib/files.ts";
import { inferTaxonomy, shortenSummary, slugId, uniqueSkillId } from "./lib/creator-match.ts";
import {
  downloadTarball,
  getRepoLicense,
  githubRepoKey,
  lsRemoteSha,
  parseGithubRepo,
} from "./lib/github.ts";
import { removePath, resetTmp, SKILLS_DIR } from "./lib/paths.ts";
import type { Skill, SkillRole } from "./lib/types.ts";
import { generateReadme } from "./generate-readme.ts";
import { parseCandidateIssue } from "./lib/issue.ts";

function csv(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveSkillDir(inputPath: string): string {
  if (existsSync(inputPath) && statSync(inputPath).isFile()) return dirname(inputPath);
  return inputPath;
}

export async function vendorSkill(input: {
  repo: string;
  path: string;
  id?: string;
  ref?: string;
  platforms?: string[];
  contentTypes?: string[];
  formats?: string[];
  role?: SkillRole;
  license?: string;
  summary?: string;
  name?: string;
  sync?: boolean;
}): Promise<Skill> {
  const parsed = parseGithubRepo(input.repo);
  if (!parsed) throw new Error(`Not a GitHub repo URL: ${input.repo}`);
  const repoUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
  const ref = input.ref || "main";
  const sha = await lsRemoteSha(repoUrl, ref);
  const tmp = resetTmp("vendor");
  try {
    const extracted = await downloadTarball(parsed.owner, parsed.repo, sha, tmp);
    const rel = input.path.replace(/^\/+/, "") || ".";
    const upstreamDir = rel === "." ? extracted : join(extracted, rel);
    const skillMd = readSkillMd(upstreamDir);
    const frontmatter = parseFrontmatter(skillMd);
    const id = input.id || frontmatter.name || rel.split("/").filter(Boolean).at(-1);
    if (!id) throw new Error("Could not determine skill id");
    const dest = join(SKILLS_DIR, id);
    copySkillTree(upstreamDir, dest);
    const license = input.license || (await getRepoLicense(parsed.owner, parsed.repo));
    const skill: Skill = {
      id,
      name: input.name || frontmatter.name || id,
      summary: input.summary || shortenSummary(frontmatter.description || id),
      role: input.role ?? "creation",
      platforms: input.platforms ?? [],
      content_types: input.contentTypes ?? [],
      formats: input.formats ?? [],
      source: {
        type: "git",
        repo: repoUrl,
        path: rel,
        ref,
        pinned_commit: sha,
      },
      license,
      sync: input.sync ?? true,
      status: "active",
    };
    writeSourceMd(dest, skill, { fetchedAt: new Date().toISOString() });
    const catalog = loadCatalog();
    upsertSkill(catalog, skill);
    saveCatalog(catalog);
    console.log(`Vendored ${id} from ${githubRepoKey(repoUrl)}@${sha.slice(0, 7)}`);
    return skill;
  } finally {
    removePath(tmp);
  }
}

export async function vendorSkillFromUrl(input: {
  url: string;
  fromDir: string;
  id?: string;
  platforms?: string[];
  contentTypes?: string[];
  formats?: string[];
  role?: SkillRole;
  license?: string;
  summary?: string;
  name?: string;
}): Promise<Skill> {
  const upstreamDir = resolveSkillDir(input.fromDir);
  const skillMd = readSkillMd(upstreamDir);
  const frontmatter = parseFrontmatter(skillMd);
  const preferred =
    input.id ||
    slugId(frontmatter.name || upstreamDir.split("/").filter(Boolean).at(-1) || "skill");
  const catalog = loadCatalog();
  const id = uniqueSkillId(new Set(catalog.skills.map((item) => item.id)), preferred, "url");
  if (!id) throw new Error("Could not determine skill id");
  const dest = join(SKILLS_DIR, id);
  copySkillTree(upstreamDir, dest);
  const tags = inferTaxonomy(`${frontmatter.name ?? ""} ${frontmatter.description ?? ""} ${skillMd}`);
  const skill: Skill = {
    id,
    name: input.name || frontmatter.name || id,
    summary: input.summary || shortenSummary(frontmatter.description || id),
    role: input.role ?? "creation",
    platforms: input.platforms ?? tags.platforms,
    content_types: input.contentTypes ?? tags.content_types,
    formats: input.formats ?? tags.formats,
    source: {
      type: "url",
      url: input.url,
    },
    license: input.license,
    sync: false,
    status: "active",
  };
  writeSourceMd(dest, skill, { fetchedAt: new Date().toISOString() });
  upsertSkill(catalog, skill);
  saveCatalog(catalog);
  console.log(`Copied ${id} from ${input.url}`);
  return skill;
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      repo: { type: "string" },
      path: { type: "string" },
      id: { type: "string" },
      ref: { type: "string" },
      platforms: { type: "string" },
      "content-types": { type: "string" },
      formats: { type: "string" },
      license: { type: "string" },
      summary: { type: "string" },
      name: { type: "string" },
      "from-issue": { type: "string" },
      "from-url": { type: "string" },
      "from-dir": { type: "string" },
      "no-sync": { type: "boolean", default: false },
      "skip-readme": { type: "boolean", default: false },
    },
    allowPositionals: false,
  });

  if (values["from-issue"]) {
    const parsed = await parseCandidateIssue(values["from-issue"]);
    await vendorSkill({
      repo: parsed.repo,
      path: parsed.path,
      id: parsed.id,
      ref: parsed.ref,
      platforms: parsed.platforms,
      contentTypes: parsed.content_types,
      formats: parsed.formats,
      license: parsed.license,
      summary: parsed.summary,
      name: parsed.name,
    });
  } else if (values["from-url"] && values["from-dir"]) {
    await vendorSkillFromUrl({
      url: values["from-url"],
      fromDir: values["from-dir"],
      id: values.id,
      platforms: csv(values.platforms),
      contentTypes: csv(values["content-types"]),
      formats: csv(values.formats),
      license: values.license,
      summary: values.summary,
      name: values.name,
    });
  } else {
    if (!values.repo || !values.path) {
      throw new Error(
        "Usage: npm run vendor -- --repo <url> --path <skill-path> | --from-url <page> --from-dir <skill-dir>",
      );
    }
    await vendorSkill({
      repo: values.repo,
      path: values.path,
      id: values.id,
      ref: values.ref,
      platforms: csv(values.platforms),
      contentTypes: csv(values["content-types"]),
      formats: csv(values.formats),
      license: values.license,
      summary: values.summary,
      name: values.name,
      sync: !values["no-sync"],
    });
  }

  if (!values["skip-readme"]) await generateReadme();
}

const isDirect = process.argv[1]?.endsWith("vendor-skill.ts");
if (isDirect) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
