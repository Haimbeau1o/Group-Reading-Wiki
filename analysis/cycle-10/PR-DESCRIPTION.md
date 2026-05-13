# cycle-10 phase 1 · FAQ schema + staleness tracking

> Implements two P0 recommendations from `analysis/lab-needs/product-recommendations.md`.
> Methodology: source-backed `lab-needs` analysis (Iteration 1-7) → RFC drafts (R01 + R02) → 16 per-task branches → integration verification. All green.

---

## TL;DR

- **R01 (FAQ schema)** — new content type `faq` for "我们组反复被问的实操问题"。`/faq/` 路由、`pnpm new:faq` scaffold、`add-faq` skill、1 个 exemplar。
- **R02 (staleness tracking)** — 每页 `last_reviewed_at` / `reviewer` / `review_cadence` 字段，`pnpm staleness-report` 工具，6 个 scaffold 自动填日期，28 个现存文件 backfill。

**Motivation**：FAQ 是 5 个 persona + 1 个 cycle 独立呼吁的最强信号（共识 ★★★★★）；staleness tracking 抵御 dead-wiki-postmortem §根因 4-5（**80% wiki 死亡的失效模式**）。

---

## What changed

### New
- `src/content/docs/faq/` 路由 + 1 个 exemplar (`how-to-pick-arxiv-papers.md`，650 字 5 heuristics + 3 坑)
- `scripts/new-faq.mjs` (174 行) · `scripts/staleness-report.mjs` (210 行) · `scripts/backfill-staleness.mjs` (64 行)
- `.agent/skills/add-faq.md` (137 行，8 段标准)
- 3 个 `pnpm` 命令：`new:faq` / `list:faq` / `staleness-report`
- 1 个 schema: `faq`（required: title/description/question/answered_by）

### Modified
- `scripts/lib/frontmatter.mjs` — faq schema + 6 schemas 加 3 个 optional 字段
- `scripts/verify.mjs` — 接受 faq + `asked_by: guest` 字面量豁免
- `scripts/build-index.mjs` — TYPES / URL_PREFIX / 投影 / stats 全加 faq
- `scripts/list.mjs` — 白名单 + usage 加 faq
- `scripts/context-for.mjs` — prefixMap / 正则 / TYPE_LABEL 加 faq（audit gap 补救）
- `scripts/init-group.mjs` — `cleanDirHonorExemplar('src/content/docs/faq')`
- `scripts/new-{paper,session,concept,theme,member}.mjs` — 5 个 scaffold 加 `--reviewer` flag + auto-fill `last_reviewed_at`
- `astro.config.mjs` — sidebar 加 ❓ FAQ entry（concepts 之后，i18n en 同步）
- `.agent/skills/README.md` — 加 add-faq 入口 + 复核 / 防腐段
- 28 content files — backfill `last_reviewed_at: "2026-05-12"` + `reviewer: ""`

### Stats
- 93 files changed · +5958 / −20
- 34 commits（含 16 per-task + 16 merge + 2 setup）

---

## Test plan

- [x] `pnpm verify` — 0 warning, 47 files
- [x] `pnpm verify:full` — 含 build, 0 warning
- [x] `pnpm build:index` — 45 edges, stats: papers=1 concepts=5 themes=4 members=15 sessions=3 **faq=1**
- [x] `pnpm list:faq --json` — 返回 index + exemplar
- [x] `pnpm staleness-report` — 29 fresh / 0 stale / 0 unreviewed, exit 0
- [x] `pnpm staleness-report --type=concepts --quiet; echo $?` — exit 0
- [x] `pnpm -s context:for faq/how-to-pick-arxiv-papers --depth=1` — backlinks 含 themes/test-time-reasoning 和 members/leon
- [x] **Negative test**：`asked_by: <nonexistent-slug>` 触发 verify error；`asked_by: guest` 通过
- [x] **Negative test**：backdate concept `last_reviewed_at: "2024-01-01"` → staleness-report 报为 stale (862d ago)
- [x] **Negative test**：missing required `question:` field → verify error
- [ ] **手动 smoke**（请 reviewer 跑）：`pnpm dev` → 访问 `/faq/` 和 `/faq/how-to-pick-arxiv-papers/`，看 sidebar 显示 ❓ FAQ 在概念词典之后

---

## Known limitations / out of scope（明确为 phase 2）

- 🟡 **Backfill 全 today** — 28 文件 6 个月后会"集体过期"。phase 2 升级到 git log 推算"最后实质改动日"。
- 🟡 **Reviewer 字段大多 `""`** — backfill 没法知道谁该负责。phase 2 加 `review-stale-pages` skill。
- 🟡 **Staleness 未进 CI** — 仅 `pnpm staleness-report` 独立工具，不阻塞 PR。phase 2 评估 advisory CI。
- 🟡 **`last_reviewed_at` 仍 optional** — 防止现有文件全爆 error。phase 2 决策 ratchet 到 required（建议 90 天 grace period）。
- 🔵 **不做 `by_faq` 聚合视图** — 信号弱，phase 2 评估。
- 🔵 **不做 paper→faq 反向边** — 单向引用足够 cycle-10，phase 2 评估。
- 🔵 **不动 README "95% 给 agent" / "AI/ML 通用"** — 是 P0-3/4/5 的范围，phase 2 单独 RFC。

---

## Audit gap discovered (fixed in T01-8)

`analysis/cycle-10/00-current-state-audit.md` §2 列了 15 个 touch point 给"添加新 content 类型"。**漏了 `scripts/context-for.mjs`** —— T01-8 verification 时发现 `pnpm context:for faq/...` 不识别 faq。已顺便修复（prefixMap / 正则 / TYPE_LABEL）。

**Phase 2 audit 必须** grep 所有 `scripts/*.mjs` 看是否有 type 列表硬编码。

---

## Methodology references

- 设计阶段：`analysis/lab-needs/`（17 markdown files，46 sources，46 条共识 + 反向意见 + 风险）
- 实施阶段：`analysis/cycle-10/`（MILESTONE / audit / 2 RFCs / 16 task files / 3 completion reports）
- RFC 与 task 的对应：每个 task commit message 含 `cycle-10/R<NN>/T<NN>-<n>` 标识
- Per-task branch 保留：见 `git branch | grep cycle-10/R0`（16 个）

---

## Suggested review path

1. **快速过**：读 `analysis/cycle-10/cycle-10-phase1-report.md`（165 行总结）
2. **看具体改动**：
   - `git log --oneline cycle-10-impl ^main` 看 commit 边界
   - `git diff main..cycle-10-impl -- scripts/lib/frontmatter.mjs` 看 schema 变化
   - `cat src/content/docs/faq/how-to-pick-arxiv-papers.md` 看 exemplar 实际形态
3. **跑一遍**：
   ```bash
   git checkout cycle-10-impl
   pnpm install
   pnpm verify:full
   pnpm staleness-report
   pnpm dev   # 访问 /faq/
   ```

---

## After merge

1. Phase 1 在真实使用中过 1-2 周（让 PI / 组员真的写 1-2 条 FAQ，看 scaffold + skill 文档是否够用）
2. 收集反馈后再开 phase 2（R03 RACI 矩阵 + README 收窄等 P0 项）
3. 6 个月后跑 `pnpm staleness-report` 看 28 文件集体过期效应，决定是否升级 backfill 方法
