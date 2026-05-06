---
title: GRPO (Group Relative Policy Optimization)
description: 把 PPO 的 critic 干掉，改用同 prompt 多采样的组内相对 reward 当 baseline —— DeepSeek-Math / R1 的核心 RL 算法。
sidebar:
  order: 14
  label: GRPO
---

## 一句话定义

**PPO 的简化版**：对同一 prompt 一次采样 G 个 response，用**组内 reward 的均值/标准差**作为 advantage 的 baseline，**省掉了 critic（value model）**，训练成本砍半。DeepSeek-Math 提出，DeepSeek-R1 用它把推理能力推上顶。

## 直觉

PPO 的痛点：

- 需要一个**和 policy 同尺寸的 value model** 来估 baseline，**显存翻倍、训练复杂度翻倍**
- 对 reasoning 这种 reward 稀疏的任务（最终答对/答错），value model 也学不准

GRPO 的洞见：**在同一 prompt 下采样一组 G 个 response，组内的相对好坏比绝对的 value 更靠谱**。直接用组内 reward 标准化作 baseline，不用 value model 了。

## 数学

对 prompt $q$ 采样 $G$ 个 response $\{o_1, \dots, o_G\}$，每个 response 拿到 reward $r_i$（可以是 outcome reward，也可以是 process reward）。

**组内归一化 advantage**：

$$
A_i = \frac{r_i - \text{mean}(r)}{\text{std}(r)}
$$

注意 $A_i$ 是**整段 response 共享同一个 advantage**（trajectory-level），不像 PPO 那样逐 token。

**目标函数**（policy ratio + clipping，结构和 PPO 一样）：

$$
\mathcal{L}_{\text{GRPO}} = \mathbb{E}\Big[\min\big(\rho_i A_i,\ \text{clip}(\rho_i, 1{-}\epsilon, 1{+}\epsilon) A_i\big)\Big] - \beta \cdot \text{KL}(\pi_\theta \| \pi_{\text{ref}})
$$

其中 $\rho_i = \frac{\pi_\theta(o_i \mid q)}{\pi_{\theta_{\text{old}}}(o_i \mid q)}$。

## 实现要点

1. **G 一般取 8–64**，越大方差越小，但显存压力线性涨
2. **reward 可以很简单**：R1 训练时只用 rule-based reward（答案对错 + 格式），无需 reward model
3. **KL 约束**：仍然需要参考模型（一般是 SFT 模型），防止跑偏
4. **没 critic** = 训练循环只有 actor，工程上简单很多

## 在 DeepSeek 里的用法

| 模型 | 角色 | 备注 |
|------|------|------|
| **DeepSeek-Math** | 提出 GRPO | 数学题 RL，提升 MATH 准确率 |
| **DeepSeek-R1-Zero** | **纯 RL（无 SFT）** | 直接在 base 模型上 GRPO，自发涌现 long CoT |
| **DeepSeek-R1** | SFT → GRPO 多阶段 | 当前最强开源 reasoner |

R1 最颠覆的发现是：**只要 reward 干净（rule-based answer matching），GRPO 能让模型自己学会思维链 + 自我验证 + 反思**，无需 process reward model 提供过程监督。

## 延伸阅读

- 提出：[DeepSeek-Math (DeepSeekMath: Pushing the Limits of Mathematical Reasoning)](https://arxiv.org/abs/2402.03300) §4
- 大规模实践：[DeepSeek-R1 paper](https://arxiv.org/abs/2501.12948)
- 对比 PPO：[Schulman et al. 2017](https://arxiv.org/abs/1707.06347)
- 相关词条：[MoE](/concepts/moe/) · [MTP](/concepts/mtp/)
