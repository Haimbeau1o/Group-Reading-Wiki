---
rfc: R02
task_id: T02-4
status: pending
depends_on: [T02-2]
estimated_minutes: 5
branch: cycle-10/R02/T02-4-package-json
files_touched:
  - package.json
verification_commands:
  - pnpm staleness-report --quiet
---

# T02-4 · 改 package.json 加 pnpm staleness-report 脚本

## Context
RFC: `analysis/cycle-10/rfcs/R02-staleness-tracking.md` §D5

## Exact Diff Intent

`package.json` `scripts` 段，紧跟 `verify:full` 之后插入：
```json
"staleness-report": "node scripts/staleness-report.mjs",
```

## Verification
- `node -e 'JSON.parse(require("fs").readFileSync("package.json"))'` —— JSON 合法
- `pnpm staleness-report --quiet; echo $?` —— 不抛 "Missing script"
- `pnpm` 不带参数 —— 应能看到 `staleness-report` 在脚本列表里

## Rollback
- 单 commit revert

## Out of Scope
- 不加 CI workflow（phase 2）
- 不改 `verify` 让 staleness 进 CI（R02 §D8 明确不做）

## Risk
- JSON 格式错（少 / 多逗号）→ 所有 pnpm 命令爆。改完先跑 node 校验
