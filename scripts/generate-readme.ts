import { writeFileSync } from "node:fs";
import { loadCatalog, loadStars, loadTaxonomy } from "./lib/catalog.ts";
import { githubRepoKey, parseGithubRepo } from "./lib/github.ts";
import { README_MD } from "./lib/paths.ts";
import { sortSkills } from "./lib/rank.ts";
import type { Skill, StarsCache, Taxonomy } from "./lib/types.ts";

function displaySummary(text: string): string {
  const one = text.replace(/\s+/g, " ").trim();
  if (one.length <= 120) return one;
  return `${one.slice(0, 117)}…`;
}

function starBadge(repoUrl: string): string {
  const parsed = parseGithubRepo(repoUrl);
  if (!parsed) return "";
  const badge = `https://badgen.net/github/stars/${parsed.owner}/${parsed.repo}`;
  return ` [![GitHub Stars](${badge})](${repoUrl})`;
}

function skillLine(skill: Skill): string {
  const badge = starBadge(skill.source.repo);
  return `- [${skill.name}](skills/${skill.id}/)${badge} — ${displaySummary(skill.summary)}`;
}

function sectionFor(
  title: string,
  taxonomy: Record<string, { label: string }>,
  skills: Skill[],
  pick: (skill: Skill) => string[],
  stars: StarsCache,
): string {
  const chunks: string[] = [`## ${title}`, ""];
  let any = false;
  for (const [key, meta] of Object.entries(taxonomy)) {
    const matched = sortSkills(
      skills.filter((skill) => pick(skill).includes(key)),
      stars,
    );
    if (matched.length === 0) continue;
    any = true;
    chunks.push(`#### ${meta.label}`, "");
    for (const skill of matched) chunks.push(skillLine(skill));
    chunks.push("");
  }
  if (!any) {
    chunks.push("_暂无。_");
    chunks.push("");
  }
  return chunks.join("\n");
}

function uniqueRepos(skills: Skill[]): string[] {
  return [...new Set(skills.map((skill) => skill.source.repo))].sort();
}

export function renderReadme(): string {
  const catalog = loadCatalog();
  const taxonomy = loadTaxonomy();
  const stars = loadStars();
  const skills = catalog.skills.filter((skill) => skill.status === "active");

  const toc = [
    "- [按平台](#按平台)",
    "- [按创作类型](#按创作类型)",
    "- [按创作形式](#按创作形式)",
    "- [安装](#安装)",
    "- [版权归属](#版权归属)",
  ].join("\n");

  const repoList = uniqueRepos(skills)
    .map((repo) => `- ${repo}`)
    .join("\n");

  return `# 创作技能合集

搜集全网创作向 Agent Skills：覆盖微信公众号、小红书、YouTube、X 等平台，以及文章、图片、图文、视频等类型。

\`\`\`bash
npx skills add BigPengSays/awesome-creator-skills --skill <skill-id>
\`\`\`

${toc}

${sectionFor("按平台", taxonomy.platforms, skills, (skill) => skill.platforms, stars)}
${sectionFor("按创作类型", taxonomy.content_types, skills, (skill) => skill.content_types, stars)}
${sectionFor("按创作形式", taxonomy.formats, skills, (skill) => skill.formats, stars)}
## 安装

\`\`\`bash
npx skills add BigPengSays/awesome-creator-skills --skill baoyu-post-to-wechat
\`\`\`

安装全部技能：

\`\`\`bash
npx skills add BigPengSays/awesome-creator-skills --skill '*'
\`\`\`

## 版权归属

技能版权仍归原作者。本仓库目录与脚本采用 MIT 许可，各技能保留其上游许可证。详见各技能目录中的 \`SOURCE.md\`，以及：

${repoList || "_暂无。_"}
`;
}

export async function generateReadme(): Promise<void> {
  writeFileSync(README_MD, renderReadme());
  console.log("Wrote README.md");
}

const isDirect = process.argv[1]?.endsWith("generate-readme.ts");
if (isDirect) {
  generateReadme().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
