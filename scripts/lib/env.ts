import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_CHAT_ID = "oc_730268e329e336bfdb44364b1a8cab75";

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/** Load ~/.env_local when running locally. Does nothing in CI if the file is absent. */
export function loadLocalEnv(): void {
  const path = process.env.ENV_LOCAL_PATH || join(homedir(), ".env_local");
  if (existsSync(path)) {
    for (const raw of readFileSync(path, "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^export\s+([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const key = match[1];
      const value = stripQuotes(match[2].trim());
      if (!process.env[key]) process.env[key] = value;
    }
  }

  if (!process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN_FOR_peterRoo) {
    process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN_FOR_peterRoo;
  }
  if (!process.env.GH_TOKEN && process.env.GITHUB_TOKEN) {
    process.env.GH_TOKEN = process.env.GITHUB_TOKEN;
  }
  if (!process.env.FEISHU_CHAT_ID) {
    process.env.FEISHU_CHAT_ID = DEFAULT_CHAT_ID;
  }
}

loadLocalEnv();
