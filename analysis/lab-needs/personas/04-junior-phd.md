---
iteration: 2
generated_at: 2026-05-12
sources_count: 4
confidence: high
---

# Persona 04 · Junior PhD（低年级博士 / 第 1-2 年）

## 一句话定位

**"轮转—选导—课程—基础训练"四重叠加期的高焦虑学习者**。没有产出压力，但有"什么都不会 / 怕问错问题"的压力。对 wiki 的核心诉求是「**让我能不打扰别人就先自学一遍组里的语境、术语、套路**」。

---

## 关键 JTBD（What → Why → When）

### JTBD-1 · 不打扰师兄师姐的前提下完成"组内语境扫盲"
- **Why**：博一压力来自多线并发：
  > "Trying to select a lab, do well in my core classes, get used to a new city, and make new friends was a lot." — [What I Wish I Knew as a First Year Ph.D. Student, Rice University Graduate School](https://graduate.rice.edu/news/current-news/what-i-wish-i-knew-first-year-phd-student), accessed 2026-05-12 `[M]`
- **When**：入组前 30 天；每次新课题接手；每次实验组会前

### JTBD-2 · 用"明文期待"打消"我做错了吗"的焦虑
- **Why**：实验室普遍**没有正式 onboarding**：
  > "most academic labs do not have a formal process for introducing new members to their group, which can sometimes result in mismatched expectations" — [Welcome to the lab, eLife (Research Culture, 2022)](https://elifesciences.org/articles/79627), accessed 2026-05-12 `[H]`
  > "Providing new members with a list of essential items they should receive or have access to can accelerate adjustment to the lab" — [eLife](https://elifesciences.org/articles/79627), accessed 2026-05-12 `[H]`
- **When**：入组第一周；第一次组会发言前；第一次 1:1 与 PI 前

### JTBD-3 · 在论文阅读上从"看不懂"到"能讨论"
- **Why**：博一是"读 paper 还没成肌肉记忆"的阶段：
  > "I felt very overwhelmed balancing my lab work with classes" — [Rice University](https://graduate.rice.edu/news/current-news/what-i-wish-i-knew-first-year-phd-student), accessed 2026-05-12 `[M]`
  → 读 paper 时间被课程挤压；带读 / 师兄笔记是关键支撑（呼应 [02-postdoc.md](02-postdoc.md) 的 5x finding）
- **When**：每周 reading group 前一天；写 literature review 时

### JTBD-4 · 建立"我的研究身份"——选择主线、感知组的研究品位
- **Why**：
  > "The primary goals of a Ph.D. rotation is to determine whether the environment is conducive to the student's learning style and a genuine feeling of being supported as you acquire new skills." — [Rice University](https://graduate.rice.edu/news/current-news/what-i-wish-i-knew-first-year-phd-student), accessed 2026-05-12 `[M]`
- **When**：博一全年（持续观察）；选导环节

---

## 典型一周

| 时段 | 活动 | 对 wiki 的实际触点 |
|------|------|------|
| 周一-周二 | 课程 + 助教 + 作业 | 几乎零（被课程吞噬） |
| 周三晚 | Lab meeting / Reading group | **最高频读 wiki 时刻** — 会前 1 小时翻 paper-note / theme 临时补课 |
| 周四 | 实验 / 代码学习（被师兄盯着做） | 中等：跟着师兄 Slack 链接到具体 concept / paper |
| 周五 | 1:1 跟 senior PhD / postdoc | 偶尔贡献 — 把"我今天遇到的卡点"写进 FAQ |
| 周末 | 补 paper / 写组会要讲的内容 | 高频读 |

---

## 对 wiki 的态度

**强读者 + 弱作者**。是 wiki 的最大 ROI 受益人之一（onboarding 5 倍收益直接落到博一），但**短期内不会主动写**。

**关键设计原则**：博一的"贡献入口"必须是「**问题 / 卡点 / 不懂的术语 + 一句话**」式提交，由师兄 / agent 补全成 concept 或 FAQ。让他们感觉自己是在「求助」而不是「写文档」。

---

## 对 `ai-paper-wiki` 现状的契合度评分

**4.5 / 5** — 项目的 onboarding 设计直接命中博一痛点

| 已覆盖（✓） | 未覆盖（✗ / △） |
|-----------|----------------|
| ✓ `onboarding.md`（Day-1 / 第一周 / 第一月 / 三个月）的分层结构直接对应博一焦虑 | ✗ **"提问入口"** — 当前没有 skill 让博一"提一个问题"进 FAQ 缓冲区，等师兄回答后由 agent 沉淀。即 [02-postdoc.md](02-postdoc.md) / [03-senior-phd.md](03-senior-phd.md) 同时要求的 FAQ schema 在博一这是「**输入端**」 |
| ✓ `personalized-onboarding` 让博一不用读 200 篇 paper（来自 5x lever 效应） | ✗ **"组里专属俚语 / 工具链 / 集群"白皮书** — eLife 强调的 "list of essential items" 当前没有结构化（部分散落在 onboarding.md） |
| ✓ Pagefind 中英文搜索让博一能直接搜术语 | △ **"读 paper 顺序" 排序** — `themes/` 列出论文但没"先读这 5 篇再读那 5 篇"的依赖序，靠人手维护 |
| ✓ Concept 词典 + KaTeX 让博一边读边查 | ✗ **"我现在在第几周 / 我应该读到什么"** 个人 dashboard — 对应"成长焦虑"问题 `[SPECULATION]` |

### 缺什么（最重要）

1. **【强信号 H / 跨 persona 共识】FAQ schema**：博一 = 提问者，博后 / 高博 = 回答者；这是 02/03/04 三个 persona 的最大共同建议。**Iteration 7 强烈应进 P0**
2. **【强信号 M】Onboarding "essentials checklist"**：基于 eLife `[H]` source 的直接建议，把 onboarding.md 拆出一个明确的"组内必备资源 / 账号 / 工具链 / 集群"列表（区分公开 vs internal-only）
3. **【中信号 M】Reading 依赖序 / 推荐序**：在 `themes/<slug>.md` frontmatter 加 `reading_order: [paper-1, paper-2, ...]`，scaffold 生成时自动排
4. **【反向意见】**当前 `add-paper-note` skill 假设"我读完 X paper，做笔记"——博一是「读不完」「不敢做笔记」的阶段。Skill 文档应明示「**博一前 6 个月不要求自己写 paper-note，去消费别人写的**」，避免博一被"我也要写一篇"的压力压垮

---

## 风险 / 待验证

- Source 是欧美生物医学 / 综合大学博一视角。**国内博一**通常无 rotation，直接选导师；博一压力分布会偏向"快速进入项目"而非"探索方向" — 留给 Iteration 3 onboarding cycle 验证
- "组里专属俚语词典"的强信号需要 Iteration 6 看 Notion / Obsidian lab 是否已经普遍有

---

## Sources

1. [Welcome to the lab — eLife Research Culture](https://elifesciences.org/articles/79627) `[H]`
2. [What I Wish I Knew as a First Year Ph.D. Student — Rice Graduate School](https://graduate.rice.edu/news/current-news/what-i-wish-i-knew-first-year-phd-student) `[M]`
3. [Strategies for Onboarding New Undergraduate Research Student Mentees — Center for Engaged Learning](https://www.centerforengagedlearning.org/strategies-for-onboarding-new-undergraduate-research-student-mentees/) `[M]` — 部分应用
4. [Inside Higher Ed (2019) — Postdocs as everyday mentors](https://www.insidehighered.com/news/2019/10/11/study-says-when-it-comes-everyday-mentoring-and-training-sciences-postdocs-are-new) `[M]` — 复用，含 PNAS 5x lever 信号
