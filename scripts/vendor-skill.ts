import { parseArgs } from "node:util";
import { join } from "node:path";
import { loadCatalog, saveCatalog, upsertSkill } from "./lib/catalog.ts";
import { copySkillTree, parseFrontmatter, readSkillMd, writeSourceMd } from "./lib/files.ts";
import {
  downloadTarball,
  getRepoLicense,
  githubRepoKey,
  lsRemoteSha,
  parseGithubRepo,
} from "./lib/github.ts";
import { removePath, resetTmp, SKILLS_DIR } from "./lib/paths.ts";
import type { Skill } from "./lib/types.ts";
import { generateReadme } from "./generate-readme.ts";
import { parseCandidateIssue } from "./lib/issue.ts";

function shortenSummary(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const cut = trimmed.search(/。|\.(?:\s|$)/);
  const first = cut > 20 ? trimmed.slice(0, cut + 1).trim() : trimmed;
  return first.length > 160 ? `${first.slice(0, 157)}…` : first;
}

function csv(value?: string): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function vendorSkill(input: {
  repo: string;
  path: string;
  id?: string;
  ref?: string;
  platforms?: string[];
  contentTypes?: string[];
  formats?: string[];
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
    const upstreamDir = join(extracted, input.path);
    const skillMd = readSkillMd(upstreamDir);
    const frontmatter = parseFrontmatter(skillMd);
    const id = input.id || frontmatter.name || input.path.split("/").filter(Boolean).at(-1);
    if (!id) throw new Error("Could not determine skill id");
    const dest = join(SKILLS_DIR, id);
    copySkillTree(upstreamDir, dest);
    const license = input.license || (await getRepoLicense(parsed.owner, parsed.repo));
    const skill: Skill = {
      id,
      name: input.name || frontmatter.name || id,
      summary: input.summary || shortenSummary(frontmatter.description || id),
      platforms: input.platforms ?? [],
      content_types: input.contentTypes ?? [],
      formats: input.formats ?? [],
      source: {
        type: "git",
        repo: repoUrl,
        path: input.path.replace(/^\/+/, ""),
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
  } else {
    if (!values.repo || !values.path) {
      throw new Error("Usage: npm run vendor -- --repo <url> --path <skill-path> [--id ...] [--from-issue N]");
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
