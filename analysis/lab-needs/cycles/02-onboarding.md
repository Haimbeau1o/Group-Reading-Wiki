---
iteration: 3
generated_at: 2026-05-12
sources_count: 4
confidence: high
cn_source_ratio: 0.50
---

# Cycle 02 · Onboarding（入组前 30 天 / 第一学期前 100 天）

## 时间窗

- **入组前 2 周**：录取 → 注册 / 签 offer / 收到 welcome email
- **入组第一周**：见 PI / 见博后 / 拿账号 / 看 onboarding 文档
- **第一月**：跟一个具体项目 / 完成第一个 hands-on 任务 / 参加 ≥4 次组会
- **第 60-100 天**：完成第一个 mini-result，参加自己的第一次组会展示

---

## 高频动作

| 角色 | 入组前 30 天的行为 | 当前 14 skill 覆盖 |
|------|-------|------|
| **新生** | 焦虑读 paper / 找师兄微信 / 自学 onboarding 文档 / 谨小慎微做事 | ✓ `personalized-onboarding` 强 |
| **博后 / 高博**（mentor） | 每天 30-60 min 答疑 / 重复教代码 / 介绍工具 | △ FAQ 缺位（02/03/04/06 共识） |
| **PI** | 第一次正式 1:1（≤30 min）/ 写期待 / 默默观察 | ✓ "PI 一段 take + agent 扩写" 模式 |

---

## 关键证据

### 多数实验室没有正式 onboarding 流程
> "most academic labs do not have a formal process for introducing new members to their group, which can sometimes result in mismatched expectations" — [Welcome to the lab — eLife (Research Culture)](https://elifesciences.org/articles/79627), accessed 2026-05-12 `[H]`

### 新生进组前 1-2 月是"谨小慎微的观察期"
> "新成员最初会受到课题组的审视，有一段谨小慎微的时期，短则一两月，长则一学期。" — paraphrased from WebSearch summary citing [新浪新闻 — 如何快速融入课题组](https://k.sina.cn/article_6468995530_1819509ca01900qvln.html), accessed 2026-05-12 `[M]` 【中文】
> "初入课题组保持谦逊的态度，适当隐藏个性" — [新浪新闻 — 如何快速融入课题组](https://k.sina.cn/article_6468995530_1819509ca01900qvln.html), accessed 2026-05-12 `[M]` 【中文】

### 师兄是事实上的 onboarding 第一站
> "新生应该充分利用师兄的知识、操作技能和课题组经验的传承，师兄是过来人，能够帮助新生摸清导师和课题组的风格" — paraphrased from WebSearch summary citing [CSDN 转载 知乎 — 给博士一年级新生的建议](https://blog.csdn.net/Xw_Classmate/article/details/122833892), accessed 2026-05-12 `[M]` 【中文】
> "借助师兄尽早摸清楚导师和课题组的风格，更好的和导师沟通" — [新浪新闻](https://k.sina.cn/article_6468995530_1819509ca01900qvln.html), accessed 2026-05-12 `[M]` 【中文】

### 读 paper 起点：先读顶刊顶会 + 带问题读
> "一开始读论文，一定要读顶会顶刊的，以后也一直要这样" — paraphrased from [CSDN 转载 知乎 — 给博士一年级新生的建议](https://blog.csdn.net/Xw_Classmate/article/details/122833892), accessed 2026-05-12 `[M]` 【中文】
> "如果不带着自己的问题去看，思路很容易就被作者带跑了" — [CSDN 转载 知乎](https://blog.csdn.net/Xw_Classmate/article/details/122833892), accessed 2026-05-12 `[M]` 【中文】

---

## 对 `ai-paper-wiki` 的契合度评分

**4.5 / 5** — 项目的 onboarding 设计是当前最完整、最匹配的部分

| 已覆盖（✓） | 未覆盖（✗ / △） |
|-----------|----------------|
| ✓ `onboarding.md` 分层（Day-1 / 第一周 / 第一月 / 三个月） | ✗ **「师兄分配」明示** — source 显示师兄是 onboarding 主力，但 wiki 没"你的对接师兄是 X / 他熟悉的方向是 Y / 时间是 Z"的结构化字段 |
| ✓ `personalized-onboarding` skill 让 mentor 起草 → agent 扩写 | ✗ **「期待 / 不期待」明文段** — eLife 强调的 "scientific policies and core values"，当前 `welcome.md` 是欢迎调性，不写"前 3 个月不要求你做的事"（避免新生焦虑） |
| ✓ Concept 词典让新生自学术语 | ✗ **「reading list 难度分级 / 阅读顺序」** — 同 04-junior-phd / 06-newcomer-ra 提到的 `level` 字段 + `reading_order` |
| ✓ Backlinks 让新生顺图谱漫游 | △ **「新生问题专用入口」** — 与 FAQ schema 同源，呼应 02/03/04/06 共识 |

### 缺什么（建议）

1. **【强信号 H / 跨 persona 共识】FAQ schema**：是 onboarding 的核心组件，承接新生"反复问 / 反复教"的痛点。**Iteration 7 必进 P0**
2. **【强信号 M】"Mentor pairing" 字段**：`members/<x>.md` 加 `mentor: <slug>` / `mentees: [<slug>, <slug>]`，scaffold `new:member` 时引导
3. **【强信号 M / 中文 source 直接支持】"前 3 个月期待" 段** —— `onboarding.md` 增加一个明确写"前 3 个月不要求做的事"的小节，缓解中国学生"谨小慎微"心理
4. **【中信号 M】"读 paper SOP"模板** —— 中文 source 反复提"带问题读 / 顶刊顶会优先"，可以加 `onboarding/how-to-read-papers.md` 一篇 30 行短文，纳入 first-week 必读
5. **【反向意见】**当前 `personalized-onboarding` skill 默认给每个新生定制 reading list。但中文 source 显示**师兄通常是直接说"先读这 3 篇我们组的代表作"**——可能更简单的 "默认 onboarding 路径 + 师兄微调" 比"全个性化"更现实

---

## 风险 / 待验证

- 中文与英文 source 高度一致地指向"师兄是第一站"，但 source 多是观察性，缺**新生实际进组后头 30 天的活动 log**。可在 Iteration 5 dead-wiki 阶段尝试找到"onboarding 失败"的 case study

---

## Sources

1. [Welcome to the lab — eLife Research Culture (2022)](https://elifesciences.org/articles/79627) `[H]`
2. [新浪新闻 — 如何快速融入课题组？跟研究生师兄搞好关系？](https://k.sina.cn/article_6468995530_1819509ca01900qvln.html) `[M]` 【中文】
3. [CSDN 转载 知乎 — 给博士一年级新生的建议](https://blog.csdn.net/Xw_Classmate/article/details/122833892) `[M]` 【中文】
4. [What I Wish I Knew as a First Year Ph.D. Student — Rice Graduate School](https://graduate.rice.edu/news/current-news/what-i-wish-i-knew-first-year-phd-student) `[M]` — 复用

**中文 source 占比**：2/4 = 50% ✓
