---
title: 长上下文效率
description: 百万 token 级别推理的注意力 / KV cache / 调度优化。
sidebar:
  order: 1
  label: 长上下文
owner: postdoc-1
co_owners:
  - phd-senior-1
tags:
  - efficiency
  - inference
---

> ⚠️ **占位内容**。Leon 与该方向 owner 请来填。下方结构是模板。

## 一句话定位

我们关心：**让百万 token 级别推理在 lab 单机集群上跑得起、跑得快**。

我们**不**关心：纯文本压缩 / 信息检索式的 long-doc QA（更像系统集成问题）。

## 该方向的 owner

- **小导师**：[占位](/members/postdoc-1/)
- **核心博士**：[占位](/members/phd-senior-1/) · [占位](/members/phd-mid-1/)
- **新生 / 硕士**：欢迎加入

## 关键论文（外部）

- [DeepSeek-V4 研究深度解析](/deepseek/v4-research/) —— 当前 SOTA 的长上下文设计
- [混合注意力机制 (SWA + CSA + HCA)](/deepseek/hybrid-attention/) —— 核心架构
- *待补*：MLA 原论文（DeepSeek-V2）
- *待补*：StreamingLLM, Longformer, Mamba/RWKV 长序列方向

## 我们的工作（内部）

> 占位。Leon 来补：组里当前在做的相关项目、已投/已发的论文。

- [ ] 项目 A：xxx（owner / 状态）
- [ ] 项目 B：xxx
- [ ] arXiv 链接 / 内部代码库链接

## 我们关心的开放问题

1. CSA / HCA 的混合比例如何随任务自适应？
2. 长上下文与 MoE 路由的耦合如何稳住？
3. 1M context 在 8×H800 上推理的真实瓶颈是哪一段？
4. KV cache 异构分层（DRAM / SSD）的 hit-rate 怎么建模？

## 推荐阅读路径（给新人）

1. **第一周**：[DeepSeek-V4 概览](/deepseek/overview/) + [V4 研究深度解析](/deepseek/v4-research/)
2. **第二周**：[混合注意力机制](/deepseek/hybrid-attention/)（SWA / CSA / HCA 三层）
3. **第三周**：补齐前置概念
   - [MLA](/concepts/mla/) · [MoE](/concepts/moe/) · [FP8](/concepts/fp8/)
4. **第四周**：动手 —— 在我们 baseline 上跑一次 1M context 推理（见 `/internal/playbooks/`，待开放）

## 该主线的"组内立场"

> 占位。Leon 写：相对其他组在这条线上，我们组的独特立场是什么。

例：**我们倾向于把"百万上下文"当作系统问题来解，而非纯算法问题**。所以我们组的工作里训练 / 推理 / 服务是耦合的，单独看任何一篇论文都未必看到全貌。

---

**有问题或想加入这条主线？** 在底部评论区留言，或直接给 PI / owner 发消息。
