---
iteration: 5
generated_at: 2026-05-12
sources_count: 6
confidence: high
cn_source_ratio: 0.33
---

# Finding 01 · "为什么课题组 wiki 都死了" — Postmortem

## 核心观察

**多数团队 / 课题组 wiki 在 3-6 个月内被废弃。**`ai-paper-wiki` 想要活过 3 年的关键不在工具，而在 5 个结构性问题是否被显式设计抵御。

> "Most team knowledge bases are abandoned within six months of launch, with a consistent pattern: someone creates a Notion or Confluence space, migrates the docs, and announces it to the team." — paraphrased from WebSearch summary citing [Notion / Docmost 综合材料], accessed 2026-05-12 `[M]`
> "Most internal knowledge bases die within a quarter, not because the extraction was bad, but because nothing keeps the extraction current." — paraphrased from WebSearch summary citing [Why Knowledge Bases Fail — Medium](https://medium.com/@artiquare/why-knowledge-bases-fail-and-how-to-move-beyond-them-b1e3a84d1d5f), accessed 2026-05-12 `[M]`

---

## 五大根因（强 source 支持）

### 根因 1 · 维护是"额外工作"，永远抢不过日常任务（incentive 缺失）

> "Writing documentation often feels like extra work rather than a valuable contribution. Employees are busy, and if documenting knowledge doesn't help them right now, it won't happen, as there's little incentive when they're buried in tasks and support tickets." — paraphrased from [Why Knowledge Bases Fail — Medium](https://medium.com/@artiquare/why-knowledge-bases-fail-and-how-to-move-beyond-them-b1e3a84d1d5f), accessed 2026-05-12 `[M]`
> "员工往往忙于日常业务，缺乏额外的时间和动力去梳理、沉淀和分享自己的知识与经验。如果企业没有建立一套行之有效的激励体系，知识库很容易沦为一个内容陈旧、无人问津的'僵尸'系统。" — paraphrased from WebSearch summary citing [知乎专栏 — 企业搭建知识库的 12 个顶级 Wiki 工具](https://zhuanlan.zhihu.com/p/694328403), accessed 2026-05-12 `[M]` 【中文】

**对 `ai-paper-wiki` 的对策**：项目已经用 "scaffold + agent 起草 + PI 一段 take" 降低写作成本。**但仍要警惕**：现有 14 skill 都偏 *production*（新建内容）。当前没有"维护已有内容"的 skill。

---

### 根因 2 · 内容变快超过维护速度（pace mismatch）

> "Even well-written wikis or SOPs go stale fast, and in dynamic environments, documentation can't keep pace with how things actually get done." — paraphrased from [Why Knowledge Bases Fail — Medium](https://medium.com/@artiquare/why-knowledge-bases-fail-and-how-to-move-beyond-them-b1e3a84d1d5f), accessed 2026-05-12 `[M]`

**AI/ML 场景特别痛**：cycle-03-steady-state 已经记录，AI/ML 半年一波术语（MoE → MLA → MTP → GRPO）。如果 `concepts/` 半年没更新，新生看到的是旧地图。

**对策**：知识图 `last_updated` 时效告警 + scaffold 时强制审查相邻 concept。

---

### 根因 3 · 维护堆在最忙的人身上（ownership concentration）

> "Traditional documentation efforts fail because they ask the people with the most knowledge—typically developers and senior staff—to write everything from scratch, which competes directly with their core responsibilities and never gets prioritized." — paraphrased from WebSearch summary citing [SharePoint Fails — Allymatter blog](https://www.allymatter.com/blog/why-sharepoint-fails-as-an-internal-knowledge-base), accessed 2026-05-12 `[M]`

**课题组里就是 PI + 博后 + 高博**——他们是最缺时间的人。01-pi.md + 02-postdoc.md + 03-senior-phd.md 三个 persona 已经独立验证这一点。

**对策**：把"写"和"审"分开。让新生 / 硕士 / 低博做"agent 草稿 → senior 校"的流程，分散负担。

---

### 根因 4 · 没有 review / 过期机制（无信号告警）

> "Without built-in content review cycles and expiration workflows, SharePoint sites commonly become digital dumping grounds filled with outdated, redundant, and sometimes contradictory information, and the system lacks automated tools to identify stale content or prompt regular reviews." — paraphrased from [Allymatter](https://www.allymatter.com/blog/why-sharepoint-fails-as-an-internal-knowledge-base), accessed 2026-05-12 `[M]`

**`ai-paper-wiki` 当前**：`verify` 检 schema / 链接 / 命名，**不检过期**。`pnpm list:* --since=Nd` 是 introspect 工具，不是过期告警。

**对策**：新加 `pnpm staleness-report`，按 themes / papers / concepts 三类输出"过期候选名单"。配合 cycle-03 的"半年未更新概念"提醒。

---

### 根因 5 · 信任崩坏后不可逆（compounding distrust）

> "Engineers actively avoid the docs because they've been burned by outdated information, and 'don't trust the wiki' becomes team wisdom when the one person who maintained it left or burned out." — paraphrased from WebSearch summary citing [SharePoint Fails — Allymatter](https://www.allymatter.com/blog/why-sharepoint-fails-as-an-internal-knowledge-base), accessed 2026-05-12 `[M]`

**这是最致命的失效**：一旦组员被错误信息坑过 1-2 次，wiki 就被默认忽略，进入"过期更厉害 → 更不可信 → 更没人看"的死亡螺旋。

**对策**：每页加 `last_reviewed_at`、`reviewer` 字段（不只是 git mtime）。让读者一眼看到"3 个月内被有人复核过 vs 18 个月没人动了"。

---

## LLM-era 的新可能性（与课题对应）

> "人类之所以会放弃维护wiki，是因为维护负担的增速超过了价值增速。大模型消除了这个瓶颈，它不会烦、不会忘、一次操作能同时更新十几个页面。" — paraphrased from WebSearch summary citing [知乎专栏 — Andrej Karpathy 如何用 LLM 构建你的个人知识库](https://zhuanlan.zhihu.com/p/2024197258569099118), accessed 2026-05-12 `[M]` 【中文】

— 这条**直接验证** `ai-paper-wiki` 的 "agent-native" 假设。但要警惕：**agent 也会撒谎 / 也会忘**。`AGENT_GUIDE.md` 必须有"agent 不该做什么"清单（README 已部分提到，但需要 expand）。

---

## 课题组特有的额外风险（推断 + 部分中文 source）

| 风险 | 描述 | source 强度 |
|------|------|------|
| **博士毕业带走 90% tacit knowledge** | cycle-05 graduation 已记录，离组没结构化交接 | `[H]` 跨 persona / cycle 共识 |
| **PI 不写就没人写** | 03-senior-phd 反向意见：依赖"主动写"的 wiki 都死 | `[M]` |
| **暑假 / 春节空窗 2-4 周** | wiki 没人动 → 重启成本高 | `[L SPECULATION]` |
| **国内课题组隐性等级** | 低博不敢公开标记师兄文档"过期 / 需复核" | `[L SPECULATION]` |
| **PI 换岗 / 退休** | 整个 wiki 失去最终决策者，最容易瞬间死亡 | `[L SPECULATION]` |

---

## 给 `ai-paper-wiki` 的具体建议（feed into Iteration 7）

1. **【P0 强烈推荐】每页 `last_reviewed_at` + `reviewer` frontmatter** — 抵御根因 5（信任崩坏）。零工程改动，立马可加
2. **【P0】`pnpm staleness-report` 工具** — 抵御根因 4（无过期机制）
3. **【P1】"agent 维护"专属 skill 集** — 抵御根因 1+3（维护负担集中）。需要新 skill：`review-stale-pages` / `propose-merge-duplicates` / `flag-broken-claims`
4. **【P1】"PI 不写也能活"的最小可运转配置** — 已在 03-senior-phd / 02-postdoc 反复指出。需要 SKill 文档 + group.config.yaml 例子展示"PI 不写"的健康组
5. **【P2 / 反向意见】**README 当前提"95% 维护交给 agent" — 这个数字**可能太高**了，给用户错误预期。Source 显示 agent 维护本身也有失效模式。建议改为"agent 起草 + 人工审，人工时间预期 30 min/周"，更诚实

---

## Sources

1. [Why Knowledge Bases Fail — and How to Move Beyond Them (Medium, artiquare)](https://medium.com/@artiquare/why-knowledge-bases-fail-and-how-to-move-beyond-them-b1e3a84d1d5f) `[M]`
2. [Why SharePoint Fails as an Internal Knowledge Base — Allymatter](https://www.allymatter.com/blog/why-sharepoint-fails-as-an-internal-knowledge-base) `[M]`
3. [Help Doc Debt: 80% of Knowledge Bases are Out of Date — Brainfish](https://www.brainfishai.com/blog/help-doc-debt-knowledge-bases-are-out-of-date) `[M]`
4. [The Knowledge Base Is Not the Moat. The Loop Is. — MPT Solutions](https://www.mpt.solutions/the-knowledge-base-is-not-the-moat-the-loop-is/) `[M]`
5. [知乎专栏 — 企业搭建知识库的 12 个顶级 Wiki 工具](https://zhuanlan.zhihu.com/p/694328403) `[M]` 【中文】
6. [知乎专栏 — Andrej Karpathy：如何用 LLM 构建你的个人知识库](https://zhuanlan.zhihu.com/p/2024197258569099118) `[M]` 【中文】

**中文 source 占比**：2/6 = 33% ✓
