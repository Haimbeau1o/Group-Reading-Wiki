---
title: W18 · DeepSeek-V4 长上下文架构
description: 2026-W18 周会共读。带读人：PhD-Senior-1。主题：CSA + HCA 混合注意力。
sidebar:
  order: 1
  label: 2026-W18 · V4 长上下文
# ─── Session 元信息 ───
session_week: 2026-W18
session_date: 2026-05-04
lead: phd-senior-1
# 注：本 session 关联的是 /deepseek/ 深度专辑文章（非 /papers/ 下的正式 paper note），
#     在正文 "📅 元信息" 表格的 **关联文章** 行用普通 markdown 链接引用。
paper_refs: []
themes:
  - long-context
status: live   # upcoming / live / archived
---

> ⚠️ **占位 session**。实际带读时由带读人替换为真实内容。结构作为模板使用。

## 📅 元信息

| 字段 | 值 |
|------|----|
| **周次** | 2026-W18 |
| **时间** | 2026-05-04（周一）14:00–15:30 |
| **带读人** | [PhD-Senior-1](/members/phd-senior-1/) |
| **会议地点** | 实验室 + 腾讯会议（链接见组群） |
| **主 paper** | [DeepSeek-V4 研究深度解析](/deepseek/v4-research/)（重点 §5、§7） |
| **配套** | [混合注意力机制 (SWA + CSA + HCA)](/deepseek/hybrid-attention/) |
| **关联主线** | [长上下文效率](/themes/long-context/) |

---

## 1. 📝 Pre-read（会前）

### 必读

- [V4 研究深度解析](/deepseek/v4-research/) §5（CSA + HCA） + §7（效率全景）
- [混合注意力机制](/deepseek/hybrid-attention/) 全文

### 选读

- [概念词典 · MLA](/concepts/mla/)（CSA / HCA 的前身）

### 引导问题（带读人提）

1. **CSA 与 HCA 的核心差异是什么？** 为什么要两个并存？
2. **Lightning Indexer 用 FP4** —— 为什么主 attention 用 BF16/FP8 但 indexer 可以激进降到 FP4？
3. **Partial RoPE + Output RoPE** 的设计取舍：与传统 RoPE 相比好在哪？

### 大家的 pre-read 问题（会前留言）

> 在评论区抛你看不懂或想讨论的点。

- *@PhD-New-1（占位）*：HCA 的 single path 是否意味着信息容量比 CSA 小？(2026-05-03)
- *@MS-Research-1（占位）*：CSA 的 indexer 是单独训练还是与主网联合训练？(2026-05-03)
- *……*

---

## 2. 🎯 Live notes（会中）

> 带读人或指定记录员实时记。**不必整齐** —— 后面会补。

### 14:00–14:20 · 引入

- 为什么这篇值得读：1M context 是当下最被讨论的方向之一；V4 的设计是工程系统级的回答，不是单纯算法替换
- 简要回顾上周共读到 V3 → V4 的演化背景

### 14:20–14:50 · CSA + HCA 详解

- CSA 的双路压缩公式（带读人在白板画）
- HCA 的简化（单路无 overlap）—— 适合什么场景？
- 关键洞见：**两者交替而不是叠加**，避免计算量翻倍

### 14:50–15:10 · 效率全景

- KV cache 精度混合（RoPE 维度 BF16 / 其余维度 [FP8](/concepts/fp8/)）
- Indexer FP4 + index scores 量化为 BF16
- 结论：精度混合不是均匀降，而是**按"对最终结果敏感度"分层**

### 15:10–15:30 · 自由讨论

> 带读人讲完后大家的提问 / 异议 / 联想。

- *@Postdoc-1*：是否可以拆出"独立 indexer + 主 attention"作为通用模块在我们 baseline 上试？
- *@Leon*：我们组关心的不是 V4 实现细节，而是它揭示的一个原则 —— [见 post-meeting key insights]

---

## 3. 💡 Post-meeting（会后）

> **带读人在周二补完**。从 live notes 提炼。

### Key insights

1. **混合注意力的本质是 memory hierarchy**：把 SWA / CSA / HCA 看成 L1 / L2 / L3 cache 的三级局部性，比单纯把它们当不同 attention 算子更易理解。
2. **精度混合的"敏感度分层"思想**比具体的 BF16/FP8/FP4 数值更值得抽象 —— 这是个**通用工程原则**，不只用于 attention。
3. **CSA Indexer 的独立性**让它有可能作为一个**可移植模块**接到我们组现有 baseline。值得后续验证。

### Action items

- [ ] **PhD-Senior-1**：把 indexer 独立模块化，在我们组的 baseline 上跑 ablation（截止 W21）
- [ ] **PhD-Mid-1**：写一篇短 wiki 总结"我们组对长上下文的立场" —— 放到 [/themes/long-context/](/themes/long-context/)
- [ ] **MS-Research-1**：补一篇概念词典词条 [SWA](/concepts/) （目前缺失）

### 与组工作的关联

- 直接关联：[长上下文效率主线](/themes/long-context/) 的开放问题 #1（CSA/HCA 混合比例自适应）
- 启发：MoE 训练稳定性方向是否也能借鉴"敏感度分层"思想？需要 [Postdoc-1](/members/postdoc-1/) 评估

### 评论区延伸讨论

> 后续追问 / 补充 / 反对意见，欢迎在下方 Giscus 评论区继续。
