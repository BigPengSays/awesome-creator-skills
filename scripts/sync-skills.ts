import { join } from "node:path";
import { loadCatalog, saveCatalog } from "./lib/catalog.ts";
import { copySkillTree, fileFingerprint, writeSourceMd } from "./lib/files.ts";
import { downloadTarball, lsRemoteSha, parseGithubRepo } from "./lib/github.ts";
import { removePath, resetTmp, SKILLS_DIR } from "./lib/paths.ts";
import { generateReadme } from "./generate-readme.ts";

export async function syncSkills(): Promise<{ updated: string[] }> {
  const catalog = loadCatalog();
  const updated: string[] = [];

  for (const skill of catalog.skills) {
    if (!skill.sync || skill.status !== "active") continue;
    if (skill.source.type !== "git") {
      console.warn(`Skip ${skill.id}: not a GitHub source`);
      continue;
    }
    const parsed = parseGithubRepo(skill.source.repo);
    if (!parsed) {
      console.warn(`Skip ${skill.id}: not a GitHub source`);
      continue;
    }
    const sha = await lsRemoteSha(skill.source.repo, skill.source.ref);
    if (skill.source.pinned_commit && sha === skill.source.pinned_commit) {
      console.log(`Unchanged ${skill.id} @ ${sha.slice(0, 7)}`);
      continue;
    }
    const tmp = resetTmp(`sync-${skill.id}`);
    try {
      const extracted = await downloadTarball(parsed.owner, parsed.repo, sha, tmp);
      const upstreamDir = join(extracted, skill.source.path);
      const dest = join(SKILLS_DIR, skill.id);
      const before = fileFingerprint(dest);
      copySkillTree(upstreamDir, dest);
      skill.source.pinned_commit = sha;
      writeSourceMd(dest, skill, { fetchedAt: new Date().toISOString() });
      const after = fileFingerprint(dest);
      if (before === after && skill.source.pinned_commit === sha) {
        console.log(`No file changes for ${skill.id}, still advancing pin to ${sha.slice(0, 7)}`);
      }
      updated.push(`${skill.id} → ${sha.slice(0, 7)}`);
      console.log(`Synced ${skill.id} to ${sha.slice(0, 7)}`);
    } finally {
      removePath(tmp);
    }
  }

  if (updated.length > 0) {
    saveCatalog(catalog);
    await generateReadme();
  }
  return { updated };
}

async function main(): Promise<void> {
  const { updated } = await syncSkills();
  if (updated.length === 0) {
    console.log("No skill content updates.");
    return;
  }
  console.log(`Updated:\n${updated.map((item) => `- ${item}`).join("\n")}`);
}

const isDirect = process.argv[1]?.endsWith("sync-skills.ts");
if (isDirect) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
