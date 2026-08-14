# 贡献指南

本仓库是创作向 Agent Skills 的**策展镜像**：技能文件在 `skills/`，元数据在 `catalog/`，README 由脚本生成。

## 收录标准

只收**创作**相关技能，例如：

- 平台：微信公众号、小红书、YouTube、X、微博、LinkedIn、哔哩哔哩
- 类型：文章、图片、图文、视频、幻灯片、漫画、信息图
- 形式：白板视频、口播、图文视频、教程、叙事

不收纯工程/运维技能（CI、K8s、数据库调优等），除非明确用于内容生产。

必须能确认再分发许可。无法确认 License 的只在 Issue 里讨论，不要入库。

## 添加技能

在本仓库打开 Cursor（或 Claude Code 等支持 Agent Skills 的环境），使用项目自带的 **[add-creator-skills](.agents/skills/add-creator-skills/SKILL.md)** 技能即可。

把链接发给 agent，例如：

- GitHub 仓库或 `SKILL.md` 路径
- 介绍技能的公众号文章（`mp.weixin.qq.com` 等）

agent 会完成筛选、拷贝、分类、更新 README 等步骤。多 skill 仓库会自动扫描；许可不明时会停下来等你确认。

不方便跑 agent 时，也可以 [开 Issue](https://github.com/BigPengSays/awesome-creator-skills/issues/new) 附上链接，由维护者处理。

## 分类

标签写在 `catalog/skills.yaml`：`role` / `platforms` / `content_types` / `formats`。词表见 [`catalog/taxonomy.yaml`](catalog/taxonomy.yaml)。**分类由 agent 阅读技能后判断**，规则见 [`catalog/classification-guide.md`](catalog/classification-guide.md)。

`summary` 请写成一两句中文：技能做什么、相对同类的特点，不要只写四个字，也不要整段复制 SKILL.md 的触发词。
