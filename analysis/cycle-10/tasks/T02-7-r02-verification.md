---
rfc: R02
task_id: T02-7
status: pending
depends_on: [T02-1, T02-2, T02-3, T02-4, T02-5, T02-6]
estimated_minutes: 15
branch: cycle-10/R02/T02-7-verification
files_touched:
  - analysis/cycle-10/R02-completion-report.md
  - analysis/cycle-10/cycle-10-phase1-report.md
verification_commands:
  - pnpm verify:full
  - pnpm staleness-report --json
---

# T02-7 · R02 集成验证 + 写完成 report + phase 1 总结

## Context
RFC: `analysis/cycle-10/rfcs/R02-staleness-tracking.md` §Verification
MILESTONE: §4 Done 全部判据

## Exact Diff Intent

### 改 1：跑全套验证

```bash
pnpm verify              # 0 warning
pnpm verify:full         # 含 build，0 warning
pnpm build:index         # ok
pnpm staleness-report                     # 应当全 fresh
pnpm staleness-report --json | jq '.stats'  # unreviewed: 0, stale: 0
pnpm staleness-report --type=concepts     # 只看 concepts
pnpm staleness-report --reviewer=leo      # 只看 reviewer=leo（如有 backfill 写 leo 的）
```

### 改 2：负向验证

```bash
# 临时把某个 concept 的 last_reviewed_at 改成 2024-01-01
# 跑 staleness-report 应当报为 stale
# 改回后再跑应当 fresh
```

### 改 3：写 `analysis/cycle-10/R02-completion-report.md`

约 50-80 行，含：
- 完成时间
- 7 个 task 单 commit SHA 列表
- 改动行数（约 ~300 行新增 + ~30 个 backfill 文件）
- 验证 output 摘要
- **已知缺陷 / phase 2 候选**：
  - backfill 全今天 → 6 个月后集体过期
  - reviewer 字段大多为空 → unowned-only 看到很多
  - staleness-report 还没进 CI advisory

### 改 4：写 `analysis/cycle-10/cycle-10-phase1-report.md`（phase 1 总结）

含：
- R01 + R02 总结
- 项目跨 phase 1 改了多少代码（行数 / commit 数）
- 触发 dead-wiki §C 防护机制的实测数据（如果有人手 review 过）
- **phase 2 候选**（按 product-recommendations.md §4）：
  - P0-3 RACI 矩阵
  - P0-4 README 改 95%
  - P0-5 README 收窄
  - P1-4 graduation-handoff
  - P1-5 submissions schema
- **学到的方法论**：RFC → task → loop 这套流程是否真的稳？哪个环节最弱？

## Verification
- `cat analysis/cycle-10/R02-completion-report.md | wc -l` —— ≥ 50
- `cat analysis/cycle-10/cycle-10-phase1-report.md | wc -l` —— ≥ 80
- 所有 verification_commands exit 0

## Rollback
- 不需要 rollback（验证 task）
- 任意失败：rollback 单个 T02-N，不要 rollback 全部

## Out of Scope
- 不写 phase 2 RFC
- 不动 README.md
- 不开 PR 到 main（cycle-10-impl 全完后单 PR）
