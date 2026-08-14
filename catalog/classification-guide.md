# Skill 分类指南（Agent 主观判断）

`catalog/skills.yaml` 里的 `role` / `platforms` / `content_types` / `formats` **不由脚本自动推断**，收录后由 agent 阅读 `skills/<id>/SKILL.md` 与上游 README，按本指南手工写入。

## 第一步：选 role

| role | 何时选 | README 展示位置 |
| --- | --- | --- |
| `publishing` | 主要工作是**发帖、上传草稿、投递视频**到平台 | 只在 **内容发布** |
| `creation` | 主要工作是**生成内容资产**（图、文、视频、PPT 等） | **按平台**、**按创作类型**、**按创作形式** |

**Publishing 示例**：`baoyu-post-to-wechat`、`baoyu-post-to-weibo`、`baoyu-post-to-x`、`md2wechat`、`video-publisher`

**Creation 示例**：封面/插图/信息图/PPT/字幕下载/视频剪辑/文风规范等一切「先做出内容」的工具

判断标准：**用户最终调用这个 skill 是为了发布，还是为了创作？** 两者都有时，看哪一步是 skill 的核心价值。

## 第二步：创作类 skill 的标签

仅当 `role: creation` 时需要填写下列字段（各出现在 README 对应分区）：

1. **一个主类型**：`content_types` 只填 **1 个** 最终产出物类型
2. **平台可多个**：只在 skill **明确服务** 某渠道时填写；`B站` / `b站` / `哔哩哔哩` → `bilibili`；无特定渠道用 `generic`
3. **形式可选**：`formats` 最多 **1 个**，且必须是核心卖点

`role: publishing` 的 skill **不会**出现在按平台/按创作类型/按创作形式中；仍需填写 `platforms` 与 `content_types` 供 catalog 检索，但 README 只在 **内容发布** 列出。

## 类型怎么选（看最终交付物）

| 类型 key | 何时选 |
| --- | --- |
| `article` | 文稿、HTML、排版后的长文、文风规范 |
| `image` | 单张或系列静态图（封面、插图、场景图） |
| `image-text` | 图文混排卡片、轮播页、小红书笔记页 |
| `video` | 视频文件、切片、字幕包 |
| `slides` | 演示稿、PPT、翻页 deck |
| `comic` | 多格漫画 |
| `infographic` | 信息图、数据可视化长图 |

## 平台怎么选

| 平台 key | 何时选 |
| --- | --- |
| `wechat-oa` | 微信公众号 |
| `xiaohongshu` | 小红书 |
| `youtube` | YouTube |
| `x` | X / Twitter |
| `weibo` | 微博 |
| `bilibili` | 哔哩哔哩 / B 站 |
| `linkedin` | LinkedIn |
| `generic` | 跨平台通用，无单一主渠道 |

## 收录后必做

1. 阅读 `skills/<id>/SKILL.md`
2. 写入 `role`，以及 creation 类所需的 platforms / content_types / formats
3. 写一句中文 `summary`
4. `npm run generate-readme`，确认每个 skill **只出现在预期分区**

不要提交 `role` 缺失或 tags 为空的条目。
