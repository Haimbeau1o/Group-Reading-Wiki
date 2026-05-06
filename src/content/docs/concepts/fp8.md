---
title: FP8 混合精度训练
description: 用 8-bit 浮点存矩阵乘的输入，精细 scaling 防数值崩溃 —— DeepSeek-V3 是首个百亿+ 全 FP8 训练。
sidebar:
  order: 13
  label: FP8 训练
---

## 一句话定义

把 BF16 训练里那些**矩阵乘的输入张量**降到 **8 位浮点**（FP8），再配合**逐 tile 的动态 scaling**避免数值溢出/下溢。**显存与通信带宽减半，吞吐 1.5× 起**，但工程门槛极高。

## 直觉

训练大模型的瓶颈早就不是算力，是**显存 + 通信**：

- BF16 是当前事实标准（指数位多，不容易溢出）
- 进一步降到 INT8 太损精度（动态范围不够）
- **FP8 是甜蜜点**：8 bit + 浮点 → 仍有指数位，但占空间是 BF16 的一半

挑战是 FP8 的**动态范围非常窄**（只有几个数量级），张量值稍大就溢出，稍小就 underflow。所以必须**给每个 tile 算一个独立的 scaling factor**，把数值移到 FP8 的甜蜜区。

## 实现要点

NVIDIA Hopper / Blackwell GPU 提供两种 FP8 格式：

| 格式 | 指数位 | 尾数位 | 用途 |
|------|--------|--------|------|
| **E4M3** | 4 | 3 | 前向激活、权重（精度优先） |
| **E5M2** | 5 | 2 | 反向梯度（动态范围优先） |

完整流程（per matmul）：

```text
1. 给输入 X 算 per-tile scale: s = max_abs(X_tile) / FP8_MAX
2. X_fp8 = (X / s).cast(E4M3)        # 仅传给 GEMM
3. 同样处理 W
4. GEMM 累加在 FP32: Y_fp32 = matmul(X_fp8, W_fp8)
5. Y = Y_fp32 * (s_x * s_w)          # 还原 scale
6. 输出可以再 cast 回 BF16 / FP32
```

主流框架支持：**NVIDIA Transformer Engine**、**MS-AMP**、PyTorch 2.5+ 的 `torch.compile + FP8`。

## 在 DeepSeek 里的用法

**DeepSeek-V3 是首个公开报告 FP8 训练 671B 模型完整收敛的工作**。关键工程点：

1. **极细粒度 scaling**：weight per-block (128×128)、activation per-token-tile (1×128)
2. **FP8 累加分块**：每 N 步切回 FP32 累加，避免长时间 FP8 累加误差累积
3. **关键算子保留高精度**：embedding、output head、Norm、attention softmax 等不走 FP8
4. **通信也压**：all-reduce 用 FP8 + dequant 在节点本地

实测：相比 BF16，FP8 训练 **吞吐 ≈1.5×**，**显存 ≈0.5×**，loss 曲线几乎重合。

## 延伸阅读

- 论文：[FP8 Formats for Deep Learning](https://arxiv.org/abs/2209.05433)（NVIDIA 2022）
- 实现：[NVIDIA Transformer Engine](https://github.com/NVIDIA/TransformerEngine)
- DeepSeek-V3 工程细节：[Tech Report §4](https://arxiv.org/abs/2412.19437)
- 相关词条：[MoE](/concepts/moe/)（FP8 + MoE 是 V3 训练成本的核心降本点）
