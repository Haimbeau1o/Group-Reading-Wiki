---
title: 怎么挑值得读的 arXiv paper？ · FAQ
description: 新生常问：每日 200+ 篇怎么筛 5 条 heuristics + 常见坑
sidebar:
  order: 2
  label: 挑 arXiv paper
question: 怎么挑值得读的 arXiv paper？
asked_by: guest
answered_by: leon
related_papers: []
related_concepts: []
themes:
  - test-time-reasoning
tags:
  - paper-reading
  - onboarding
last_reviewed_at: "2026-05-12"
reviewer: "leon"
exemplar: true
---

## 问题

> 怎么挑值得读的 arXiv paper？

## 简答（≤200 字）

按 **5 条** heuristics 过滤：(1) 作者已知靠谱 → 10 秒决定；(2) 题目命中组主线 → 30 秒；(3) 摘要含可验证的 SOTA claim → 1 分钟；(4) GitHub repo 存在且活 → 2 分钟；(5) PI / 师兄在群里扔过 → 信号最强直接读。前 4 条用来劝退，第 5 条用来抢跑。**不要看 cite 数**，一年内 paper 的 cite=0 是正常的。

## 完整答案

### 1 · 背景：为什么不可能全读

arXiv `cs.LG` 每日 ≈ 200 篇新 paper，`cs.AI / cs.CL / cs.CV` 加起来每日还有 ~300 篇。一年 ≈ 7-8 万篇 LLM 相关。**任何一个人的阅读上限都是每日 5-15 篇**（含读 + 笔记 + 想清楚）。所以问题不是"读什么"，而是"**怎么 30 秒决定一篇该不该花 10 分钟读**"。

### 2 · 我们组的 5 条 heuristics

我们组的筛选不是按"质量"打分，而是按 **"信号 / 时间成本"** 排序。第一个能命中的就读：

#### Heuristic 1 · 作者已知靠谱（10 秒决定）
- 我们组维护了一份「靠谱作者」名单（在 `members/leon.md` 的 reading list 段，约 50 个名字）
- 命中任意一人 → 直接打开看摘要
- 这是**最高信号**：靠谱的人不会发完全不靠谱的 paper（虽然偶尔会发不重要的）

#### Heuristic 2 · 题目命中组主线（30 秒）
- 我们组 4 条主线见 [/themes](/themes/)
- 题目含 `test-time scaling / chain-of-thought reasoning / MoE / sparse attention / long context` 等 → 加分
- 命中 → 读摘要；不命中 → 跳

#### Heuristic 3 · 摘要含可验证的 SOTA claim（1 分钟）
- 摘要里说"+X% on Y benchmark" → 必须 X ≥ 5%、Y 是知名 benchmark（GSM8K / MATH / MMLU / HumanEval / SWE-Bench / LongBench / Code-Forces 等）
- 否则大概率灌水
- **不要相信"提升了模型能力"这类含糊表述** —— 没有 benchmark = 没有 claim

#### Heuristic 4 · GitHub repo 存在且活（2 分钟）
- 摘要末尾或正文 §1 通常会带 repo URL
- 打开 repo → 看 commit 时间：最近 30 天有 commit → 活的；超过 6 个月无 commit → 大概率烂尾
- ⭐ ≥ 10 是有人验证过的弱信号；< 10 不代表差，结合 1-3 看
- **没 repo 的 paper 谨慎**（除非作者已知靠谱）—— 没 repo 通常意味着 close-source 实验，复现性低

#### Heuristic 5 · 师兄 / PI 群里扔过（最强信号）
- 微信群 + Slack 的 "AI/LLM 论文" 频道是组里最高密度的过滤器
- PI 扔的 paper 优先读，**当晚或次日**读完写一段 take
- 师兄扔的 paper 周内读，写 paper note 或 1 段 take

### 3 · 常见坑

**坑 1：迷信 cite 数**
- 一年内 paper 的 cite=0 是**正常**的（NeurIPS 24 的 paper 到 25 年 5 月 cite ≈ 1-5）
- 看 cite 数会让你错过最新工作
- 真要看可见度，看 Twitter / 知乎讨论度

**坑 2：迷信"已发表"**
- 很多关键工作只在 arXiv 上（DeepSeek 系列的开放报告就是）
- venue（NeurIPS / ICML / ICLR）只是迟到 6-12 个月的标签
- **arXiv 优先于 venue**

**坑 3：只读摘要不读 limitation**
- 摘要永远报喜，limitation 段才是真信号
- 我们组规定：读完 paper 必须能用一句话说出"这篇的 limitation 是什么"
- 说不出 → 没读懂 → 不写 paper note

### 4 · 链回 wiki

- 写完 paper note 用 `pnpm new:paper <slug> --title="..." --theme=<theme-slug>`
- 概念词典：见 [/concepts](/concepts/)
- 主线：见 [/themes](/themes/)
- 周会带读流程：[`.agent/skills/weekly-session.md`](https://github.com/Haimbeau1o/Group-Reading-Wiki/blob/main/.agent/skills/weekly-session.md)

## 修订历史

- 2026-05-12：首次起草（answered_by=leon, exemplar 入库）
