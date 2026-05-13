---
iteration: 7
generated_at: 2026-05-12
sources_count: 0
confidence: high
cn_source_ratio: n/a
---

# Finding 03 · Insight Clusters（前 6 次迭代的聚类合并）

> **本文件不引入新 source，是对前 6 个迭代 17 个文件的横切聚类。**所有引用追溯到原文件。

## §1 横切共识矩阵

下表统计哪些信号在多个 persona / cycle / discipline 中独立出现。**出现次数 ≥3 即视为强共识**。

| 信号 | personas | cycles | disciplines | findings | 共识强度 |
|------|----------|--------|-------------|----------|----------|
| **FAQ / 踩坑词典 schema** | 02 / 03 / 04 / 06 | 02-onboarding | — | — | **5 ★★★★★** |
| **Graduation handoff skill** | 03 | 05-graduation | engineering | — | **3 ★★★** |
| **Session-level objective 字段** | 01 | 03-steady-state | — | — | **2 ★★** |
| **轻量记录模式 / "30 秒入口"** | 02 / 03 | 03-steady-state | — | dead-wiki 根因 1+3 | **4 ★★★★** |
| **Who-knows-X 路由** | 03 | — | — | — | **1 ★** |
| **Mentor pairing 字段** | 06 | 02-onboarding | — | — | **2 ★★** |
| **PI 不是主要作者（skill 文档明示）** | 01 / 03 | 03-steady-state | — | dead-wiki 根因 3 | **4 ★★★★** |
| **arXiv / Zotero 集成** | — | 04-paper-season | ai-ml | competitor-gaps Obsidian | **3 ★★★** |
| **Submission schema（组里写的论文）** | — | 04 / 05 | ai-ml / engineering | — | **4 ★★★★** |
| **Alumni 入口** | 03 | 05-graduation | — | — | **2 ★★** |
| **招生季模式 / public push** | 01 | 01-recruiting | ai-ml | competitor-gaps Notion | **4 ★★★★** |
| **reading list 难度分级** | 04 / 06 | 02-onboarding | — | — | **3 ★★★** |
| **last_reviewed_at + reviewer 字段** | — | — | — | dead-wiki 根因 5 | **1 ★（但 P0 影响大）** |
| **staleness-report 工具** | — | — | — | dead-wiki 根因 4 | **1 ★（但 P0 影响大）** |

---

## §2 五大主题聚类

### 主题 A · "答疑 → 沉淀" 闭环（最强信号）

**5 个文件独立呼吁**：02-postdoc / 03-senior-phd / 04-junior-phd / 06-newcomer-ra / 02-onboarding 全部点名"FAQ / 踩坑词典"。

**底层逻辑**：
- 博后 / 高博每周被新生问 5-10 个重复问题
- 新生因"师兄看着我学"压力不敢公开提问
- 当前 `concepts/` 是术语词典，不是问答库
- Quotes:
  > "Having someone there to walk me through every single step, multiple times if necessary, was really helpful" — [Chemistry World](https://www.chemistryworld.com/careers/recognising-the-roles-that-senior-phds-and-postdocs-play-in-training-new-lab-members/4018162.article)（02-postdoc）
  > "新生应该充分利用师兄的知识、操作技能和课题组经验的传承" — [CSDN 转载 知乎](https://blog.csdn.net/Xw_Classmate/article/details/122833892)（02-onboarding）

**该建什么**：FAQ schema + `add-faq` skill + 自动从 Slack / 微信 / Discussions 转 FAQ。

---

### 主题 B · "PI 不写，组也能活" + 维护负担分散

**4 个文件呼应**：01-pi（PI 不写 sessions）/ 03-senior-phd（PI 不是主要作者）/ 03-steady-state（PI 不参与 sessions 写作）/ dead-wiki-postmortem（根因 3 ownership concentration）。

**底层逻辑**：
- README 当前默认 PI 是 wiki 灵魂，但 PI 周二 = 深度工作日，**完全不碰 wiki**
- 真实主作者是博后 + 高博
- 维护堆在最忙的人身上是死亡螺旋
- Quotes:
  > "I need to pipet stuff while I'm stressing out over a grant deadline." — [Cell Mentor](https://crosstalk.cell.com/blog/lessons-from-my-first-year-as-a-pi)（01-pi）
  > "Traditional documentation efforts fail because they ask the people with the most knowledge—typically developers and senior staff—to write everything from scratch" — [Allymatter](https://www.allymatter.com/blog/why-sharepoint-fails-as-an-internal-knowledge-base)（dead-wiki）

**该建什么**：明确"主作者 = 博后 + 高博 + 低博 + 硕"的 RACI 矩阵；让"PI 不写也能跑"成为 stage 验证项。

---

### 主题 C · 过期 / 复核 / 信任机制（防腐）

**唯一全 source 是 dead-wiki-postmortem**，但影响所有 wiki。

**该建什么**：
- 每页 `last_reviewed_at` + `reviewer` frontmatter
- `pnpm staleness-report` 工具
- `review-stale-pages` skill（每月跑一次）

**为何 P0**：单一 root cause 在所有竞品中导致 80%+ wiki 死亡。dead-wiki §5 已论证。

---

### 主题 D · "组里产出"维度（vs 仅"组里读过"）

**4 个文件呼应**：04-paper-season / 05-graduation / ai-ml / engineering 都呼吁 `submissions/` schema。

**底层逻辑**：当前 `papers/` 是外部论文解读，缺组内自己发的论文记录。这让：
- 招生季外部学生看不到"近期产出"
- 毕业时未发表 wip 没结构化容器
- 复盘 reviewer 反馈无处沉淀

**该建什么**：`submissions/<year>-<venue>-<slug>.md` schema + `add-submission` skill + 配套 `submission-postmortem` skill。

---

### 主题 E · 周期性"模式切换"（freeze / push）

**3 个文件呼应**：04-paper-season（freeze 模式）/ 01-recruiting（public push 模式）/ 03-steady-state（轻量模式）。

**底层逻辑**：研究组一年有结构化的高压期 / 平稳期 / 招生期。当前 wiki 是无差别状态机，不感知"我们组现在在做啥"。

**该建什么**：`group.config.yaml` 加 `mode: steady|paper-freeze|recruiting-push`，scaffold / verify / digest 根据 mode 自动调整严格度。

---

## §3 个人 / 组未发声但 source 明显的盲区

这些信号在 source 里出现但未在 personas / cycles 充分讨论，应进 product-recommendations 的"待验证"：

1. **隐性等级文化** — 中文 source 暗示新生不敢标注师兄文档"过期"，但项目假设的是 git PR / Discussions 平等讨论。**Iteration v2 调研：国内课题组用 review-pr skill 的真实接受度**
2. **暑假 / 春节空窗 2-4 周** — 没有 source 直接说，但符合 dead-wiki 根因 5（一次崩塌就死）的失效模式
3. **AI for X 混合组**（AI for biology / engineering）— ai-ml + wet-lab + engineering 三个 discipline 均指向这是潜在 PMF 候选，但没单独调研

---

## §4 反向意见 / 砍掉的候选

整合所有 personas / cycles 的反向意见：

| 候选砍 / 收窄 | 来源 | 建议 |
|--------------|------|------|
| `weekly-digest` 强制每周频率 | 02-postdoc 反向 | 改双周 / 主题触发式 |
| `sessions/` 三段式强制 | 01-pi / 03-senior-phd / 03-steady-state | 提供 `--mode=light` 轻量替代 |
| `personalized-onboarding` 全个性化 | 02-onboarding | 改 "默认路径 + 师兄微调" |
| README "95% 维护交给 agent" | dead-wiki §5 | 改 "agent 起草 + 人工审 30 min/周" |
| `add-member` 包含毕业流程 | 05-graduation | 拆出 `graduation-handoff` 独立 skill |
| "AI/ML 研究组通用" | ai-ml §5 | 收窄到 NLP / 大模型应用 |
| "服务湿实验组" | wet-lab §1 | 明示"reading-side"，不与 ELN 竞争 |

---

## §5 风险盘点（Iteration 7 决策前必须意识到）

1. **本里程碑只是 desktop research，没有真实用户访谈** — 所有 JTBD 都是基于 source 推断
2. **强 source 偏 Anglophone + 生物医学**，中国 / AI/ML 实际课题组的 N=多 调研缺失
3. **PNAS + Wiley 关键文献无法直接抓取**，二手引用占比偏高
4. **市场可能不存在** — competitor-gaps §综合 已指出 "ai-paper-wiki 独占象限"既是好消息也是坏消息

---

## §6 与里程碑 §4 Done 的对齐

- 本文件不引入新 source，但 §1 表格的 14 行信号 + §3 的 3 个盲区，足以输入 `product-recommendations.md`
- `product-recommendations.md` 应当满足：
  - 至少 5 条建议（共识 ≥3★ 的至少进 P0/P1）
  - 至少 1 条"砍/收窄"（§4 已列出 7 个候选）
  - 至少 1 条"风险标注"（§5 已列出 4 类风险）

下一步：写 `product-recommendations.md`。
