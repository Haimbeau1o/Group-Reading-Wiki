---
iteration: 2
generated_at: 2026-05-12
sources_count: 4
confidence: high
---

# Persona 06 · Newcomer / Undergraduate RA（新生 / 本科 RA / 实习研究助理）

## 一句话定位

**研究入门的"零基础高潜力"参与者**——动机强（保研 / 简历 / 兴趣）、技能空白、tenure 不确定（一个学期 ~ 两年）。对 wiki 的核心诉求是「**给我一个清晰的学习路径，让我能从'看不懂 paper'走到'能贡献一个小结果'**」。

---

## 关键 JTBD（What → Why → When）

### JTBD-1 · 从"看不懂论文"到"能跟着师兄做一个小任务"
- **Why**：本科生 / 新生的起点是 paper 阅读能力薄弱：
  > "Students are often barely able to comprehend scientific literature and perform simple tasks in research projects after limited research mentoring." — paraphrased from [PMC4885025 — Managing and Mentoring assistant professors and RAs](https://pmc.ncbi.nlm.nih.gov/articles/PMC4885025/), accessed 2026-05-12 `[H]`
- **When**：入组前 2 周；前 3 个月每周

### JTBD-2 · 在结构化"trial"期内证明自己值得被投资
- **Why**：本科 RA 普遍有 trial-then-commit 模型：
  > "Many faculty mentors incorporate a 'trial' semester when taking on undergraduate students [...] which might involve shadowing graduate students, participating in journal clubs and literature searches, and learning basic procedures before transitioning to increasingly independent work." — paraphrased from [Strategies for Onboarding New Undergraduate Research Student Mentees, Center for Engaged Learning](https://www.centerforengagedlearning.org/strategies-for-onboarding-new-undergraduate-research-student-mentees/), accessed 2026-05-12 `[M]`
- **When**：入组第一学期；师兄给的第一个独立小任务

### JTBD-3 · 通过 RA 经历换取保研 / 申请的资本
- **Why**：BYU 训练 RA 计划的数据级证据：
  > "Students produced 'over five publications' and 'secured high-profile scholarships and grants for graduate school.'" — paraphrased from [Training undergraduate research assistants with an outcome-oriented and skill-based mentoring strategy, PMC9344475](https://pmc.ncbi.nlm.nih.gov/articles/PMC9344475/), accessed 2026-05-12 `[H]`
  → 本科 RA 不只是劳动力，是**正在 underwrite 自己未来的人**
- **When**：申请季前 1 年；导师推荐信启动时

### JTBD-4 · 用最低风险问问题（不让师兄烦 / 不让 PI 怀疑）
- **Why**：新生 + 学科陌生 + 等级心理 = **极强不安**。同 [04-junior-phd.md](04-junior-phd.md) 的 eLife `[H]` 引用：
  > "Communicating the lab's scientific policies and core values as part of the onboarding package can help new (and existing) members be more aware of the PI's expectations" — [eLife Welcome to the lab](https://elifesciences.org/articles/79627), accessed 2026-05-12 `[H]`
- **When**：入组第一周；每次组会前

---

## 典型一周（trial semester，约 10-20 小时 / 周）

| 时段 | 活动 | 对 wiki 的实际触点 |
|------|------|------|
| 周一-周二 | 课业 + 偶尔上组的 reading | 较低，需要"低门槛入门"页面 |
| 周三晚 | Lab meeting（旁听） | **最高频读 wiki** — 但常常听不懂，会后翻 wiki 补 concept |
| 周四 | 师兄安排的 hands-on 任务（跑代码 / 标数据 / 整理引用） | 中等：经常搜组里的 "how-to" |
| 周五 | 1:1 跟 senior PhD（30 min 内） | 偶尔贡献"踩坑笔记"，需要被低门槛 onboard |
| 周末 | 自学（基础课 / 数学 / 代码训练） | 高频：跟着 onboarding 的"先读这 3 篇"路径走 |

---

## 对 wiki 的态度

**纯读者 + 早期不主动贡献**。所有"贡献"都来自师兄 / agent 的**强引导**。

**关键设计原则**：本科 RA / 新生**是** onboarding 的设计目标用户。但贡献链路必须是「师兄说一句话，agent 起草，新生 review / 加 1 句」。

---

## 对 `ai-paper-wiki` 现状的契合度评分

**4 / 5**

| 已覆盖（✓） | 未覆盖（✗ / △） |
|-----------|----------------|
| ✓ Onboarding Day-1 / 第一周 / 第一月 分层 — 直接对应 trial semester 节奏 | ✗ **难度分级 / 入门标签** — `paper-note` / `concept` 没有 `level: beginner|intermediate|advanced` 字段，新生不知道哪个能消化 |
| ✓ Concept 词典减少"听不懂术语"焦虑 | ✗ **"shadow learning" 模式** — 本科 RA 的 trial 阶段是「跟随观察」，但当前 14 skill 都假设主动贡献，缺一个 `shadow-observer` 的可见性入口 |
| ✓ KaTeX / Mermaid 让新生能慢慢消化数学符号 | △ **"我现在的水平能读什么"个性化推荐** — `personalized-onboarding` 是好的开始，但没有难度感知 `[SPECULATION]` |
| ✓ Discussions 评论低门槛贡献（README 提到） | ✗ **"我看完了"的进度回报** — 新生需要被看到、被肯定。当前没有"我读完了 onboarding Day-1"的轻量打卡机制 |

### 缺什么

1. **【强信号 M】难度分级字段**：`papers/<slug>.md` / `concepts/<slug>.md` frontmatter 加 `level: beginner|intermediate|advanced`，scaffold 默认 advanced；`personalized-onboarding` 拉一个分层 reading list
2. **【中信号 M】"trial-semester" onboarding 子流程**：与博一 onboarding 区分。本科 RA 的前 3 个月应该是「看 + 跟」，不是「读 200 篇 paper」
3. **【弱信号 / 跨 persona 共用】**FAQ schema 同样适用——本科 RA 是 FAQ 的最高输入端，但需要"匿名提问"模式以降低社交压力 `[SPECULATION]`
4. **【反向意见】**当前 `personalized-onboarding` skill 可能默认"学生有阅读 paper 的能力"——对本科 RA 不成立。Skill 应允许"先读综述 / textbook 章节 / video 链接"作为前置环节
5. **【风险】**本科 RA 是 wiki 公开页面的"二级广告位"——优秀的本科生可能因为看到组的公开 wiki 而主动联系。这是 [01-pi.md](01-pi.md) JTBD-5（招生）的**外延**，但当前未明确

---

## 风险 / 待验证

- 美国本科 RA 模型（带薪 / URAP / 学分）vs 中国本科生进组（无薪 / 蹭课 / 保研动机）差异大。**国内本科生**不一定有 trial-semester 结构 — 留给 Iteration 3 onboarding cycle
- "难度分级"是基于 source 的合理推论，但 wiki 实操中字段会不会被维护是 `[SPECULATION]`
- JTBD-3 的"保研 / 申请资本"在中国语境更重，BYU 数据是美国 case — 中文 source 补充留 Iteration 3

---

## Sources

1. [Training undergraduate research assistants with an outcome-oriented and skill-based mentoring strategy — PMC9344475 (BYU case study)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9344475/) `[H]`
2. [Strategies for Onboarding New Undergraduate Research Student Mentees — Center for Engaged Learning](https://www.centerforengagedlearning.org/strategies-for-onboarding-new-undergraduate-research-student-mentees/) `[M]`
3. [Managing and Mentoring: Experiences of Assistant Professors in Working with Research Assistants — PMC4885025](https://pmc.ncbi.nlm.nih.gov/articles/PMC4885025/) `[H]`
4. [Welcome to the lab — eLife](https://elifesciences.org/articles/79627) `[H]` — 复用
