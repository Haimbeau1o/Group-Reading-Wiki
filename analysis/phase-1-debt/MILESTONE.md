# Phase 1 Tech Debt · Ralph Debut Milestone

> **目的**：清理 cycle-10 phase 1 暴露的 3 条工程债，同时作为 Ralph autonomous loop 的首秀验证。
> **入口**：每次 Ralph iteration 读本文件，按 §2 Next-Iteration-Rule 找下一个 pending task。
> **作用域**：仅 D01 + D02 + D03。**不含** RFC 起草、phase 2 规划、跨任务设计判断。
> **完成判据**：见 §4 Done。

---

## §0 总览

| Task | 标题 | 类型 | 估时 | 依赖 |
|------|------|------|------|------|
| D01 | 修 `new-session.mjs` `paper_refs` 解析 bug | bug fix | 30 min | 无 |
| D02 | 加 `scripts/audit-touchpoints.mjs` helper | new tool | 45 min | 无 |
| D03 | 抽 `scripts/lib/scaffold-helpers.mjs` 共享模块 | refactor | 60 min | 无 |
| `phase-1-debt-report.md` | 完成报告 | report | 15 min | D01+D02+D03 |

**总估时**：~2.5 小时纯实施（Ralph 跑）。3 个 task 互相独立可任意顺序。

---

## §1 Task 清单

每个 task 是独立 markdown 文件，frontmatter 含完整元数据。详见 `tasks/D0N-<slug>.md`。

### D01 · 修 new-session.mjs paper_refs bug
`tasks/D01-fix-new-session-paper-refs.md`

**Bug**：`pnpm new:session <week> <slug>` 不传 `--paper` 时生成 `paper_refs:` 空字符串，YAML 解析为 `{}`，verify 报 `paper/[object Object]` 死链。

**Fix**：line 40 把 `''` 改成 `' []'`，让空 case 输出合法 YAML flow list。

### D02 · 加 audit-touchpoints helper
`tasks/D02-add-audit-touchpoints.md`

**Why**：phase 1 audit 漏列 `context-for.mjs` 和 `init-group.mjs` 的 sanitize 函数为 touch point，T01-8 + T01-7b 临时补救。下次新增 content 类型应当有工具自动列出"该类型必须注册的位置"。

**What**：新 `scripts/audit-touchpoints.mjs`，grep 所有 `scripts/*.mjs` + `scripts/lib/*.mjs` 找硬编码的类型列表（如 `['paper','concept',...]`、`/papers|concepts|.../`、`URL_PREFIX={...}` 等），输出位置 + 已注册类型。

### D03 · 抽 scaffold-helpers 共享模块
`tasks/D03-extract-scaffold-helpers.md`

**Why**：6 个 `new-*.mjs` 各自重复定义 `yamlSafe` / `yamlList`（部分还轻微变体）。下次加字段要改 6 处。

**What**：抽到 `scripts/lib/scaffold-helpers.mjs`，6 个 scaffold 改 import。**行为完全等价**——smoke 前后 diff 必须只有 import 行差异。

---

## §2 Next-Iteration-Rule

按顺序检查，第一个不满足的就是下一个 iteration（**Ralph 必须这样判断**）：

```
1. ls tasks/D01-*.md 存在?      不存在 → STOP（cycle file issue）
2. ls tasks/D02-*.md 存在?      不存在 → STOP
3. ls tasks/D03-*.md 存在?      不存在 → STOP
4. test -f IMPLEMENTATION_STARTED.md  → 不存在则 HUMAN_GATE
5. D01 task 状态非 completed   → 执行 D01
6. D02 task 状态非 completed   → 执行 D02
7. D03 task 状态非 completed   → 执行 D03
8. test -f phase-1-debt-report.md  → 不存在则写报告
9. 全部完成 → 打印 RALPH_LOOP_COMPLETE
```

**任务状态**通过任务文件 frontmatter `status:` 字段判断（同 phase 1 §3.3 约定）。

---

## §3 通用规则

### §3.1 Branch 约定

```
phase-1-debt-impl                     ← 长期分支（off main post-PR-#3）
   └── phase-1-debt/D01-<slug>        ← 单 task branch（off phase-1-debt-impl）
       └── 1 commit + verify pass
       → merge --no-ff 回 phase-1-debt-impl
   └── phase-1-debt/D02-<slug>
   └── phase-1-debt/D03-<slug>
```

**禁止**：直接 commit 到 `phase-1-debt-impl`（除非是 commit 报告 / MILESTONE 元文件）。每个 D0N 任务必须独立 branch + merge。

### §3.2 单次 iteration 硬约束

- **1 iteration = 1 task** —— 永远不要一次跑 2 个 task
- **只动 task 标的 `files_touched` 文件** —— 不"顺手"改别的
- 每个 task 必须：(a) 自己的 branch；(b) 单 commit；(c) commit message 含 `phase-1-debt/D0N` 标识
- 改完 **必须** 跑 `pnpm verify` 0 warning —— 失败立刻 `RALPH_LOOP_BLOCKED`，不 retry
- 改完跑该 task 的 `verification_commands` 全部 pass

### §3.3 Task frontmatter schema

```yaml
---
debt_id: D01
status: pending | in_progress | completed | blocked
estimated_minutes: 30
depends_on: []
branch: phase-1-debt/D01-fix-new-session-paper-refs
files_touched: [scripts/new-session.mjs]
verification_commands:
  - pnpm verify
  - pnpm new:session 2026-W99 ralph-test --json
  - rm src/content/docs/sessions/2026-w99-ralph-test.md
---
```

Body 必含：Context（指 phase 1 哪个 commit / report 引出）+ Exact diff intent + Verification + Rollback + Out of scope + Risk。

### §3.4 禁止动的文件（forbidden list — Ralph 红线）

- `astro.config.mjs` 的 `base` / `outDir` / `build` 配置
- `scripts/verify.mjs` 的核心校验逻辑（可加新规则，不能删旧）
- `init-group.mjs` 的 demo 清洗白名单
- `group.config.yaml` 的 `stage` 字段语义
- `scripts/ralph/` —— **Ralph 自己不改自己的 runner**
- `analysis/lab-needs/` —— 用户分析仓
- `analysis/cycle-10/` —— phase 1 历史档案

如果某 task 的 `files_touched` 含上面任一项 → `RALPH_LOOP_BLOCKED: would-touch-forbidden-file`，不动手。

### §3.5 验证清单

每个 task commit 前必跑：
- `pnpm verify` —— 0 warning
- task 自己的 `verification_commands`

所有 task 完成后（写报告前）跑：
- `pnpm verify:full` —— 含 build
- `pnpm build:index` —— 知识图可重建
- `pnpm staleness-report --quiet; echo $?` —— 应仍 exit 0（R02 不应被破）
- `pnpm smoke-test:fork` —— cold-fork 端到端

任何一条挂 → 不写报告，`RALPH_LOOP_BLOCKED`。

---

## §4 Done 判据

全部满足才算完成（Ralph 检查每条 → 全 ✓ → print `RALPH_LOOP_COMPLETE`）：

- [ ] `tasks/D01-*.md` `status: completed`
- [ ] `tasks/D02-*.md` `status: completed`
- [ ] `tasks/D03-*.md` `status: completed`
- [ ] `phase-1-debt-report.md` 存在，含 3 个 task 的 commit SHA + verify output 摘要
- [ ] `pnpm verify:full` exit 0
- [ ] `pnpm staleness-report --quiet` exit 0
- [ ] `pnpm smoke-test:fork` exit 0
- [ ] `phase-1-debt-impl` 含 3 个 task merge commits（边界清晰）

---

## §5 Loop 调用方式

### Dry-run（零成本，强烈推荐先跑）

```bash
pnpm loop --dry-run --cycle analysis/phase-1-debt/MILESTONE.md
```

print 出 Ralph 准备发给 `claude -p` 的完整 prompt。确认：
- `CYCLE_MILESTONE_FILE` 路径对
- §2 第 1 条规则就是"找下一个 pending task"
- §3.4 forbidden 列表完整

### 真跑（unattended）

```bash
# 推荐首次配置（保守）
pnpm loop \
  --cycle analysis/phase-1-debt/MILESTONE.md \
  --skip-perms \
  --max-runs 5 \
  --max-duration 3h \
  --max-budget-usd 5
```

- `--skip-perms` 必填（unattended 需要绕过 tool 权限）
- `--max-runs 5` = 3 task + 1 report + 1 误差 = 5 上限
- `--max-duration 3h` 时间闸
- `--max-budget-usd 5` 每 iteration $ 上限（Claude 自动停）

### 中断 / 停止

- 优雅：`touch .ralph-stop`（当前 iteration 跑完后退出）
- 硬停：`Ctrl-C`（杀当前 claude 进程，退出 loop）

### Logs

`.ralph/runs/run-<ts>-iter<N>.log` per iteration（gitignored）。

---

## §6 Phase-1-debt 范围之外（明确不做）

- ❌ Phase 2 / cycle-11 规划
- ❌ README / .agent/skills/README.md 内容更新
- ❌ FAQ schema / staleness schema 调整
- ❌ Test-lab 启动 / 验收
- ❌ 任何主观判断（用户审稿 / 反向意见 / 优先级辩论）

如果 Ralph 在 iteration 里发现需要做上面任一 → `RALPH_LOOP_BLOCKED: out-of-scope <reason>`。
