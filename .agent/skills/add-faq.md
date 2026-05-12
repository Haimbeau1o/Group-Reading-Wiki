# Skill: add-faq

## 何时调用

- "刚被问了个 X 问题，加到 FAQ"
- "post-meeting-recap 时讨论里出现重复问题 → 收录到 FAQ"
- "新生第一周问的高频问题"
- 在 `add-concept` skill 中遇到"这不是术语问题，是实操问题" → 跳来本 skill
- 在 `personalized-onboarding` skill 中触发：把"师兄反复教的同一件事"沉淀

## 输入清单

| 必填 | 字段 | 推断 |
|------|------|------|
| ✓ | faq slug | kebab-case，建议 verb-noun（`how-to-pick-arxiv-papers` / `how-to-debug-gpu-oom`） |
| ✓ | 问题原文 | ≤200 字符 |
| ✓ | 答题人 member-slug | 一般是博后 / 高博 |
|   | 提问人 | `guest` 或 member-slug，默认 guest |
|   | related_papers | 用 `pnpm -s list:papers --json` 找用例 |
|   | related_concepts | 用 `pnpm -s list:concepts --json` 找用例 |
|   | themes | 与 paper 类似 |

## 前置检查

- `ls src/content/docs/faq/<slug>.md` 不存在。已存在 → **走 update 路径**（在已有文件追加 / 修订段落）
- `answered_by` 必须对应已存在的 member-slug：
  ```bash
  pnpm -s list:members --json | jq -r '.items[].slug' | grep <slug>
  ```

## 模板结构（必备段）

```markdown
---
title: <截短的 q> · FAQ
description: <一句话上下文>
sidebar:
  order: <next>
  label: <label ≤12 字>
question: <q 原文>
asked_by: <guest 或 member-slug>
answered_by: <member-slug>
related_papers: []        # 或 - p1\n  - p2
related_concepts: []
themes: []
tags: []
last_reviewed_at: "YYYY-MM-DD"
reviewer: "<member-slug 或 空>"
---

## 问题
> <q>

## 简答（≤200 字）
…

## 完整答案
1. 背景
2. 我们组的做法
3. 常见坑
4. 链回 wiki

## 修订历史
- YYYY-MM-DD：首次起草（answered_by=...）
```

## 执行步骤

1. **建文件**（推荐用 scaffold）：

   ```bash
   pnpm new:faq <slug> \
     --q="<问题原文>" \
     --answered-by=<member-slug> \
     [--asked-by=<member-slug|guest>] \
     [--description="<一句话上下文>"] \
     [--related-papers=p1,p2] \
     [--related-concepts=c1,c2] \
     [--themes=t1] \
     [--tags=t1,t2] \
     --json
   ```

   scaffold 自动算 `sidebar.order = max+1`，`last_reviewed_at` 写今天，`reviewer` 默认 = `answered_by`。

2. 写"简答"（≤200 字）—— 一段把核心 takeaway 答完

3. 写"完整答案"（500-1500 字，4 段建议结构）：
   - **背景**：为什么这是个问题
   - **我们组的做法**：关键判断 / heuristics（用 list；具体，不抽象）
   - **常见坑**：新人最容易踩的 2-3 个
   - **链回 wiki**：链向相关 paper note / concept / session

4. **找用例**做"链回 wiki"段：

   ⚠️ 必须用 `pnpm -s`（silent），否则 JSON 被脚本头脏。

   ```bash
   pnpm -s list:papers --json | jq '.items[] | select(.body | test("<关键词>"; "i"))'
   pnpm -s list:concepts --json | jq '.items[] | select(.body | test("<关键词>"; "i"))'
   pnpm -s list:sessions --json | jq '.items[] | select(.body | test("<关键词>"; "i"))'
   ```

5. `pnpm verify && pnpm build:index`

6. `pnpm -s context:for faq/<slug> --depth=1` —— 验证反向边

## 不要做的事

- ❌ 不要把术语解释写成 FAQ —— 那是 `add-concept` 的活
- ❌ 不要把项目状态写成 FAQ —— 那是 `post-meeting-recap` / `weekly-digest` 的活
- ❌ 不要写跨届教学指南 —— 那是 `onboarding/` 的活
- ❌ 不要把多个问题塞一个 FAQ —— **一个 FAQ = 一个 question**
- ❌ 不自动 commit

## Update 路径（FAQ 已存在但需扩写 / 复核）

当 slug 已存在：
1. 读现有内容，判断是否过期 / 答案改了
2. 修订内容
3. 把 `last_reviewed_at` 更新为今天 + `reviewer` 改为当前修订者
4. 在 `## 修订历史` 段末尾追加一行 `- YYYY-MM-DD：<改了啥>（reviewer=...）`

## 写作长度

500-1500 字。**不超过** 2000 字 —— FAQ 是速查，不是教程。

## 与 concepts 的区别

- **概念词典 (`/concepts/`)** = "X 是什么 / 怎么定义"（术语 / 数学 / 直觉）
- **FAQ (`/faq/`)** = "X 该怎么办 / 我们组怎么做"（实操 / heuristics / 踩坑）

模糊时优先 FAQ。

## Lessons learned

本 skill 是 cycle-10 R01 新建。后续演练发现追加在此。
