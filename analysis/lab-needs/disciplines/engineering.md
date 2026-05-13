---
iteration: 4
generated_at: 2026-05-12
sources_count: 4
confidence: medium
cn_source_ratio: 0.25
---

# Discipline 03 · Engineering（机械 / 电子 / 系统 / 控制 / 信号）

## 一句话定位

**工程学科与 AI/ML 在"重代码、重项目、重实验"维度相似，但 paper-driven 程度低于 AI/ML，project-driven 程度高于 AI/ML**。工程学科的"reading group" 更多是 reference 性质而非主线活动。`ai-paper-wiki` 对工程组有 60% 适配度——比湿实验高，比 AI/ML 低。

> ⚠ **本文件中文 source 占比 25%**，低于 §3.2 30% 阈值。已用 `confidence: medium` 标记。

---

## 工程学科课题组的特征性行为

| 特征 | 描述 | `ai-paper-wiki` 现状契合度 |
|------|------|---------------|
| **project-driven** | 通常带横向（企业合作）/ 国家课题，项目交付物比 paper 更重 | △ wiki 没有 project schema |
| **设计文档比 reading 多** | 电路图 / CAD / 仿真 setup / 系统架构 | △ Mermaid 可用，但缺专用 schema |
| **paper reading 较窄** | 通常只跟随直接相关的领域期刊 | ✓ paper schema 仍可用 |
| **代码 + 硬件 + 测试** | 比 AI/ML 多一维硬件 / 实物 | ✗ 不在项目范围 |
| **横向项目带商业敏感** | 与企业合作部分不能公开 | ✓ Cloudflare Access 私域支持 |
| **博士周期接近 AI/ML** | 4-5 年；偏应用方向毕业去工业为主 | (无直接影响) |

---

## 关键证据

### ELN 在工程类实验室同样适用，但市场偏工业
> "Electronic lab notebooks enable scientists, engineers and technicians to document research, experimental data and procedures performed in a laboratory" — paraphrased from WebSearch summary, accessed 2026-05-12 `[M]`
> "The global ELN market size is increasing from $613.5 Million in 2023 to a projected $1,276.3 Million by 2033." — paraphrased from WebSearch summary, accessed 2026-05-12 `[M]`

ELN 市场快速增长但客户多是工业 R&D（pharma、材料、化工）。学术工程组的渗透率仍较低。

### "项目交接"是工程组刚需（与 cycle-05 graduation 共振）
> "Java程序员交接文档通常包含项目概述、技术架构、代码结构、数据库结构、运行环境和开发环境" — paraphrased from [知乎专栏 — 程序员如何做好工作交接](https://zhuanlan.zhihu.com/p/29297794), accessed 2026-05-12 `[M]` 【中文】

工程学科的代码 / 硬件交接对 wiki 的要求与软件工程团队接近——结构化、可执行、可复现。这是 `ai-paper-wiki` 的 `graduation-handoff` skill 可以发力的场景。

### ELN 整合 LIMS 趋势（与 ai-paper-wiki 定位脱钩）
> "Integrated ELNs combine traditional ELN functionalities with additional tools such as Laboratory Information Management Systems (LIMS), sample tracking, and workflow automation" — paraphrased from WebSearch summary, accessed 2026-05-12 `[M]`

—— ELN + LIMS 是工业级方案，`ai-paper-wiki` 不在这条路径上。

---

## 对 `ai-paper-wiki` 的契合度评分

**3 / 5** —— **次要市场，不主推但可被采用**

### 工程组该用 `ai-paper-wiki` 做什么 / 不做什么

| 适合做 | 不适合做 |
|--------|----------|
| ✓ Paper reading group 笔记 / 概念词典 | ✗ 设计文件管理（用 PDM / Git LFS） |
| ✓ 主线 / 子方向地图 | ✗ 仿真 / 测试结果归档（用 ELN / Jupyter） |
| ✓ 成员主页 + 招生 | ✗ 横向项目交付管理（用 Jira / Teambition） |
| ✓ Graduation handoff（cycle-05） | ✗ 硬件 BOM / 采购管理 |

### 建议

1. **【强信号 M / 收窄】README 显示工程组适配范围** —— "reading-side wiki for engineering labs that also do AI/algorithm research"。明示**不**覆盖硬件 / 设计文件 / 横向项目交付
2. **【中信号 M】"project + paper" 混合 schema** —— `submissions/` 的"组里产出论文" schema（cycle-04 提到）对工程组用处更大，因为工程组项目→论文链路明显
3. **【中信号 M / cycle-05 共振】Project handoff 模板针对工程组优化** —— `graduation-handoff` skill 加 `code_handoff_checklist`、`hardware_handoff_checklist`（可选）两个分支
4. **【弱信号 L / 推测】"AI for engineering" 是合适的 PMF 候选** —— 比如 ML for control / ML for robotics / 物理信息 NN 等。这类组同时具备 AI/ML 论文密度和工程项目特征，是 `ai-paper-wiki` 的次优市场 `[SPECULATION]`

---

## 风险 / 待验证

- 工程学科内部差异极大（机械 vs 控制 vs 通信），单一画像可能过粗 — 不在 Iteration 4 解决，留 v2 调研
- 工程学科中文 source 调研不够（中国工程类课题组更内卷、保密性更强、横向项目更多）

---

## Sources

1. [Top Lab Management Tools, Software & Systems (Zageno blog, 2026)](https://go.zageno.com/blog/top-lab-management-tools-2025) `[M]`
2. [List of electronic laboratory notebook software packages — Wikipedia](https://en.wikipedia.org/wiki/List_of_electronic_laboratory_notebook_software_packages) `[M]`
3. [Labguru — Lab Management Software](https://www.labguru.com/) `[M]`
4. [知乎专栏 — 程序员如何做好工作交接](https://zhuanlan.zhihu.com/p/29297794) `[M]` 【中文】 — 复用 cycle-05

**中文 source 占比**：1/4 = 25% ✗（低于阈值，confidence 已降级）
