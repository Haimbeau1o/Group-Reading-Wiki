---
rfc: R02
task_id: T02-5
status: pending
depends_on: []
estimated_minutes: 10
branch: cycle-10/R02/T02-5-skill-readme
files_touched:
  - .agent/skills/README.md
verification_commands: []
---

# T02-5 · .agent/skills/README.md 加复核规范段

## Context
RFC: `analysis/cycle-10/rfcs/R02-staleness-tracking.md` §D7
Audit: `analysis/cycle-10/00-current-state-audit.md` §3（skill 文件 8 段标准 + README 是清单）

## Exact Diff Intent

先 `cat .agent/skills/README.md` 看现有结构。然后在合适的位置（建议**末尾**或"通用约定"段如有）插入：

```markdown
## 复核 / 防腐（cycle-10 R02）

所有内容类型 frontmatter 支持：
- `last_reviewed_at: YYYY-MM-DD` — 上次复核日期
- `reviewer: <member-slug>` — 复核责任人
- `review_cadence: 6m|12m|indefinite` — 复核周期（默认按类型推断：concept/theme=6m，paper/session/member/faq=12m）

跑 `pnpm staleness-report` 看 stale 候选。

**不要 batch revisit**：每页复核应当带"实际是否仍有效"的判断，不只是改日期。

scaffold 命令支持 `--reviewer=<member-slug>`。新建内容时 `last_reviewed_at` 自动填今天。
```

## Verification
- `cat .agent/skills/README.md | grep -A 2 "复核"` —— 必须命中
- `wc -l .agent/skills/README.md` —— 行数应增加 ~10-15 行

## Rollback
- 撤 README.md 修改

## Out of Scope
- 不动其他 14 个 skill 文件（每个 skill 自动让用户填字段，不需要单独写"记得复核"）
- 不写 review-stale-pages skill（P1，phase 2）
