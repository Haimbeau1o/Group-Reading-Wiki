---
iteration: 4
generated_at: 2026-05-12
sources_count: 4
confidence: medium
cn_source_ratio: 0.00
---

# Discipline 02 · Wet Lab（生物 / 化学 / 材料 / 医学）

## 一句话定位

**项目的 paper-centric 假设在湿实验组只覆盖一半场景**。湿实验组的核心信息是 **protocol（步骤 SOP）+ batch（样品批次）+ result（实验记录）**，paper reading 只是辅助。已有 ELN（电子实验记录本）生态成熟，**`ai-paper-wiki` 试图直接服务湿实验组的 ROI 较低**，但**可以与 ELN 共存做"paper-side"**。

> ⚠ **本文件中文 source = 0**，违反 §3.2 30% 阈值。Iteration 5/6 需要补湿实验中文 source（中国课题组生物化学版 / 小木虫论坛 / 丁香园等）。已用 `confidence: medium` 标记。

---

## 湿实验组的特征性行为

| 特征 | 描述 | `ai-paper-wiki` 现状契合度 |
|------|------|---------------|
| **实验周期长** | 单次实验 1 周-3 月不等，远长于 AI/ML 模型训练 | 不直接适用 |
| **protocol 是核心资产** | 每个组都有几十到几百个 SOP，跨届传承 | ✗ wiki 没有 protocol schema |
| **样品 / 试剂 / 设备管理** | 与论文知识完全不同维度的工作 | ✗ wiki 不该做这块 |
| **批次错误成本极高** | 一个 batch 错了浪费 2 月，记录刚需 | ✗ ELN 的核心场景 |
| **论文阅读密度低于 AI/ML** | 一周 1-3 篇 vs AI/ML 5-20 篇 | △ wiki 仍可服务但 ROI 降 |
| **博士周期更长** | 通常 5-7 年，tacit knowledge 积累更厚 | ✓ graduation handoff 更刚需 |

---

## 关键证据

### ELN 已成湿实验组的"事实标准"
> "ELNs are connected to a networked digital environment through their import and export functions and seamless interfaces to other programmes." [...] "ELNs enable researchers to collaborate, whether within their own group or with others, through a common medium." [...] "ELNs make an important contribution to Good Research Practice by facilitating the tracking, tracing, and documentation of research processes and results through time." — [Ten simple rules for implementing ELNs (PMC11189195, PLOS Comp Bio 2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11189195/), accessed 2026-05-12 `[H]`

### ELN 不覆盖 paper reading / 概念笔记
> 同一篇 PLOS Comp Bio 论文：**No mentions of reading groups or paper review documentation procedures appear in this text**.
— `ai-paper-wiki` 的差异化机会：和 ELN 共存做 reading-side。

### 学科专用 ELN 生态成熟
> "There are discipline-specific ELNs such as Chemotion for chemistry, eLabJournal for molecular biology, and PsychNotebook for psychology. Other notable platforms mentioned include SciNote, LabArchives, eLabFTW (open-source), Labii, and SciSure." — paraphrased from WebSearch summary, accessed 2026-05-12 `[M]`

### protocols.io 是公开 protocol 库
> "SciNote is integrated with protocols.io, allowing you to simply choose a protocol and import it." — paraphrased from WebSearch summary citing [SciNote](https://www.scinote.net/), accessed 2026-05-12 `[M]`

### ELN 也存在采用障碍
> "Implementing and using an ELN requires time, ongoing support, and training." [...] "Open-source ELNs can be time-consuming to run and maintain and may require the purchase of server hardware." [...] "Proprietary ELNs are expensive, and the vendor may go out of business or raise their prices." — [PMC11189195](https://pmc.ncbi.nlm.nih.gov/articles/PMC11189195/), accessed 2026-05-12 `[H]`

—— **湿实验组并非"已经全部用上 ELN"**，仍有空白市场。但若 `ai-paper-wiki` 想进入，需要补 protocol / batch / sample 三个 schema —— 偏离当前定位。

---

## 对 `ai-paper-wiki` 的契合度评分

**2 / 5** —— **不建议作为主战场**

### 建议（关键决策）

1. **【强信号 / 收窄建议 H】明确"不服务湿实验全栈"** —— README 应当显式声明 `ai-paper-wiki` 是"reading-side wiki"，与 ELN（protocol/batch side）互补。**降低湿实验 PI 的错误期待，避免承诺做不到的事**
2. **【中信号 M】湿实验组的可服务子集** —— 即使是湿实验组，PI / 博后 / 学生也读 paper、开 reading group。`ai-paper-wiki` 可以作为"reading-side 子项目"被湿实验组采用，与 ELN 并存
3. **【中信号 M】"与 ELN 互操作"hint** —— `papers/<slug>.md` 可以加 `eln_protocols: [labarchives-url, ...]` 字段，让 reading note 引用 ELN 里的实验记录（但 ELN 鉴权问题暂不解决，只做 URL 链接）
4. **【弱信号 L / 待验证】"湿实验 + AI"组的 sweet spot** —— 比如 AI for biology / AI for chemistry 这类**混合组**，paper 密度足够高，又有 wet-lab 文化。可以作为 v2 探索方向
5. **【反向意见】**`ai-paper-wiki` 的 14 skill 没有一个针对 protocol / batch / sample —— 这是**正确**的设计，应该坚持不扩散到 ELN 领域，避免和 LabArchives / SciNote / eLabFTW 直接竞争

---

## 风险 / 待验证

- **中文 source 缺失** —— 国内生物 / 化学课题组的实际工作流（多少用 ELN、多少用 OneNote / 微信、protocols.io 渗透率）没有 source 支持。本文件结论可能对中国湿实验组过度悲观
- 湿实验 + AI 的混合组（如 AlphaFold 用户）在中文学术界正在兴起，可能是 v2 的真正机会

---

## Sources

1. [Ten simple rules for implementing electronic lab notebooks (PMC11189195)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11189195/) `[H]`
2. [SciNote — Electronic Lab Notebook](https://www.scinote.net/) `[M]`
3. [LabArchives — The Modern Electronic Lab Notebook](https://www.labarchives.com/) `[M]`
4. [Harvard Medical School — Electronic Lab Notebooks](https://datamanagement.hms.harvard.edu/collect-analyze/electronic-lab-notebooks) `[M]`

**中文 source 占比**：0/4 = 0% ✗（**违反 §3.2 30% 阈值**，已在头部声明 + confidence 降级；遗留问题：Iteration 5/6 补中文湿实验 source）
