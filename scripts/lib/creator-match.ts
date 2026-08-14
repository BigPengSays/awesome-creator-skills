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
  { key: "bilibili", re: /bilibili|哔哩/i },
];

const CONTENT_TYPE_RULES: Array<{ key: string; re: RegExp }> = [
  { key: "infographic", re: /infographic|信息图/i },
  { key: "comic", re: /comic|漫画/i },
  { key: "slides", re: /slides?|幻灯|ppt|deck/i },
  { key: "image-text", re: /图文|image-text|卡片/i },
  { key: "image", re: /封面|配图|cover image|illustrat/i },
  { key: "video", re: /video|视频|字幕|切片|transcript|clipper/i },
  { key: "article", re: /article|文章|markdown|排版/i },
];

const FORMAT_RULES: Array<{ key: string; re: RegExp }> = [
  { key: "tutorial", re: /tutorial|教程/i },
  { key: "storytelling", re: /storytelling|叙事|漫画/i },
  { key: "whiteboard-video", re: /whiteboard|白板/i },
  { key: "talking-head", re: /talking-?head|口播/i },
  { key: "image-text-video", re: /图文视频/i },
  { key: "english-learning", re: /english learning|英文学习/i },
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

export function inferTaxonomy(text: string): {
  platforms: string[];
  content_types: string[];
  formats: string[];
} {
  const platforms = matchKeys(text, PLATFORM_RULES);
  return {
    platforms: platforms.length > 0 ? platforms : ["generic"],
    content_types: matchKeys(text, CONTENT_TYPE_RULES),
    formats: matchKeys(text, FORMAT_RULES),
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
