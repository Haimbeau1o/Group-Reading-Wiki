---
title: W19 · DeepSeek-R1 — RL 涌现 Long-CoT Reasoning
description: W19 共读 DeepSeek-R1，看不用 SFT、纯 RL 怎么涌现 long-form reasoning，以及 GRPO 的工程取舍。
sidebar:
  label: W19 · DeepSeek-R1
session_week: 2026-W19
session_date: 2026-05-11
lead: phd-senior-1
paper_refs:
  - /papers/deepseek-r1/
themes:
  - test-time-reasoning
status: upcoming
---

> 本次共读由 [@phd-senior-1](/members/phd-senior-1/) 带读，关联主线 [Test-time Reasoning](/themes/test-time-reasoning/)。

## 📅 元信息

| 字段 | 值 |
|------|----|
| **周次** | 2026-W19 |
| **时间** | 2026-05-11 周一 14:00–15:30 |
| **带读人** | [@phd-senior-1](/members/phd-senior-1/) (cluster: 研究主理人) |
| **会议地点** | 实验室 A301 + 腾讯会议 |
| **主 paper** | [DeepSeek-R1](/papers/deepseek-r1/) — 重点 §3 GRPO + §4 涌现行为 |
| **关联主线** | [Test-time Reasoning](/themes/test-time-reasoning/) |

---

## 1. 📝 Pre-read（会前）

### 必读

- [DeepSeek-R1 论文笔记](/papers/deepseek-r1/) — 站内组内笔记
  - 重点 §3 **GRPO 算法**（理解为什么去掉 critic）
  - 重点 §4 **R1-Zero 涌现行为**（aha moment、反思、self-correction）
- 原 paper：[arXiv:2501.12948](https://arxiv.org/abs/2501.12948) — 主要看 abstract、§2、§3、§4

### 选读

- [GRPO 词条](/concepts/grpo/) — 5 分钟搞懂
- [W18 共读 DeepSeek-V4](/sessions/2026-w18-deepseek-v4/) — 对照看 V4 → R1 的训练栈演化
- [Test-time Reasoning 主线](/themes/test-time-reasoning/) — 看组内立场

### 引导问题（带读人提）

1. **R1-Zero 不用 SFT 直接 RL 涌现 long CoT** —— 与传统 RLHF（SFT → RM → PPO）流程相比，省略 SFT 的代价是什么？什么类型的任务上行不通？
2. **GRPO 用组内归一化作 baseline** —— 组大小 G 该怎么选？与 PPO 用 critic 的方差 / 样本效率差异是什么？G 趋于无穷时退化到什么？
3. **接入我们组现有 baseline** —— GRPO 能不能直接接到我们组的 SFT 模型上？reward 设计上有哪些痛点？哪些任务的 reward 是 verifiable 的（数学 / 代码）哪些不是？

### 大家的 pre-read 问题

> 在评论区抛你看不懂或想讨论的点。带读人会在会议中挑 2–3 个集中讨论。
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
