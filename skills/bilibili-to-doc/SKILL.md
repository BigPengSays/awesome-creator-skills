---
name: bilibili-to-doc
description: >
  This skill should be used when the user asks to "提取B站视频", "B站视频转文档",
  "bilibili视频提取", "将B站视频转文字", or provides a bilibili.com video URL
  and wants to extract its content into a structured Markdown document.
  Automatically downloads AI subtitles (Chinese) via yt-dlp, parses SRT,
  and generates a well-formatted tutorial/article document.
version: 0.1.0
---

# Bilibili Video to Document (B站视频提取文档)

## Overview

Extract Bilibili video content into a structured Markdown document by: (1) downloading AI-generated subtitles via yt-dlp with browser cookies, (2) parsing the SRT subtitle file, (3) reorganizing the transcript into a logical, well-structured document with sections, tables, and code blocks.

## When to Use

Trigger this skill when the user:
- Provides a bilibili.com video URL and asks to extract/converter it to a document
- "提取B站视频内容" / "B站视频转文档" / "将视频转成文章"
- "把这个B站视频整理成笔记"
- "generate document from Bilibili video"

## Prerequisites

- `yt-dlp` must be installed: `pip3 install yt-dlp`
- Browser cookies are needed for Bilibili access (Chrome or other browser)
- Python 3.10+ for subtitle processing

## Workflow

### Step 1: Download Subtitles

Use yt-dlp with browser cookies to download the AI Chinese subtitles:

```bash
yt-dlp --cookies-from-browser chrome "<BILIBILI_URL>" \
  --write-subs --sub-lang ai-zh \
  --skip-download \
  -o "/tmp/bilibili_output"
```

Also get the video title:

```bash
yt-dlp --cookies-from-browser chrome "<BILIBILI_URL>" \
  --print "%(title)s" --skip-download 2>&1 | tail -1
```

If `chrome` browser cookies are not available, try `safari`, `firefox`, or `edge`.

### Step 2: Parse SRT and Generate Document

Read the downloaded `.ai-zh.srt` file, then:

1. **Strip SRT formatting**: Remove sequence numbers, timestamps, empty lines
2. **Merge consecutive lines**: Combine fragmented subtitle lines into complete sentences
3. **Identify logical sections**: The AI should read through the full transcript and identify:
   - Topic/theme divisions
   - Step-by-step procedures
   - Key concepts and definitions
   - Configuration examples / code blocks
4. **Structure the document** with proper heading hierarchy

### Step 3: Document Structure

Generate a Markdown document following this structure (from reference template):

```markdown
# {Video Title}

> 来源：B站视频 {BV号} | 主讲：{author}

---

## 一、{Topic Overview}

{Summary of what the video covers}

## 二、{Main Content Sections}

{Organized by logical topic divisions}

## N、总结

{Key takeaways}
```

### Step 4: Save Output

Save to the user's Desktop by default: `~/Desktop/{Video_Title}.md`

## Document Writing Guidelines

- **Preserve technical details**: Configuration code, SQL, JSON, YAML, shell commands should be formatted in code blocks
- **Use tables for comparisons**: Feature comparisons, parameter lists, pros/cons
- **Bullet lists for key points**: Use hierarchical bullet points for nested concepts
- **Add section numbers**: Use Chinese numbered sections (一、二、三...) for main divisions
- **Keep code accurate**: If the speaker mentions specific config/code, represent it faithfully
- **Add explanatory notes**: Fill in gaps where the spoken word might be ambiguous without visuals
- **Trim filler content**: Remove repeated phrases, verbal fillers (嗯, 啊, 这个), and self-promotion segments
- **Mark at the end**: Add a disclaimer that the document is AI-generated from subtitles

## Reference

See `references/doc-template.md` for the full document template.
