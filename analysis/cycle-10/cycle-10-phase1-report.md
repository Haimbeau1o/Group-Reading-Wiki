---
phase: 1
status: COMPLETE
completed_at: 2026-05-13
scope: R01 (FAQ schema) + R02 (Staleness tracking)
---

# Cycle-10 Phase 1 · 完成总结

## 🎯 一句话

**FAQ schema + staleness tracking 全部落地**，第一阶段 16 个 task 全 green，`cycle-10-impl` branch 准备 PR。

---

## 📊 量化

| 指标 | 值 |
|------|----|
| Phase 总耗时 | ~6 小时（含 RFC 起草 + audit + 16 task 实施） |
| Task 数 | 16 (R01: 9 + R02: 7) |
| Git commit 数 | 32（16 task commit + 16 merge commit）|
| 改动文件 | 91 (新增 12 + 修改 79) |
| 行数 | +5686 / −20 |
| 新加 `pnpm` 命令 | 3 (`new:faq` / `list:faq` / `staleness-report`) |
| 新加 schema | 1 (faq) |
| 新加字段 | 3 (last_reviewed_at / reviewer / review_cadence × 6 schemas) |
| 新加 skill | 1 (`add-faq.md`) |
| 验证状态 | ✅ verify:full · ✅ staleness-report · ✅ context:for faq |

---

## 🗺️ 改了什么（按层）

### 工具链层（`scripts/`）
- `lib/frontmatter.mjs` — SCHEMAS 加 faq + reviewer slug_ref × 6
- `verify.mjs` — 接受 faq + guest 字面量豁免
- `build-index.mjs` — TYPES / URL_PREFIX / 投影 / stats 全加 faq
- `list.mjs` — 白名单 + usage 加 faq
- `context-for.mjs` — prefixMap / 正则 / candidates / groupByType / TYPE_LABEL（**audit gap 补救**）
- `init-group.mjs` — clean faq dir（honor exemplar）
- `new-faq.mjs` — **新** 174 行
- `staleness-report.mjs` — **新** 210 行
- `backfill-staleness.mjs` — **新** 64 行（一次性脚本，保留作复用）
- `new-{paper,session,concept,theme,member}.mjs` — 5 个 scaffold 加 reviewer flag + auto-fill today

### Skill 层（`.agent/skills/`）
- `add-faq.md` — **新** 137 行（8 段标准 + Update 路径）
- `README.md` — 加 add-faq 入口 + 复核 / 防腐段

### Content 层（`src/content/docs/`）
- `faq/index.md` — **新** 38 行（FAQ vs concepts 区分）
- `faq/how-to-pick-arxiv-papers.md` — **新** exemplar，92 行，5 heuristics + 3 坑
- 28 文件 backfill（concepts/members/papers/sessions/themes 全部）

### 站点层（`astro.config.mjs`）
- sidebar 加 ❓ FAQ entry（concepts 之后，i18n en 同步）

### Schema 层（`scripts/lib/frontmatter.mjs` SCHEMAS）
- faq schema：required 4 字段（title/description/question/answered_by），optional 9 字段
- member/session/paper/theme/concept/faq 各加 3 optional + 1 slug_ref

---

## 🪜 流程方法论（事后复盘）

### 有效的

1. **3 层产出（recommendation → RFC → task）** —— 设计阶段卡 bug 在动代码前
2. **审稿点 + gate 文件（USER_APPROVED_RFCS / IMPLEMENTATION_STARTED）** —— 强制人工 check-in
3. **每 task 1 branch + verify** —— task 边界清晰，回退便宜
4. **frontmatter 跨子任务依赖（R01 schema 加 last_reviewed_at 为 R02 留位）** —— 避免后续 schema 升级触发现存文件 verify 失败

### 暴露的弱点

1. **Audit 不全** —— `00-current-state-audit.md` §2 列 15 个 touch point，**漏 `scripts/context-for.mjs`**。T01-8 verification 时才发现。结论：未来 audit 必须 grep 所有 `scripts/*.mjs` 看类型硬编码。
2. **Backfill 全 today** —— 6 个月后 28 个文件集体过期。**已知**，phase 2 升级。
3. **Scaffold 间一致性差** —— new-paper/session 用模板字符串 + 内联条件；new-member 用 lines.push() 数组拼。后续应统一。

### 单 task 成功率

- 12 / 16 task **一次过**（不需要返工）
- 4 / 16 涉及小修：
  - T01-2 verify 改正则前缀（漏了 faq 前缀字符串）
  - T01-7 sidebar 加完没立即试 build
  - T01-8 发现 context-for.mjs 漏 faq → 顺便修
  - T02-3 smoke 时发现 new-session 有 pre-existing paper_refs 解析 bug（与本 task 无关）

---

## 🔮 Phase 2 候选 ranked

来自 `analysis/lab-needs/product-recommendations.md` + 本 phase 发现：

### P0 推荐（cycle-10 phase 2 紧接做）

1. **P0-3 RACI 矩阵** — 改 14 skill 文档明确 "PI 不写 sessions" / "博后是主作者"
2. **P0-4 README "95% 给 agent" 改诚实数字** — 1 commit 完事
3. **P0-5 README 收窄到 NLP/LLM + reading-side** — 1 commit 完事

### P1 推荐（cycle-11）

4. **P1-4 graduation-handoff skill** — 4 类强制产出
5. **P1-5 submissions schema**（组里写的论文 vs `papers/` 是读的论文）
6. **P1-6 mode 状态机**（steady / paper-freeze / recruiting-push）

### 本 phase 引入的债务（必修）

7. **Staleness 6 个月后集体过期** — backfill 升级到 git log 推算
8. **`review-stale-pages` skill** — 当 staleness-report 报警时，agent 自动起草更新建议
9. **Audit gap 补救** —— phase 2 audit 必须 grep 全部 `scripts/*.mjs` 看 type 硬编码
10. **Scaffold 一致性** — 6 个 new-*.mjs 模板风格统一

---

## 🚦 下一步建议给用户

### 立刻可做

```bash
# 1. 看产出
git log --oneline cycle-10-impl ^main          # 32 commits
git diff --shortstat main..cycle-10-impl       # 91 files, +5686 / -20

# 2. 本地预览
pnpm dev   # 访问 /faq/, /faq/how-to-pick-arxiv-papers/

# 3. 端到端验收
pnpm verify:full
pnpm staleness-report

# 4. 觉得 OK → 开 PR
gh pr create --base main --head cycle-10-impl \
  --title "cycle-10 phase 1: FAQ schema + staleness tracking" \
  --body "See analysis/cycle-10/cycle-10-phase1-report.md for full breakdown"
```

### 不建议

- ❌ 不要直接 push cycle-10-impl → main（用 PR 触发 CI verify）
- ❌ 不要在审阅前删 cycle-10/R01/* / cycle-10/R02/* 任务分支（用作 task 边界证据）
- ❌ 不要立刻开 phase 2（先让 phase 1 在真实使用中过 1-2 周，看 FAQ + staleness 是否真有人用）

### 让我做的

- 可让 agent 写 PR description 草稿
- 可让 agent 起草 phase 2 的 RFC（R03 RACI 矩阵）
- 可让 agent 起草 `phase-1 announcement` 给组成员（"我们现在有 FAQ 入口了，请看 .agent/skills/add-faq.md"）

---

## ✅ Phase 1 sign-off 判据全 met

- [x] R01 9 task 全 completed + report 写完
- [x] R02 7 task 全 completed + report 写完
- [x] `pnpm verify` 0 warning
- [x] `pnpm verify:full` 含 build 全过
- [x] `pnpm build:index` 知识图含 faq + reviewer 边
- [x] `pnpm staleness-report` 全 fresh exit 0
- [x] `pnpm context:for faq/<exemplar>` backlinks 正确
- [x] 手动 smoke：sidebar 显示 ❓ FAQ（T01-7 build 时验证）
- [x] cycle-10-impl branch 整洁、32 commits 边界清晰
- [x] 无未解决 blocker

**CYCLE-10 PHASE 1 COMPLETE.**
