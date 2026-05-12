---
rfc: R02
task_id: T02-3
status: pending
depends_on: [T02-1]
estimated_minutes: 45
branch: cycle-10/R02/T02-3-scaffolds-fill-date
files_touched:
  - scripts/new-paper.mjs
  - scripts/new-session.mjs
  - scripts/new-concept.mjs
  - scripts/new-theme.mjs
  - scripts/new-member.mjs
  - scripts/new-faq.mjs
verification_commands:
  - pnpm verify
---

# T02-3 · 6 个 scaffold 自动填 last_reviewed_at + reviewer

## Context
RFC: `analysis/cycle-10/rfcs/R02-staleness-tracking.md` §D6

## Exact Diff Intent

每个 scaffold 改 2 处：

### 改 1：参数解析（每个文件）

支持 `--reviewer=<slug>` flag。一般在 args 解析段（同 `opts.label`、`opts.json` 风格）：
```js
const reviewer = opts.reviewer || '';
```

### 改 2：frontmatter 模板（每个文件）

在生成 frontmatter content 时追加 2 个字段（位置：所有现有字段之后、关闭 `---` 之前）：

```js
const today = new Date().toISOString().slice(0, 10);
// ...
// 拼到 content 模板里：
last_reviewed_at: "${today}"
reviewer: ${reviewer ? `"${reviewer}"` : '""'}
```

### 改 3：jsdoc usage（每个文件）

顶部 jsdoc 加 `[--reviewer=<slug>]` 选项。

## Per-file 改动清单

- `scripts/new-paper.mjs` —— 同模式
- `scripts/new-session.mjs` —— 同模式（注意 session 已有 lead 字段，reviewer 一般可不同人）
- `scripts/new-concept.mjs` —— 同模式
- `scripts/new-theme.mjs` —— 同模式
- `scripts/new-member.mjs` —— 同模式（member 本身就是 reviewer 候选）
- `scripts/new-faq.mjs` —— 同模式（**注意**：T01-5 时已经在 RFC §D2.3 模板里含 last_reviewed_at = today；本 task 只补 reviewer flag 解析）

## Verification

每个 scaffold 跑一遍 smoke：
```bash
pnpm new:concept t-staleness-test --full="Test" --reviewer=leo --json
grep -E "(last_reviewed_at|reviewer)" src/content/docs/concepts/t-staleness-test.md
rm src/content/docs/concepts/t-staleness-test.md   # 清理
```

每个 type 生成的文件应当含两行：
```yaml
last_reviewed_at: "2026-05-12"  # or 当天
reviewer: "leo"                 # or ""
```

- `pnpm verify` —— 0 warning
- `pnpm staleness-report --quiet; echo $?` —— exit 0（新建的文件刚填日期，fresh）

## Rollback
- 撤 6 个 .mjs 文件的改动

## Out of Scope
- 不 backfill 现存内容（T02-6）
- 不动 scaffold 模板正文，仅 frontmatter

## Risk
- 6 个文件改 → 容易漏 1 个。**改完跑 `grep -l "last_reviewed_at" scripts/new-*.mjs | wc -l` 必须 = 6**
- new-session 等已有 `status: upcoming` 等 enum 字段 → reviewer 加错位置可能让 YAML invalid。**每个文件改完跑一次 smoke**
