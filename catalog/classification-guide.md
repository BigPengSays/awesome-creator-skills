# Skill 分类指南（Agent 主观判断）

`catalog/skills.yaml` 里的 `platforms` / `content_types` / `formats` **不由脚本自动推断**，收录后由 agent 阅读 `skills/<id>/SKILL.md` 与上游 README，按本指南手工写入。

## 原则

1. **一个主类型**：`content_types` 只填 **1 个** 最能代表最终产出物的类型。不要因 skill 正文提到「文章配图」「图文排版」等辅助能力而叠加多个类型。
2. **平台可多个，但要克制**：只在 skill **明确服务** 某发布渠道时填写。`B站` / `b站` / `哔哩哔哩` 统一写 `bilibili`。无特定渠道时用 `generic`，不要同时写 `generic` 与其他平台。
3. **形式可选**：`formats` 最多 **1 个**，仅当某种创作形式（口播、白板视频、教程等）是 skill 的核心卖点时才填；否则留空数组 `[]`。
4. **发布 vs 创作**：发布类 skill（`post-to-*`、`video-publisher`、草稿上传等）由 README **内容发布** 区块展示；`content_types` 仍写其发布的主要内容形态（通常是 `article` 或 `video`）。

## 类型怎么选（看最终交付物）

| 类型 key | 何时选 |
| --- | --- |
| `article` | 主要产出是可发布的文稿、HTML、排版后的长文 |
| `image` | 主要产出是单张或系列静态图（封面、插图、场景图） |
| `image-text` | 主要产出是图文混排卡片、轮播页、小红书笔记页 |
| `video` | 主要产出是视频文件、切片、字幕包、发布视频 |
| `slides` | 主要产出是演示稿、PPT、翻页 deck |
| `comic` | 主要产出是多格漫画 |
| `infographic` | 主要产出是信息图、数据可视化长图 |

## 平台怎么选

| 平台 key | 何时选 |
| --- | --- |
| `wechat-oa` | 微信公众号文章、草稿、封面、排版 |
| `xiaohongshu` | 小红书笔记、种草图文、竖版卡片 |
| `youtube` | YouTube 视频、字幕、频道内容 |
| `x` | X / Twitter 推文与长文 |
| `weibo` | 微博、头条文章 |
| `bilibili` | 哔哩哔哩 / B 站视频与封面 |
| `linkedin` | LinkedIn 帖子与文章 |
| `generic` | 跨平台通用工具，无单一主渠道 |

## 收录后必做

导入或 vendor 后，在提交前：

1. 阅读 `skills/<id>/SKILL.md`（必要时看 references）
2. 按上表写入 **唯一主类型** 与必要平台
3. 写一句中文 `summary`
4. 运行 `npm run generate-readme` 检查 README 是否只出现在预期分类下

脚本入库时 `platforms` / `content_types` / `formats` 默认为空；**空数组表示尚未分类，不应推送到 main**。
