---
rfc: R01
title: FAQ schema + add-faq skill + scaffold
status: draft
estimated_total_minutes: 240
depends_on: []
authors: agent
---

# R01 · FAQ Schema + Skill + Scaffold

## Problem（1 句）

**博后 / 高博每周被新生 / 低博问 5-10 个重复实操问题（"那个参数怎么调 / 这个集群账号怎么开 / 这篇 paper 我们组怎么看"），当前 `concepts/` 是术语词典，没有为"问答 + 实操"形态的知识沉淀提供任何 schema 入口。**

## Source of Truth

- `analysis/lab-needs/personas/02-postdoc.md` JTBD-2 + §"缺什么 1"（强信号 H · Chemistry World 直接 quote）
- `analysis/lab-needs/personas/03-senior-phd.md` JTBD-2 + §"缺什么 2-3"
- `analysis/lab-needs/personas/04-junior-phd.md` §"缺什么"（FAQ 列于 personas/04 缺什么）
- `analysis/lab-needs/personas/06-newcomer-ra.md` §"缺什么"
- `analysis/lab-needs/cycles/02-onboarding.md` §"缺什么 1"
- `analysis/lab-needs/findings/insight-clusters.md` §1 表（FAQ 5★ 共识，最强信号）+ §2 主题 A
- `analysis/lab-needs/product-recommendations.md` §1 新增 1（P0）

## Current State

引用自 `analysis/cycle-10/00-current-state-audit.md`：
- §1.2-1.3 · `SCHEMAS` 当前 5 个类型（member / session / paper / theme / concept），**无 faq**
- §2 · 添加新 content 类型需要 15 个 touch point
- §3 · 14 个 skill，**无 add-faq**
- §4 · sidebar 当前 6 个顶层 entry，**无 FAQ entry**
- §5.2 · `build-index.mjs` L48 `TYPES` 数组当前 5 项，**无 'faq'**
- §6 · `verify.mjs` 当前**没有**对 FAQ 字段的任何校验
- §9 + §11 · `init-group.mjs` demo 清洗有已知 bug（#30：concepts 未清），FAQ 不能继承
- §10 · concepts 当前 5 个文件作为 schema 模式参考
- §12 · `pnpm list:* --json` 等 API shape **不能变**

## Desired State

### §D1 · 新内容类型：faq

#### §D1.1 路径
```
src/content/docs/faq/
├── index.md                            ← 入口页（参考 concepts/index.md）
├── how-to-pick-arxiv-papers.md         ← 1 个 exemplar（带 exemplar: true）
└── <future-faq>.md                     ← 后续用户产出
```

#### §D1.2 Frontmatter Schema（YAML 例子）

```yaml
---
title: "怎么挑值得读的 arXiv paper？"
description: "新生 / 低博常问；师兄给出组里筛选 5 条 heuristics。"
sidebar:
  order: 2
  label: "挑 arXiv paper"
question: "怎么挑值得读的 arXiv paper？"      # required, ≤200 char
asked_by: "guest"                              # optional · member-slug 或 "guest"
answered_by: "alice"                           # required · member-slug
related_papers: []                             # optional · paper-slug 数组
related_concepts: []                           # optional · concept-slug 数组
themes: ["test-time-reasoning"]                # optional · theme-slug 数组
tags: ["paper-reading", "onboarding"]          # optional
last_reviewed_at: "2026-05-12"                 # optional in R01 · ratchet to required in phase 2 / R02
reviewer: "alice"                              # optional in R01 · ratchet in phase 2 / R02
exemplar: true                                 # optional · 仅模板自带的 1 个 FAQ 用，init 时保留
---
```

**字段说明**：
- `question` 是**正式 question**，不同于 Starlight `title`（title 用于 SEO + 列表展示，可以更短）
- `asked_by: guest` 是设计选择 —— 让外部访客的提问可以被收录，不强制对应到 member-slug
- `last_reviewed_at` / `reviewer` **本 RFC 是 optional**，由 R02 决定 ratchet 时机
- `exemplar` 复用 paper schema 的同字段语义（来自 frontmatter.mjs L131）

#### §D1.3 SCHEMAS 新增（精确改 `scripts/lib/frontmatter.mjs`）

在 L152 `concept:` 后、L153 `generic:` 前插入：
```js
  faq: {
    required: ['title', 'description', 'question', 'answered_by'],
    optional: ['asked_by', 'related_papers', 'related_concepts', 'themes', 'tags', 'last_reviewed_at', 'reviewer', 'exemplar'],
    slug_refs: [
      { field: 'answered_by', target: 'member', kind: 'scalar' },
      { field: 'asked_by',    target: 'member', kind: 'scalar' },   // "guest" 不在 slugsByType.member 中 → 需要 verify 例外
      { field: 'related_papers',   target: 'paper',   kind: 'array' },
      { field: 'related_concepts', target: 'concept', kind: 'array' },
      { field: 'themes',           target: 'theme',   kind: 'array' },
    ],
  },
```

**特殊处理**：`asked_by` 字段允许 `"guest"` 字面量，需要在 verify slug_refs 死链检查（verify.mjs L114-122）加一个豁免：
```js
if (ref.field === 'asked_by' && String(v).trim() === 'guest') continue;
```

#### §D1.4 detectSchema 新增

`scripts/lib/frontmatter.mjs` L175-183，在 concept 检测之后、generic 之前加：
```js
if (relpath.includes('/faq/') && !relpath.endsWith('/index.md')) return 'faq';
```

#### §D1.5 verify.mjs 改动

- L52 `slugsByType` 加 `faq: new Set()`
- L116 路径前缀正则加 `faq`：
  ```js
  .replace(/^(papers|concepts|themes|members|sessions|faq)\//, '')
  ```
- L114-122 slug_refs 死链检查加 `asked_by === 'guest'` 豁免（见上）

#### §D1.6 build-index.mjs 改动

- L34-40 `URL_PREFIX` 加 `faq: '/faq/'`
- L48 `TYPES` 数组加 `'faq'`
- L79-108 投影 if-else 链加：
  ```js
  } else if (schema === 'faq') {
    node.question = fm.question || '';
    node.asked_by = fm.asked_by || null;
    node.answered_by = fm.answered_by || null;
    node.related_papers = arrayOf(fm.related_papers);
    node.related_concepts = arrayOf(fm.related_concepts);
    node.themes = arrayOf(fm.themes);
    node.exemplar = fm.exemplar === true;
    node.last_reviewed_at = fm.last_reviewed_at || null;
    node.reviewer = fm.reviewer || null;
  }
  ```
- L360-369 `stats` 对象加 `faq: 0` 计数
- **不建** `by_faq` 聚合视图（信号弱，phase 2 再说）

#### §D1.7 list.mjs 改动

- L36 白名单加 `'faq'`：
  ```js
  if (!['members','themes','sessions','papers','concepts','faq'].includes(subcommand)) { ... }
  ```

### §D2 · scaffold：`scripts/new-faq.mjs`（约 130 行，参考 new-concept.mjs）

#### §D2.1 命令签名

```
pnpm new:faq <slug>
  --q="<问题>"                          # required
  --answered-by=<member-slug>           # required
  [--asked-by=<member-slug|guest>]      # 默认 guest
  [--description="<一句话上下文>"]       # 默认 generated from q
  [--label="<sidebar 简称>"]            # 默认从 q 截 12 字符
  [--related-papers=p1,p2]
  [--related-concepts=c1,c2]
  [--themes=t1,t2]
  [--tags=t1,t2]
  [--exemplar]                          # 仅模板 init 前手工带
  [--json]
```

#### §D2.2 行为
1. 检查 `src/content/docs/faq/<slug>.md` 不存在
2. 自动算 `sidebar.order = max+1`（同 new-concept.mjs L67-80）
3. 生成 frontmatter + 模板正文
4. `--json` 模式输出 `{ ok, action, file, slug, question, sidebar_order, ... }`
5. 非 --json 模式打印 "Next" 步骤清单

#### §D2.3 模板正文结构（前 30 行）

```markdown
---
title: <从 --q 截短> · FAQ
description: <description>
sidebar:
  order: <next>
  label: <label>
question: <q>
asked_by: <asked_by>
answered_by: <answered_by>
related_papers:<list>
related_concepts:<list>
themes:<list>
tags:<list>
last_reviewed_at: ""
reviewer: ""
---

## 问题

> <q>

## 简答（≤200 字）

📝 TODO：一段话答完。如果展开太长，把核心 takeaway 放这段，细节放下面。

## 完整答案

📝 TODO：500-1500 字。建议结构：

1. **背景** —— 为什么这是个问题
2. **我们组的做法** —— 关键判断 / heuristics
3. **常见坑** —— 新人最容易踩的 2-3 个
4. **链回 wiki** —— 链向相关 paper note / concept / session
```

### §D3 · skill：`.agent/skills/add-faq.md`（约 130 行）

复用 add-concept.md 8 段结构。前 30 行模板：

```markdown
# Skill: add-faq

## 何时调用

- "刚被问了个 X 问题，加到 FAQ"
- "post-meeting-recap 时讨论里出现重复问题 → 收录到 FAQ"
- 在 `personalized-onboarding` skill 中触发：新生第一周问的高频问题应该入 FAQ
- 在 `add-concept` skill 中遇到"这不是术语问题，是实操问题" → 跳来本 skill

## 输入清单

| 必填 | 字段 | 推断 |
|------|------|------|
| ✓ | faq slug | kebab-case，建议 verb-noun（`how-to-pick-arxiv-papers`） |
| ✓ | 问题原文 | ≤200 字符 |
| ✓ | 答题人 member-slug | 一般是博后 / 高博 |
| | 提问人 | `guest` 或 member-slug，默认 guest |
| | related_papers | 用 `pnpm -s list:papers --json` 找用例 |
| | related_concepts | 用 `pnpm -s list:concepts --json` 找用例 |

## 前置检查

`ls src/content/docs/faq/<slug>.md` 不存在。已存在 → 走 update 路径。

## 执行步骤

1. **建文件**：`pnpm new:faq <slug> --q="..." --answered-by=<slug> --json`
2. 写简答（≤200 字）
3. 写完整答案（500-1500 字，4 段建议结构）
4. 链回 paper / concept / session
5. `pnpm verify && pnpm build:index`
6. `pnpm -s context:for faq/<slug>` 验证反向边

## 不要做的事
- ❌ 不要把术语解释写成 FAQ —— 那是 concept 的活
- ❌ 不要把项目状态写成 FAQ —— 那是 session / digest 的活
- ❌ 不要写跨届教学指南 —— 那是 onboarding/ 的活
- ❌ 不自动 commit
```

### §D4 · sidebar：`astro.config.mjs` L84-86 之后插入

```js
{
  label: '❓ FAQ',
  translations: { en: 'FAQ' },
  autogenerate: { directory: 'faq' },
  collapsed: true,
},
```

### §D5 · package.json

L24 后插入：
```json
"new:faq": "node scripts/new-faq.mjs",
"list:faq": "node scripts/list.mjs faq",
```

### §D6 · exemplar：`src/content/docs/faq/how-to-pick-arxiv-papers.md`

用 `pnpm new:faq how-to-pick-arxiv-papers --q="怎么挑值得读的 arXiv paper？" --answered-by=alice --exemplar --json` 生成后手工填实，作为模板自带的"好 FAQ"参考。

### §D7 · init-group.mjs 清洗

**新组运行 `init:group` 时，清空 `src/content/docs/faq/` 下所有非 `exemplar: true` 的文件**。即 demo Leon's Group 的 FAQ 大多被清，只留 exemplar 1 个。

具体改 `scripts/init-group.mjs` 中的清洗段（需要 audit 找到该段精确行号；T01-7 task 处理）。

## Work Breakdown

| Task | 标题 | 依赖 | 影响文件 | 预计 |
|------|------|------|---------|------|
| **T01-1** | 加 faq 进 SCHEMAS + detectSchema | 无 | `scripts/lib/frontmatter.mjs` | 20 min |
| **T01-2** | 改 verify.mjs 接受 faq（含 guest 豁免） | T01-1 | `scripts/verify.mjs` | 20 min |
| **T01-3** | 改 build-index.mjs 收集 faq 节点 | T01-1 | `scripts/build-index.mjs` | 30 min |
| **T01-4** | 改 list.mjs 白名单 + 加 pnpm 脚本 | T01-1 | `scripts/list.mjs` / `package.json` | 15 min |
| **T01-5** | 新建 `scripts/new-faq.mjs` scaffold | T01-1 | 新文件 | 45 min |
| **T01-6** | 新建 `.agent/skills/add-faq.md` | T01-5 | 新文件 | 30 min |
| **T01-7** | 改 init-group.mjs 清洗逻辑 + sidebar 加 entry | T01-1 | `scripts/init-group.mjs` / `astro.config.mjs` | 30 min |
| **T01-8** | 用 scaffold 建 exemplar FAQ + 写实内容 | T01-5, T01-6 | `src/content/docs/faq/index.md` + `how-to-pick-arxiv-papers.md` | 30 min |
| **T01-9** | 跑 verify:full + 手动 smoke + 写完成 report | 全部 | 无（验证） | 20 min |

**合计 ~4 小时**。每个 task 独立 branch + 独立 commit。

## Verification

每个 task 完成后必跑：
- `pnpm verify` —— 0 warning 才算 pass
- `pnpm build:index` —— knowledge-graph.json 必须可重建，看 stats.faq 是否正确

T01-9（集成验证）必跑：
- `pnpm verify:full` —— 含完整 build
- `pnpm list:faq --json` —— 至少返回 1 条（exemplar）
- `pnpm new:faq test-q --q="..." --answered-by=<existing-member>` —— 跑通后 git restore（不留下测试文件）
- `pnpm context:for faq/how-to-pick-arxiv-papers` —— 看反向边
- 手动 `pnpm dev` → 访问 `/faq/how-to-pick-arxiv-papers/` 看渲染 / sidebar 显示 / backlinks

**不能破的现有功能**：
- `pnpm list:papers --json` shape 不变
- `src/generated/knowledge-graph.json` 顶层 keys 不删 / 不改名（可加 `faq` 进 `stats`）
- 现有 sidebar 6 个 entry 顺序不变

## Out of Scope

- ❌ FAQ → Slack 自动同步 / IM 集成
- ❌ FAQ 投票 / 排序 / 热度
- ❌ FAQ 自动从 sessions 摘录（"周会里出现 5 次的问题自动入 FAQ"）—— phase 2 / R??
- ❌ 改 `concepts/` schema —— 与 FAQ 是并列关系，不变更
- ❌ FAQ i18n（英文镜像）—— 现 README 已说"机翻质量不达标"，保持手工
- ❌ `by_faq` 聚合视图

## Rollback

- 每个 task 一个 branch：`cycle-10/R01/T01-<n>-<slug>`
- 全部完成后合并到 `cycle-10-impl`，再开 PR 到 main
- 任意 task 失败：直接 abandon branch，已合并 task 通过 `git revert <SHA>` 单独撤
- 集成失败：revert 整个 PR（所有 task 一起撤）

## Risk

| Risk | Likelihood | Impact | 缓解 |
|------|------------|--------|------|
| `asked_by: guest` 豁免逻辑写错让所有 slug_refs 失效 | 中 | 高 | T01-2 单测：故意写 `asked_by: nonexistent-slug` 必须报 error |
| build-index.mjs 投影漏字段 → backlinks 不全 | 中 | 中 | T01-3 后跑 `context:for faq/<slug>` 验证 |
| sidebar 加入位置不对 → autogenerate 排序乱 | 低 | 低 | T01-7 加完跑 pnpm dev 看 sidebar |
| init-group.mjs 清洗逻辑误删 exemplar | 中 | 高 | T01-7 必须用 `exemplar: true` 字段保留，**先在 demo 仓 dry-run** |
| pnpm list:faq 出现但 `find-related-context` skill 没更新 | 低 | 低 | phase 2 再统一改 skill 引用，本 RFC 不动 |
| 现有 paper / concept 已使用 `question:` 等字段名冲突 | 低 | 低 | T01-1 前 grep 全仓库 `^question:` 确认 |

---

**Status**: draft · 待用户审稿后可拆 task / 实施
