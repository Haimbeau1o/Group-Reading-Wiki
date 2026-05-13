---
iteration: 3
generated_at: 2026-05-12
sources_count: 4
confidence: high
cn_source_ratio: 0.50
---

# Cycle 03 · Steady State（稳态学期中 / 无截稿压力的"日常"）

## 时间窗

- **学期中段的 6-10 周**：开学 4 周后 → 期中考试前后 → 学期结束前 2-4 周
- **AI/ML 组**：会议截稿之间的"窗口期"（如 ICLR 9 月截稿 → NeurIPS 5 月截稿之间）
- **湿实验组**：实验周期之间的 reading / 数据分析期
- **总占比**：研究组一年大约 50-60% 时间处于稳态

---

## 高频动作

| 角色 | 稳态期高频行为 | 当前 14 skill 覆盖 |
|------|------|------|
| **PI** | 1:1 / 写基金 / 看文献 / 偶尔参加 reading group | ✓ "PI 一段 take" 模式 |
| **博后 / 高博** | 自己研究 + 带读 + 答疑 + 跑实验 | ✓ `weekly-session` / `post-meeting-recap` |
| **低博 / 硕 / RA** | 读 paper / 跑实验 / 写代码 / 准备组会 | ✓ scaffold + concept 词典 |
| **wiki 系统层** | 周会前后产出 / digest / paper note 沉淀 | ✓ `weekly-digest` |

---

## 关键证据

### 组会是稳态期的"中心活动"，频率高但形式参差
> "每周开『组会』？有必要吗？" — paraphrased from WebSearch summary citing [知乎专栏 — 研究生每周开组会？有必要吗？](https://zhuanlan.zhihu.com/p/687597539), accessed 2026-05-12 `[M]` 【中文】
> 描述了不同组的组会形式："weekly meetings with 45 minutes to one hour reports where each person presents every month or so, while theoretical/computational groups may have more frequent meetings (one to two times per week)" — paraphrased from [知乎 — 科研小组里有哪些有效的组会形式](https://www.zhihu.com/question/27956707), accessed 2026-05-12 `[M]` 【中文】

### 组会形式分两类：文献报告 / 进展报告
> "Group meeting presentations typically fall into two main types: literature reading reports and research progress reports" — paraphrased from WebSearch summary citing [知乎 — 说到文献报告类组会，你真的知道该怎么准备吗？](https://zhuanlan.zhihu.com/p/445806436), accessed 2026-05-12 `[M]` 【中文】

### "内耗组会"问题
> "Some meetings described as 'unproductive' (内耗组会) where students must stop their work to prepare presentations but receive minimal feedback or encounter critical comments from advisors" — paraphrased from WebSearch summary, accessed 2026-05-12 `[L]` 【中文】

### 产出型组会需要 "objectives"
> "Lab meetings will be most effective and productive if they have clearly articulated objectives and fit within the overall lab mission." — [Ten simple rules for productive lab meetings, PLOS Comp Bio 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8158921/), accessed 2026-05-12 `[M]`

---

## 对 `ai-paper-wiki` 的契合度评分

**4 / 5** — 稳态是项目最擅长的场景

| 已覆盖（✓） | 未覆盖（✗ / △） |
|-----------|----------------|
| ✓ `weekly-session` 直接覆盖文献报告 + 进展报告两种形式 | ✗ **「组会 objective」字段** — `sessions/` frontmatter 缺 `objective` / `type: literature\|progress\|hybrid`，让组会从"挑一篇讲"升级到"为什么讲这篇" |
| ✓ Concept 词典 + Backlinks → 稳态期最有价值（不被截稿压垮的沉淀） | ✗ **「内耗组会」诊断 / 防护** — 中文 source 直接点出"准备组会的成本压垮学生"，wiki 没设计"轻量记录模式" |
| ✓ `weekly-digest` 让稳态期不那么"无声" | △ **"哪些主题已经讲过"自动检测** — 防止重复 paper 反复带读（呼应 03-senior-phd 的 who-knows-X） |
| ✓ KaTeX / Mermaid / Pagefind 在稳态期都能稳定贡献 ROI | ✗ **"组会 30 秒入口"** — 同 02-postdoc / 03-senior-phd 提到的"对手机说 30 秒 agent 写 markdown" |

### 缺什么（建议）

1. **【强信号 H / 跨 persona + cycle 共识】"组会 objective + type" 字段**：`sessions/` frontmatter 加 `objective: "..."` 和 `type: literature|progress|hybrid|discussion`；让 PI 看 wiki 时能跳过不感兴趣的类型
2. **【强信号 M / 中文 source 独家信号】"轻量记录模式"**：当前 `weekly-session` 的三段式（事实 / 讨论 / take）对组会成本高。提供 `--mode=light` 只记 3 bullets，agent 扩写 → 减"内耗"
3. **【中信号 M】"已带读 paper 索引"**：知识图扩展，给 PI 看"今年组里讨论过的 paper 列表 + 每篇的最深 insight"。一年一次重看（呼应 04 paper-season）
4. **【反向意见】**项目假设"周会是 wiki 主要生产场景"——但中文 source 显示**学生准备组会本身就是过载**。可能应该明示"周会笔记是 mentor 的活，不是 presenter 的活"

---

## 风险 / 待验证

- "内耗组会"信号目前是 `[L]`，需要 Iteration 5 / 6 加固
- 不同学科的"稳态频率"差异大，AI/ML 几乎没有稳态（连续截稿）vs 湿实验组每年有 6 个月稳态 — Iteration 4 验证

---

## Sources

1. [知乎 — 研究生每周开『组会』？有必要吗？](https://zhuanlan.zhihu.com/p/687597539) `[M]` 【中文】
2. [知乎 — 说到文献报告类组会，你真的知道该怎么准备吗？](https://zhuanlan.zhihu.com/p/445806436) `[M]` 【中文】
3. [知乎 — 科研小组里有哪些有效的组会形式？](https://www.zhihu.com/question/27956707) `[M]` 【中文】 — 部分通过 search summary
4. [Ten simple rules for productive lab meetings — PLOS Comp Bio 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8158921/) `[M]` — 复用

**中文 source 占比**：3/4 = 75% ✓
