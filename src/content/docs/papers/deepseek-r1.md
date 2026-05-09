---
title: "DeepSeek-R1: Incentivizing Reasoning via Reinforcement Learning"
description: "组内深度解读 · DeepSeek-R1: 用纯 RL（无 SFT）涌现 long-CoT reasoning，及 GRPO 的工程取舍"
sidebar:
  label: DeepSeek-R1
themes:
  - test-time-reasoning
status: published
exemplar: true
concept_refs:
  - grpo
  - moe
  - mla
  - fp8
---

> 📌 **这是一篇 exemplar paper note** —— 当你 `pnpm init:group` 重置示例内容时，**这篇会被保留** 作为"什么是好的组内 paper note"的样板。如果你的组想保留它就保留；想删掉就在 frontmatter 把 `exemplar: true` 删掉重新跑 init。
>
> 阅读本身按"组内带读人讲两小时"的密度写的，长但密度高。建议**带着 R1 论文 PDF 对照读**。

## 元信息

| 字段 | 值 |
|------|---|
| **作者** | DeepSeek-AI Team |
| **arXiv** | [2501.12948](https://arxiv.org/abs/2501.12948) |
| **发表** | 2025-01-22 |
| **代码 / Weights** | [github.com/deepseek-ai/DeepSeek-R1](https://github.com/deepseek-ai/DeepSeek-R1) · MIT License |
| **基座** | DeepSeek-V3-Base（MoE 671B 总参 / 37B 激活） |
| **关联主线** | 《推理 / test-time compute》主线（按你们组实际名字替换） |
| **关联概念** | [GRPO](/concepts/grpo/) · [MoE](/concepts/moe/) · [MLA](/concepts/mla/) |
| **关联 session** | 《R1 首次共读》（你们的 W?? session） |
| **带读人** | _‹带读人⁀_（当你们真共读这篇时填上） |
| **状态** | ✅ published（示范用的 exemplar）｜ |

## 一句话总结

> **不靠 SFT、不靠 PRM、不靠 MCTS，仅用规则奖励 + GRPO 在 DeepSeek-V3-Base 上做 RL，模型自己"涌现"出 long-CoT reasoning，并能蒸馏给小模型。**

这一句里有三个关键反直觉，每一条都值得拆开看：

1. **不靠 SFT** —— R1-Zero 直接在 base model 上跑 RL，没有 reasoning SFT 启动；
2. **不靠 PRM / MCTS** —— 业界过去两年（OpenAI o1 出来之后）默认 long-CoT 必须靠 process reward model 或搜索，R1 用纯 outcome reward 就训出来；
3. **小模型不靠 RL，靠蒸馏** —— 把 R1 的输出 SFT 到小模型，比小模型自己跑 RL 更强。

这三条颠覆了 2024 后期"reasoning 必须复杂"的主流叙事。

## 我们组为什么读这篇

> 这一节由带读人写。读一篇论文之前先想清楚"为什么现在读它，对组里有什么影响"。
>
> 下面的段落是 *可能的 reasoning 主线的组*写的版本。你们组采用这个模板时按自己情况改写。

我们组《推理 / test-time compute》主线的核心问题是 **"大模型在测试时多花算力，能不能真正提升 reasoning 能力（而非简单的 verbosity）"**。

R1 在 2025 年 1 月出来之前，组里默认的 reasoning training 路线是：

```text
SFT (long CoT data, 几十万条) → RM 训练 → PPO + 价值网络
                ↑                              ↑
        数据从哪来？               critic 训练不稳
        人工标注成本太高           大模型上 RL infra 痛苦
```

R1 把这条路彻底简化成：

```text
直接 RL（GRPO，无 critic）+ 规则奖励（数学答对 / 代码通过测试）
```

**对我们组的实际影响**：

- **数据侧**：我们之前花在收集 long-CoT SFT 数据的精力可以省下 60%+，把投入挪到 verifiable reward 设计上
- **infra 侧**：去掉 critic 网络后，RL infra 的内存压力降低约一半（critic 与 actor 通常同规模），这让我们小集群上 RL 训练 30B 模型从"勉强可行"变成"舒适"
- **方法论**：R1-Zero 的"涌现"现象说明 base model 可能本来就有 reasoning 能力，只是缺一个"激活"的 RL 信号（与 MoE 训练中"专家激活的稀疏性是预先存在的"是同一种故事）

## 关键贡献（按重要性排）

### 1. GRPO：去掉 critic 的 PPO 简化版

把 PPO 里"用 critic 估 advantage"这一步换成"用同一个 prompt 的 G 个 rollout 的相对排名"作 baseline。

**为什么这个最重要**：critic 网络是 RL infra 最痛的部分（双倍内存、双倍训练复杂度、离线相关性问题）。GRPO 一刀切掉，换来的是采样开销增加 G 倍 —— 但**采样可以推理-only**（不需要训练状态），并行 / decoupled 容易得多。

工程上是把"训练昂贵的部分"换成了"推理便宜的部分"。这个 trade-off 是 LLM RL infra 的关键转折。

### 2. R1-Zero：纯 RL on base model 涌现 long-CoT

不做任何 SFT 启动，直接在 V3-Base 上跑 GRPO，规则奖励是：

- **Accuracy reward**：数学题答案对不对（用规则匹配），代码通过测试不通过；
- **Format reward**：模型必须把推理放 `<think>...</think>` 里、答案放 `<answer>...</answer>` 里。

跑了几千步后，R1-Zero 自己发展出：

- 平均输出长度从几百 token 涨到几千；
- 自发出现 "Let me reconsider..." / "Wait, that's not right" 这类**反思 / 自我纠错**句式；
- AIME 2024 pass@1 从 V3-Base 的 ~16% 提升到 71%（多数表决到 86%），追平 OpenAI o1-0912。

> **"Aha moment"**（论文 §4.3）：训练曲线某个时刻，模型突然"想通了"要在中间步骤停下来重审，输出长度阶跃式增加。论文里那张训练曲线图（Figure 3）值得贴在带读现场让大家看 —— 这是文章最有冲击力的一张图。

### 3. R1 多阶段 pipeline：兼顾 reasoning + 通用能力

R1-Zero 虽然 reasoning 强，但有两个明显缺点：

- 输出格式难看（mix 中英文、不停跑题）
- 通用能力（写作、对话、安全）被牺牲

所以正式的 R1 走了**四阶段** pipeline：

```text
[Stage 1] Cold-start SFT
  数千条人工 / R1-Zero 蒸馏的 long-CoT 高质量样本，启动 base model
       ↓
[Stage 2] Reasoning-oriented RL
  在 reasoning-heavy domain 上 GRPO（数学 / 代码 / 逻辑），加 language consistency reward 抑制中英文混杂
       ↓
[Stage 3] Rejection-sampling SFT + 通用数据
  从 stage 2 输出里筛 600k reasoning + 200k 通用对话 / 写作 / 翻译 → 全量 SFT
       ↓
[Stage 4] All-scenario RL
  RLHF 风格全场景 RL：reasoning 用 rule reward，通用任务用 RM
```

**Stage 1 的"cold-start"是关键**：直接 R1-Zero 输出当 SFT 数据虽然 reasoning 好，但格式乱；用人工筛 / 重写过的几千条启动，让模型 "学会怎么说人话地 reason"。**几千条** —— 比传统 reasoning SFT 的几十万条少两个数量级。

### 4. 蒸馏 > 在小模型上做 RL

把 R1 输出的 800k SFT 数据，喂给 Qwen-32B / Llama-70B 等小模型，纯 SFT，不做 RL。

**结果**（论文 Table 5）：蒸馏后的 Qwen-32B 在 AIME 上 72.6%，**直接对小模型做 GRPO 只能到 47%**。

这说明：

- 小模型缺的不是 RL 算力，是**"被激活"的 reasoning capacity** —— 而这个 capacity 必须先在大模型上 RL 出来才能教给小模型；
- 实践含义：**学术界 / 中型实验室不要在 7B-30B 上烧 RL**，等 frontier lab 出 SOTA reasoning model，蒸馏即可。

## 方法详解 · GRPO 算法

### PPO 基线（对照）

PPO 在每个 prompt $q$ 上：

1. Actor $\pi_\theta$ 采样一个轨迹 $o$
2. Critic $V_\phi$ 估值 $V(s_t)$
3. 用 GAE 算 advantage $\hat A_t$
4. clipped policy gradient 更新 actor，MSE loss 更新 critic

代价：critic 与 actor 通常同等大小（1×–2× actor 参数量），训练时**两个网络并行**。

### GRPO（论文 Eq. 1–3）

每个 prompt $q$ 采样一**组** $G$ 个 rollouts $\{o_1, ..., o_G\}$，每个 rollout 拿到一个标量 reward $r_i$。

定义组内相对 advantage：

$$
\hat A_i = \frac{r_i - \mathrm{mean}(\{r_1, \ldots, r_G\})}{\mathrm{std}(\{r_1, \ldots, r_G\})}
$$

这就是 baseline —— **用同 prompt 别的 rollout 的平均 reward 当 baseline**，不需要 critic。

更新仍是 PPO-style clipped objective：

$$
\mathcal{L}_{\text{GRPO}} = \mathbb{E}_{q, \{o_i\}} \left[ \frac{1}{G} \sum_{i=1}^G \min\left( \frac{\pi_\theta(o_i|q)}{\pi_{\theta_{\text{old}}}(o_i|q)} \hat A_i, \, \mathrm{clip}(\cdot, 1-\epsilon, 1+\epsilon) \hat A_i \right) - \beta \, \mathrm{KL}[\pi_\theta || \pi_{\text{ref}}] \right]
$$

KL 正则用 ref policy（通常是 SFT 模型）防 policy 漂移太远。

### G 该选多大？组里讨论的几个观点

> 这一节是 W19 共读时讨论出来的，记下来。

- **G = 1** → 退化成 REINFORCE-with-no-baseline，方差大；
- **G → ∞** → mean 趋近真实 expected reward，等价于完美 critic，但采样成本爆炸；
- **DeepSeek 选 G = 16**：经验上够稳，单 prompt 16 路 rollout 在 vLLM 这类引擎上仍然 batch 友好。

一个值得验证的猜想（示例提问，你们组带读时替换为真实提问人）：**G 应该自适应于 reward 方差** —— 简单 prompt（reward 几乎都对或都错）G = 4 就够，难 prompt G = 32 才能拿到有效梯度。有价值的 short paper 题材。

## 关键实验 / 结果

| Benchmark | V3-Base | R1-Zero | R1 | OpenAI o1-1217 |
|-----------|---------|---------|-----|----------------|
| AIME 2024 (pass@1) | 16.0% | 71.0% | **79.8%** | 79.2% |
| MATH-500 | 73.8% | 95.9% | **97.3%** | 96.4% |
| Codeforces (rating) | 759 | 1444 | **2029** | 2061 |
| MMLU | 88.5% | 90.0% | **90.8%** | 91.8% |
| GPQA Diamond | 56.8% | 73.3% | **71.5%** | 75.7% |

蒸馏出的小模型（论文 Table 5）：

| 模型 | AIME 2024 | MATH-500 |
|------|-----------|----------|
| DeepSeek-R1-Distill-Qwen-32B | 72.6% | 94.3% |
| DeepSeek-R1-Distill-Llama-70B | 70.0% | 94.5% |
| Qwen-32B + GRPO（直接 RL，对照） | 47.0% | 91.6% |

> **解读**：32B 蒸馏几乎打平 671B 的 R1-Zero，且远超直接对 32B 做 RL。

## 我们组的 take

> 这一节是组内立场，不是论文复述。**这是 paper note 最重要的一节**，决定这篇读完之后我们做什么。

### 1. 短期接入 baseline（例：2-4 周内）

这一节是 *示范版本*，实际用时替换为你们组的 baseline 模型 / 成员 / 时间节点。

接 GRPO 到现有 baseline SFT 模型，验证三件事：

- **GRPO infra 端到端能跑**（带读人 owner）
- **AIME 提升幅度**：是否能复现"几百步训练涨 30+ 个点"
- **G 自适应**：上述猜想做 ablation（G = 4/8/16/32 + reward variance buckets）

详细 plan 见 session 的 action items。

### 2. 中期：reward design 是 1 号瓶颈

R1 之所以能成是因为**数学 / 代码有 verifiable reward**。我们组真正关心的多模态推理 / 多轮 agent 任务**没有这种 clean reward**。

下一步要做的是：

- 给我们关心的任务设计 hybrid reward（rule-based + LLM-as-judge）
- 评估 GRPO 在 noisy reward 下的鲁棒性 —— 这是论文 §6.2 提到但没充分实验的

### 3. 长期：蒸馏路线 vs. 自研 RL

如果 SOTA reasoning 模型 weights 持续开源（R1 / R1-V2 / Qwen-Reasoning ...），**学术界做 RL training 的边际价值在快速递减**。

我们的核心竞争力应该转向：

- 蒸馏的**机制**研究（什么知识能蒸馏、什么不能、如何最小数据量）
- **应用域**的 reward 设计（这是闭源模型不会替我们做的）

不要陷入"再训一遍 R1"的陷阱。

## 局限与未解问题

> 论文自己承认（§6） + 我们的额外质疑。

### 论文自己承认

1. **Language mixing**：R1-Zero 中英文混杂严重，R1 加了 language consistency reward 缓解但仍有
2. **Prompting sensitivity**：few-shot prompting 反而让 R1 变差，必须 zero-shot —— 与 GPT-4 系列相反
3. **Software engineering**：在 SWE-bench 这类需要复杂工具调用的任务上，R1 落后 GPT-4o
4. **多语言之外的语言**：英中双语训练导致其他语言 reasoning 能力退化

### 我们的额外质疑

1. **"Aha moment" 是真涌现，还是 reward hacking？** —— 模型是否只是学会了一个能 "讨好" reward 的句式模板？需要做 careful counterfactual 分析。
2. **G = 16 的选择有没有更深层依据？** —— 论文没有 ablation，值得自己组上做
3. **Cold-start SFT 数据真的"几千条"够吗？** —— 这个数字小到反直觉，需要复现验证
4. **RL 训练里出现的 "language consistency reward" 调权重** —— 论文一笔带过，但这是 multi-objective RL 的核心痛点，工程上怎么 tune 的没说

## 开放问题（可作为后续 paper / project 切入点）

- **GRPO 在 partial-credit reward 下的行为** —— 不是 0/1 reward，而是连续分数（如 LLM-judge 0–10），相对归一化是否还稳定？
- **G 自适应**（前文提出，**值得做 short paper**）
- **reasoning 蒸馏的 lower bound**：R1 → 7B 还有效吗？800k 数据 → 80k / 8k 还行吗？
- **多模态版 R1**：visual / video 任务的 verifiable reward 怎么设计？这是我们组下一篇 paper 的**潜在方向**。

## 共读历史

> 你们组真共读过这篇后加到这里，格式：「**YYYY-Wxx**（链到 session）—— 带读人 + 重点」。
>
> （后续计划由 agent skill 自动维护这一节。）

## 延伸阅读

### 直接前驱

- [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300) —— GRPO 的原始论文（DeepSeek 2024-02），R1 是把它 scale 到 V3-Base
- [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437) —— R1 的 base model

### 同期 / 对照

- [OpenAI o1 system card](https://openai.com/o1/) —— 闭源 SOTA，与 R1 直接对比
- [QwQ-32B-Preview](https://qwenlm.github.io/blog/qwq-32b-preview/)（阿里 2024-11）—— 同期开源 reasoning 尝试，quality 不如 R1
- [Tülu 3](https://arxiv.org/abs/2411.15124)（AI2 2024-11）—— 开源 RL 训练 recipe，与 R1 对照看 PPO vs. GRPO

### 概念基础

- [GRPO 概念词条](/concepts/grpo/) · [MoE](/concepts/moe/) · [MLA](/concepts/mla/) · [FP8](/concepts/fp8/)

### 我们组相关

> 示示范性：构建这篇 paper note 时应该链到你们组自己的相关资源。比如：
>
> - 某个友邻共读（同公司的其他模型 / 前驱模型 / 同期对手模型）
> - 你们组相关的主线 page，比如 《推理主线》或 《RL 基础设施》
