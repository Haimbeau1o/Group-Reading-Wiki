---
rfc: R01
status: completed
completed_at: 2026-05-13
verification: passed
---

# R01 · FAQ Schema 完成报告

## 摘要

**完成时间**：2026-05-13（cycle-10-impl branch）
**Task 数**：9 / 9 全部 completed
**代码改动**：13 文件，+494 / −15（含 exemplar 内容 ~92 行）
**验证**：`pnpm verify:full` 全过（含 89 pages build）

---

## 9 个 task 完成对账

| Task | 提交 SHA | 影响文件 | verify | 备注 |
|------|----------|----------|--------|------|
| T01-1 | `1a06eb1` | scripts/lib/frontmatter.mjs (+12) | ✓ | SCHEMAS.faq + detectSchema |
| T01-2 | `70ce010` | scripts/verify.mjs (+4/−2) | ✓ | guest 豁免 + faq slug 正则；负向测试通过 |
| T01-3 | `4ce20ee` | scripts/build-index.mjs (+15/−3) | ✓ | URL_PREFIX/TYPES/projection/stats |
| T01-4 | `cb45c58` | scripts/list.mjs (+3/−3) · package.json (+3/−1) | ✓ | list:faq + new:faq 脚本注册 |
| T01-5 | `a2d9077` | scripts/new-faq.mjs (+174 新文件) | ✓ | smoke 通过 |
| T01-6 | `79c147e` | .agent/skills/add-faq.md (+137 新) · README.md (+1) | ✓ | 8 段标准 + Update 路径 |
| T01-7 | `5762fa7` | scripts/init-group.mjs (+3) · astro.config.mjs (+6) | ✓ | 清洗复用 exemplar 字段；89 pages build |
| T01-8 | `613f0c2` | faq/{index,how-to-pick-arxiv-papers}.md (+130 新) · scripts/context-for.mjs (+5/−5) | ✓ | **audit gap 修复**：context-for 加 faq |
| T01-9 | (本次提交) | analysis/cycle-10/R01-completion-report.md (新) | — | 本报告 |

---

## 验证 output 摘要

```
$ pnpm verify
📋 verify · 47 个文件
✅ 全部通过

$ pnpm verify:full         # 含完整 build
📋 verify · 47 个文件
✅ 全部通过
[build] 89 page(s) built in ~39s

$ pnpm build:index
✅ knowledge-graph.json (44 edges)
   nodes: papers=1 concepts=5 themes=4 members=15 sessions=3 faq=1

$ pnpm -s context:for faq/how-to-pick-arxiv-papers --depth=1
📍 faq: 怎么挑值得读的 arXiv paper？ · FAQ
── 1 跳邻居 ──
  themes (1) → Test-time Reasoning  [themes]
  members (1) → Leon  [answered_by]
```

---

## Audit Gap 修复（重要）

`00-current-state-audit.md` §2 列出"添加新 content 类型 = 15 个 touch point"，但 **漏了 `scripts/context-for.mjs`** —— 这是知识图 introspect 命令，处理 type / slug 解析。

T01-8 verification 步骤要求 `pnpm context:for faq/<slug>` 工作，**发现 context-for.mjs 不识别 faq**。已在 T01-8 顺便修复：
- `prefixMap` += `faq`
- `/^(paper|concept|theme|member|session|faq)\//` 正则
- 候选类型循环 += `faq`
- `groupByType.buckets` + `map` 各加 `faq`
- `TYPE_LABEL` += `faq`

**未来 audit 必须含 context-for.mjs 作 touch point**。R02 不受影响（只加 frontmatter 字段，不加新类型）。

---

## 未解决的问题（feed into phase 2）

### P0 / 阻塞性 —— 无

### P1 / 应当后续做
1. **knowledge-graph 没建 `by_faq` 聚合视图** —— RFC §D1.6 明确暂不做，phase 2 评估
2. **paper / concept 没反向加 `related_faq` 字段** —— RFC §Out of Scope，phase 2
3. **R01 exemplar 标 `last_reviewed_at: "2026-05-13"`**，跟 backfill 一起 6 个月后到期 —— R02 §Risk 已记录

### P2 / 长期
1. 现有 14 个 skill 没引用 `add-faq` —— 可能"post-meeting-recap" / "personalized-onboarding" / "add-concept" 触发链应该提一句 FAQ 入口

---

## 对 R02 的解锁说明

R01 完成后，R02 task 现在可以起草 + 实施：

- T02-1 改 SCHEMAS：6 个类型（含 R01 新加的 faq）每个加 3 个 optional 字段
- T02-6 backfill 包含 `src/content/docs/faq/` 下 2 个文件（index + exemplar）

**R02 不再被阻塞**。下一步：开始 T02-1。

---

## 学到的方法论

1. **审稿点（USER_APPROVED_RFCS）+ 实施门（IMPLEMENTATION_STARTED）双 gate 有效** —— 强制把"设计错误"在动代码前抓出
2. **Per-task branch + merge --no-ff 给清晰边界** —— 每个 task 是单一 commit，merge commit 保留语义
3. **Audit 不够全 = task 执行时被迫扩范围** —— context-for.mjs 是案例。下一个 phase 应当 audit 全部 `scripts/*.mjs` 看 type 列表硬编码
4. **每 task 跑 verify 是必要的** —— T01-7 build 30+ 秒，但本身建立了"build 不破"的信心，T01-8 加内容后再 build 才能精确归因
