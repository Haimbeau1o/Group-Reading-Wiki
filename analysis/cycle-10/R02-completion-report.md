---
rfc: R02
status: completed
completed_at: 2026-05-13
verification: passed
---

# R02 · Staleness Tracking 完成报告

## 摘要

**完成时间**：2026-05-13（cycle-10-impl branch）
**Task 数**：7 / 7 全部 completed
**代码改动**：8 files 改 + 1 file 新（staleness-report.mjs）+ 1 file 新（backfill-staleness.mjs）+ 28 文件 backfill 字段
**验证**：`pnpm verify:full` 全过；`pnpm staleness-report` 全 fresh exit 0

---

## 7 个 task 完成对账

| Task | 提交 SHA | 影响文件 | verify | 备注 |
|------|----------|----------|--------|------|
| T02-1 | `5f65830` | scripts/lib/frontmatter.mjs (+11/−5) | ✓ | 6 schemas 加 3 optional 字段 + reviewer slug_ref |
| T02-2 | `87f49f1` | scripts/staleness-report.mjs (+210 新) | ✓ | 含 negative test：backdate moe → stale 862d ✓ |
| T02-3 | `7d9be8c` | scripts/new-{paper,session,concept,theme,member}.mjs (+19/−0) | ✓ | 6/6 scaffolds 含 last_reviewed_at（new-faq 已在 T01-5） |
| T02-4 | `7af419c` | package.json (+1) | ✓ | pnpm staleness-report 命令注册 |
| T02-5 | `fd2c6a2` | .agent/skills/README.md (+20) | ✓ | 复核 / 防腐段（cadence 默认值、scaffold 行为、Update 路径） |
| T02-6 | `2a3797b` | scripts/backfill-staleness.mjs (+64 新) + 28 content 文件 (+56) | ✓ | touched=28 / already-had=1 / skipped=18 |
| T02-7 | (本次) | analysis/cycle-10/R02-completion-report.md (新) | — | 本报告 |

---

## 验证 output 摘要

```
$ pnpm verify
📋 verify · 47 个文件
✅ 全部通过

$ pnpm verify:full         # 含完整 build
📋 verify · 47 个文件
✅ 全部通过
(build silent on success, exit 0)

$ pnpm build:index
✅ knowledge-graph.json (45 edges)
   nodes: papers=1 concepts=5 themes=4 members=15 sessions=3 faq=1

$ pnpm staleness-report
📋 staleness-report · 2026-05-12
   stats: total=29, stale=0, unreviewed=0, fresh=29
✅ all fresh
$ echo $? → 0

$ pnpm staleness-report --type=concepts --quiet; echo $?
→ 0  (5 concepts, all fresh)

$ pnpm staleness-report --type=faq --quiet; echo $?
→ 0  (1 faq fresh)
```

---

## 关键设计决策落地

### 决策 1 · 全部 optional，不进 required
所有 6 个 schema 的 `last_reviewed_at` / `reviewer` / `review_cadence` 都是 optional。**未填写的内容文件 verify 0 warning** —— 这是为了避免 backfill 之前的 28 个旧文件全爆 error。Phase 2 决策：是否 ratchet 到 required（需要 90 天 grace period）。

### 决策 2 · 不让 staleness 进 verify
`pnpm verify` 不检查 staleness，仅 schema / link / slug_refs / build。staleness 是独立 `pnpm staleness-report`，**不阻塞 CI**。原因（R02 §D8）：让 90% 文件即刻"过期"会破坏信号。

### 决策 3 · review_cadence 默认按类型推断
- `concept` / `theme` → 6m（术语和主线变化快）
- `paper` / `session` / `member` / `faq` → 12m（事实型相对稳定）
- generic / index → 不检查

### 决策 4 · backfill 用方案 A（today），不用 git log
RFC §Risk 已标 known limitation。Phase 2 升级到 git log 推算"最后实质改动日"。

---

## 已知缺陷 / phase-2 候选

1. **【已知】Backfill 全 today → 6 个月后 28 文件集体过期** — R02 §Risk + T02-6 commit message 已记录
2. **【已知】Reviewer 字段大多为空 = `""`** — backfill 没法知道谁该负责。Phase 2 加 `review-stale-pages` skill 引导 PI / mentor 认领
3. **【未做】staleness-report 进 CI advisory** — R02 §Out of Scope，phase 2 决策
4. **【未做】`last_reviewed_at` ratchet 到 required** — phase 2 决策（先有 90 天 grace period）
5. **【未做】Web UI 显示 "last reviewed N months ago" badge** — Starlight footer 改造，cycle-11
6. **【未做】`review-stale-pages` skill 自动起草更新建议** — P1，phase 2

---

## 与 R01 的交叉验证

R02 完成后再次验证 R01 仍 work：
- `pnpm list:faq --json` 仍返回 2 items ✓
- `pnpm context:for faq/how-to-pick-arxiv-papers` 仍 work ✓
- `knowledge-graph.json` 含 stats.faq=1 ✓
- faq schema slug_refs 含 reviewer（T02-1 加） ✓

**R02 没有破坏 R01。**

---

## Phase 1 ready for sign-off

R02 完成 = phase 1 完成。下一步：写 `cycle-10-phase1-report.md`（phase 总结）。
