# Bilibili Video Document Template

Use this as the structural template when generating documents from Bilibili video subtitles.

```markdown
# {Video Title}

> 来源：B站视频 {BV号} | 主讲：{author/channel name}

---

## 一、概述

{1-3 paragraphs summarizing the video topic and what the viewer will learn}

### 1.1 背景

{Context/background of the topic}

### 1.2 核心主题

{Main subject of the video}

---

## 二、{First Major Topic}

{Content organized by logical sections}

### 2.1 {Sub-topic}

{Explanation + any code/config blocks}

```
{code/config if applicable}
```

### 2.2 {Sub-topic}

---

## 三、{Second Major Topic}

...

---

## 四、实战演示

{If the video includes a hands-on demo}

### 4.1 环境准备

### 4.2 操作步骤

### 4.3 效果验证

---

## N、总结与建议

{Key takeaways and recommendations}

- 要点1
- 要点2
- 要点3

---

*本文档由 AI 根据 B 站视频 AI 字幕自动提取整理，可能存在少量错漏，建议结合原视频学习。*
*原视频链接：{URL}*
```

## Section Mapping Guide

| Video Content Type | Document Section Type |
|---|---|
| Introduction/背景介绍 | 概述 |
| Concept explanation | 独立章节 + 子标题 |
| Step-by-step demo | 实战演示 > 操作步骤 |
| Code/config walkthrough | 代码块 (```) |
| Comparison (A vs B) | 表格 |
| Key takeaways | 总结 |
| Q&A / 互动 | 可选附录 |
