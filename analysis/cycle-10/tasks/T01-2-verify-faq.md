---
rfc: R01
task_id: T01-2
status: pending
depends_on: [T01-1]
estimated_minutes: 20
branch: cycle-10/R01/T01-2-verify-faq
files_touched:
  - scripts/verify.mjs
verification_commands:
  - pnpm verify
---

# T01-2 · verify.mjs 接受 faq（含 asked_by:guest 豁免）

## Context
RFC: `analysis/cycle-10/rfcs/R01-faq-schema.md` §D1.3 末段 + §D1.5
Audit: `analysis/cycle-10/00-current-state-audit.md` §2 row 3-4, §6

## Exact Diff Intent

**改 1：** `scripts/verify.mjs` L52 `slugsByType` 加 `faq`：
```js
const slugsByType = { paper: new Set(), concept: new Set(), theme: new Set(), member: new Set(), session: new Set(), faq: new Set() };
```

**改 2：** L116 路径前缀正则加 `faq`：
```js
.replace(/^(papers|concepts|themes|members|sessions|faq)\//, '')
```

**改 3：** L114-122 slug_refs 死链检查，在 `for (const v of values)` 循环内最前面加豁免：
```js
for (const v of values) {
  // FAQ asked_by 允许字面量 "guest"（外部访客提问，不对应 member）
  if (ref.field === 'asked_by' && String(v).trim() === 'guest') continue;
  // 原有 slug 标准化逻辑
  const slug = String(v).trim().replace(/^\/+|\/+$/g, '')
    .replace(/^(papers|concepts|themes|members|sessions|faq)\//, '');
  ...
}
```

## Verification
- `pnpm verify` —— 0 warning（faq 目录还不存在）
- 临时建一个 `src/content/docs/faq/test.md` 含 `asked_by: nonexistent-slug` → 跑 `pnpm verify` 应当 error；改成 `asked_by: guest` → 应当 pass；测完 `git restore` + 删文件

## Rollback
单 commit revert 即可。

## Out of Scope
- 不动 verify.mjs 其它逻辑
- 不动 staleness 检查（R02 整段不进 verify，见 R02 §D8）

## Risk
- 改正则前缀漏掉某个类型 → 现有 paper.related_papers 之类 slug 检查可能错位。**改完跑 `pnpm verify` 必须仍 0 warning**
