---
rfc: R01
task_id: T01-9
status: pending
depends_on: [T01-1, T01-2, T01-3, T01-4, T01-5, T01-6, T01-7, T01-8]
estimated_minutes: 20
branch: cycle-10/R01/T01-9-verification
files_touched:
  - analysis/cycle-10/R01-completion-report.md
verification_commands:
  - pnpm verify:full
  - pnpm list:faq --json
  - pnpm build:index
---

# T01-9 · R01 集成验证 + 写完成 report

## Context
RFC: `analysis/cycle-10/rfcs/R01-faq-schema.md` §Verification
MILESTONE: §4 Done 第 6-8 条

## Exact Diff Intent

### 改 1：跑全套验证

```bash
pnpm verify              # 必须 0 warning
pnpm verify:full         # 必须 ok（含 build）
pnpm build:index         # stats.faq >= 1
pnpm list:faq --json     # 至少 1 条
pnpm list:papers --json  # shape 不变（旧 API）
pnpm list:concepts --json # shape 不变
pnpm -s context:for faq/how-to-pick-arxiv-papers --depth=1
```

每条都应该 work。任何失败 → 不写 report，开 blocker issue。

### 改 2：手动 smoke

```bash
pnpm dev &
# 访问 http://localhost:4321/faq/
# 访问 http://localhost:4321/faq/how-to-pick-arxiv-papers/
# 看：sidebar 显示 ❓ FAQ 在概念词典之后；page render ok；footer Backlinks 显示
```

### 改 3：写 `analysis/cycle-10/R01-completion-report.md`

约 50-80 行，含：
- **完成时间** YYYY-MM-DD
- **8 个 task 单 commit SHA 列表**（实施时记录）
- **改动行数总计**（约 ~250 行新增）
- **验证 output 摘要**：verify / build 全过 / sidebar 显示正确
- **未解决的问题**（如有）：留作 phase 2 / R02
- **对 R02 的解锁说明**：R02 task 现在可以起草 + 实施

## Verification
- `cat analysis/cycle-10/R01-completion-report.md` —— 应有 50+ 行
- 所有 verification_commands 必须 exit 0

## Rollback
- 不需要 rollback —— 这是验证 task
- 如果发现集成失败：rollback 单个失败的 T01-N，**不要 rollback 全部**

## Out of Scope
- 不写 R02 task（R02 task 是单独 iteration）
- 不动 README.md（phase 2 改 README）
- 不开 PR 到 main（cycle-10-impl branch 完成后统一开 1 个 PR）
