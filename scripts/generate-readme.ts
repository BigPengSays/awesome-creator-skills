import { writeFileSync } from "node:fs";
import { loadCatalog, loadStars, loadTaxonomy } from "./lib/catalog.ts";
import { parseGithubRepo } from "./lib/github.ts";
import { README_MD } from "./lib/paths.ts";
import { sortSkills } from "./lib/rank.ts";
import {
  isPublishingSkill,
  sourceAttribution,
  type Skill,
  type StarsCache,
  type Taxonomy,
} from "./lib/types.ts";

function displaySummary(text: string): string {
  const one = text.replace(/\s+/g, " ").trim();
  if (one.length <= 220) return one;
  return `${one.slice(0, 217)}…`;
}

function sourceSkillUrl(skill: Skill): string {
  if (skill.source.type === "url") return skill.source.url;
  const clean = skill.source.path.replace(/^\/+|\/+$/g, "");
  if (!clean || clean === ".") return skill.source.repo;
  const encodedPath = clean.split("/").map(encodeURIComponent).join("/");
  return `${skill.source.repo}/tree/${encodeURIComponent(skill.source.ref)}/${encodedPath}`;
}

function starBadge(repoUrl: string): string {
  const parsed = parseGithubRepo(repoUrl);
  if (!parsed) return "";
  const badge = `https://badgen.net/github/stars/${parsed.owner}/${parsed.repo}`;
  return ` [![GitHub Stars](${badge})](${repoUrl})`;
}

function skillLine(skill: Skill): string {
  const badge = skill.source.type === "git" ? starBadge(skill.source.repo) : "";
  return `- [${skill.name}](${sourceSkillUrl(skill)})${badge} — ${displaySummary(skill.summary)}`;
}

function githubHeadingAnchor(label: string, used: Map<string, number>): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
  const count = used.get(slug) ?? 0;
  used.set(slug, count + 1);
  return count === 0 ? slug : `${slug}-${count}`;
}

interface TocSubsection {
  label: string;
  anchor: string;
}

interface TocSection {
  label: string;
  anchor: string;
  subsections: TocSubsection[];
}

interface SectionResult {
  body: string;
  toc: TocSection;
}

function sectionFor(
  title: string,
  taxonomy: Record<string, { label: string }>,
  skills: Skill[],
  pick: (skill: Skill) => string[],
  stars: StarsCache,
  anchorUsed: Map<string, number>,
  options?: { exclude?: (skill: Skill) => boolean },
): SectionResult {
  const sectionAnchor = githubHeadingAnchor(title, anchorUsed);
  const subsections: TocSubsection[] = [];
  const chunks: string[] = [`## ${title}`, ""];
  let any = false;

  for (const [key, meta] of Object.entries(taxonomy)) {
    const matched = sortSkills(
      skills.filter((skill) => {
        if (options?.exclude?.(skill)) return false;
        return pick(skill).includes(key);
      }),
      stars,
    );
    if (matched.length === 0) continue;
    any = true;
    const subAnchor = githubHeadingAnchor(meta.label, anchorUsed);
    subsections.push({ label: meta.label, anchor: subAnchor });
    chunks.push(`#### ${meta.label}`, "");
    for (const skill of matched) chunks.push(skillLine(skill));
    chunks.push("");
  }

  if (!any) {
    chunks.push("_暂无。_");
    chunks.push("");
  }

  return {
    body: chunks.join("\n"),
    toc: { label: title, anchor: sectionAnchor, subsections },
  };
}

function flatSectionFor(
  title: string,
  skills: Skill[],
  stars: StarsCache,
  anchorUsed: Map<string, number>,
): SectionResult {
  const sectionAnchor = githubHeadingAnchor(title, anchorUsed);
  const sorted = sortSkills(skills, stars);
  const chunks = [`## ${title}`, ""];
  if (sorted.length === 0) {
    chunks.push("_暂无。_", "");
  } else {
    for (const skill of sorted) chunks.push(skillLine(skill));
    chunks.push("");
  }
  return {
    body: chunks.join("\n"),
    toc: { label: title, anchor: sectionAnchor, subsections: [] },
  };
}

function renderToc(sections: TocSection[]): string {
  const lines = ["## 目录", ""];
  for (const section of sections) {
    lines.push(`- [${section.label}](#${section.anchor})`);
    for (const sub of section.subsections) {
      lines.push(`  - [${sub.label}](#${sub.anchor})`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

function uniqueRepos(skills: Skill[]): string[] {
  return [...new Set(skills.map((skill) => sourceAttribution(skill.source)))].sort();
}

function coverageLine(skills: Skill[], taxonomy: Taxonomy): string {
  const creationSkills = skills.filter((skill) => !isPublishingSkill(skill));
  const platformKeys = new Set(creationSkills.flatMap((skill) => skill.platforms));
  const typeKeys = new Set(creationSkills.flatMap((skill) => skill.content_types));
  const platforms = Object.entries(taxonomy.platforms)
    .filter(([key]) => platformKeys.has(key) && key !== "generic")
    .map(([, meta]) => meta.label);
  const types = Object.entries(taxonomy.content_types)
    .filter(([key]) => typeKeys.has(key))
    .map(([, meta]) => meta.label);
  const platformPart = platforms.length
    ? `覆盖${platforms.join("、")}`
    : "按发布渠道整理";
  const typePart = types.length
    ? `内容形态包括${types.join("、")}。`
    : "";
  return `当前精选 **${skills.length}** 项，${platformPart}。${typePart ? `\n\n${typePart}` : ""}`;
}

export function renderReadme(): string {
  const catalog = loadCatalog();
  const taxonomy = loadTaxonomy();
  const stars = loadStars();
  const skills = catalog.skills.filter((skill) => skill.status === "active");
  const anchorUsed = new Map<string, number>();

  const publishingSkills = skills.filter(isPublishingSkill);
  const platformSkills = skills;

  const publishingSection = flatSectionFor(
    "内容发布",
    publishingSkills,
    stars,
    anchorUsed,
  );

  const platformSection = sectionFor(
    "按平台",
    taxonomy.platforms,
    platformSkills,
    (skill) => skill.platforms,
    stars,
    anchorUsed,
    { exclude: isPublishingSkill },
  );

  const typeSection = sectionFor(
    "按创作类型",
    taxonomy.content_types,
    skills,
    (skill) => skill.content_types,
    stars,
    anchorUsed,
    { exclude: isPublishingSkill },
  );

  const formatSection = sectionFor(
    "按创作形式",
    taxonomy.formats,
    skills,
    (skill) => skill.formats,
    stars,
    anchorUsed,
    { exclude: isPublishingSkill },
  );

  const toc = renderToc([
    platformSection.toc,
    typeSection.toc,
    formatSection.toc,
    publishingSection.toc,
    {
      label: "安装",
      anchor: githubHeadingAnchor("安装", anchorUsed),
      subsections: [],
    },
    {
      label: "版权归属",
      anchor: githubHeadingAnchor("版权归属", anchorUsed),
      subsections: [],
    },
  ]);

  const repoList = uniqueRepos(skills)
    .map((repo) => `- ${repo}`)
    .join("\n");

  return `<!-- Generated by scripts/generate-readme.ts. Do not edit by hand. -->

# 创作技能合集

面向内容创作者的 **精选 Agent Skills** 目录。只收录与内容生产直接相关、可一键安装到 Cursor、Claude Code 等环境的技能，按发布渠道与内容形态整理。

${coverageLine(platformSkills, taxonomy)}

\`\`\`bash
npx skills add BigPengSays/awesome-creator-skills --skill <skill-id>
\`\`\`

${toc}

${platformSection.body}${typeSection.body}${formatSection.body}
${publishingSection.body}## 安装

安装单个技能：

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
