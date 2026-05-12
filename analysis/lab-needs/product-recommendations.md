---
iteration: 7
generated_at: 2026-05-12
sources_count: 0
confidence: high
cn_source_ratio: n/a
---

# Product Recommendations · cycle-10+ 决策建议（基于 17 个 finding 文件）

> 本文件是第一阶段里程碑的最终产出。所有建议追溯到 `personas/` `cycles/` `disciplines/` `findings/`。
> 优先级：**P0** = cycle-10 必做；**P1** = cycle-10/11 建议；**P2** = 长期 / 待验证。

---

## §1 新增建议（共 8 条）

### P0 · 新增 1 · FAQ schema + `add-faq` skill ★★★★★

**根据**：5 个 finding 文件共识（personas 02/03/04/06、cycles/02-onboarding、findings/insight-clusters §A）

**做什么**：
- 新增 `src/content/docs/faq/<slug>.md` 类型
- frontmatter 字段：`question: "..."`、`asked_by: <member-slug | guest>`、`answered_by: <member-slug>`、`related_papers: [...]`、`related_concepts: [...]`、`last_reviewed_at: YYYY-MM-DD`
- 新增 `.agent/skills/add-faq.md`：从 Slack / 微信粘贴片段 → agent 草稿 → senior 审 → 沉淀
- 新增 `pnpm new:faq <slug> --q="..." --asked-by=... --answered-by=...`
- 在 `concepts/` sidebar 旁增加 `faq/` 入口

**预期影响**：减少博后 / 高博 50% 的"答第 N 次同样问题"时间。直接打 dead-wiki 根因 1（incentive）—— 减少答疑成本 = 持续维护的内在动力。

**风险**：低。是 `concepts/` 的扩展，技术复杂度低。

---

### P0 · 新增 2 · `last_reviewed_at` + `reviewer` frontmatter + `pnpm staleness-report` ★

**根据**：dead-wiki-postmortem §根因 4-5；insight-clusters §C

**做什么**：
- 所有内容类型（themes / papers / sessions / concepts / faq / members）frontmatter 强制 `last_reviewed_at: YYYY-MM-DD`、`reviewer: <member-slug>`
- 新增 `scripts/staleness-report.mjs`：列出超过 6 个月（themes / concepts）/ 12 个月（papers）未复核的文件
- 每月一次 CI 自动开 issue "Stale content review needed"
- 新增 `.agent/skills/review-stale-pages.md`：agent 起草更新建议，让审者 30 min 内审完一批

**预期影响**：抵御 80%+ wiki 死亡的根因（信任崩坏）。

**风险**：低。frontmatter 加字段 + introspect 脚本，无破坏性。

---

### P0 · 新增 3 · "PI 不写也能活"的 RACI 矩阵 + skill 文档清洗 ★★★★

**根据**：personas 01 + 03、cycles/03-steady-state、findings/dead-wiki-postmortem §根因 3、insight-clusters §B

**做什么**：
- 在 `AGENT_GUIDE.md` 头部加 **RACI 矩阵**：

  | 内容类型 | 主作者 | 审者 | PI 角色 |
  |---------|--------|------|--------|
  | sessions | 博后 / 高博 / 当周 presenter | 无 / 自审 | **不参与** |
  | papers (read) | 博 / 硕 / 博后 | 同方向 senior | **审 take 段（≤200 字）** |
  | papers (write) / submissions | 第一作者 | 共同作者 | **拍板 / cover letter** |
  | concepts | 任意 contributor | senior 一审 | **不参与** |
  | themes | PI / 博后 | PI | **唯一主作者** |
  | mentoring-plan | PI + mentee | — | **共同所有** |
- 修改所有 14 个 skill 的 "Who runs this" 段，明确**禁止 PI 在 sessions 类内容上独立运行**
- 修订 README "PI take" 段：从"主笔"改为"审稿"

**预期影响**：让组员清楚知道"PI 不写"是设计目标而非 bug。降低新组采用时的"等 PI"瓶颈。

**风险**：低。纯文档改动。

---

### P1 · 新增 4 · `graduation-handoff` skill + 4 类强制产出 ★★★

**根据**：personas/03-senior-phd、cycles/05-graduation、disciplines/engineering、insight-clusters §1

**做什么**：
- 新增 `.agent/skills/graduation-handoff.md`
- 当 `members/<x>.frontmatter.status` 从 `active` 改为 `graduating` 时触发
- 强制 4 类产出：
  1. `internal/handoffs/<member-slug>/credentials.md`（代码 / 数据集 / 集群账号；放 Cloudflare Access 锁定区）
  2. `internal/handoffs/<member-slug>/wip.md`（半成品 / 未发表想法 / 接手人提名）
  3. `members/<member-slug>.md` 加 `forwarding_policy`、`remote_help_topics`、`alumni_since` 字段
  4. 触发 `personalized-onboarding` 给接手人自动生成 reading list
- 配套 `pnpm new:handoff <member-slug>`

**预期影响**：消灭"博士毕业带走 90% tacit knowledge"的最大单点失效。

**风险**：中。需要明确 `internal/` 与 Cloudflare Access 的鉴权配套，比纯文档复杂。

---

### P1 · 新增 5 · `submissions/` schema + `add-submission` skill ★★★★

**根据**：cycles 04 + 05、disciplines/ai-ml + engineering、insight-clusters §D

**做什么**：
- 新增 `src/content/docs/submissions/<year>-<venue>-<slug>.md`
- frontmatter：`status: in-prep|submitted|under-review|accepted|rejected|withdrawn|camera-ready`、`authors_order: [slug, slug, ...]`、`venue`、`deadline`、`postmortem_url`、`wip_owner: <slug>`、`reproduction_status`、`code_url`
- 新增 skill `add-submission`（开稿）、`submission-postmortem`（结果出来后复盘）
- 与 `papers/`（外部论文解读）区分；与 `themes/`（主线）关联

**预期影响**：让招生季"我们近期做了啥"可见；让毕业季 wip 有归宿；让 reviewer 反馈被沉淀。

**风险**：中。schema 设计有歧义（与 themes / papers 边界），需要 cycle-10 设计阶段细化。

---

### P1 · 新增 6 · `mode` 状态机 + 周期感知的 verify ★★★★

**根据**：cycles 01 + 03 + 04、insight-clusters §E

**做什么**：
- `group.config.yaml` 加 `mode: steady | paper-freeze | recruiting-push | onboarding-burst | summer-break`
- `verify` 在 `paper-freeze` 模式下放宽 schema 严格度（允许 sessions 占位 4 周）
- `weekly-digest` 在 `paper-freeze` 模式下自动暂停
- `welcome.md` / `themes/` 在 `recruiting-push` 模式下渲染额外 "Now Recruiting" 标语
- 新增 skill `switch-mode`

**预期影响**：让 wiki 跟随研究组真实节奏，避免"截稿前还要求写 sessions"的反人性约束。

**风险**：中。模式切换的状态管理复杂度高于 stage（template/initialized/established 已有 3 态 + 新增 5 个 mode）。

---

### P2 · 新增 7 · `who-knows-X` introspect 命令 ★

**根据**：personas/03-senior-phd JTBD-2、insight-clusters §1

**做什么**：
- 基于现有 `src/generated/knowledge-graph.json`
- `pnpm who-knows <topic-or-concept-slug>`：返回近 6 个月在 sessions/papers/concepts/faq 写过该主题的成员排序

**预期影响**：减少高博被新生敲门的频率。

**风险**：低。复用知识图 json，纯查询。

---

### P2 · 新增 8 · `arxiv` / `zotero` 集成 ★★★

**根据**：cycles/04-paper-season、disciplines/ai-ml、competitor-gaps §2

**做什么**：
- `pnpm new:paper --from-arxiv=2501.12345`：自动抓 metadata + bibtex + abstract → 填 frontmatter
- `pnpm new:paper --from-zotero-key=ABC123`：从 Zotero better-bibtex export 拉数据
- `papers/<slug>.frontmatter` 加 `arxiv_id`、`zotero_key`、`reproduction_status`、`code_url`

**预期影响**：降低 AI/ML 用户 50%+ 的 paper note 起草时间，提升留存。

**风险**：中。arXiv API rate limit + Zotero local sqlite 路径不稳定。要设计成可选 plugin 而非核心。

---

## §2 砍 / 收窄建议（共 7 条 — 至少 1 条已满足里程碑要求）

### P0 · 砍 1 · README "95% 维护交给 agent" 改为诚实数字

**根据**：findings/dead-wiki-postmortem §5（信任崩坏 + LLM 也会出错）

**做什么**：README 改为 "agent 起草 + 人工审，人工 ~30 min/周（稳态）/ 0 min/周（截稿期 freeze）"。

**为什么**：当前数字过高给用户错误预期。Source 显示 agent 维护本身有失效模式。诚实预期 = 长期信任。

---

### P0 · 收窄 1 · "AI/ML 研究组通用" → "NLP / 大模型应用 sweet spot"

**根据**：disciplines/ai-ml §5 反向意见

**做什么**：README "解决什么问题"段加一句"当前模板对 NLP / 大模型应用 / 算法组优化最好；CV / 系统组 / RL 组可用，但部分 schema（如 sessions 三段式）可能需要本地化调整"。

**为什么**：避免"什么都接但什么都不优秀"。Leon's Group 是 DeepSeek 主题 = NLP/LLM 应用，与模板设计的 spirit 一致。

---

### P0 · 收窄 2 · "服务全学科" → 明示"reading-side wiki"

**根据**：disciplines/wet-lab + engineering、competitor-gaps §8

**做什么**：README 明示"`ai-paper-wiki` 是 reading-side wiki，与 ELN（protocol / batch / sample）互补，不替代"。

**为什么**：避免湿实验 / 工程 PI 错误期待"用一套工具搞定所有"。

---

### P1 · 砍 2 · `weekly-digest` 强制每周频率 → 双周 / 主题触发

**根据**：personas/02-postdoc 反向意见

**做什么**：`weekly-digest` skill 改名 `digest`，参数化 `--cadence=weekly|biweekly|monthly|on-trigger`，默认双周。`paper-freeze` 模式下自动 on-trigger。

---

### P1 · 砍 3 · `sessions/` 三段式强制 → 提供 `--mode=light`

**根据**：personas/01 + 03、cycles/03-steady-state、insight-clusters §4

**做什么**：`weekly-session` skill 加 `--mode=light`：只记 3 个 bullets + agent 扩写 → 3 段输出。verify 不强制 light mode 写满三段。

---

### P1 · 收窄 3 · `personalized-onboarding` "全个性化" → "默认路径 + 师兄微调"

**根据**：cycles/02-onboarding 反向意见 + 中文 source 显示师兄通常直接给 reading list

**做什么**：`personalized-onboarding` skill 默认从 `onboarding.md` 的标准路径出发，让师兄 / 博后 review 时只修改 5-10 行 reading_list，不从零定制。

---

### P2 · 砍 4 · `add-member` 包含毕业流程 → 拆出独立 `graduation-handoff`

**根据**：cycles/05-graduation 反向意见、insight-clusters §1

**做什么**：见 P1 新增 4。`add-member` skill 移除毕业 / alumni 部分，由独立 skill 接管。

---

## §3 待验证 / 风险标注（共 5 条）

| 待验证 | 风险 | 验证方法 |
|--------|------|---------|
| **市场存在性** | 课题组 wiki 这个垂直市场可能太小 | competitor-gaps §独占象限 — 留 v2 真实用户访谈 |
| **国内课题组隐性等级** | review-pr / staleness-report 在国内组的实际接受度未知 | insight-clusters §3-1 — 找 3 个国内 PI 试用 v0 |
| **AI for X 混合组是否真的是 PMF 候选** | 没有直接 source | 在 v2 招 1-2 个 AI for biology / robotics 组试用 |
| **PNAS + Wiley 二手引用** | 关键文献无法直接抓取 | 找学校图书馆代查；不影响主结论 |
| **湿实验 + 工程的中文 source 缺失** | disciplines/wet-lab cn_ratio=0，engineering cn_ratio=25% | 不在 cycle-10 解决，留 v2 |

---

## §4 优先级 Roadmap 建议（一张图）

```
cycle-10（推荐 4-6 周内）：
  P0 · FAQ schema + add-faq skill         （新增 1）
  P0 · last_reviewed_at + staleness-report（新增 2）
  P0 · RACI 矩阵 + skill 文档清洗         （新增 3）
  P0 · README 改 95% → 诚实数字           （砍 1）
  P0 · README 收窄 NLP/LLM + reading-side  （收窄 1, 2）

cycle-11（cycle-10 验证后 4-6 周）：
  P1 · graduation-handoff skill           （新增 4）
  P1 · submissions schema                 （新增 5）
  P1 · mode 状态机                        （新增 6）
  P1 · weekly-digest 改双周               （砍 2）
  P1 · sessions light mode                （砍 3）

cycle-12+ / v2：
  P2 · who-knows-X
  P2 · arxiv / zotero 集成
  P2 · onboarding 默认路径 + 师兄微调
  P2 · add-member 拆 graduation-handoff
  P2 · 验证：市场存在性 / 隐性等级 / AI for X
```

---

## §5 与 MILESTONE §4 Done 判据对齐

- [x] `personas/` 6 个文件
- [x] `cycles/` 5 个文件
- [x] `disciplines/` 3 个文件
- [x] `findings/` 3 个文件
- [x] `product-recommendations.md` 本文件
- [x] 至少 5 条建议（实际 8 新增 + 7 砍 / 收窄 = 15 条）
- [x] 至少 1 条"砍/收窄"（实际 7 条）
- [x] 至少 1 条"风险标注"（实际 5 条）
- ⏳ `RESEARCH_INDEX.md` ≥ 30 条 — 待最终更新

**MILESTONE COMPLETE 在 RESEARCH_INDEX 补全后达成。**
