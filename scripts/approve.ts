import { readFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { loadRejected, saveRejected, candidateKey } from "./lib/catalog.ts";
import { parseCandidateBlock } from "./lib/issue.ts";
import { vendorSkill } from "./vendor-skill.ts";
import { generateReadme } from "./generate-readme.ts";

const execFileAsync = promisify(execFile);

interface IssueCommentEvent {
  action?: string;
  comment?: { body?: string };
  issue?: { number?: number; body?: string; labels?: Array<{ name: string }> };
}

function loadEvent(): IssueCommentEvent {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!path) throw new Error("GITHUB_EVENT_PATH is not set");
  return JSON.parse(readFileSync(path, "utf8")) as IssueCommentEvent;
}

async function commentOnIssue(number: number, body: string): Promise<void> {
  await execFileAsync("gh", ["issue", "comment", String(number), "--body", body]);
}

async function closeIssue(number: number): Promise<void> {
  await execFileAsync("gh", ["issue", "close", String(number), "--reason", "completed"]);
}

async function main(): Promise<void> {
  const event = loadEvent();
  const body = event.comment?.body?.trim() ?? "";
  const issue = event.issue;
  if (!issue?.number || !issue.body) {
    console.log("No issue payload; skip.");
    return;
  }
  const labels = (issue.labels ?? []).map((item) => item.name);
  if (!labels.includes("candidate")) {
    console.log("Issue is not a candidate; skip.");
    return;
  }

  if (body.startsWith("/reject")) {
    const reason = body.replace(/^\/reject\s*/, "").trim() || "rejected";
    const meta = parseCandidateBlock(issue.body);
    const rejected = loadRejected();
    if (!rejected.rejected.some((item) => candidateKey(item.repo, item.path) === candidateKey(meta.repo, meta.path))) {
      rejected.rejected.push({
        repo: meta.repo,
        path: meta.path,
        reason,
        rejected_at: new Date().toISOString(),
      });
      saveRejected(rejected);
    }
    await commentOnIssue(issue.number, `已拒绝：${reason}`);
    await closeIssue(issue.number);
    console.log(`Rejected ${meta.id}`);
    return;
  }

  if (!body.startsWith("/approve")) {
    console.log("Comment is not an approval command; skip.");
    return;
  }

  const meta = parseCandidateBlock(issue.body);
  await vendorSkill({
    repo: meta.repo,
    path: meta.path,
    id: meta.id,
    ref: meta.ref,
    platforms: meta.platforms,
    contentTypes: meta.content_types,
    formats: meta.formats,
    license: meta.license,
    summary: meta.summary,
    name: meta.name,
  });
  await generateReadme();
  await commentOnIssue(
    issue.number,
    `已 vendor \`${meta.id}\`。请检查变更并合并同步 PR / commit。`,
  );
  await closeIssue(issue.number);
}

const isDirect = process.argv[1]?.endsWith("approve.ts");
if (isDirect) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
