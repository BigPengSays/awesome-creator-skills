# 贡献指南

本仓库是创作向 Agent Skills 的**策展镜像**：技能文件拷贝到 `skills/`，元数据在 `catalog/`，README 由脚本生成。

## 目录约定

- 磁盘扁平：`skills/<skill-id>/SKILL.md`
- 不要按平台或类型建物理子目录
- 标签写在 `catalog/skills.yaml`：`platforms` / `content_types` / `formats`
- 词表在 [`catalog/taxonomy.yaml`](catalog/taxonomy.yaml)

## 收录标准

只收**创作**相关技能，例如：

- 平台：微信公众号、小红书、YouTube、X、微博、LinkedIn、哔哩哔哩
- 类型：文章、图片、图文、视频、幻灯片、漫画、信息图
- 形式：白板视频、口播、图文视频、英文学习、教程、叙事

不收纯工程/运维技能（CI、K8s、数据库调优等），除非明确用于内容生产。

必须能确认再分发许可。无法确认 License 的只在 Issue 里讨论，不要 vendor。

## 手工入库

```bash
npm install
npm run vendor -- \
  --repo https://github.com/owner/repo \
  --path skills/the-skill \
  --id the-skill \
  --platforms xiaohongshu \
  --content-types image-text \
  --formats tutorial \
  --license MIT
```

脚本会：

1. 下载上游指定路径
2. 写入 `skills/<id>/` 和 `SOURCE.md`
3. 更新 `catalog/skills.yaml`
4. 重生成 README

`catalog/skills.yaml` 里的 `summary` 请写成一两句中文：技能做什么、相对同类的特点或优点，不要只写四个字，也不要保留 SKILL.md 里整段触发词。

## 从链接收录

维护者可以把一个或多个链接交给项目内 skill [`.agents/skills/add-creator-skills`](.agents/skills/add-creator-skills/SKILL.md)，或直接跑：

```bash
npm run ingest -- --dry-run https://github.com/owner/repo
npm run ingest -- https://github.com/owner/repo https://mp.weixin.qq.com/s/...
```

脚本会扫描仓库里全部 `SKILL.md`，只导入与本仓库收录标准吻合、且尚未入库的创作向技能，并刷新 star / `pushed_at`。公众号等文章若能解析出 GitHub 链接，会继续走 GitHub 流程；若只有内嵌 skill 正文：

```bash
npm run ingest -- --from-dir path/to/skill --url https://example.com/article
```

非 GitHub 拷贝写入 `source.type: url`、`sync: false`，README 不显示 star 徽章。许可无法确认时默认不入库。

不要把 `add-creator-skills` 本身写入公开 catalog。收录成功后列出改动，并直接提交、推送到 `main`。

## 发现与确认

每日（可手动触发）`discover` 会检索 GitHub、skills.sh 和若干 awesome 列表。新候选会：

1. 发到飞书群（需仓库 secrets：`FEISHU_APP_ID`、`FEISHU_APP_SECRET`、`FEISHU_CHAT_ID`）
2. 开 GitHub Issue（label: `candidate`）

本地运行会读取 `~/.env_local` 里的 `FEISHU_APP_ID` / `FEISHU_APP_SECRET`，以及 `GITHUB_TOKEN_FOR_peterRoo`。

在 Issue 评论：

- `/approve` — vendor 该技能并开 PR
- `/reject <原因>` — 写入 `catalog/rejected.yaml`，避免重复通知

## 上游同步

`sync: true` 的条目每天检查源仓库 `ref`。有变更时开 PR，不直接推 main。

默认策略是**上游覆盖镜像**。若你改了镜像内容，把该条目设为 `sync: false`。

## Star

README 用 [badgen](https://badgen.net) 的 GitHub stars 徽章展示**源仓库**实时 star。`catalog/stars.yaml` 缓存 star 和最近推送时间 `pushed_at`。每个分类按 `stars × 2^(-ageDays/21)` 排序：star 权值约每 21 天减半，所以 1k star 且 7 天内更新会排在 4k star 但已两个月未更新的前面。非 GitHub 来源不显示徽章，排在分类末尾。

## 本地命令

| 命令 | 作用 |
| --- | --- |
| `npm run ingest -- <url...>` | 从 GitHub 或文章链接收录创作向技能 |
| `npm run vendor -- --repo ... --path ...` | 入库 |
| `npm run sync` | 从上游同步 |
| `npm run refresh-stars` | 刷新 star、最近提交时间并重生成 README |
| `npm run generate-readme` | 只重生成 README |
| `npm run discover` | 抓取候选、开 Issue、通知飞书 |
