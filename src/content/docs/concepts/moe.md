---
title: MoE (Mixture of Experts)
description: 把 FFN 拆成多个专家，每个 token 只走其中少数几个 —— 总参数量大涨，激活计算量不变。
sidebar:
  order: 10
  label: MoE
---

## 一句话定义

把 Transformer 中本来"密集"的 FFN 层换成 **N 个并列的小 FFN（专家）+ 一个路由器**，每个 token 只激活其中 Top-K 个专家。**总参数量大幅增长，但每个 token 的计算量几乎不变**。

## 直觉

标准 Transformer 的 FFN 对每个 token 都走全部参数 —— 但显然，处理"它"和处理"傅里叶变换"用不到同一批权重。MoE 把这种**条件计算**显式建模出来：

- N 个 expert 专门化，路由器学会"该把这个 token 送给谁"
- 推理时只激活 K 个 expert（通常 K=1 或 2）→ 算力没变
- 但模型容量是 N×FFN

代价：**显存被全部 N 个专家占着**（推理时也要加载），路由会带来负载不均衡。

## 数学 / 实现

设 token 表示 $h \in \mathbb{R}^d$，N 个专家 $E_1, \dots, E_N$，路由器 $g(h) = \text{softmax}(W_r h) \in \mathbb{R}^N$：

$$
y = \sum_{i \in \text{TopK}(g(h))} g_i(h) \cdot E_i(h)
$$

伪代码：

```python
scores = router(h)              # [B, T, N]
topk_v, topk_i = scores.topk(K) # 选 K 个专家
y = 0
for k in range(K):
    expert_out = experts[topk_i[..., k]](h)
    y += topk_v[..., k:k+1] * expert_out
```

工程难点是**负载均衡**：如果路由总把 token 送给少数热门专家，那些专家算力爆炸而其他闲置。常见做法是加 **auxiliary loss** 惩罚路由分布偏差。

## 在 DeepSeek 里的用法

DeepSeek 自己的 MoE 实现（**DeepSeekMoE**）有两个关键创新：

1. **细粒度专家**：把每个传统专家再拆成 m 个更小的专家，N 增大但单专家变小，路由更精细。
2. **共享专家**（shared experts）：留几个专家**强制每个 token 都走**，捕捉通用知识；其他才是路由专家。

| 模型 | 总参数 | 激活参数 | 路由专家数 / 共享 | Top-K |
|------|--------|---------|------------------|-------|
| DeepSeek-V2 | 236B | 21B | 160 / 2 | 6 |
| DeepSeek-V3 | 671B | 37B | 256 / 1 | 8 |

V3 还干掉了传统 auxiliary loss，改用 **bias-based loss-free balancing**（给路由 logits 加可学习偏置，监控历史负载实时校准），避免 aux loss 对主任务的干扰。

## 延伸阅读

- 起源：[GShard](https://arxiv.org/abs/2006.16668)、[Switch Transformer](https://arxiv.org/abs/2101.03961)
- DeepSeek 自家文章：[DeepSeekMoE](https://arxiv.org/abs/2401.06066)、[DeepSeek-V3 Tech Report](https://arxiv.org/abs/2412.19437)
- 相关词条：[MLA](/concepts/mla/) · [FP8 训练](/concepts/fp8/)
