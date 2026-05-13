# cycle-10 Implementation Plan · Phase 1（R01 + R02）

> **本里程碑**：把 `analysis/lab-needs/product-recommendations.md` 的 P0-1 (FAQ schema) 和 P0-2 (staleness tracking) 落地为可运行代码。
> **入口**：每次 loop 迭代读本文件，按 §2 Next-Iteration-Rule 找下一个未完成的 iteration / task。
> **作用域**：**仅 R01 + R02**。其它 P0/P1 项暂不在本里程碑内（验证流程稳了再开 phase 2）。

---

## §0 总览

| 阶段 | 产出 | 单次时长 | 状态 |
|------|------|---------|------|
| **Iteration 0** | `00-current-state-audit.md` | 45-60 min | ⏳ pending |
| **Iteration 1** | `rfcs/R01-faq-schema.md` | 30-45 min | ⏳ pending |
| **Iteration 2** | `rfcs/R02-staleness-tracking.md` | 30-45 min | ⏳ pending |
| **审稿点 A** | 用户审 R01 + R02 | — | ⏳ pending |
| **Iteration 3-N** | 每次 1 个 task（R01 tasks first），按依赖图 | 30-60 min / task | ⏳ pending |
| **审稿点 B** | R01 全部 task 完成后用户验收 | — | ⏳ pending |
| **Iteration N+1...** | R02 tasks | 30-60 min / task | ⏳ pending |
| **集成验证** | 跑 `verify:full` + 手动 smoke + 写最终 report | 30 min | ⏳ pending |

---

## §1 RFC 模板（每个 RFC 必须填齐）

```markdown
# R<NN> · <Title>

## Problem（1 句）
<one-sentence>

## Source of Truth
- analysis/lab-needs/personas/<file>.md §<section>
- analysis/lab-needs/cycles/<file>.md §<section>
- analysis/lab-needs/findings/<file>.md §<section>
- analysis/lab-needs/product-recommendations.md §<section>

## Current State（必须来自 00-current-state-audit.md 的引用）
- 相关文件：<list with line refs>
- 当前行为：<bullets>
- 已有 schema 字段：<table>

## Desired State（精确到字段 + 例子）
### Schema YAML 例子
\`\`\`yaml
---
<frontmatter example>
---
\`\`\`

### Scaffold 命令签名
\`\`\`
pnpm new:<type> <args>
\`\`\`

### Skill markdown 例子（前 30 行）
\`\`\`markdown
<example>
\`\`\`

### Sidebar 行为
<bullets>

## Work Breakdown（拆 task，每个 task ≤ 60 min）
- T<NN>-1: <task title> | 依赖：<task id 或 "无"> | 影响文件：<list>
- T<NN>-2: ...

## Verification（每个 task 完成后必跑）
- 必跑命令：<list>
- 必通过判据：<list>
- 不能破的现有功能：<list>

## Out of Scope（避免膨胀）
- <bullets>

## Rollback
- Branch 策略：<bullets>
- 单 commit revert 是否可行：<yes/no + reason>

## Risk
- <bullets，标 likelihood + impact>
```

---

## §2 Next-Iteration-Rule

按顺序检查，第一个不满足的就是下一个迭代：

```
1. test -f 00-current-state-audit.md → Iteration 0
2. test -f rfcs/R01-faq-schema.md    → Iteration 1
3. test -f rfcs/R02-staleness-tracking.md → Iteration 2
4. test -f USER_APPROVED_RFCS.md     → 审稿点 A（停下等用户）
5. ls tasks/T01-*.md | wc -l < (R01 task count) → 继续起草 R01 tasks
6. ls tasks/T02-*.md | wc -l < (R02 task count) → 继续起草 R02 tasks
7. test -f IMPLEMENTATION_STARTED.md → 审稿点 B（用户确认开始实施）
8. 任意 tasks/*.md 状态非 completed → 执行下一个 pending task
9. 全部 task 完成 → 集成验证
10. test -f cycle-10-phase1-report.md → 输出 "CYCLE-10 PHASE 1 COMPLETE" 并停止
```

---

## §3 通用规则

### §3.1 文件命名
- RFC：`rfcs/R<NN>-<kebab-title>.md`
- Task：`tasks/T<NN>-<seq>-<kebab-title>.md`（NN = RFC 编号；seq = task 序号）
- 状态文件（gate）：`USER_APPROVED_RFCS.md` / `IMPLEMENTATION_STARTED.md` —— 用户手动创建，不能由 loop 自动生成

### §3.2 RFC 起草阶段（Iteration 1-2）
- **不动任何项目代码**。只在 `analysis/cycle-10/rfcs/` 下产出 markdown
- 必须含 §1 模板的所有段落
- 必须从 `00-current-state-audit.md` 引用具体行号 / 字段，不能凭记忆
- 必须给 Schema YAML + skill 头 30 行 + scaffold 命令签名 3 个例子

### §3.3 Task 起草阶段
- 每个 task 在自己的 markdown 文件里
- frontmatter 必含：
  ```yaml
  ---
  rfc: R01
  task_id: T01-1
  status: pending | in_progress | completed | blocked
  depends_on: [T01-N, ...]
  estimated_minutes: 30
  branch: cycle-10/R01/T01-1-<slug>
  files_touched: [path1, path2]
  verification_commands: [pnpm verify, pnpm verify:full]
  ---
  ```
- body 含：context（引用 RFC）+ exact diff intent + verification + rollback

### §3.4 实施阶段（Iteration ≥ 3）每次 loop 单步硬约束
- **只动 1 个 task** 标的文件
- **每个 task 一个 git branch**（命名 `cycle-10/R<NN>/T<NN>-<n>-<slug>`）
- 改完必须跑 `pnpm verify` 0 warning；失败 → 停下、写 blocker 报告、不进 todo
- 单 commit message 含 `cycle-10/R<NN>/T<NN>-<n>` 标识
- **禁止动**：
  - `astro.config.mjs` 的 `base` / `outDir` / `build` 配置
  - `scripts/verify.mjs` 的核心校验逻辑（可以加新规则但不能删旧规则）
  - `init-group.mjs` 的 demo 清洗白名单（不要让新组继承不稳定 schema）
  - `group.config.yaml` 的 `stage` 字段语义（只能加 mode，不能改 stage）

### §3.5 验证清单
- `pnpm verify` —— 0 warning 才算 pass
- `pnpm verify:full` —— 含 build；在 R01 / R02 集成验证阶段必跑
- `pnpm build:index` —— 知识图必须可重建
- `pnpm list:* --json` —— introspect 必须仍 work
- 手动 smoke：visiting `/<new-path>` in `pnpm dev`，看渲染、点击 backlinks

---

## §4 Done 判据（Phase 1）

- [ ] `00-current-state-audit.md` 写完，含 src/content/config.ts / scripts/ / .agent/skills/ / astro.config.mjs 的真实状态
- [ ] `rfcs/R01-faq-schema.md` 写完，含 §1 模板所有段落 + YAML 例子 + skill 头 30 行
- [ ] `rfcs/R02-staleness-tracking.md` 同上
- [ ] `tasks/T01-*.md` 起草完整（约 3-5 个 task）
- [ ] `tasks/T02-*.md` 起草完整（约 3-5 个 task）
- [ ] 所有 task 状态 = `completed`
- [ ] `pnpm verify:full` 全过
- [ ] 手动 smoke：`pnpm dev` 能访问 `/faq/<exemplar-slug>` 且 staleness-report 命令存在
- [ ] `cycle-10-phase1-report.md` 写完，含 implementation log + 风险记录 + 后续 cycle-10 phase 2 建议
- [ ] 单 PR 合到 main，CI 全绿

---

## §5 Loop 调用方式（参考）

```
/loop 读 analysis/cycle-10/MILESTONE.md，按 §2 Next-Iteration-Rule 找到下一个未完成迭代，严格按 §3 通用规则执行，遇到审稿点（USER_APPROVED_RFCS.md / IMPLEMENTATION_STARTED.md 不存在）立刻停止并报告"等待用户审"。task 实施失败（verify warning）立刻停止并写 blocker 报告。如果 §4 全部勾选，输出 "CYCLE-10 PHASE 1 COMPLETE" 并停止。
```

---

## §6 Phase 1 范围之外（明确不做）

以下从 product-recommendations.md 来的项**不在本里程碑内**，待 phase 1 验证流程稳了再开 phase 2：

- P0-3 RACI 矩阵（纯文档，复杂度低，但跟所有 14 skill 联动，单独开 phase 2 / R03）
- P0-4 README 改 "95% 给 agent"（一次提交即可，等 phase 2 一并做）
- P0-5 README 收窄 NLP/LLM + reading-side（同上）
- P1 全部 / P2 全部

**Phase 1 只验证两件事**：
1. RFC → task → loop 实施 → 集成验证这套流程是否真能跑稳
2. R01 + R02 是两条最强 source 支持的建议，先把它们做对比"什么都做一点"更稳
