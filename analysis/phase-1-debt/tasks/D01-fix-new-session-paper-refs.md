---
debt_id: D01
status: pending
estimated_minutes: 30
depends_on: []
branch: phase-1-debt/D01-fix-new-session-paper-refs
files_touched:
  - scripts/new-session.mjs
verification_commands:
  - pnpm verify
  - "pnpm new:session 2026-W99 ralph-d01-test --lead=leon --json"
  - "rm -f src/content/docs/sessions/2026-w99-ralph-d01-test.md"
  - pnpm verify
---

# D01 · 修 `new-session.mjs` `paper_refs` 空 case bug

## Context

cycle-10 phase 1 T02-3 smoke 跑 `pnpm new:session 2026-W99 test-stale-s --lead=leon --reviewer=leon` 时（**没传 `--paper`**）触发 verify error：

```
src/content/docs/sessions/2026-w99-test-stale-s.md: [graph] paper_refs → paper/[object Object] 不存在
```

**根因**：`scripts/new-session.mjs` line 40：
```js
const paperRef = opts.paper ? `\n  - /${opts.paper}/` : '';
```

不传 `--paper` 时 `paperRef = ''`，模板渲染成 `paper_refs:`（key 后空白）。`scripts/lib/frontmatter.mjs` parseFrontmatter 将无值 key 解析为空对象 `{}`，于是 verify slug_refs 检查时 `String({})` → `"[object Object]"`。

记录在 `analysis/cycle-10/cycle-10-phase1-report.md` §"暴露的弱点" #5。

## Exact Diff Intent

**单一修改**：`scripts/new-session.mjs` line 40

```diff
-const paperRef = opts.paper ? `\n  - /${opts.paper}/` : '';
+const paperRef = opts.paper ? `\n  - /${opts.paper}/` : ' []';
```

`yamlList` 已用 `' []'` 表示 empty flow list（同文件其它 array 字段都用这个）。本改动只是让 paper_refs 与 themes / participants / concept_refs / tags 同行为。

## Verification

负向 + 正向：

```bash
# 负向：不传 --paper 应该不报死链
pnpm new:session 2026-W99 ralph-d01-test --lead=leon --json
pnpm verify     # 必须 0 error 0 warning
grep "paper_refs:" src/content/docs/sessions/2026-w99-ralph-d01-test.md
#   预期输出：paper_refs: []
rm src/content/docs/sessions/2026-w99-ralph-d01-test.md

# 正向：传 --paper 应该正常（不破现有行为）
pnpm new:session 2026-W99 ralph-d01-test --lead=leon --paper=papers/deepseek-r1 --json
pnpm verify     # 必须 0 warning
grep -A 1 "paper_refs:" src/content/docs/sessions/2026-w99-ralph-d01-test.md
#   预期输出：
#   paper_refs:
#     - /papers/deepseek-r1/
rm src/content/docs/sessions/2026-w99-ralph-d01-test.md
pnpm verify     # 清理后仍 0 warning
```

## Rollback

单 commit revert。无 schema / API 变化。

## Out of Scope

- ❌ 不重构 `paperRef` 路径格式（`/papers/X/` vs `X`）— 与其它字段不一致是历史问题，phase 2 统一
- ❌ 不动 `parseFrontmatter` 对空 key 的解析行为（影响面太大）
- ❌ 不加 `--paper` 必填的 enforcement

## Risk

| Risk | Likelihood | Impact | 缓解 |
|------|-----------|--------|------|
| YAML flow `[]` 在某 parser 边缘 case 解析错 | 极低 | 中 | parseFrontmatter 对其它字段 `: []` 已正确处理（themes/tags 都用）→ 一致即安全 |
| 改动让 build 失败 | 低 | 高 | verification 含 verify:full 隐式（通过 cycle MILESTONE §3.5） |
