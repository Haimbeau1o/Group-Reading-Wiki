---
title: 常见问题（FAQ）
description: 组里反复被问的实操问题集合 —— 答一次，省一万次。
sidebar:
  order: 1
  label: FAQ 入口
---

## 这里是什么

新生 / 低博 / 师弟问的高频实操问题。每个 FAQ 都是一次「师兄认真答一遍 → 沉到 wiki → 下次直接发链接」。

`add-faq` skill 是它的入口，`pnpm new:faq <slug> --q="..." --answered-by=<member-slug>` 是 scaffold。

## 如何贡献

被问了一个值得收录的问题时：

```bash
pnpm new:faq <slug> \
  --q="<问题原文>" \
  --answered-by=<member-slug>
```

模板用 4 段建议结构：背景 / 我们组的做法 / 常见坑 / 链回 wiki。

详见 [`.agent/skills/add-faq.md`](https://github.com/Haimbeau1o/Group-Reading-Wiki/blob/main/.agent/skills/add-faq.md)。

## 与「概念词典」的区别

- **概念词典 (`/concepts/`)** = "X 是什么 / 怎么定义"（术语 / 数学 / 直觉）
- **FAQ (`/faq/`)** = "X 该怎么办 / 我们组怎么做"（实操 / heuristics / 踩坑）

模糊时优先 FAQ。

## 维护节奏（cycle-10 R02 起）

每个 FAQ 含 `last_reviewed_at` + `reviewer` 字段。跑 `pnpm staleness-report` 看哪些 FAQ 该复核。建议每年至少 review 一次（默认 cadence=12m）。
