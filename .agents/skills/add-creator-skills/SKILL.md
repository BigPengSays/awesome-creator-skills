---
name: add-creator-skills
description: Add creator-focused Agent Skills from one or more URLs into this catalog. Handles GitHub skill repos (including multi-skill trees), WeChat official-account articles, and other pages that introduce skills. Use when the user asks to add-creator-skills, 收录技能, 导入 skill, 从链接添加, ingest, vendor from url, or paste GitHub / 微信文章 / 公众号 links that describe skills.
---

# Add creator skills

Turn GitHub skill repos or articles about skills into catalog entries in this repository. Do not add this maintainer skill itself to `catalog/skills.yaml`.

## When to use

User provides one or more links such as:

- `https://github.com/owner/repo`
- a path to `SKILL.md` / `tree/` / `blob/`
- a WeChat article (`mp.weixin.qq.com`) or other post that introduces a skill

## Workflow

1. Classify each URL: GitHub vs article.
2. **Dry-run first.** Print import / skip / blocked, then vendor only the import rows.
3. GitHub: scan every `SKILL.md`, keep creator-aligned skills, skip cataloged/rejected, block unknown licenses.
4. Article: fetch body, extract GitHub / skills.sh links, then follow the GitHub path. If the page embeds a full skill and has no GitHub source, copy it as `source.type: url`.
5. Regenerate README. Refresh stars for new git sources.
6. Polish catalog `summary` into one Chinese sentence. **Classify by reading the skill** — follow [`catalog/classification-guide.md`](../../../catalog/classification-guide.md): set `role` (`publishing` or `creation`), then one primary `content_types`, necessary `platforms`, optional single `format`. Ingest leaves tags empty.
7. Tell the user what changed (imported / skipped / blocked, plus classification and summary edits).
8. **Commit and push immediately.** Do not wait for another confirmation.

### After import: report, commit, push

Report in this shape, then git:

```text
Imported: <id> from <repo or url> (license, role, platforms, content type)
Skipped: ...
Blocked: ...
Catalog polish: ...
```

Then add the touched catalog, `skills/<id>/`, README, and star cache. Commit with a message like `Add <skill-id> from <source>.` If you also changed this maintainer skill, include that in the same commit or a second one. Push `HEAD` to `origin/main`.

Follow this repository's existing git author and GitHub push method. Do not update git config. Do not force-push. Strip a `Co-authored-by: Cursor` trailer if a hook adds it.

### Commands

```bash
npm run ingest -- --dry-run <url...>
npm run ingest -- <url...>
npm run ingest -- --allow-unknown-license <url...>
npm run ingest -- --from-dir <skill-dir> --url <article-url>
```

Single known GitHub skill (existing path):

```bash
npm run vendor -- --repo <url> --path skills/<id> --platforms ... --content-types ... --license MIT
```

Non-GitHub copy:

```bash
npm run vendor -- --from-url <article-url> --from-dir <skill-dir>
```

After git imports, `npm run ingest` already calls `refresh-stars` and `generate-readme`.

### Article fetch order

1. `npm run ingest -- --dry-run <article>` (plain fetch).
2. If output contains `ARTICLE_FETCH_REQUIRED`, fetch with WebFetch, browser, or URL-to-markdown.
3. Pull `github.com` / `skills.sh` links from the markdown and run ingest on those URLs.
4. If the article embeds YAML frontmatter + `SKILL.md` body and has no GitHub repo: write files under a temp dir and run `--from-dir --url`.

### Creator filter

Keep a skill only if name, description, path, or body match creator platforms/types (WeChat, 小红书, YouTube, X, 微博, 文章/图片/图文/视频/幻灯片/漫画/信息图, etc.). Drop infra/CI/K8s-style skills unless they are clearly for content production.

### Classification (agent, not script)

After vendor, read `skills/<id>/SKILL.md` and [`catalog/classification-guide.md`](../../../catalog/classification-guide.md).

**First decide `role`:**

- `publishing` — post/upload/draft to a platform (`post-to-*`, `video-publisher`, WeChat draft upload). README lists these **only** under **内容发布**.
- `creation` — generate images, articles, videos, slides, etc. README lists under **按平台** / **按创作类型** / **按创作形式**.

Then for `role: creation`, write **one** `content_types`, only the `platforms` the skill serves, and at most one `formats`. For `role: publishing`, still record `platforms` and the main published `content_types`, but the skill must not appear outside **内容发布** in README.

`B站` / `b站` / `哔哩哔哩` → `bilibili`.

Do not commit without `role`, `platforms`, and `content_types`.

### License gate

GitHub: use the repo SPDX license. If missing/`NOASSERTION`, **do not vendor**. Report `blocked` and wait for the user (or `--allow-unknown-license` after they confirm redistribution).

URL copies: record the article URL in `SOURCE.md`, `sync: false`, no star badge.

### Multi-skill repos

Scan the whole tree (e.g. `skills/*/SKILL.md` plus a root `SKILL.md`). Import every creator match that is not already in the catalog. Skip the rest with reasons.

### Output

Before writing, list:

- **import** — will vendor
- **skip** — already cataloged, rejected, or not creator-related
- **blocked** — license unknown
- **article** — fetch still needed, or GitHub links extracted

This skill is a maintainer tool. Never catalog it as a public creator skill.
