import { writeFileSync } from "node:fs";
import { loadCatalog, loadStars, loadTaxonomy } from "./lib/catalog.ts";
import { parseGithubRepo } from "./lib/github.ts";
import { README_MD } from "./lib/paths.ts";
import { sortSkills } from "./lib/rank.ts";
import {
  isPublishingSkill,
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
    lines.push(`**[${section.label}](#${section.anchor})**`);
    if (section.subsections.length > 0) {
      const subs = section.subsections
        .map((sub) => `[${sub.label}](#${sub.anchor})`)
        .join(" · ");
      lines.push("");
      lines.push(`> ${subs}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function platformLine(skills: Skill[], taxonomy: Taxonomy): string {
  const creationSkills = skills.filter((skill) => !isPublishingSkill(skill));
  const platformKeys = new Set(creationSkills.flatMap((skill) => skill.platforms));
  return Object.entries(taxonomy.platforms)
    .filter(([key]) => platformKeys.has(key) && key !== "generic")
    .map(([, meta]) => meta.label)
    .join(" · ");
}

function typeLine(skills: Skill[], taxonomy: Taxonomy): string {
  const creationSkills = skills.filter((skill) => !isPublishingSkill(skill));
  const typeKeys = new Set(creationSkills.flatMap((skill) => skill.content_types));
  return Object.entries(taxonomy.content_types)
    .filter(([key]) => typeKeys.has(key))
    .map(([, meta]) => meta.label)
    .join(" · ");
}

function renderHeader(skills: Skill[], taxonomy: Taxonomy): string {
  const platforms = platformLine(skills, taxonomy);
  const types = typeLine(skills, taxonomy);
  const repo = "https://github.com/BigPengSays/awesome-creator-skills";

  return `<h1 align="center">内容创作者 Skill 精选大合集</h1>

<p align="center">
<a href="https://github.com/BigPengSays"><img alt="BigPengSays" src="https://img.shields.io/badge/Made%20by%20BigPengSays-000?logoColor=fff" /></a>
<a href="${repo}"><img alt="Skills" src="https://img.shields.io/badge/skills-${skills.length}-2ea043?logoColor=fff" /></a>
<a href="${repo}/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/BigPengSays/awesome-creator-skills?color=blue" /></a>
</p>

<p align="center">
  <img src="assets/readme/xiaohei-header.jpg" alt="内容创作者 Skill 精选大合集 — Ian 小黑风格 header 配图" width="100%" />
</p>

面向内容创作的 **Agent Skills** 精选合集。每个 skill 入库前都经过人工筛选与验证，多数也是维护者日常在用的工具——不是 star 排行榜，而是可以直接装进 Agent 的创作工作流。

- **平台覆盖：** ${platforms || "多平台"}
- **内容形态：** ${types || "多种创作类型"}
- **当前收录：** **${skills.length}** 个精选 skill，[持续更新中](CONTRIBUTING.md)

## 快速开始

支持 [Cursor](https://cursor.com)、[Claude Code](https://docs.anthropic.com/en/docs/claude-code) 等 Agent 环境，一条命令即可安装：

\`\`\`bash
npx skills add BigPengSays/awesome-creator-skills --skill <skill-id>
\`\`\`

安装全部 skill 或查看其他安装方式，见下方 [安装](#安装) 章节。

---

发现好用的创作 skill？[欢迎投稿](CONTRIBUTING.md) · 提 Issue 或 PR`;
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

  return `<!-- Generated by scripts/generate-readme.ts. Do not edit by hand. -->

${renderHeader(skills, taxonomy)}

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

技能版权仍归原作者。本仓库目录与脚本采用 MIT 许可，各技能保留其上游许可证，详见 \`skills/<id>/SOURCE.md\`。
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
