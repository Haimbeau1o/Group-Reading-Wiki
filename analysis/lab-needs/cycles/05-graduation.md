---
iteration: 3
generated_at: 2026-05-12
sources_count: 5
confidence: medium
cn_source_ratio: 0.40
---

# Cycle 05 · Graduation Season（毕业季 / 离组 / 知识传承）

## 时间窗

- **博士毕业**：thesis defense 通过 → 离校前 2-4 周交接 → 离开
- **博后出站**：合同结束前 2-3 月开始找下家 → 离开前 1 月交接
- **硕士 / RA 毕业**：通常更仓促（1-2 周）— 但带走的 tacit knowledge 同样关键
- **流量分布**：每年 6-9 月（毕业典礼前后）+ 12-1 月（学期末次峰）

---

## 高频动作

| 角色 | 毕业季高频行为 | 当前 14 skill 覆盖 |
|------|------|------|
| **离组者** | 整理代码 / 写交接文档 / 关账号 / 转移数据 / 告别 | **空白** — 没有 `handoff-on-graduation` skill |
| **接手人**（新博 / 师弟） | 学接手的代码库 / 跑 reproducibility / 问问题 | △ `personalized-onboarding` 部分覆盖 |
| **PI** | 写推荐信 / 决定项目去留 / 接手"半成品" | **空白** |
| **博后 / 高博**（监督交接） | 验证交接质量 / 留 forwarding 联系方式 | **空白** |

---

## 关键证据

### 离组的两类知识：explicit + tacit
> "There are two types of knowledge to transfer: explicit knowledge which is documented and easy to share like SOPs, project files, and process guides, and tacit knowledge which includes unwritten insights and relationships." — paraphrased from WebSearch summary citing [monday.com — Project handoff process](https://monday.com/blog/project-management/project-handoff/), accessed 2026-05-12 `[M]`

### 学术机构有标准化"毕业 to-do list"，但偏 IT
> Wharton 的 PhD 毕业技术清单包括：关账号、数据迁移、研究文件备份、邮箱 forwarding 设置、订阅取消、最后报销 — paraphrased from [Wharton PhD Graduation Technology To-Do List](https://support.wharton.upenn.edu/help/graduation-technology-to-do-phd), accessed 2026-05-12 `[M]`

### 大学级 offboarding 模板已有，但研究组没用上
> "A knowledge transfer file should feed into the offboarding checklist with sections for planning (ensuring data is reproducible), storage (ensuring data is findable, accessible, and interoperable), and sharing (ensuring data is reusable)" — paraphrased from WebSearch summary citing [Calpoly Offboarding KT Plan](https://afd.calpoly.edu/learn-and-grow/docs/offboarding%20knowledge%20transfer%20plan.pdf), accessed 2026-05-12 `[M]`

### 中文圈强调"扶上马再送一程"的人对人交接
> "项目交接核心是确保对方能及时接手，原则是扶对方上马再送一程，把文档整理好的同时，最好能面对面沟通项目情况" — paraphrased from WebSearch summary citing [知乎专栏 — 如何做好项目交接](https://zhuanlan.zhihu.com/p/574607960), accessed 2026-05-12 `[M]` 【中文】

### 中文圈典型交接文档结构（程序员视角，直接映射到课题组代码项目）
> "Java程序员交接文档通常包含项目概述、技术架构、代码结构、数据库结构、运行环境和开发环境" — paraphrased from WebSearch summary citing [知乎专栏 — 程序员如何做好工作交接](https://zhuanlan.zhihu.com/p/29297794), accessed 2026-05-12 `[M]` 【中文】

---

## 对 `ai-paper-wiki` 的契合度评分

**2.5 / 5** — 毕业季是项目**最大盲区**之一

| 已覆盖（✓） | 未覆盖（✗ / △） |
|-----------|----------------|
| ✓ `add-member` skill 在 README 提到 "新成员 / 毕业 / alumni" — 但只覆盖 status 变更 | ✗ **「graduation handoff」skill 缺失** — alumni 状态切换不等于交接完成 |
| ✓ `members/<x>.md` 有 status 字段 | ✗ **「半成品 / 未发表项目」schema** — 离组者头脑里"还可能做的项目"没有结构化容器 |
| ✓ Backlinks → 离组者写过的笔记继续被引用 | ✗ **「接手人提名」** — 离组者推荐"谁能继续我的方向"没有 wiki 入口 |
| △ Cloudflare Access 可以放敏感凭证 | ✗ **「forwarding 联系方式 + 远程协助声明」** — 离组者"我未来还可远程协助哪些 topic"没有 wiki 字段 |
| — | ✗ **"defense 后强制 4 类交接产出"机制** — 与中文 source 强调的"扶上马再送一程"理念直接相关 |

### 缺什么（建议）— 这是整个 milestone 最强信号的 cycle

1. **【强信号 H / 03-senior-phd 已点名 / 此处再确认】`graduation-handoff` skill**：当 `members/<x>.frontmatter.status` 改成 `graduating` 时触发，引导产出 4 类文件：
   - **代码 / 数据集 / 集群账号入口表**（放 `internal-only` 区，Cloudflare Access 锁）
   - **半成品 / 未发表想法清单**（哪些建议继续 / 哪些建议砍 / 接手人提名）
   - **"远程协助声明"**（离组后我还愿意答的 topic + 频率上限）
   - **forwarding 联系方式**（含失效时间）
2. **【强信号 M】「submissions / 半成品」schema**：与 `cycles/04-paper-season.md` 提到的 submissions schema 共用，加 `wip_owner: <slug>` 字段，毕业时自动 grep 出"该 owner 名下未结的 wip"
3. **【中信号 M】"接手人 onboarding 路径"自动生成**：离组者填好交接后，agent 用知识图自动给接手人生成"你接手的 X 项目相关的 paper-notes / sessions / concepts" reading list
4. **【中信号 M / 跨 cycle 共识】"alumni 入口"**：呼应 03-senior-phd JTBD-4（简历需求）。离组后 `members/<x>.md` 自动转 `alumni`，展示"在组期间产出 + 毕业去向"。直接服务招生季 PI（"我们的学生去哪里"）和外部学生（社会证据）
5. **【反向意见】**README 提到"add-member 处理新成员 / 毕业 / alumni"——但 source 显示**毕业是一个独立 cycle**，复杂度远超 status 字段切换。把 graduation 塞进 add-member 是错的，应当独立 skill

---

## 风险 / 待验证

- 中文 source 多是程序员视角，学术组的"代码 + 论文 + 数据 + 关系"四维交接没有完整 case study — Iteration 5 dead-wiki 阶段尝试找研究组失败 case
- "远程协助声明"的实际履行率没有 source 支持，需要 alumni 反馈数据 — 项目可以做的最小可行版本：让 alumni 自己写 forwarding policy

---

## Sources

1. [monday.com — Project handoff process: 8 steps for seamless transitions](https://monday.com/blog/project-management/project-handoff/) `[M]`
2. [Wharton — PhD Graduation Technology To-Do List](https://support.wharton.upenn.edu/help/graduation-technology-to-do-phd) `[M]`
3. [Calpoly — Offboarding Knowledge Transfer Plan (PDF)](https://afd.calpoly.edu/learn-and-grow/docs/offboarding%20knowledge%20transfer%20plan.pdf) `[M]`
4. [知乎专栏 — 如何做好项目交接](https://zhuanlan.zhihu.com/p/574607960) `[M]` 【中文】
5. [知乎专栏 — 程序员如何做好工作交接](https://zhuanlan.zhihu.com/p/29297794) `[M]` 【中文】

**中文 source 占比**：2/5 = 40% ✓
