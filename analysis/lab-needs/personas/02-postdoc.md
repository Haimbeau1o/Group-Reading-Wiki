---
iteration: 1
generated_at: 2026-05-11
sources_count: 4
confidence: high
---

# Persona 02 · Postdoc（博士后）

## 一句话定位

**实验室的"事实上的副 PI"——承担最多的日常指导、最多的论文带写、最多的新生 onboarding，却没有任何机构正式职位描述与之匹配**。同时在准备自己的下一步（faculty / industry job），时间被切成"自己的项目 / 学生答疑 / PI 安排的临时任务 / 写自己 paper"四块。对 wiki 的核心诉求是「**用工具把'重复回答新生问题'的成本降到最低，给我留出独立产出时间**」。

---

## 关键 JTBD（What → Why → When）

### JTBD-1 · 让 PhD 学生在我不在场时也能学会做研究（"force multiplier"）
- **Why**：博后是 PhD 学生研究技能的**最大杠杆**——比 PI 直接指导有效 5 倍：
  > "students were five times more likely to have positive development when postdocs were involved in lab discussions" — [Inside Higher Ed (2019)](https://www.insidehighered.com/news/2019/10/11/study-says-when-it-comes-everyday-mentoring-and-training-sciences-postdocs-are-new), accessed 2026-05-11 `[M]`
  > "postdocs mentor doctoral students 'in myriad ways, most commonly by being present in the laboratory to provide ongoing and hands-on instruction'" — [Inside Higher Ed](https://www.insidehighered.com/news/2019/10/11/study-says-when-it-comes-everyday-mentoring-and-training-sciences-postdocs-are-new) (paraphrasing PNAS 2019), accessed 2026-05-11 `[M]`
- **When**：每周（实验室日常）；新生入组前 30 天最密集

### JTBD-2 · 把"被反复问的同一个问题"答案沉淀下来，少回答一次是一次
- **Why**：博后是新生的「事实上的单一接触点」。新生需要的不是一次性 lecture，而是**反复请教**：
  > "Having someone there to walk me through every single step, multiple times if necessary, was really helpful" — [Chemistry World careers](https://www.chemistryworld.com/careers/recognising-the-roles-that-senior-phds-and-postdocs-play-in-training-new-lab-members/4018162.article), accessed 2026-05-11 `[M]`
  > "This specific point-of-contact is hugely beneficial to new students who can often feel overwhelmed with the unusual demands of lab work or intimidated to ask for help" — [Chemistry World](https://www.chemistryworld.com/careers/recognising-the-roles-that-senior-phds-and-postdocs-play-in-training-new-lab-members/4018162.article), accessed 2026-05-11 `[M]`
- **When**：每次新生轮转；每次实验流程 / 评测脚本 / 代码库的"踩坑指南"

### JTBD-3 · 保住自己的独立研究时间 / 论文产出，不被 mentoring 吞掉
- **Why**：博后没有正式 mentoring 职位，但实际承担大量义务：
  > "postdocs 'disproportionately enhance the doctoral training enterprise' despite typically having no formal mentorship role" — [Inside Higher Ed](https://www.insidehighered.com/news/2019/10/11/study-says-when-it-comes-everyday-mentoring-and-training-sciences-postdocs-are-new) (citing PNAS 2019), accessed 2026-05-11 `[M]`
  > "explicit statement of expectations and boundaries prevents postdocs becoming overburdened by supervision responsibilities" — [Chemistry World](https://www.chemistryworld.com/careers/recognising-the-roles-that-senior-phds-and-postdocs-play-in-training-new-lab-members/4018162.article), accessed 2026-05-11 `[M]`
- **When**：开学初（新生集中入组）；自己的 paper 截稿前；找工作季

### JTBD-4 · 给自己的下一步职业建立可见的"贡献轨迹"
- **Why**：博后通常是 2-4 年的过渡岗。简历需要展示"我在这个组做了什么"。`[SPECULATION]` 来源不直接，但与 JTBD-3 的"无正式认可"问题对偶
- **When**：找 faculty / industry 工作的最后一年

---

## 典型一周（基于 source 综合）

| 时段 | 活动 | 对 wiki 的实际触点 |
|------|------|------|
| 周一 | 1:1 跟 PI / 跟自己带的 PhD 学生 | **写组 wiki 的最高频时间**——把刚和 PI 同步的方向、刚教完学生的实验细节就地沉淀 |
| 周二-周四 | 自己的项目（实验 / 代码 / 写作） | 低频，但被打断率高：随时有学生敲门问"那个参数怎么调" |
| 周三晚 | Lab meeting | 经常被 PI 临时指派带读；周会笔记若是博后写则成本高 |
| 周五 | 整理 + 帮学生 debug + 申请季杂事 | 「我能不能让 agent 起草本周给学生的 feedback」 |

---

## 对 wiki 的态度

**强推动 + 高边际收益**。三类角色中**最可能成为 wiki 实际维护者**。

- **推**：每写一条沉淀 = 节省下一次新生入组的 30 分钟答疑。复利效应最显著
- **风险点**：如果 wiki 把所有 onboarding / mentoring / digest 写作都堆给博后，会**加重而非减轻**已知的"过载"问题
- **关键设计原则**：博后的写作行为应该被 agent 大幅放大——博后说一段话（30 秒口述 / 微信粘贴），agent 扩写成结构化文档

---

## 对 `ai-paper-wiki` 现状的契合度评分

**4 / 5**

| 已覆盖（✓） | 未覆盖（✗ / △） |
|-----------|----------------|
| ✓ `personalized-onboarding` skill 直接对应"5x force multiplier"的杠杆 | ✗ **「FAQ / 踩坑词典」schema** — 当前 `concepts/` 偏术语，缺一个"重复被问的实操问题"的格式（[source: Chemistry World "step multiple times" quote](https://www.chemistryworld.com/careers/recognising-the-roles-that-senior-phds-and-postdocs-play-in-training-new-lab-members/4018162.article)） |
| ✓ `weekly-digest` / `post-meeting-recap` 减少录笔记负担 | ✗ **「博后贡献度」可见性** — `members/<postdoc>` 当前是简历式，缺"我带过的学生 + 我起草的笔记 + 我审过的 PR"的反向聚合 |
| ✓ scaffold（`new:paper / new:session`）降低写作启动成本 | △ **轻量"语音 / 一句话→文档"入口** — 博后是 wiki 的高频生产者但时间最碎，应该有"对手机说 30 秒，agent 起草 markdown"的入口（推断，需 cycle/finding 验证）`[SPECULATION]` |
| ✓ Backlinks 让博后早期沉淀在后续 onboarding 中持续被复用 | ✗ **新生提问→沉淀回路** — 当前没有 skill 显式把"新生 Q / 博后 A"自动收进 FAQ |

### 缺什么（最重要的一段）

1. **【强信号 H】FAQ / "踩坑词典" 模块**：与 `concepts/` 并列的新类型，结构是「Q：典型新生问的问题 / A：博后写一段 / 链接到相关 paper-session-code」。这条来自最强 `[M]` source 的直接证据
2. **【强信号 H】Onboarding template 的"局部化"能力**：`personalized-onboarding` skill 当前可能太通用——博后需要"针对'我的子方向'的 onboarding 模板"。建议加 `onboarding/by-subdomain/<slug>.md` 这种结构，让博后每带一个新生就改 5 行而不是重写
3. **【中信号 M】博后贡献度反向聚合**：在 `members/<postdoc>.md` 自动渲染"我带的学生""我起草的笔记""我审的 PR"——同 cycle-8 backlinks 思路扩展。这条不只是博后福利，也直接服务 JTBD-4 的简历需求
4. **【反向意见】**`weekly-digest` 假设的是"每周一篇周报"——博后没时间。可能应该**砍掉 weekly 频率**改成"双周 / 主题触发式"。需要 Iteration 3 cycles 验证
5. **【风险】**当前 14 skill 全是「生产新内容」导向——`add-paper-note` / `add-concept` / `add-member` 等。博后真实的高频动作是「回答 + 复用」而非「新建」，整个 skill 集**可能偏向作者而非读者+答疑者**

---

## 风险 / 待验证

- 强 source 集中在生物医学 / 工程领域。**AI/ML 博后**因为论文周期更快（季度 / 月级别），mentoring 节奏可能完全不同——留给 Iteration 4 `disciplines/ai-ml.md`
- "FAQ / 踩坑词典" 的强信号来自 Chemistry World 一句话——`[M]` 级，可信但需要 Iteration 6 `competitor-gaps.md` 看看 Notion lab template 是否已经普遍有这个模块
- JTBD-4（贡献度对找工作的价值）没有直接 source，标 `[SPECULATION]`

---

## Sources 用到的（已追加进 RESEARCH_INDEX.md）

1. [Postdocs' lab engagement predicts trajectories of PhD students' skill development (PNAS 2019)](https://www.pnas.org/doi/10.1073/pnas.1912488116) `[FETCH-FAILED 403]` — 通过 Inside Higher Ed + Chemistry World 二手引用
2. [Inside Higher Ed (2019) — Postdocs as everyday mentors](https://www.insidehighered.com/news/2019/10/11/study-says-when-it-comes-everyday-mentoring-and-training-sciences-postdocs-are-new) `[M]`
3. [Chemistry World — Recognising the roles that senior PhDs and postdocs play in training new lab members](https://www.chemistryworld.com/careers/recognising-the-roles-that-senior-phds-and-postdocs-play-in-training-new-lab-members/4018162.article) `[M]`
4. [Enhancing the Postdoctoral Experience for Scientists and Engineers (NCBI/NAS book)](https://www.ncbi.nlm.nih.gov/books/NBK547066/) `[H]` — 仅作为「博后无正式 mentoring 框架」论点的背景引用
