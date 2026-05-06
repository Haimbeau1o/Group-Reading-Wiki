---
title: MLA (Multi-head Latent Attention)
description: 把 KV cache 压成低维 latent，推理时再投影回多头空间 —— DeepSeek-V2 的招牌 KV 压缩注意力。
sidebar:
  order: 11
  label: MLA
---

## 一句话定义

**用一对低秩投影把 K、V 压成一个共享的低维 latent 向量缓存**；attention 计算时再上投影回各 head 空间。**KV cache 体积下降到 1/4 以下**，推理时长上下文不再 OOM。

## 直觉

长上下文推理的真正瓶颈不是算力，是 **KV cache 显存**：

- 普通 MHA：每个 head 一份完整 K、V 缓存
- MQA：所有 head 共享一份 K、V，体积小但表达力损失明显
- GQA：分组共享，是个折中

MLA 给出一种新思路：**不共享 K/V 本身，而是共享一个低维 latent；K、V 用 latent + 各 head 自己的上投影矩阵动态生成**。这样：

- 缓存的只有 latent，体积 ≈ MQA 量级
- 但每个 head 仍有独立的"个性化" K、V（通过上投影）

## 数学 / 实现

设 token 表示 $h_t \in \mathbb{R}^d$，潜在维度 $d_c \ll d$，head 数 $n_h$，每 head 维度 $d_h$。

**压缩**（每步只算这一步缓存）：

$$
c^{KV}_t = W^{DKV} h_t \quad \in \mathbb{R}^{d_c}
$$

$c^{KV}_t$ 就是要写入 cache 的东西，**远小于** $n_h \cdot d_h$。

**上投影**（attention 计算时即时做）：

$$
k^{(i)}_t = W^{UK}_{(i)} c^{KV}_t, \quad v^{(i)}_t = W^{UV}_{(i)} c^{KV}_t
$$

但这里有个坑：**RoPE 不能直接施加在 latent 上**（位置编码要在投影之后）。DeepSeek 的解法是 **decoupled RoPE**：单独留一小段 head 维度专门承载 RoPE 位置信息，与 latent 通路并行。

具体见 `@/src/content/docs/deepseek/v4-research.md` 的对应章节，以及原论文 §2.1。

## 在 DeepSeek 里的用法

| 模型 | KV cache 相对 MHA | 备注 |
|------|------------------|------|
| DeepSeek-V2 | ~6.7% | MLA 首发 |
| DeepSeek-V3 | ~5% | 沿用 MLA + 优化 |
| DeepSeek-V4 | 进一步降 | MLA + [混合注意力（SWA/CSA/HCA）](/deepseek/hybrid-attention/) 协同 |

V4 在 MLA 基础上叠加分层稀疏，让百万 token 上下文成为可能。

## 延伸阅读

- 原论文：[DeepSeek-V2](https://arxiv.org/abs/2405.04434) §2.1
- 对比：[GQA](https://arxiv.org/abs/2305.13245) / MQA
- 相关词条：[MoE](/concepts/moe/) · [MTP](/concepts/mtp/)
- 站内：[V4 混合注意力](/deepseek/hybrid-attention/)
