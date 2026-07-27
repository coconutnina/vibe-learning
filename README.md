# vibe-learning

> Turn YouTube videos into interactive knowledge maps — watch smarter, retain more.

**Live demo → [video-to-note.vercel.app](https://video-to-note.vercel.app)**

---

## What it does

Paste a YouTube URL. Get an **AI-generated mind map where every node links directly to the video timestamp** where that concept is explained.

Three panels, one workflow:

```
[ Mind Map ]  ←→  [ Video Player ]  ←→  [ AI Assistant ]
   click node        bilingual subs        ask about any segment
   → jump to video
```

Built for content where you actually need to understand, not just skim — technical courses, academic lectures, long-form talks.

---

## Getting started

```bash
# Clone the repo
git clone https://github.com/coconutnina/vibe-learning.git
cd vibe-learning/web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in the seven variables listed in .env.example

# Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features

- **Timestamp-linked mind map** — click any node to jump to that moment in the video
- **Bilingual subtitles** — original + translated, synced with playback
- **AI assistant** — ask questions about specific segments, not just the whole video
- **Streaming generation** — real-time progress as the mind map builds
- **Cross-user caching** — popular videos don't re-generate from scratch

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) | API routes + streaming in one repo |
| Language | TypeScript | — |
| Mind map | React Flow | Handles node drag/zoom/pan; not the core differentiator |
| AI model | DeepSeek | 1/10th cost of GPT-4; 1M context fits full transcripts without chunking |
| Streaming | NDJSON via ReadableStream | Bypasses Vercel's 10s timeout limit for long generation |
| Auth + DB | Supabase | Quota system, user sessions, caching layer |
| Deployment | Vercel | — |

---

## Design decisions

**Why timestamp-linked nodes, not static export**
A mind map that doesn't link back to the video is just another summary. The harder implementation (timestamp extraction at parse time, node-to-segment mapping, cross-panel state sync) is what makes the map a navigation tool rather than a read-once artifact.

**Why indented text output instead of JSON**
LLMs truncate long JSON structures unpredictably — the client receives broken output and throws. Indented text is more resilient and uses ~60% fewer tokens. Less elegant, more reliable.

**Why two-stage generation**
One prompt doing both "build structure" and "fill content" does both poorly. Stage 1 generates node titles and hierarchy. Stage 2 enriches leaf nodes with detail. Focused prompts, better output.

---

## Status

Private beta. Core loop is working; pre-public checklist:

- [x] YouTube → mind map with timestamp sync
- [x] Bilingual subtitles
- [x] AI assistant (segment-aware)
- [x] Quota system + caching
- [ ] Watch history / user library
- [ ] Timestamp accuracy improvements
- [ ] Mobile layout

---

---

# 中文说明

> 把 YouTube 视频变成可交互的知识地图——边看边学，真正理解。

**在线体验 → [video-to-note.vercel.app](https://video-to-note.vercel.app)**

---

## 这是什么

粘贴一个 YouTube 链接，生成一张 **AI 思维导图——每个节点直接绑定对应视频时间戳**，点击即跳转。

三栏布局：

```
[ 思维导图 ]  ←→  [ 视频播放器 ]  ←→  [ AI 助手 ]
  点击节点          双语字幕            针对任意片段提问
  → 跳转到视频
```

适合需要真正理解的内容——技术课程、学术讲座、深度分析视频。

---

## 本地运行

```bash
git clone https://github.com/coconutnina/vibe-learning.git
cd vibe-learning/web

npm install

cp .env.example .env.local
# 填入 .env.example 中列出的 7 个环境变量

npm run dev
```

---

## 核心功能

- **时间戳联动脑图** — 点击节点直接跳转到视频对应位置
- **双语字幕** — 原文 + 翻译，与播放进度同步
- **AI 助手** — 针对具体片段提问，而不只是问整个视频
- **流式生成** — 实时展示脑图生成进度
- **跨用户缓存** — 热门视频不重复调用 API

---

## 技术栈

| 层级 | 选择 | 原因 |
|---|---|---|
| 框架 | Next.js (App Router) | API 路由 + streaming 在同一个 repo |
| 语言 | TypeScript | — |
| 脑图渲染 | React Flow | 节点拖拽/缩放交互成本高，外包给成熟库 |
| AI 模型 | DeepSeek | 成本约为 GPT-4 的十分之一；百万上下文窗口支持完整字幕一次输入 |
| Streaming | NDJSON ReadableStream | 绕过 Vercel Hobby 10 秒超时限制 |
| Auth + 存储 | Supabase | 配额系统、用户 session、缓存层 |
| 部署 | Vercel | — |

---

## 设计决策

**为什么做时间戳联动而不是静态导出**
不能跳转回视频的脑图，本质上还是摘要。更高的实现复杂度（字幕解析时提取时间戳、建立节点映射、跨面板状态同步）换来的是脑图真正成为导航工具，而不是看完一次就没用的输出物。

**为什么用缩进文本而不是 JSON**
LLM 生成长 JSON 时频繁截断，客户端拿到残缺结构直接报错。改成缩进文本后稳定性大幅提升，token 消耗减少约 60%。

**为什么分两阶段生成**
让一次调用同时完成"构建结构"和"填充内容"，两件事都做得平庸。第一阶段只生成节点标题和层级，第二阶段专门做内容 enrichment——目标单一，质量更好。

---

## 当前状态

私测阶段，核心功能已上线：

- [x] YouTube → 时间戳联动思维导图
- [x] 双语字幕
- [x] AI 助手（支持分段提问）
- [x] 配额系统 + 跨用户缓存
- [ ] 历史记录 / 用户内容库
- [ ] 时间戳精度优化
- [ ] 移动端适配
