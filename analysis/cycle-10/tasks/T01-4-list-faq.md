---
rfc: R01
task_id: T01-4
status: pending
depends_on: [T01-1]
estimated_minutes: 15
branch: cycle-10/R01/T01-4-list-faq
files_touched:
  - scripts/list.mjs
  - package.json
verification_commands:
  - pnpm list:faq --json
---

# T01-4 · list.mjs 白名单 + package.json 加 pnpm 脚本

## Context
RFC: `analysis/cycle-10/rfcs/R01-faq-schema.md` §D1.7 + §D5
Audit: `analysis/cycle-10/00-current-state-audit.md` §2 row 8 + §7

## Exact Diff Intent

**改 1：** `scripts/list.mjs` L36 白名单加 `'faq'`：
```js
if (!['members','themes','sessions','papers','concepts','faq'].includes(subcommand)) {
  console.error('Usage: pnpm list:<members|themes|sessions|papers|concepts|faq> [--json] [--since=<Nd>] [--theme=<slug>] [--role=<role>]');
  process.exit(1);
}
```

**改 2：** L1 注释（usage 行）同步加 `faq`：
```js
 * pnpm list:<members|themes|sessions|papers|concepts|faq> [--json] [--since=<Nd>] ...
```

**改 3：** `package.json` `scripts` 段（紧跟 `list:concepts` 之后）加：
```json
"list:faq": "node scripts/list.mjs faq",
```

**改 4：** `package.json` `scripts` 段（紧跟 `new:concept` 之后）加：
```json
"new:faq": "node scripts/new-faq.mjs",
```

（new-faq.mjs 在 T01-5 建。本 task 仅注册命令名。）

## Verification
- `pnpm list:faq --json` —— 因为目录不存在应当 `console.error` "No directory: .../faq" + exit 1。**这是预期行为**，目录会在 T01-8 建
- `pnpm` 不带参数 —— 应能看到 `list:faq` 和 `new:faq` 在脚本列表里
- `grep -n '"new:faq"' package.json` —— 必须命中
- `grep -n '"list:faq"' package.json` —— 必须命中

## Rollback
单 commit revert 即可。

## Out of Scope
- 不动 list.mjs 其它逻辑（--since / --source / --status flag 自动适用 faq）
- 不动 new-faq.mjs（T01-5 单独 task）

## Risk
- package.json JSON 格式错（少逗号 / 多逗号）→ `pnpm` 全部命令爆。改完跑 `node -e 'JSON.parse(require("fs").readFileSync("package.json"))'` 验证 JSON 合法
