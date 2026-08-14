import { parse } from "yaml";

export interface CandidateMeta {
  id: string;
  name?: string;
  summary?: string;
  repo: string;
  path: string;
  ref?: string;
  license?: string;
  platforms?: string[];
  content_types?: string[];
  formats?: string[];
}

const BLOCK_RE = /<!--\s*catalog\s*\n([\s\S]*?)-->/;

export function encodeCandidateBlock(meta: CandidateMeta): string {
  return `<!-- catalog\n${stringifyish(meta)}-->`;
}

function stringifyish(meta: CandidateMeta): string {
  const lines = [
    `id: ${meta.id}`,
    `name: ${meta.name ?? meta.id}`,
    `summary: ${JSON.stringify(meta.summary ?? "")}`,
    `repo: ${meta.repo}`,
    `path: ${meta.path}`,
    `ref: ${meta.ref ?? "main"}`,
  ];
  if (meta.license) lines.push(`license: ${meta.license}`);
  if (meta.platforms?.length) lines.push(`platforms: [${meta.platforms.join(", ")}]`);
  if (meta.content_types?.length) lines.push(`content_types: [${meta.content_types.join(", ")}]`);
  if (meta.formats?.length) lines.push(`formats: [${meta.formats.join(", ")}]`);
  return `${lines.join("\n")}\n`;
}

export function parseCandidateBlock(body: string): CandidateMeta {
  const match = body.match(BLOCK_RE);
  if (!match) throw new Error("Issue body is missing the <!-- catalog --> block");
  const parsed = parse(match[1]) as CandidateMeta;
  if (!parsed?.id || !parsed.repo || !parsed.path) {
    throw new Error("catalog block requires id, repo, and path");
  }
  return parsed;
}

export function renderCandidateIssue(meta: CandidateMeta & { reason: string; stars?: number; url?: string }): string {
  const starLine = typeof meta.stars === "number" ? `- **stars**: ${meta.stars}` : "";
  return `## 创作 Skill 候选

请确认是否入库。确认后评论 \`/approve\`，拒绝评论 \`/reject <原因>\`。

- **id**: \`${meta.id}\`
- **name**: ${meta.name ?? meta.id}
- **summary**: ${meta.summary ?? ""}
- **repo**: ${meta.repo}
- **path**: \`${meta.path}\`
${starLine}
- **reason**: ${meta.reason}
${meta.url ? `- **link**: ${meta.url}` : ""}

${encodeCandidateBlock(meta)}
`;
}

export async function parseCandidateIssue(issueNumber: string): Promise<CandidateMeta> {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const execFileAsync = promisify(execFile);
  const { stdout } = await execFileAsync("gh", ["issue", "view", issueNumber, "--json", "body", "--jq", ".body"]);
  return parseCandidateBlock(stdout);
}

