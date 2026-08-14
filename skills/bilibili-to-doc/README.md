# bilibili-to-doc — 哔哩哔哩视频转文档

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Skill-blue)](https://claude.ai/code)

一个 [Claude Code](https://claude.ai/code) Skill，自动将 B 站视频的 AI 字幕提取并整理成结构化 Markdown 文档。非常适合快速将技术教程、知识分享类视频转化为可检索的笔记 / 参考文档。

A [Claude Code](https://claude.ai/code) skill that automatically extracts Bilibili video AI subtitles and reorganizes them into well-structured Markdown documents. Perfect for turning tech tutorials and educational videos into searchable, shareable written notes.

---

## 效果展示 / Demo

**输入**：一个 B 站视频链接

**输出**：一份结构化的教程文档，包含目录、代码块、表格、要点总结

| Before (原始字幕) | After (结构化文档) |
|---|---|
| 碎片化的逐句字幕，含时间戳 | 有章节标题、代码块、表格的 Markdown 文章 |

<details>
<summary>📄 点击查看输出示例</summary>

```markdown
# 【IT老齐772】ETL中间件 SeaTunnel 快速上手

## 一、SeaTunnel 概述
### 1.1 什么是 SeaTunnel
SeaTunnel 是 Apache 孵化开源的 ETL 工具...

### 1.2 核心优势：简单易用
只要会写 SQL 语句，就能完成 ETL 的工作。

## 二、案例演示：MySQL → Redis 准实时同步
...

## 三、环境准备
### 3.2 Docker Compose 编排
- 1 个主节点（Master）：负责管理和资源调度
- 2 个工作节点（Worker）：具体执行数据处理任务

## 四、任务配置（HOCON 格式）
```hocon
{
  source { MySQL-CDC { ... } }
  transform { Sql { ... } }
  sink { Redis { ... } }
}
```
```

</details>

---

## 安装 / Installation

### 前置依赖 / Prerequisites

- [Claude Code](https://claude.ai/code) CLI
- Python 3.10+
- `yt-dlp`（用于下载字幕 / for downloading subtitles）
- 浏览器（Chrome/Safari/Firefox/Edge 任一，用于读取 cookies 以访问 B 站）

```bash
pip3 install yt-dlp
```

### 安装 Skill

```bash
# 克隆仓库到 Claude Code skills 目录
git clone https://github.com/programmerloverun/bilibili-to-doc.git ~/.claude/skills/bilibili-to-doc
```

安装后，在 Claude Code 对话中发送 B 站视频链接即可自动触发。

---

## 使用方法 / Usage

### 基本使用 / Basic

```
你：把这个B站视频整理成文档 https://www.bilibili.com/video/BV1v5TuzJE4v
Claude：正在下载字幕... 正在生成文档... ✅ 已保存到桌面
```

### 触发关键词 / Trigger Phrases

| 中文 | English |
|---|---|
| "提取B站视频" | "extract Bilibili video" |
| "B站视频转文档" | "convert Bilibili to doc" |
| "把这个B站视频整理成笔记" | "turn this Bilibili video into notes" |

或者直接粘贴 `bilibili.com/video/BV...` 链接并说明需求。

### 输出位置 / Output Location

默认保存到桌面：`~/Desktop/{视频标题}.md`

---

## 工作原理 / How It Works

```
B站视频链接
  │
  ├─► yt-dlp + 浏览器 Cookies 下载 AI 中文字幕 (.srt)
  │
  ├─► 解析 SRT，去除时间戳和编号，合并碎片句子
  │
  ├─► AI 识别逻辑章节，将文字重组为结构化文档
  │      ├─ 章节标题
  │      ├─ 代码块（配置 / SQL / Shell）
  │      ├─ 对比表格
  │      └─ 要点总结
  │
  └─► 输出 Markdown 文件到桌面
```

---

## 适用场景 / Use Cases

- 📖 **技术教程** — 将 B 站上的编程 / 架构 / DevOps 视频转为可检索的参考文档
- 📝 **学习笔记** — 快速将教学视频内容整理为复习笔记
- 🔍 **知识管理** — 为视频内容建立全文可搜索的文字档案
- 📤 **内容分发** — 将视频内容转文字后发布到博客、公众号等平台

---

## 注意事项 / Notes

1. **需要登录态**：B 站 AI 字幕需要登录账号才能获取，因此必须通过浏览器 cookies 认证
2. **字幕依赖**：依赖 B 站 AI 自动生成的字幕，如果视频没有 AI 字幕则无法提取
3. **质量说明**：AI 字幕可能存在少量识别错误，文档末尾会标注"由 AI 自动生成"
4. **浏览器选择**：如果 Chrome 不可用，可以在 SKILL.md 中修改为 `safari` / `firefox` / `edge`

---

## 项目结构 / Project Structure

```
bilibili-to-doc/
├── SKILL.md                      # Skill 定义文件（Claude Code 加载入口）
├── references/
│   └── doc-template.md           # 文档模板参考
├── README.md                     # 本文件
└── LICENSE                       # MIT License
```

---

## 自定义 / Customization

编辑 `SKILL.md` 中的 Workflow 部分即可调整行为：

- **目标语言**：修改 `--sub-lang` 参数（如 `ai-en` 获取英文字幕）
- **输出路径**：修改 Save Output 步骤中的路径
- **文档风格**：编辑 `references/doc-template.md` 调整模板结构

---

## License

MIT © [programmerloverun](https://github.com/programmerloverun)

---

## 贡献 / Contributing

欢迎提 Issue 和 PR！

如果你有好的改进建议（比如支持更多语言字幕、支持视频下载后本地转写等），欢迎一起完善。

Welcome to open Issues and PRs! Ideas like supporting more subtitle languages, offline speech-to-text fallback, etc. are all welcome.
