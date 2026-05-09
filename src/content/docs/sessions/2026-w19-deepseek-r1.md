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
concept_refs:
  - grpo
  - moe
participants:
  - postdoc-1
  - phd-mid-2
  - ms-research-1
status: archived
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

> 由 [`post-meeting-recap` skill](/.agent/skills/post-meeting-recap/) 从会议 transcript 抽取，PI/带读人请校对。

### 14:00–14:20 · GRPO §3 引入与核心机制

- 带读人 [@phd-senior-1](/members/phd-senior-1/) 抛三个引导问题：去掉 critic 是否够、G 怎么选、能否套现有 SFT 模型
- GRPO 核心：同一 prompt 采 G 个 response，组内 reward 标准化当 advantage；省掉 critic 网络（省 ≈一半显存）
- 代价：组内 baseline 是**有偏的**，依赖采样分布

### 14:15–14:30 · G 与 critic 的取舍讨论

- [@postdoc-1](/members/postdoc-1/) 质疑组内归一化方差缩减能力 < critic（critic 是 oracle baseline，group baseline 受采样噪声影响）
- [@phd-senior-1](/members/phd-senior-1/) 回应：所以 G 不能太小，论文用 G=64
- [@leon](/members/leon/) 抽象出**算力预算重分配视角**：critic 训练算力 ↔ 多采样算力的 trade-off；KV 可缓存的情境下多采样更便宜

### 14:30–14:55 · §4 R1-Zero 涌现与 verifiable reward

- R1-Zero 跳过 SFT 直接 RL，涌现 aha moment / 反思 / 回溯
- [@phd-mid-1](/members/phd-mid-1/) 指出关键前提：**reward 必须 verifiable**（数学题答案可验证）
- [@leon](/members/leon/) 升级为通用洞察：RL 在 LLM 上能涌现什么能力，被 reward 信号 verifiability 决定 → 对话/agent 任务有边界
- [@postdoc-1](/members/postdoc-1/)：R1（非 zero）经 SFT cold start 后 RL 更稳，SFT 是 prior 角色而非必需

### 14:55–15:30 · 接入组内 baseline + 行动决议

- 现有 SFT 模型套 GRPO 技术上可行，但对话任务 reward 不 verifiable → 建议先在数学/代码 verifiable 任务上跑通训练栈再迁移
- [@leon](/members/leon/) 决议：[@phd-senior-1](/members/phd-senior-1/) 做最小 GRPO 复现（G=8 数学题，目标搭训练栈非 SOTA），截止 W22
- [@ms-research-1](/members/ms-research-1/) 认领补 [GRPO 词条](/concepts/grpo/)，加入"verifiable reward 边界"组内观察，截止 W20
- [@phd-mid-2](/members/phd-mid-2/) 提开放问题：long CoT 涌现是否仅在大规模模型出现？论文未系统消融
- [@postdoc-1](/members/postdoc-1/) 接两天 spike：评估 7B baseline 上 GRPO 是否涌现

---

## 3. 💡 Post-meeting（会后）

> 由 [`post-meeting-recap` skill](/.agent/skills/post-meeting-recap/) 从 transcript 抽取，[@phd-senior-1](/members/phd-senior-1/) 已校对。

### Key insights

1. **GRPO 的本质是计算预算重分配**：把算力从 critic 训练挪到多采样上。在 KV 可缓存、采样比训练 critic 便宜的大模型情境下成立；脱离这个前提（小模型 / 采样昂贵场景）GRPO 性价比就不一定。
2. **RL 涌现能力的边界由 reward verifiability 决定**：R1-Zero 在数学这种可验证任务上跳过 SFT 直接 RL 涌现 long CoT，但对话/开放生成等无 ground truth 任务上没有这条路。组内做 agent / 对话方向时这是硬约束。
3. **SFT 是 prior 角色而非必需**：R1 vs R1-Zero 的对比说明 SFT cold start 让 RL 更稳，但不是涌现的充分必要条件。
4. **G（group size）是 GRPO 的核心超参**：太小则 baseline 噪声大、方差缩减不够；太大每步贵。论文 G=64 是一个高资源点，组内复现可从 G=8 起步。
5. **Long-CoT 涌现的规模阈值是开放问题**：论文 base 是 V3 671B，未系统消融小规模能否涌现。组内 7B baseline 上的 spike（[@postdoc-1](/members/postdoc-1/)）是廉价信号源。

### Action items

- [ ] **[@phd-senior-1](/members/phd-senior-1/)**：最小 GRPO 复现，G=8 数学题，搭通训练栈（非 SOTA），截止 **W22**
- [ ] **[@ms-research-1](/members/ms-research-1/)**：补 [GRPO 词条](/concepts/grpo/)，加入 verifiable reward 边界组内观察，截止 **W20**
- [ ] **[@postdoc-1](/members/postdoc-1/)**：7B baseline 上 GRPO 涌现 spike（2 天），W20 同步
- [ ] **[@phd-mid-2](/members/phd-mid-2/)**：把"long-CoT 涌现规模阈值"开放问题加到 [Test-time Reasoning 主线](/themes/test-time-reasoning/)

### 与组工作的关联

- **直接关联**：[Test-time Reasoning 主线](/themes/test-time-reasoning/) — GRPO 是当前最强开源 reasoner 的训练算法；最小复现是该主线下季度的硬里程碑
- **启发**：把"算力预算重分配"和"reward verifiability 边界"这两个抽象作为组内**通用工程原则**，未来评估其他 RLHF 变体（如 DPO、KTO）时复用

### 评论区延伸讨论

> 在底部继续。
