import "./lib/env.ts";
import type { Candidate } from "./lib/types.ts";

function truncate(text: string, max = 400): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function cardPayload(candidates: Candidate[], issueUrls: string[]) {
  const lines = candidates.map((candidate, index) => {
    const stars = typeof candidate.stars === "number" ? ` ★${candidate.stars}` : "";
    const issue = issueUrls[index] ? ` [Issue](${issueUrls[index]})` : "";
    return `${index + 1}. **${candidate.id}**${stars} — ${truncate(candidate.summary)}\n来源：${candidate.repo} \`${candidate.path}\`${issue}\n原因：${candidate.reason}`;
  });

  return {
    header: {
      title: {
        tag: "plain_text",
        content: `发现 ${candidates.length} 个创作 Skill 候选`,
      },
      template: "blue",
    },
    elements: [
      {
        tag: "div",
        text: {
          tag: "lark_md",
          content: `${lines.join("\n\n")}\n\n请到对应 GitHub Issue 评论 \`/approve\` 或 \`/reject\`。`,
        },
      },
    ],
  };
}

async function tenantAccessToken(appId: string, appSecret: string): Promise<string> {
  const res = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });
  const data = (await res.json()) as { code?: number; msg?: string; tenant_access_token?: string };
  if (!res.ok || data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Feishu tenant token failed: ${data.code ?? res.status} ${data.msg ?? res.statusText}`);
  }
  return data.tenant_access_token;
}

async function sendViaApp(candidates: Candidate[], issueUrls: string[]): Promise<void> {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  const chatId = process.env.FEISHU_CHAT_ID;
  if (!appId || !appSecret || !chatId) return;

  const token = await tenantAccessToken(appId, appSecret);
  const card = cardPayload(candidates, issueUrls);
  const res = await fetch("https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      receive_id: chatId,
      msg_type: "interactive",
      content: JSON.stringify(card),
    }),
  });
  const data = (await res.json()) as { code?: number; msg?: string };
  if (!res.ok || (data.code != null && data.code !== 0)) {
    throw new Error(`Feishu IM send failed: ${data.code ?? res.status} ${data.msg ?? res.statusText}`);
  }
  console.log("Feishu notification sent via app + chat_id.");
}

async function sendViaWebhook(candidates: Candidate[], issueUrls: string[]): Promise<void> {
  const webhook = process.env.FEISHU_WEBHOOK_URL;
  if (!webhook) return;

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      msg_type: "interactive",
      card: cardPayload(candidates, issueUrls),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Feishu webhook failed: ${res.status} ${text}`);
  }
  console.log("Feishu notification sent via webhook.");
}

export async function notifyFeishu(candidates: Candidate[], issueUrls: string[]): Promise<void> {
  if (candidates.length === 0) return;
  if (process.env.FEISHU_APP_ID && process.env.FEISHU_APP_SECRET && process.env.FEISHU_CHAT_ID) {
    await sendViaApp(candidates, issueUrls);
    return;
  }
  if (process.env.FEISHU_WEBHOOK_URL) {
    await sendViaWebhook(candidates, issueUrls);
    return;
  }
  console.log("Feishu credentials not set; skip notify.");
}
