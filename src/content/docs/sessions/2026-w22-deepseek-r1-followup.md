---
title: "W22 · DeepSeek-R1 续讨论 — GRPO 在 MoE 上的稳定性"
description: 接 W19 余热，深入 GRPO × MoE routing 的工程取舍，及 R1 之后社区的 reproduction 现状。
sidebar:
  label: W22 · DeepSeek-R1 续讨论
session_week: 2026-W22
session_date: 2026-05-09
lead: phd-senior-1
paper_refs:
  - /papers/deepseek-r1/
themes:
  - test-time-reasoning
participants:
  - phd-mid-2
  - ms-research-1
concept_refs:
  - grpo
  - moe
tags:
  - rl
  - reasoning
status: upcoming
---

> 自动生成的 session 模板。请带读人在周三前完成 Pre-read 部分。

## 📅 元信息

| 字段 | 值 |
|------|----|
| **周次** | 2026-W22 |
| **时间** | （待填）周一 14:00–15:30 |
| **带读人** | [phd-senior-1](/members/phd-senior-1/) |
| **会议地点** | 实验室 + 腾讯会议 |
| **主 paper** | [DeepSeek-R1](/papers/deepseek-r1/)（W19 续讨论） |
| **关联主线** | [Test-time Reasoning](/themes/test-time-reasoning/) |

---

## 0. 🔗 关联背景

:::caution[🤖 Agent 起草 · 由 `pnpm context:for papers/deepseek-r1 --depth=2` 自动产出，待 phd-senior-1 校对]
下面这段是 agent 用知识图邻居自动起草的"会前坐标系"。**事实链接由构建期自动维护**，文字解读由 agent 补，需 lead review 后删 caution + 修订。
:::

本次共读延续 [W19 · DeepSeek-R1 共读](/sessions/2026-w19-deepseek-r1/)，重点续讨论 **GRPO × MoE routing 在 RL 训练中的稳定性**。

**概念前置**（建议会前过一遍词典页）：

- [GRPO](/concepts/grpo/) — PPO 干掉 critic，组内相对 reward 当 baseline
- [MoE](/concepts/moe/) — sparse activation，routing 稳定性是 RL 训练的痛点
- [MLA](/concepts/mla/) — DeepSeek 系列的 KV-cache 压缩，影响 long-CoT 显存预算
- [FP8](/concepts/fp8/) — R1 训练的混合精度 baseline

**前情回顾**：

- [W19 · DeepSeek-R1](/sessions/2026-w19-deepseek-r1/) — 主篇 paper 共读，重点 GRPO 涌现 long-CoT；W22 接力的 open-question 是"GRPO 跑在 MoE 上 routing 还稳吗"

**主线坐标**：本次仍在 [Test-time Reasoning](/themes/test-time-reasoning/) 主线下。该主线 owner [postdoc-1](/members/postdoc-1/)；co-owners 含 [phd-senior-1](/members/phd-senior-1/) / [phd-mid-2](/members/phd-mid-2/)。

**2 跳邻居**（context:for `--depth=2` 暴露）：

- [MTP](/concepts/mtp/) — 通过 MoE 间接关联（同 DeepSeek 系列）；如有时间可对比 R1 是否启用了 MTP

> 📝 lead 校对要点：上述链接 100% 来自 frontmatter 知识图，**不会编造**；但每条后面的"一句话定位"是 agent 复述 concept 页 description，需 lead 确认精度。

---

## 1. 📝 Pre-read（会前）

### 必读

- （待带读人填）

### 选读

- （可选）

### 引导问题（带读人提）

1. ?
2. ?
3. ?

### 大家的 pre-read 问题

> 在评论区抛你看不懂或想讨论的点。
>
> *@……*：（在底部 Giscus 评论或直接 PR 加到这里）

---

## 2. 🎯 Live notes（会中）

> 带读人或指定记录员实时记。

### 14:00–14:20 · 引入

…

### 14:20–14:50 · 主体

…

### 14:50–15:10 · 关键讨论

…

### 15:10–15:30 · 自由讨论

…

---

## 3. 💡 Post-meeting（会后）

> **带读人在周二补完**。

### Key insights

1. …

### Action items

- [ ] **@phd-senior-1**：…
- [ ] **@……**：…

### 与组工作的关联

- 直接关联：…
- 启发：…

### 评论区延伸讨论

> 在底部继续。
