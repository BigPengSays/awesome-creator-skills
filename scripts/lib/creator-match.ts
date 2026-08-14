export const CREATOR_RE =
  /wechat|xiaohongshu|小红书|公众号|微信|youtube|weibo|微博|bilibili|哔哩|linkedin|twitter|tiktok|douyin|抖音|infographic|copywriting|文案|推文|图文|封面|slides?|幻灯|comic|漫画|whiteboard|newsletter|rednote|tweet|配图|信息图|口播|叙事/i;

export const EXCLUDE_RE =
  /\b(kubernetes|terraform|prisma|docker compose|github actions ci|eslint|webpack|postgres dba)\b/i;

const PLATFORM_RULES: Array<{ key: string; re: RegExp }> = [
  { key: "wechat-oa", re: /wechat|公众号|微信/i },
  { key: "xiaohongshu", re: /xiaohongshu|小红书|rednote|xhs/i },
  { key: "youtube", re: /youtube/i },
  { key: "x", re: /twitter|\btweets?\b|推文|x articles?/i },
  { key: "weibo", re: /weibo|微博/i },
  { key: "linkedin", re: /linkedin/i },
  { key: "bilibili", re: /bilibili|哔哩|[Bb]\s*站/i },
];

export function slugId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isCreatorSkillText(text: string): boolean {
  if (!CREATOR_RE.test(text)) return false;
  if (EXCLUDE_RE.test(text) && !CREATOR_RE.test(text.replace(EXCLUDE_RE, ""))) return false;
  return true;
}

function matchKeys(text: string, rules: Array<{ key: string; re: RegExp }>): string[] {
  const keys: string[] = [];
  for (const rule of rules) {
    if (rule.re.test(text) && !keys.includes(rule.key)) keys.push(rule.key);
  }
  return keys;
}

/** Optional hint for agents; never written to catalog automatically. */
export function suggestPlatforms(text: string): string[] {
  const keys = matchKeys(text, PLATFORM_RULES);
  return keys.length > 0 ? keys : ["generic"];
}

export function inferTaxonomy(_text: string): {
  platforms: string[];
  content_types: string[];
  formats: string[];
} {
  return {
    platforms: [],
    content_types: [],
    formats: [],
  };
}

export function shortenSummary(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const cut = trimmed.search(/。|\.(?:\s|$)/);
  const first = cut > 20 ? trimmed.slice(0, cut + 1).trim() : trimmed;
  return first.length > 160 ? `${first.slice(0, 157)}…` : first;
}

export function uniqueSkillId(existingIds: Set<string>, preferred: string, extra: string): string {
  const base = preferred || slugId(extra) || "skill";
  if (!existingIds.has(base)) return base;
  const alt = slugId(`${extra}-${base}`) || base;
  if (!existingIds.has(alt)) return alt;
  let index = 2;
  while (existingIds.has(`${alt}-${index}`)) index += 1;
  return `${alt}-${index}`;
}
