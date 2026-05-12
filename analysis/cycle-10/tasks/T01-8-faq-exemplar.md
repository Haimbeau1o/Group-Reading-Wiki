---
rfc: R01
task_id: T01-8
status: pending
depends_on: [T01-5, T01-6, T01-7]
estimated_minutes: 30
branch: cycle-10/R01/T01-8-faq-exemplar
files_touched:
  - src/content/docs/faq/index.md
  - src/content/docs/faq/how-to-pick-arxiv-papers.md
verification_commands:
  - pnpm verify
  - pnpm build:index
  - pnpm build
---

# T01-8 · 建 FAQ 入口页 + 1 个 exemplar

## Context
RFC: `analysis/cycle-10/rfcs/R01-faq-schema.md` §D6
Audit: `analysis/cycle-10/00-current-state-audit.md` §10 (concepts/index.md 作参考)

## Exact Diff Intent

### 改 1：建 `src/content/docs/faq/index.md`（约 30 行）

参考 `src/content/docs/concepts/index.md` 模式。frontmatter：
```yaml
---
title: 常见问题（FAQ）
description: 组里反复被问的实操问题集合 —— 答一次，省一万次。
sidebar:
  order: 1
  label: FAQ 入口
---
```

body：30-50 字介绍 + "已上线"列表（autogenerate 会替你列出所有 FAQ，所以入口页只写引言不列具体条目）：

```markdown
## 这里是什么

新生 / 低博 / 师弟问的高频实操问题。每个 FAQ 都是一次"师兄认真答一遍 → 沉到 wiki → 下次直接发链接"。

## 如何贡献

被问了一个值得收录的问题时跑：
\`\`\`bash
pnpm new:faq <slug> --q="..." --answered-by=<member-slug>
\`\`\`

详见 `.agent/skills/add-faq.md`。

## 与「概念词典」的区别

- **概念词典 (`/concepts/`)** = "X 是什么 / 怎么定义"（术语 / 数学 / 直觉）
- **FAQ (`/faq/`)** = "X 该怎么办 / 我们组怎么做"（实操 / heuristics / 踩坑）

模糊时优先 FAQ。
```

### 改 2：建 exemplar FAQ `src/content/docs/faq/how-to-pick-arxiv-papers.md`

**两步**：

**第一步**：用 scaffold 建：
```bash
pnpm new:faq how-to-pick-arxiv-papers \
  --q="怎么挑值得读的 arXiv paper？" \
  --description="新生 / 低博常问；师兄给出组里筛选 5 条 heuristics。" \
  --answered-by=leo \
  --themes=test-time-reasoning \
  --tags=paper-reading,onboarding \
  --exemplar
```

（`leo` 是 Leon's Group demo 里的 PI member-slug；如果实际 slug 不同需先 `pnpm list:members --json` 确认）

**第二步**：手工填实 body（500-1500 字）。**这是模板自带的"好 FAQ 长这样"参考**，必须用心写。建议 5 段：

1. **背景**：arXiv 每日 200+ 篇 AI/ML，无差别全读不现实
2. **我们组的 5 条 heuristics**：（自由发挥，但应当具体）
   - 作者已知靠谱 (10s 决定)
   - 题目命中我们 themes/<slug> (30s)
   - 摘要含 SOTA claim + 可复现 (1 min)
   - GitHub repo 存在且 ≥10 star (2 min)
   - PI 在 X/微信扔过 (信号最强)
3. **常见坑**：
   - 只看摘要不看 limitation
   - 跟 cite 数误以为质量（一年内 paper cite=0 是正常）
4. **链回 wiki**：列 3 个本组 paper notes / themes
5. **修订记录**：留空

## Verification
- `pnpm verify` —— 0 warning
- `pnpm list:faq --json` —— 应当返回 2 个文件（index + how-to-pick-arxiv-papers）
- `pnpm build:index` —— knowledge-graph.json 含 faq 节点
- `pnpm -s context:for faq/how-to-pick-arxiv-papers --depth=1` —— 看 backlinks（themes/test-time-reasoning 反向应当出现）
- `pnpm build` —— 含 `dist/faq/how-to-pick-arxiv-papers/index.html`
- 手动 `pnpm dev` → 访问 `/faq/how-to-pick-arxiv-papers/` 看渲染 + sidebar 显示 + footer backlinks

## Rollback
- 删除 `src/content/docs/faq/index.md` 和 `how-to-pick-arxiv-papers.md`

## Out of Scope
- 不建多个 exemplar（只 1 个保持低噪声）
- 不在 paper / concept 文件里反向加 `related_faq` 字段（phase 2）

## Risk
- `--answered-by=leo` 如果 leo 不存在 → verify 报死链。**先跑 `pnpm list:members --json | jq -r '.items[].slug'` 选一个真存在的 member**
- exemplar 内容是 demo 性质 —— **必须**带 `exemplar: true` frontmatter，让 init:group 时保留
