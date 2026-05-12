---
rfc: R02
title: last_reviewed_at + reviewer frontmatter + staleness-report
status: draft
estimated_total_minutes: 180
depends_on: [R01]
authors: agent
---

# R02 · Staleness Tracking · `last_reviewed_at` + `reviewer` + `pnpm staleness-report`

## Problem（1 句）

**80%+ 的团队 wiki 在 6 个月内被废弃，最致命的失效模式是"信任崩坏"——一旦组员被过期信息坑过 1-2 次就停止使用 wiki，进入死亡螺旋。当前 `verify` 不检过期；`pnpm list:* --since=Nd` 是 introspect 不是预警；除 git mtime 外**没有任何"页面级"的复核时间证据**。**

## Source of Truth

- `analysis/lab-needs/findings/dead-wiki-postmortem.md` §根因 4（无 review/过期机制）+ §根因 5（信任崩坏不可逆，**80% wiki 死法**）+ §"对策"
- `analysis/lab-needs/findings/insight-clusters.md` §C 主题（"过期/复核/信任机制"）
- `analysis/lab-needs/product-recommendations.md` §1 新增 2（P0）+ §4 Roadmap cycle-10 第 2 项

## Current State

引用自 `analysis/cycle-10/00-current-state-audit.md`：
- §1.3 · 当前 5 个内容类型的 schema **没有**任何"复核时间"字段
- §6 · `verify.mjs` 9 类检查 **没有 staleness 检查**（确认零冲突）
- §7 · `list.mjs` 接受 `--since=Nd`、`--source=mtime|git`，**没有 `--stale-only` flag**
- §6 末尾 · "**R02 整个就是新增能力，不会破坏现有规则**"
- §8 · `group.config.yaml` 配置级 stage 与本 RFC 无关（页面级不是配置级）
- §13 · 风险预警：**`last_reviewed_at` 不能立刻 required**，否则所有现有文件报 error → 本 RFC 全程 **optional**

## Desired State

### §D1 · Frontmatter 字段（5 个 schema + faq 共 6 个）

每个 schema 的 `optional` 数组追加：

```
- last_reviewed_at  : YYYY-MM-DD（ISO 日期字符串）
- reviewer          : member-slug
- review_cadence    : "6m" | "12m" | "indefinite"     （optional · 默认按类型推断）
```

**`review_cadence` 类型默认值**（用于 staleness-report 阈值）：
- `concept` / `theme` → 6 个月
- `paper` / `session` / `member` / `faq` → 12 个月
- generic / index → 不检查

**字段语义**：
- `last_reviewed_at` 表示"上次有人**人工复核**这一页"——**不是** git mtime（git mtime 会被 `init` / rename 刷掉，见 list.mjs 文档说明）
- `reviewer` 是负责人的 member-slug。无人审 = 字段为空。
- `review_cadence` 是可选 override，让"快速腐烂的概念"（半年）和"慢速变化的成员页"（12 个月）分别处理

### §D2 · YAML 例子

```yaml
---
title: "Mixture of Experts (MoE)"
description: "..."
sidebar:
  order: 2
  label: "MoE"
aliases: []
related_concepts: [grpo]
parent_concept: null
tags: [transformer]
last_reviewed_at: "2026-05-12"    # NEW · optional
reviewer: "alice"                  # NEW · optional
review_cadence: "6m"               # NEW · optional · 默认对 concept 就是 6m
---
```

### §D3 · 改 `scripts/lib/frontmatter.mjs`

每个 schema 的 `optional` 数组追加 3 个字段：

```js
// L101 member
optional: [...existing, 'last_reviewed_at', 'reviewer', 'review_cadence'],
// L114 session
optional: [...existing, 'last_reviewed_at', 'reviewer', 'review_cadence'],
// L128 paper
optional: [...existing, 'last_reviewed_at', 'reviewer', 'review_cadence'],
// L138 theme
optional: [...existing, 'last_reviewed_at', 'reviewer', 'review_cadence'],
// L146 concept
optional: [...existing, 'last_reviewed_at', 'reviewer', 'review_cadence'],
// faq (来自 R01)
optional: [...existing, 'last_reviewed_at', 'reviewer', 'review_cadence'],
```

**关键决策**：**全部 `optional`，不进 `required`**。理由：
- 现有内容大多没这字段，required 会让 `pnpm verify` 全爆 error
- ratchet 到 required 是 phase 2 决策（dead-wiki §C 提了但 R02 不做）

**`slug_refs` 改动**：把 `reviewer` 加为指向 member 的 slug_ref：
```js
{ field: 'reviewer', target: 'member', kind: 'scalar' }
```

每个 schema 的 `slug_refs` 数组各加这一条。**verify 死链检查会自动覆盖**（无需改 verify.mjs）。

### §D4 · 新脚本 `scripts/staleness-report.mjs`（~180 行）

#### §D4.1 命令签名

```
pnpm staleness-report
  [--type=papers|concepts|themes|members|sessions|faq|all]   # 默认 all
  [--cadence=6m|12m|24m]                                     # 强制覆盖类型默认
  [--include-unreviewed]                                     # 未填 last_reviewed_at 的也算 stale，默认 true
  [--reviewer=<member-slug>]                                 # 仅看某人负责的
  [--unowned-only]                                           # 仅显示 reviewer 字段为空的
  [--json]                                                   # 机读输出
  [--quiet]                                                  # 仅 exit code，不打印
```

#### §D4.2 行为

1. 遍历 `src/content/docs/**/*.{md,mdx}`
2. 跳过 `index.*` 和 generic schema
3. 对每个文件：
   - 读 `last_reviewed_at` / `reviewer` / `review_cadence`
   - 用 `review_cadence` 字段；没有就用类型默认（concept/theme=6m，其他=12m）
   - 算 days_since_reviewed
   - 如果 days_since_reviewed > cadence 阈值 → 加入 stale 列表
   - 如果 `last_reviewed_at` 缺失且 `--include-unreviewed`（默认）→ 加入 stale 列表，days_since 标 `null`
4. 按 days_since_reviewed 倒序 / null-first 排序输出

#### §D4.3 输出形态

**人类可读模式（默认）**：
```
📋 staleness-report · 2026-05-12

⚠️  3 stale · 2 unreviewed

STALE (last reviewed > cadence):
  ⏰ concepts/moe.md        last_reviewed=2025-09-01 (254d ago, cadence=6m)  reviewer=alice
  ⏰ themes/long-context.md last_reviewed=2025-08-15 (271d ago, cadence=6m)  reviewer=bob
  ⏰ papers/deepseek-r1.md  last_reviewed=2025-03-12 (427d ago, cadence=12m) reviewer=alice

UNREVIEWED (no last_reviewed_at):
  ❓ concepts/mla.md        reviewer=<unset>
  ❓ faq/how-to-pick-arxiv-papers.md  reviewer=alice
```

**JSON 模式 (`--json`)**：
```json
{
  "ok": true,
  "generated_at": "2026-05-12T14:30:00Z",
  "stats": { "total": 32, "stale": 3, "unreviewed": 2, "fresh": 27 },
  "items": [
    {
      "file": "concepts/moe.md",
      "type": "concept",
      "last_reviewed_at": "2025-09-01",
      "reviewer": "alice",
      "review_cadence": "6m",
      "days_since": 254,
      "status": "stale"
    },
    ...
  ]
}
```

#### §D4.4 Exit code

- `0` —— 全部 fresh / 都在 cadence 内
- `1` —— 至少 1 个 stale 或 unreviewed
- `2` —— 脚本本身报错

**理由**：CI 可以选择跑 `pnpm staleness-report --quiet` 然后看 exit code 决定是否警告。**R02 不让 CI 必须通过 staleness**（这会让 PR 集中遭误伤），但暴露 exit code 供未来 phase 用。

### §D5 · 改 `package.json`

L24 后插入：
```json
"staleness-report": "node scripts/staleness-report.mjs",
```

### §D6 · scaffold 改动（`new-*.mjs`）

新建文件时自动填 `last_reviewed_at: <today>` + `reviewer: <作者，如可推断>`。

具体改动 6 个 scaffold（new-paper / new-session / new-concept / new-theme / new-member / new-faq）：

在生成 frontmatter content 时追加：
```js
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const reviewer = opts.reviewer || '';
// ... 拼到 content 模板里
last_reviewed_at: "${today}"
reviewer: ${reviewer ? `"${reviewer}"` : '""'}
```

每个 scaffold 加 `--reviewer=<slug>` 可选 flag。

### §D7 · skill 改动（轻）

**只动 1 个 skill 文件**：`.agent/skills/README.md` 加一段"复核规范"：

```markdown
## 复核 / 防腐（cycle-10 R02）

所有内容类型 frontmatter 支持：
- `last_reviewed_at: YYYY-MM-DD` — 上次复核日期
- `reviewer: <member-slug>` — 复核责任人
- `review_cadence: 6m|12m|indefinite` — 复核周期

跑 `pnpm staleness-report` 看 stale 候选。

**不要 batch revisit**：每页复核应当带"实际是否仍有效"的判断，不只是改日期。
```

**不动其他 13 个 skill**——它们的"执行步骤"段会自然在新内容里包含 last_reviewed_at（因为模板已含），不需要单独写"记得改 last_reviewed_at"。

### §D8 · 不动 verify.mjs 的核心检查

**重要**：本 RFC **不让 staleness 进 `pnpm verify`**。理由：
- verify 失败 = CI 红，会阻塞 PR
- staleness 是 informational，不是 schema 错误
- 强制 verify 跑 staleness 会让现存所有文件即刻"过期" → 全爆 → 失去信号

**未来 ratchet（phase 2 决策，本 RFC 不做）**：
- 把 staleness-report 加进 CI 但仅 advisory（continue-on-error）
- 把 `last_reviewed_at` 从 optional 升 required（先有 90 天 grace period）

## Work Breakdown

| Task | 标题 | 依赖 | 影响文件 | 预计 |
|------|------|------|---------|------|
| **T02-1** | 改 SCHEMAS 加 3 个 optional 字段 + reviewer slug_ref | R01 完成 | `scripts/lib/frontmatter.mjs` | 15 min |
| **T02-2** | 新建 `scripts/staleness-report.mjs` | T02-1 | 新文件 | 60 min |
| **T02-3** | 改 6 个 scaffold 自动填 last_reviewed_at + reviewer | T02-1 | `scripts/new-*.mjs` × 6 | 45 min |
| **T02-4** | 改 package.json 加 `pnpm staleness-report` 脚本 | T02-2 | `package.json` | 5 min |
| **T02-5** | 改 `.agent/skills/README.md` 加复核规范段 | 无 | `.agent/skills/README.md` | 10 min |
| **T02-6** | 给所有现存 `src/content/docs/**/*.md` backfill `last_reviewed_at: <today>` + `reviewer: ""` | T02-1 | 全部内容文件（~30 个） | 30 min |
| **T02-7** | 集成验证 + 写完成 report | 全部 | 无 | 15 min |

**合计 ~3 小时**。

**T02-6 重要说明**：backfill 是**纯字段添加**，不改任何现有内容。改后 `pnpm verify` 应当 0 warning（因为是 optional → 不报）。这步要做是因为不做的话 staleness-report 会把所有现存文件标 `unreviewed`，噪声太大。

## Verification

每个 task 完成后必跑：
- `pnpm verify` —— 0 warning
- `pnpm build:index` —— knowledge-graph.json 可重建（reviewer 边出现在 backlinks）

T02-7 集成验证：
- `pnpm staleness-report` —— 必须 work，给个像样的报告
- `pnpm staleness-report --json | jq .` —— 输出符合 D4.3 形态
- `pnpm staleness-report --type=concepts --quiet; echo $?` —— 看 exit code（concepts cadence=6m，backfill 是今天 → 应该 exit 0）
- 手动把某个 concept 的 `last_reviewed_at` 改为 `2024-01-01` → 再跑 staleness-report 看是否被报为 stale
- `pnpm new:concept test-staleness --full="..." --reviewer=alice` —— 看生成的文件含 last_reviewed_at = today
- `pnpm verify:full` —— 含完整 build，确认 staleness 字段不破 build

**不能破的现有功能**：
- `pnpm list:*` shape 不变
- `pnpm verify` 0 warning（含 backfill 后）
- `src/generated/knowledge-graph.json` 仍可读
- 现有 14 个 skill 文件不动（除 README）

## Out of Scope

- ❌ CI 集成 staleness-report（advisory or blocking）—— phase 2
- ❌ `last_reviewed_at` ratchet 到 required —— phase 2
- ❌ 自动 PR 提醒（"page X 过期了，请审"）—— phase 3
- ❌ 复核工作流（"agent 给出审核建议 → 人确认 → 自动更新 last_reviewed_at"）—— 这是 P1 的 `review-stale-pages` skill，**不在本 RFC**
- ❌ Web UI 显示 "last reviewed N months ago" badge —— Starlight footer 改造，cycle-11
- ❌ Reviewer 字段必填 —— phase 2

## Rollback

- 每个 task 一个 branch：`cycle-10/R02/T02-<n>-<slug>`
- T02-6（backfill）是最大但也最容易撤的改动：单 `git revert <SHA>` 恢复
- T02-3（改 scaffold）失败 → 撤 scaffold change，**已生成的内容文件保留**（向前兼容）
- T02-2（新脚本）失败 → 删 staleness-report.mjs + revert package.json 那一行

## Risk

| Risk | Likelihood | Impact | 缓解 |
|------|------------|--------|------|
| `last_reviewed_at` 日期格式不一致（ISO vs slash vs 中文） | 中 | 中 | T02-2 解析时严格 `YYYY-MM-DD`，其他报 warn 不报 error |
| backfill 时间集中（全 = 今天） → staleness-report 6 个月后**集体过期**全爆警告 | 高 | 中 | 已知问题，在 R02 报告里明文标注；缓解：phase 2 时用 git log 找每页"最后实质改动日" 作 backfill 而非 today |
| reviewer 字段被人填错（非 member-slug） | 中 | 低 | slug_refs 死链检查覆盖，verify 会 error |
| scaffold 改动让现有 init-group 测试失败 | 低 | 中 | T02-7 跑 `pnpm smoke-test:fork` 验证 |
| review_cadence 取值"6m" / "12m" 字符串解析错 | 低 | 低 | 写测试覆盖：`parseCadence("6m")` → 180 天 |

---

**Status**: draft · 待用户审稿。**依赖 R01 完成**（R01 加的 `faq` schema 也要在本 RFC backfill last_reviewed_at）。
