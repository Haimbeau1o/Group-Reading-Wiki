---
rfc: R01
task_id: T01-1
status: pending
depends_on: []
estimated_minutes: 20
branch: cycle-10/R01/T01-1-faq-schemas
files_touched:
  - scripts/lib/frontmatter.mjs
verification_commands:
  - pnpm verify
  - pnpm build:index
---

# T01-1 · 加 faq 进 SCHEMAS + detectSchema

## Context
RFC: `analysis/cycle-10/rfcs/R01-faq-schema.md` §D1.3 + §D1.4
Audit: `analysis/cycle-10/00-current-state-audit.md` §1.2-1.3, §2 row 1+2

## Exact Diff Intent

**改 1：** 在 `scripts/lib/frontmatter.mjs` L152 `concept:` schema 之后、L153 `generic:` 之前插入新的 `faq` schema：

```js
  faq: {
    required: ['title', 'description', 'question', 'answered_by'],
    optional: ['asked_by', 'related_papers', 'related_concepts', 'themes', 'tags', 'last_reviewed_at', 'reviewer', 'review_cadence', 'exemplar'],
    slug_refs: [
      { field: 'answered_by',      target: 'member',  kind: 'scalar' },
      { field: 'asked_by',         target: 'member',  kind: 'scalar' },
      { field: 'related_papers',   target: 'paper',   kind: 'array'  },
      { field: 'related_concepts', target: 'concept', kind: 'array'  },
      { field: 'themes',           target: 'theme',   kind: 'array'  },
    ],
  },
```

**改 2：** 在 `detectSchema()` L175-183 的 `concept` 检测**之后**、`generic` 返回**之前**插入：

```js
if (relpath.includes('/faq/') && !relpath.endsWith('/index.md')) return 'faq';
```

## Verification
- `pnpm verify` —— 0 warning（faq 目录还不存在，无新文件，应当全过）
- `pnpm build:index` —— 应当 work；输出的 `stats` 暂时不含 faq 数（因为没 faq 文件）
- `grep -n "faq" scripts/lib/frontmatter.mjs` —— 必须命中 SCHEMAS + detectSchema 两处

## Rollback
单 commit revert 即可。

## Out of Scope
- 不动 verify.mjs（T01-2 处理）
- 不动 build-index.mjs（T01-3 处理）
- 不动 last_reviewed_at / reviewer / review_cadence 的 backfill（T02-6 处理 — 但 schema 字段已含，向前兼容 R02）

## Risk
- 现有 paper 等使用 `question:` 字段名 → 先在 task 开始时跑 `grep -rE "^question:" src/content/docs/ || true`；如有命中**停下报告**
