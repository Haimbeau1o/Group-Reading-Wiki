---
title: DeepSeek-V4 混合注意力机制
description: SWA + CSA + HCA —— V4 实现百万上下文的核心架构设计。
sidebar:
  order: 3
  label: 混合注意力机制
---

日期：2026-05-05
视角：架构研究者 / 注意力机制深入理解
聚焦：从数学公式到工程细节，彻底搞懂 CSA、HCA、SWA 怎么混合

---

## 0. 为什么需要混合注意力？

先建立清晰的痛苦点：普通全注意力下，序列长度 n 时：

- **计算量**：O(n²) attention FLOPs
- **KV cache**：O(n) 存储
- **1M 上下文**：这两个量都变得不可承受

V4 的答案不是单一压缩策略，而是**三层 memory hierarchy 混合**：

```
L1: SWA (Sliding Window)    — 近处不压缩，局部精确
L2: CSA (Compressed Sparse) — 4:1 压缩 + top-k 选择
L3: HCA (Heavily Compressed)— 128:1 压缩 + 全量 dense attention
```

每层解决不同的问题，混合使用形成完整的记忆系统。

---

## 1. CSA：压缩 + 稀疏选择

CSA = Compression + Sparse Selection。核心分三步：

### 1.1 KV 压缩（Compressed KV Entries）

给定输入 hidden states H ∈ R^(n×d)，CSA 计算**两套** KV entries 和对应的压缩权重：

```
C^a = H · W^a_KV,   C^b = H · W^b_KV     (Eq 9)
Z^a = H · W^a_Z,    Z^b = H · W^b_Z      (Eq 10)
```

其中 W^a_KV, W^b_KV, W^a_Z, W^b_Z ∈ R^(d×c)，c 是 head dimension。

**关键设计：每 2m 个 KV entries 压缩成 1 个，但有 overlap。**

对第 i 个压缩块 C^Comp_i：

```
S^a_{mi:m(i+1)-1} ; S^b_{m(i-1):mi-1} = Softmax_row([Z^a_{mi:m(i+1)-1} + B^a ; Z^b_{m(i-1):mi-1} + B^b])  (Eq 11)

C^Comp_i = Σ_{j=mi}^{m(i+1)-1} S^a_j ⊙ C^a_j  +  Σ_{j=m(i-1)}^{mi-1} S^b_j ⊙ C^b_j  (Eq 12)
```

这里发生了什么？

- 每个压缩块用了 2m 个 token 的 KV（m 个来自 C^a，m 个来自 C^b）
- Softmax 在 2m 个元素上做归一化
- 压缩权重 Z 是 **learnable** 的 — 模型自己学会哪些 token 的 KV 更重要
- B^a, B^b 是 learnable positional biases — 给位置信息
- 最终通过 weighted sum（Hadamard product ⊙ + sum）合并

**Overlap 的精妙之处**：
- C^Comp_i 用的 C^b 的索引 `m(i-1):mi-1`
- C^Comp_{i-1} 用的 C^a 的索引 `m(i-1):mi-1`
- 所以实际压缩比是 **1/m**，不是 1/(2m)
- V4-Flash 中 m=4，即 4:1 压缩
- 但每个压缩 entry 看过 2m=8 个 token 的信息，信息密度更高

**为什么两套 KV (C^a, C^b)？**
- 单套 KV 压缩会在块边界丢失信息
- 两套交错压缩让每个压缩块有"前视"和"后视"两种上下文
- Overlap 保证块边界信息不丢失

### 1.2 Lightning Indexer（稀疏选择）

压缩完了，但 query token 还是不能看所有压缩块（1M / 4 = 250K 个压缩块仍然太多）。

**Step 1：再压缩 KV 得到 indexer keys**

用同样的压缩操作，把 KV 压缩到更小的 indexer head dimension c_I：

```
K^IComp ∈ R^(n/m × c_I)
```

**Step 2：产生 indexer queries（低秩）**

```
c^Q_t = h_t · W^DQ                                                (Eq 13)    d → d_c
[q^{I,1}_t; ...; q^{I,n^I_h}_t] = c^Q_t · W^IUQ                  (Eq 14)    d_c → c_I·n^I_h
```

注意：c^Q_t 是压缩后的 latent vector，由 W^DQ ∈ R^(d×d_c) 降维得到，d_c << d。

**Step 3：计算 index scores（加权 ReLU dot product）**

每个 indexer head 产生自己的 score，然后加权求和：

```
[w^{I,1}_t; ...; w^{I,n^I_h}_t] = h_t · W^w                       (Eq 15)

I_{t,s} = Σ_{h=1}^{n^I_h}  w^{I,h}_t · ReLU(q^{I,h}_t · K^IComp_s)  (Eq 16)
```

这里的设计值得注意：
- **ReLU 不是 Softmax**：Indexer 是 scoring function，不是 attention。ReLU 截断负相关，只保留正得分
- **W^w 直接从 h_t 产生**：不经过 c^Q_t 的低秩瓶颈，保留完整表达能力来学习 head importance
- **Per-head weights w^{I,h}_t**：不同 indexer head 可以关注不同类型的相关性（语义、位置、主题等）

**Step 4：Top-k 选择**

```
C^SprsComp_t = {C^Comp_s | I_{t,s} ∈ Top-k(I_{t,:})}              (Eq 17)
```

- V4-Flash: k=512
- V4-Pro: k=1024
- 每个 query token 只看 512/1024 个压缩块

**这是 query-dependent 的选择**：不同 query token 会选择不同的压缩块。这是 CSA 区别于固定稀疏模式（如 sparse attention pattern、block-sparse）的关键。

### 1.3 Shared KV MQA（Core Attention）

选中压缩块后做真正的 attention：

```
[q_{t,1}; ...; q_{t,n_h}] = c^Q_t · W^UQ                             (Eq 18)    d_c → c·n_h

o_{t,i} = CoreAttn(query=q_{t,i}, key=C^SprsComp_t, value=C^SprsComp_t)  (Eq 19)
```

关键特性：

- **MQA (Multi-Query Attention)**：多个 query heads 共享同一套 KV。压缩块本身就是 keys 也是 values
- **Shared latent c^Q_t**：attention queries 和 indexer queries 共享同一个压缩 latent vector
  - 这很重要：indexer 选出来的块，恰好是 attention queries 要用的块
  - 不是两套独立的表示空间，而是一套压缩表示驱动两个操作

### 1.4 Grouped Output Projection

n_h 很大时，c·n_h >> d，直接 output projection 计算量很大。

```
o_t ∈ R^(c·n_h)                                                      # 所有 head 输出 concat
→ split into g groups: o^G_{t,i} ∈ R^(c·n_h/g)
→ each group projected to d_g dimension (d_g < c·n_h/g)
→ concat to d_g·g, then project to d
```

两步投影降计算量：先在 group 内降维，再合并投影。

---

## 2. HCA：极致压缩 + 全量 dense

HCA 和 CSA 共享很多设计，但有两个核心区别。

### 2.1 压缩：m' >> m，无 overlap

```
C = H · W^KV                                                         (Eq 20)
Z = H · W^Z                                                          (Eq 21)

S_{m'i:m'(i+1)-1} = Softmax_row(Z_{m'i:m'(i+1)-1} + B)              (Eq 22)
C^Comp_i = Σ_{j=m'i}^{m'(i+1)-1} S_j ⊙ C_j                          (Eq 23)
```

与 CSA 的区别：
- **单套 KV (C)，不是两套**：不需要交错压缩，因为目的不同
- **m' = 128（≫ m=4）**：128:1 压缩
- **无 overlap**：每 128 个 token 独立压缩成一个块
- **只有 learnable positional bias B**：无交错结构，所以 bias 更简单

### 2.2 不做稀疏选择

HCA **没有 Lightning Indexer**，也不做 top-k。query 直接对所有 compressed blocks 做 dense attention。

为什么可以 dense？因为 m'=128 时，1M tokens → ~7812 个压缩块，这个量级做全 attention 是可承受的。

### 2.3 Shared KV MQA + Grouped Output Projection

和 CSA 相同：
- 低秩 query：c^Q_t = h_t · W^DQ，q_t = c^Q_t · W^UQ
- MQA，压缩块作为 key 和 value
- Grouped output projection

---

## 3. CSA vs HCA 对比

| 维度 | CSA | HCA |
|---|:---:|:---:|
| 压缩比 | m=4（4:1） | m'=128（128:1） |
| KV 套数 | 2（C^a, C^b），overlap | 1（C），no overlap |
| 压缩块数（1M） | ~250K | ~7.8K |
| 稀疏选择 | ✓ Lightning Indexer + Top-k | ✗ 全量 dense |
| 每个 query 看到的块 | k=512/1024 | 全部 ~7.8K |
| 信息精度 | 中细粒度 | 粗粒度 |
| 作用 | 选择性读取相关历史 | 保留全局背景 |

---

## 4. SWA：局部窗口保真

SWA 不是独立的 attention layer，而是**附加到 CSA 和 HCA 上的一个分支**。

### 4.1 为什么需要 SWA？

CSA/HCA 有两个结构性问题：

**问题 1：块内不可见**
- CSA 中每个 query 只能看到自己压缩块之前的压缩块（保持 causality）
- 也就是同一个压缩块内的 token 之间互相不可见
- 但语言建模中，相邻 token 的相关性最强

**问题 2：压缩有损**
- 4:1 压缩已经丢了一些细节
- 128:1 压缩丢得更多
- 近邻依赖需要精确 KV，不能靠压缩记忆

### 4.2 SWA 的做法

对每个 query token t，额外保留最近的 n_win 个**未压缩** KV entries：

```
SWA_KV = {K_{t-n_win}, V_{t-n_win}, ..., K_{t-1}, V_{t-1}}
```

在 core attention 中，这些 SWA KV 和 compressed KV 一起参与 attention：
```
final KV = [SWA_KV | compressed KV blocks]
```

效果：
- 近处的 token 以未压缩的精确形式参与 attention
- 远处的 token 以压缩后的块形式参与 attention
- 就是"近处高清 + 远处压缩"的 memory hierarchy

---

## 5. 混合配置：CSA 和 HCA 如何"interleaved"？

这是论文最关键但最容易忽略的设计：**不是每层都用 CSA 或 HCA，而是交替使用**。

论文说的是 "interleaved hybrid configuration"——部分层用 CSA，部分层用 HCA。

为什么要交替？

- CSA 擅长细粒度相关性检索（"第 372 页提到的那个定理"），但 top-k 有召回风险
- HCA 擅长全局背景保留（"这段文档是讲机器学习的"），但信息太粗
- 单一类型会导致：要么召回不全（全 CSA），要么细节不够（全 HCA）
- 交替使用：CSA 层捕捉细粒度证据 → HCA 层整合全局上下文 → CSA 层再做精细检索...

**可以理解为深层的 alternating access pattern**：
```
Layer 1: CSA (细粒度检索) → 找到相关证据块
Layer 2: HCA (全局整合) → 把这些证据放在整体背景下理解
Layer 3: CSA (细粒度检索) → 基于新理解再做更精确的检索
...
```

---

## 6. 共享的通用细节

这些技术同时用于 CSA 和 HCA。

### 6.1 Query 和 KV 的 RMSNorm

在 core attention 之前，对每个 head：
- query 做 RMSNorm
- compressed KV 做 RMSNorm

```
q'_h = RMSNorm(q_h)
K'_comp = RMSNorm(K_comp)
```

**作用**：防止 attention logits 爆炸。大模型深层 training 中 Q·K^T 的值可能很大，RMSNorm 把 query 和 key 都归一化，logits 就被控制在合理范围。

这也是为什么 V4 不需要 Muon 的 QK-Clip 技术——有了这个归一化，logits 自然稳定。

### 6.2 Partial RoPE（部分旋转位置编码）

只在 query 和 KV 的**最后 64 维**上应用 RoPE：

```
q[:128] = no RoPE
q[128:192] = apply RoPE with position t

K[:128] = no RoPE
K[128:192] = apply RoPE with position s
```

**为什么部分 RoPE？**

全维度 RoPE 会带来两个问题：
1. 压缩块的 KV 是多个 token 的加权和，它们的绝对位置各不相同，全维度 RoPE 会引入歧义
2. 压缩块的绝对位置信息会通过 attention 的加权和传递到输出中

**反制措施：Output RoPE**：

因为 KV 同时作为 key 和 value（MQA），attention 输出 o_{t,i} 会包含来自 KV 的绝对位置嵌入。V4 对每个 o_{t,i} 的最后 64 维也施加 RoPE，但用**负位置**：

```
o_{t,i}[128:192] = apply RoPE(o_{t,i}[128:192], position=-i)
```

这样，每个 KV entry 对最终输出的贡献中，位置信息表现为 query 和 KV 的**相对位置**（s - i），而不是绝对位置 s。这是一套精巧的相对位置编码保持方案。

### 6.3 Attention Sink

在 core attention 的 softmax 分母中加一个 learnable sink logit z'_h：

```
s_{h,i,j} = exp(z_{h,i,j}) / (Σ_k exp(z_{h,i,k}) + exp(z'_h))
```

这是 OpenAI 和 Xiao et al. 发现的现象：attention heads 天然需要一个"废纸篓"来倾倒多余的 attention mass。如果不提供 sink，某些 head 会强制关注前几个 token（通常是 BOS token），造成不必要的模式偏差。

V4 给每个 head 一个 learnable sink logit z'_h：
- 如果 z'_h 很大：这个 head 可以把多余的 attention 排到 sink，实际有效 attention 变小
- 如果 z'_h 很小（→ -∞）：sink 几乎不吸收 attention，head 正常工作
- 每个 head 自己学需要多少 sink 容量

---

## 7. 效率全景：混合精度 + 混合注意力

### 7.1 KV Cache 精度混合

```
RoPE 维度（最后 64 维）：BF16
其余维度：[FP8](/concepts/fp8/)
```

相比纯 BF16，KV cache 减半。

### 7.2 Indexer 用 FP4

CSA 的 Lightning Indexer 不是主 attention，对精度要求相对低。用 FP4 做 indexer 的 attention computation，加速明显。

### 7.3 Index Scores 量化

index scores 从 FP32 量化到 BF16，top-k selector 约 2× 加速，KV recall 保持 99.7%。

### 7.4 最终数字（1M context）

相比 BF16 GQA8 baseline：
- **KV cache 降到约 2%**

相比 DeepSeek-V3.2（已是很高效的 baseline）：
- V4-Pro：**27% single-token FLOPs，10% KV cache**
- V4-Flash：**10% single-token FLOPs，7% KV cache**

---

## 8. 混合注意力的计算流程图解

以 V4-Flash 为例，一个 query token t 经过 CSA 层的完整路径：

```
Input: h_t ∈ R^d

1. Down Project
   h_t → c^Q_t ∈ R^{d_c}                    (W^DQ)
                                       
2a. Indexer Queries（低秩）                2b. Indexer Head Weights（全秩）
    c^Q_t → {q^{I,1}_t, ..., q^{I,n^I_h}_t}    h_t → {w^{I,1}_t, ..., w^{I,n^I_h}_t}

3. Index Scores
   I_{t,s} = Σ_h w^{I,h}_t · ReLU(q^{I,h}_t · K^IComp_s)
   
4. Top-k Selection
   C^SprsComp_t = {C^Comp_s | I_{t,s} ∈ Top-512}

5. Attention Queries
   c^Q_t → {q_{t,1}, ..., q_{t,n_h}}

6. Core Attention (MQA)
   o_{t,i} = Attn(q_{t,i}, [SWA_KV | C^SprsComp_t], [SWA_KV | C^SprsComp_t])

7. Output RoPE
   o_{t,i}[128:192] = RoPE(o_{t,i}[128:192], -i)

8. Grouped Output Projection
   o_t ∈ R^{c·n_h} → split into g groups → low-dim projection → concat → d-dim output

Output: ô_t ∈ R^d
```

对 HCA 层，跳过 step 2a-3-4（indexer 和 top-k），step 6 中用全部 C^Comp 替换 C^SprsComp_t。

---

## 9. 核心洞察总结

### 9.1 CSA 的三个精妙设计

1. **双路交错压缩（C^a, C^b + overlap）**：既保证 4:1 压缩比，又让块边界信息不丢失
2. **共享 latent c^Q_t**：indexer 和 attention queries 共享低秩表示，保证 indexer 选出的块正好是 attention 需要的
3. **加权 ReLU indexer（非 Softmax）**：indexer 是 scoring 不是 attention，ReLU 天然做稀疏化，多 head + learned weights 组合不同信号

### 9.2 HCA 的角色

HCA 是"安全网"——CSA 的 top-k 选择可能遗漏重要信息，HCA 以 128:1 的粗粒度覆盖全序列，提供不能被遗漏的全局背景。代价是信息粗糙。

### 9.3 混合的核心哲学

```
SWA:  近 → 高清 → 局部流畅
CSA:  远 → 可选 → 按需检索
HCA:  全 → 粗糙 → 全局兜底

交替使用：深度方向上形成 alternating fine/coarse access pattern
```

这不是三选一，而是**三层同时工作，层间交替配置**。每个 query token 同时拥有：
- 最近 n_win 个 token 的精确 KV（SWA）
- 通过内容检索选出的 512/1024 个压缩块（CSA path）
- （如果是 HCA 层）全部 ~7.8K 个粗压缩块（HCA path）

---

## 10. 你可能会追问的问题

### Q1: Indexer 本身不也是 attention 吗？它的计算量呢？

Indexer 的 dot product 是用 FP4 在 c_I 维度上做的（c_I 比 c 小很多），且只用单 head shared KV。相比主 attention，indexer 的 FLOPs 小一个数量级以上。论文把 index scores 量化到 BF16 后 selector 有 2x 加速。

### Q2: 压缩权重 Z 是 learnable 的，但怎么保证它学到好的压缩？

压缩目标是让 attention 结果尽可能接近全 attention。虽然没有显式的压缩 loss（压缩是可微的，端到端训练），但：
- Softmax 使得权重归一化
- Positional bias B 给位置先验（比如块内中心 token 权重可能更高）
- 模型损失会驱动 Z 学习有效的信息整合方式

### Q3: CSA 的 top-k 选择是 per-head 还是 shared？

论文没说得很明确，但从 Eq 17 看，C^SprsComp_t 是 per-token 的（没有 head 下标），而 index scores I_{t,s} 是 weighted sum over indexer heads（Eq 16）。所以是 **shared KV selection，multi-head attention on it**。

### Q4: 交替比例的 ablation？

论文没有给出 CSA/HCA 的交替比例 ablation。这是一个开放问题——什么比例最优？前几层做什么？不同任务需要不同比例吗？

---

## 11. 和现有你的知识体系的衔接

你已经学过的：
- **V4 整体架构**：CSA/HCA 在哪，和 [MoE](/concepts/moe/)/mHC/Muon 什么关系
- **视觉原语论文**：V4-Flash 的 CSA 怎么帮助压缩视觉 KV cache（从 324 → 81 个视觉 KV entries）

现在你多知道了：
- CSA 的压缩公式（双路 + overlap）和 indexer 公式（加权 ReLU）
- HCA 的简化压缩（单路 + 无 overlap）
- SWA 为什么是补充分支不是替代
- 精度混合（BF16/FP8/FP4）在哪些路径上
- Partial RoPE + Output RoPE 的位置编码方案
- Attention Sink 的作用

下一层可以深挖的方向：
- mHC 的数学细节（doubly stochastic manifold 约束怎么保证）
- Muon 的 Newton-Schulz 迭代为什么两阶段切换系数
- Anticipatory Routing 的稳定性机制
- OPD 的 full-vocabulary KL 工程细节