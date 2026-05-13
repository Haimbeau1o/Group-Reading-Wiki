---
rfc: R02
task_id: T02-1
status: pending
depends_on: [T01-9]
estimated_minutes: 15
branch: cycle-10/R02/T02-1-schema-fields
files_touched:
  - scripts/lib/frontmatter.mjs
verification_commands:
  - pnpm verify
  - pnpm build:index
---

# T02-1 · 改 SCHEMAS 加 3 个 optional 字段 + reviewer slug_ref

## Context
RFC: `analysis/cycle-10/rfcs/R02-staleness-tracking.md` §D1 + §D3
Audit: `analysis/cycle-10/00-current-state-audit.md` §1.3（无 last_reviewed_at 字段）

## Exact Diff Intent

**改 1：** `scripts/lib/frontmatter.mjs` SCHEMAS 中 6 个类型（member / session / paper / theme / concept / faq）每个的 `optional` 数组**追加**：

```js
optional: [...existing, 'last_reviewed_at', 'reviewer', 'review_cadence'],
```

**改 2：** 6 个类型每个的 `slug_refs` 数组**追加**：

```js
{ field: 'reviewer', target: 'member', kind: 'scalar' },
```

**注意**：
- `member.slug_refs` 当前已有 `theme_refs` → 加 `reviewer` 没冲突
- `concept.slug_refs` 当前有 2 项 → 加 `reviewer` 共 3 项
- 等等，每个 schema 都新增一条

**关键**：**全部 optional**，**不**进 `required`。RFC §D3 + §Risk 已论证。

## Verification
- `pnpm verify` —— 0 warning（所有现存文件没填这 3 字段，但 optional 不报）
- `pnpm build:index` —— 成功（reviewer 边由于现存文件 reviewer 字段空 → 暂无新边）
- `grep -A 1 "optional:" scripts/lib/frontmatter.mjs | grep "last_reviewed_at"` —— 必须出现 6 次

## Rollback
- 单 commit revert

## Out of Scope
- 不写 staleness-report.mjs（T02-2）
- 不 backfill（T02-6）
- 不动 scaffold（T02-3）

## Risk
- 漏 1 个 schema 没加 → staleness-report 报 unreviewed 但实际不应。**改完跑 `grep -c "last_reviewed_at" scripts/lib/frontmatter.mjs` 必须 = 6**
