# 第一阶段里程碑：课题组共读 Wiki 垂类需求洞察 v1

> **目的**：为 `ai-paper-wiki` 项目挖掘课题组场景的深度需求，产出 cycle-10+ 的决策依据。
> **入口**：每次 loop 迭代读本文件，按 §2 Next-Iteration-Rule 找下一个未完成任务，做完写文件。
> **完成判据**：见 §4 Done。

---

## §0 总览

| 类别 | 文件数 | 输出位置 |
|------|--------|---------|
| 角色画像 (personas) | 6 | `personas/0X-<role>.md` |
| 周期切面 (cycles) | 5 | `cycles/0X-<phase>.md` |
| 学科切面 (disciplines) | 3 | `disciplines/<field>.md` |
| 横切发现 (findings) | 3 | `findings/<topic>.md` |
| 最终建议 | 1 | `product-recommendations.md` |
| 信息源索引 | 1 | `RESEARCH_INDEX.md`（累积更新） |

共 **18 个产出**，7 个 loop 迭代完成（部分迭代产出多个文件）。

---

## §1 Loop 迭代清单

每次迭代必须：
1. **至少访问 3 个真实 URL**（WebFetch / WebSearch / 公开仓库），不得凭空捏造
2. **每条洞察可溯源** — 引用要带 `[source: URL]`，无源的标 `[SPECULATION]`
3. **写完后追加** source 到 `RESEARCH_INDEX.md`
4. **不重复内容** — 写前先 grep 已有 personas / cycles / findings，避免互抄
5. **保留批判性** — 至少有一条反向意见（"项目当前做法可能错"）

### Iteration 1 · Personas batch A（PI + 博后 + 高年级博）
- 产出：`personas/01-pi.md`、`personas/02-postdoc.md`、`personas/03-senior-phd.md`
- 重点：决策权层、JTBD、对 wiki 的实际投入意愿
- 信息源建议：
  - reddit r/AskAcademia / r/PhD / r/labrats
  - 知乎"课题组""导师""博士后"话题高赞
  - Twitter/X：`@AcademicChatter`、`@PhDLife`、`@AcademicsSay`
  - 真实公开 lab page（Stanford SAIL、MIT CSAIL、北大智能学院、清华 THUNLP）
- 每个画像必须包含：
  - 一句话定位
  - JTBD（3-5 条，What → Why → When）
  - 典型一天 / 一周
  - 对 wiki 的态度（推 / 中立 / 抗拒 + 原因）
  - 对 `ai-paper-wiki` 现状的契合度评分（1-5）+ 缺什么

### Iteration 2 · Personas batch B（低年级博 + 硕士 + 新生 / RA）
- 产出：`personas/04-junior-phd.md`、`personas/05-masters.md`、`personas/06-newcomer-ra.md`
- 同 §1 结构。重点关注"被动使用者"的真实行为。

### Iteration 3 · Cycles（5 个周期切面）
- 产出：
  - `cycles/01-recruiting.md` 招生季
  - `cycles/02-onboarding.md` 入组前 30 天
  - `cycles/03-steady-state.md` 稳态学期中
  - `cycles/04-paper-season.md` 论文季 / 会议截稿前
  - `cycles/05-graduation.md` 毕业季 / 知识传承
- 每个周期必须包含：
  - 时间窗（例如 ICML 前 8 周）
  - 该周期下 wiki 的"高频动作"
  - 对应 `ai-paper-wiki` 现有 14 skill 的覆盖情况（覆盖 / 部分 / 空白）
  - 建议新增的 skill 或 schema 字段

### Iteration 4 · Disciplines（3 个学科切面）
- 产出：
  - `disciplines/ai-ml.md`（项目当前的 sweet spot）
  - `disciplines/wet-lab.md`（生物 / 化学 / 材料）
  - `disciplines/engineering.md`（机械 / 电子 / 系统）
- 重点：项目 "paper-centric" 假设在哪些组成立 / 不成立。每个学科至少访问 2 个真实公开 lab wiki。

### Iteration 5 · 横切发现 A · "为什么课题组 wiki 都死了"
- 产出：`findings/dead-wiki-postmortem.md`
- 至少 5 个真实根因，每个带 source quote
- 检索方向：
  - "lab wiki abandoned" / "research group notion died" / "wiki rot"
  - 公开仓库：检查 GitHub 上 "lab-wiki" / "research-group" 模板的 commit 频率（>1 年无 commit 算"死掉"）
  - 学术圈博客：Athena Talks / The Professor Is In / Inside Higher Ed

### Iteration 6 · 横切发现 B · 竞品 gap 分析
- 产出：`findings/competitor-gaps.md`
- 必须覆盖：Notion lab template、Obsidian 学术圈、Roam Research、Zotero groups、Quarto、Confluence、GitBook、Foam、tana.inc
- 每个工具一段：定位 / 做得好的 / 做得差的 / `ai-paper-wiki` 的差异化点
- 必有一段写"我们项目可能学到什么"

### Iteration 7 · 终局汇总 · 产品建议
- 产出：`findings/insight-clusters.md`（聚类前 6 次迭代的发现）+ `product-recommendations.md`
- `product-recommendations.md` 必须含：
  - **新增建议**（cycle-10+ 加什么 skill / schema / scaffold）
  - **砍掉建议**（哪些现有功能可能是过度设计） — **至少 1 条反向意见**
  - **收窄建议**（哪些假设应该明确"我们不服务这类组"）
  - **优先级排序**（每条标 P0 / P1 / P2，含理由）
  - **风险标注**（哪些建议可能错，需要进一步验证）

---

## §2 Next-Iteration-Rule

按以下顺序检查，第一个不满足的就是下一个迭代：

```
1. ls personas/*.md  → 6 个文件齐？ 不齐 → Iteration 1 / 2
2. ls cycles/*.md    → 5 个文件齐？ 不齐 → Iteration 3
3. ls disciplines/*.md → 3 个文件齐？ 不齐 → Iteration 4
4. test -f findings/dead-wiki-postmortem.md → Iteration 5
5. test -f findings/competitor-gaps.md → Iteration 6
6. test -f product-recommendations.md → Iteration 7
7. 全齐 → 停止 loop，输出 "MILESTONE COMPLETE"
```

---

## §3 通用产出规则

- **文件 frontmatter**：每个 .md 起头都加
  ```yaml
  ---
  iteration: <N>
  generated_at: <YYYY-MM-DD>
  sources_count: <N>
  confidence: high | medium | low
  ---
  ```
- **引用格式**：`> "原文 quote" — [source title](url), accessed YYYY-MM-DD`
- **可信度标记**：
  - `[H]` high — 来自 ≥2 个独立 source 印证
  - `[M]` medium — 单一 source 但权威
  - `[L]` low — 仅 1 个匿名社区帖
  - `[SPECULATION]` 推测
- **RESEARCH_INDEX.md 行格式**：
  `- [Title](url) — accessed YYYY-MM-DD — [H|M|L] — used in: personas/01-pi.md, cycles/02-onboarding.md`
- **避免**：
  - "我认为""可能""也许" 不带 source 的判断 → 必须标 `[SPECULATION]`
  - 罗列工具不分析 → 每个工具必有"对我们的启发"

### §3.1 Persona 入门门槛（适用 `personas/` 6 个文件）

- 每个 persona 必须有 **≥1 个 `[M]` 或 `[H]`** source。`[L]` 单一匿名社区帖不够开局。
- `[L]` source 允许做为 **佐证** 出现（≤30% 引用占比），不能作为 JTBD / 痛点的**唯一**支撑。
- 找不齐 `[M/H]`：**不写该 persona 文件**，停下问用户是否降级门槛，**禁止**勉强凑。
- `cycles/` `disciplines/` `findings/` 不受本条门槛限制（这些场景常需要 `[L]` 田野证据）。

### §3.2 信源多样性强制规则（Iteration 1 复盘后新增）

来源：Iteration 1 发现所有 source 都偏 Anglophone / 生物医学口音，与项目的"中国课题组 + AI/ML"目标用户存在视角错位。

- **Iteration 3（cycles/）**：每个 cycle 文件 **中文 source 占比 ≥ 30%**。允许来源类型：知乎、小木虫、`bilibili` 学术 up、中文公众号、中文 lab 主页、`zhuanlan.zhihu.com` 高赞、中文学位论文（CNKI / 万方）
- **Iteration 4（disciplines/）**：
  - `disciplines/ai-ml.md` 必须打 **≥3 个真实 AI/ML lab 公开页**（候选：Karpathy blog / Stanford NLP / Stanford SAIL / 清华 THUNLP / 北大 PKU-AI / DeepMind blog / OpenAI blog / Andrew Ng's lab / Allen Institute for AI）
  - `disciplines/wet-lab.md` 至少 1 个中文湿实验组主页（候选：颜宁组 / 施一公组 / 邵峰组 公开页面）
  - `disciplines/engineering.md` 至少 1 个非英语圈工程组
- **降级规则**：尝试 ≥3 个 URL 仍取不到时，在文件末尾标 `[GAP-CN]` / `[GAP-AI]` / `[GAP-WETLAB]` 并说明尝试过的 URL 与失败原因；**禁止**为了凑数把英文 source 强行说成"通用"

---

## §4 Done

全部满足才算第一阶段完成：

- [ ] `personas/` 下 6 个文件
- [ ] `cycles/` 下 5 个文件
- [ ] `disciplines/` 下 3 个文件
- [ ] `findings/` 下 3 个文件（dead-wiki-postmortem / competitor-gaps / insight-clusters）
- [ ] `product-recommendations.md`
- [ ] `RESEARCH_INDEX.md` 收录 ≥ 30 条真实 source
- [ ] `product-recommendations.md` 至少 5 条建议，至少 1 条是"砍/收窄"
- [ ] 所有文件有 frontmatter + 至少 1 个 `[source: URL]` 引用

---

## §5 Loop 调用方式

用户在 Claude Code 里：

```
/loop 读 analysis/lab-needs/MILESTONE.md，按 §2 Next-Iteration-Rule 找到下一个未完成的迭代，严格按 §1 对应迭代条目和 §3 通用规则执行（必须真实 WebFetch / WebSearch 取 source，禁止凭空写），产出指定文件并把新 source 追加到 RESEARCH_INDEX.md。如果 §4 全部勾选，输出 "MILESTONE COMPLETE" 并停止。
```

（不带 interval → 模型自定速。每次迭代 30-45 min。）
