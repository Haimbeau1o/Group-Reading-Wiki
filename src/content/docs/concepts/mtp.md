---
title: MTP (Multi-Token Prediction)
description: 训练时不止预测下一个 token，而是同时预测未来 k 个 —— 加密监督信号，推理时还能加速。
sidebar:
  order: 12
  label: MTP
---

## 一句话定义

把"下一 token 预测"扩展为"未来 k 个 token 预测"：在主干 LM head 之外串一串轻量预测模块，每个模块负责预测 $t+2, t+3, \dots$。**训练时给信号加密度，推理时可丢可用作 speculative decoding**。

## 直觉

标准 next-token prediction 的监督信号是**稀疏**的：每个位置只学"下一步"。但很多时候我们其实可以从 $h_t$ 推断出后续多个 token 的趋势。MTP 把这种隐含监督显式化：

- 训练阶段：每个位置同时被要求预测 t+1, t+2, …, t+k
- 推理阶段：
  - **保守用法**：扔掉额外 head，只用主 LM head，行为和普通模型一致
  - **激进用法**：用额外 head 做 speculative decoding，单步多吐 token，加速 1.5×–2×

这是个**几乎免费的 trick**：训练成本上升不多，能带来更稳定的训练 loss + 推理加速选项。

## 数学 / 实现

DeepSeek-V3 的 MTP 不是并列多 head，而是**串联模块**。设深度 $D$ 个 MTP 模块：

```
   ┌──────── 主干 Transformer ───────┐
   │                                  │
   h_t ──► main LM head ──► p(t+1)    │
   │                                  │
   ├─► MTP-1 (Tx block + head) ──► p(t+2)
   │                                  │
   └─► MTP-2 (Tx block + head) ──► p(t+3)  ...
```

每个 MTP 模块复用主干输出 + 接受前一模块的隐藏状态，串行预测更远的 token。损失是各位置 cross-entropy 加权和。

```python
loss = ce(main_head(h), y_next) + sum(
    lambda_d * ce(mtp_d(h, prev_h), y_far_d) for d in range(D)
)
```

## 在 DeepSeek 里的用法

- **DeepSeek-V3**：1 个 MTP 模块（D=1），训练阶段开启，推理阶段默认丢弃。带来 ≈1% 验证 loss 改善。
- **推理加速**：把 MTP 模块当 speculative decoding 的 draft model（同一份权重），在常见任务上 1.6×–1.8× 吞吐。
- **DeepSeek-V4**：进一步整合到 OPD 训练管线（见 [V4 研究](/deepseek/v4-research/)）。

## 延伸阅读

- 概念起源：[Better & Faster Large Language Models via Multi-token Prediction](https://arxiv.org/abs/2404.19737)（Meta 2024）
- DeepSeek 实现：[DeepSeek-V3 Tech Report](https://arxiv.org/abs/2412.19437) §3
- 相关词条：[MoE](/concepts/moe/) · [MLA](/concepts/mla/)
- 相关概念：speculative decoding（推测解码）— 待补
