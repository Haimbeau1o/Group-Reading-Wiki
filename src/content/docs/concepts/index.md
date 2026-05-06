---
title: 概念词典
description: 大模型术语速查 —— 一个词条一篇短文。
sidebar:
  order: 1
  label: 索引
---

> � 一个词条一篇短文，目标控制在 300–800 字，必带原始论文出处。每条会被主文章里的术语链接双向引用。

## 已上线（首批 5 条）

- [**MoE**](/concepts/moe/) — Mixture of Experts，DeepSeekMoE 的细粒度专家 + 共享专家
- [**MLA**](/concepts/mla/) — Multi-head Latent Attention，KV cache 压缩
- [**MTP**](/concepts/mtp/) — Multi-Token Prediction，加密训练信号 + 推理加速
- [**FP8 训练**](/concepts/fp8/) — 8-bit 浮点混合精度，DeepSeek-V3 的降本关键
- [**GRPO**](/concepts/grpo/) — 去 critic 的 PPO，DeepSeek-R1 推理涌现的核心算法

## 写作模板

```markdown
---
title: <英文全称> (<缩写>)
description: 一句话定义
---

## 一句话定义
<这个术语在做什么>

## 直觉
<为什么需要它，解决了什么问题>

## 数学 / 实现
<最小可读的公式或伪代码>

## 在 DeepSeek 里的用法
<跨链接到具体论文文章>

## 延伸阅读
- 原论文
- 相关词条
```

## 待补充词条（欢迎认领）

- [ ] **SWA** — Sliding Window Attention
- [ ] **CSA** — Compressed Sparse Attention
- [ ] **HCA** — Hierarchical Compressed Attention
- [ ] **OPD** — Open-Process Distillation
- [ ] **Speculative Decoding** — 推测解码
- [ ] **DPO / KTO** — 直接偏好优化族
- [ ] **RoPE / YaRN / NTK Scaling** — 长上下文位置编码族

> 想认领某个词条？在底部评论区或 [GitHub Discussions](https://github.com/Haimbeau1o/Group-Reading-Wiki/discussions) 留言。
