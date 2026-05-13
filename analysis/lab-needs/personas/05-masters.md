---
iteration: 2
generated_at: 2026-05-12
sources_count: 3
confidence: medium
---

# Persona 05 · Masters Student（硕士生 / 1-2.5 年）

## 一句话定位

**短期租客式的研究参与者**——1 年课程 + 1 年研究 / 写 thesis，时长被截稿和找工作 / 申博的截止日强压。对 wiki 的核心诉求是「**让我用最短时间把组里的方法学完、做出一个可交差 / 投稿的产出**」。

---

## 关键 JTBD（What → Why → When）

### JTBD-1 · 在 12-18 个月里完成"上手 → 产出 → 答辩"全流程
- **Why**：硕士实际科研窗口被课程严重压缩：
  > "Getting a master's degree is usually a shorter commitment of about two years [...] In practice, instead of having 2 years of research, it's often more like 1 year of research after 1 year of coursework and teaching." — paraphrased from [UC SD M.S. Plan I (Thesis)](https://cse.ucsd.edu/graduate/plan-i-thesis), accessed 2026-05-12 `[M]`
- **When**：入组当下；课题选定时；前一学期；答辩前 3 个月

### JTBD-2 · 决定毕业后是"找工作还是申博"——用 thesis 当筹码
- **Why**：硕士论文规格直接关系到投稿可能性：
  > "The thesis report should contain sufficient original research for publication in a scholarly journal or conference." — paraphrased from [How to Write a Master's Thesis in Computer Science, FIT](https://cs.fit.edu/~wds/guides/howto/howto.html), accessed 2026-05-12 `[M]`
- **When**：硕一末-硕二全程；申博截稿前（12 月）；春招 / 秋招前

### JTBD-3 · 用最少协作时间获得师兄博后的关键指导
- **Why**：硕士在组内通常是"边缘"角色，但又需要博后 / 高博的 mentoring（呼应 [02-postdoc.md](02-postdoc.md) / [03-senior-phd.md](03-senior-phd.md) 的"反复答疑"问题）。`[SPECULATION]` 直接 source 不足
- **When**：选题 / 实验设计 / 投稿前 review

### JTBD-4 · 离组时把项目"封存"得让师弟妹接得起来（如果有）
- **Why**：硕士毕业后多数离开学术，未发表的 thesis 工作要么进 archive 要么被某个博士生捡起来。同 [03-senior-phd.md](03-senior-phd.md) JTBD-3 但时间更短、tacit 知识更浅
- **When**：答辩后 1 个月

---

## 典型一周（硕二有研究期，硕一以课程为主）

| 时段 | 活动 | 对 wiki 的实际触点 |
|------|------|------|
| 周一-周三 | 课程 / 助教 / 找工作面试准备 | 零 |
| 周四 | 实验 / 代码 / 跑实验 | 中等：搜组里现成代码 / 数据脚本 |
| 周五 | 组会 + 跟博后 / PI 同步进展 | 中等：会前补 paper-note，会后偶尔贡献"我做的部分" |
| 周末 | 写 thesis 章节 / 投稿草稿 | 中等：抄 wiki 上的 concept 定义 / Mermaid 图 |

---

## 对 wiki 的态度

**功利型读者 + 偶尔贡献者**。
- **强读者**：搜组里的 paper-note / concept / theme 节省自己 lit review 时间
- **弱作者**：只在"必须留下"的环节（答辩前后 / 投稿）才写
- **关键设计原则**：硕士不会经营 wiki，但**会消费**——所以质量 baseline 由博后 / 高博保证，硕士贡献的是**"thesis 副产物"**（章节图、代码 README、踩坑笔记）

---

## 对 `ai-paper-wiki` 现状的契合度评分

**3.5 / 5** — 当前项目偏向博士与博后视角，硕士场景部分缺位

| 已覆盖（✓） | 未覆盖（✗ / △） |
|-----------|----------------|
| ✓ Pagefind 中英文搜索 → 硕士 lit review 加速器 | ✗ **"短期成员"标签 / 模板** — `members/` schema 当前没"硕士只待 18 个月"的特殊化（onboarding 应该精简，handoff 更早触发） |
| ✓ KaTeX / Mermaid → thesis 写作可以直接复用 wiki 图表 | ✗ **Thesis-derivative 模板** — 硕士可以把 thesis 拆出几节作为 paper-note / concept 留下来，但没有 skill 引导这个动作 |
| ✓ Concept 词典 + Backlinks 让硕士能快速理解组内术语 | △ **"硕士需要的 onboarding 比博士轻"** — `personalized-onboarding` 当前未区分博 / 硕，可能给硕士过载 `[SPECULATION]` |
| △ `add-member` skill 覆盖加入，但毕业流程同 [03-senior-phd.md](03-senior-phd.md) 缺 handoff | ✗ **代码 / 数据 archive 链接** — 硕士毕业后代码常进个人 GitHub 然后失联；`members/<x>.md` 应该有 archive_pointer 字段 |

### 缺什么

1. **【中信号 M】"短期成员模板"**：`new:member --tenure=18m --type=masters` 自动减裁 onboarding 步骤，自动激活 handoff 提醒（毕业前 3 月）
2. **【中信号 M】Thesis-derivative skill**：答辩后引导硕士把 thesis 章节拆 1-2 节为 paper-note / 概念词典条，作为「离组贡献的最低门槛」
3. **【弱信号 / 跨 persona 共用】**`graduation-handoff` 同 [03-senior-phd.md](03-senior-phd.md) 第 1 条，差异是硕士 tacit 知识更浅但代码 / 数据 archive 更关键
4. **【反向意见】**硕士不应被强制要求贡献 weekly-session / paper-note。当前 14 skill 默认所有成员都贡献——可能把硕士拒之门外。Skill 文档应明示「硕士只在 thesis 阶段产出，平时是读者」

---

## 风险 / 待验证

- 本画像 confidence 标 medium —— 3 个 source 都是机构课程描述，**缺硕士本人的 first-person 描述**。Iteration 5 dead-wiki 阶段可补 reddit / 知乎硕士发言
- 美国 CS 硕士 vs 国内学硕（3 年）/ 专硕（2 年）/ 港硕（1 年）差异大，"18 个月窗口"是美国 CS 的特化假设 — Iteration 3 cycles 验证
- JTBD-3（短时间获得指导）和 JTBD-4（封存项目）都是 `[SPECULATION]` 级别，需要 Iteration 5 / 7 加固

---

## Sources

1. [How to Write a Master's Thesis in Computer Science — FIT (William Shoaff)](https://cs.fit.edu/~wds/guides/howto/howto.html) `[M]`
2. [UC San Diego CSE M.S. Plan I (Thesis)](https://cse.ucsd.edu/graduate/plan-i-thesis) `[M]`
3. [Computer Science Masters Theses — Missouri University of Science and Technology](https://scholarsmine.mst.edu/comsci_theses/) `[L]` — 作为 archive 实例的间接证据
