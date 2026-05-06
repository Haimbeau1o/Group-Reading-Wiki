---
title: MoE 与稀疏化
description: 专家路由、负载均衡、稀疏激活的训练与推理。
sidebar:
  order: 2
  label: MoE / 稀疏
---

> ⚠️ **占位内容**。该方向 owner 请来填。

## 一句话定位

我们关心：**让稀疏激活模型在训练稳定 + 推理高效之间找到工程上可生产的设计点**。

我们**不**关心：单纯堆专家数刷参数 / 与硬件无关的纯理论。

## 该方向的 owner

- **小导师**：[占位](/members/postdoc-1/)
- **核心博士**：[占位](/members/phd-senior-2/)
- **硕士 / 新生**：欢迎加入

## 关键论文（外部）

- [DeepSeek-V4 研究深度解析](/deepseek/v4-research/) §4 / §10 —— DeepSeekMoE + 训练稳定性
- *待补*：Switch Transformer / GShard / Mixtral
- *待补*：DeepSeekMoE 原论文

## 我们的工作（内部）

> 占位。

- [ ] 项目 A
- [ ] 项目 B

## 我们关心的开放问题

1. Auxiliary-loss-free balancing 的稳定性边界在哪？
2. MoE outliers 与 routing 的耦合是否有更干净的解释？
3. Fine-grained vs coarse experts 的 trade-off 在不同模态下是否一致？
4. 专家容量自适应（dynamic top-K）值不值得？

## 推荐阅读路径（给新人）

1. **第一步**：词典 [MoE](/concepts/moe/) —— 30 分钟搞懂基本概念
2. **第二步**：DeepSeek-V4 §10 训练不稳定章节 —— 了解我们关心的具体问题
3. **第三步**：Switch / GShard / Mixtral 原论文（待补 paper 解读）
4. **第四步**：上手复现 baseline（见 `/internal/codebases/`，待开放）

## 该主线的"组内立场"

> 占位。例：我们更关心**训练阶段稳定性**而不是推理阶段调度，因为我们组没有自己的推理引擎团队。
