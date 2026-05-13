---
iteration: 0
generated_at: 2026-05-12
purpose: 为 R01 (FAQ schema) 和 R02 (staleness tracking) 提供事实基础。所有 RFC 必须引用本文件具体行号。
---

# Iteration 0 · Current State Audit

> 本文件**只描述事实**。任何"建议"应在 RFC 中提出。

## §1 Content 类型基础设施（关键发现：schema 在脚本层，不在 Astro 层）

### §1.1 Astro 内容配置极简
**`src/content.config.ts`（8 行）**：
- 只声明了 `docs` collection
- 用 Starlight 默认 `docsLoader()` + `docsSchema()`
- **没有任何自定义 schema** 强制

→ **含义**：Astro 层只校验 Starlight 必备字段（`title`、`description` 等）。所有"组里特定的 frontmatter 规则"由 `scripts/verify.mjs` 强制。**新增一个 content 类型不需要改 content.config.ts**。

### §1.2 真正的 schema 真相源：`scripts/lib/frontmatter.mjs`

文件结构（关键行）：
- **L100-157 · `SCHEMAS` 常量** — 5 个类型的 schema 定义：`member` / `session` / `paper` / `theme` / `concept` + `generic`
- **L159-172 · `validateFrontmatter(fm, schema)`** — 校验 required / enum
- **L175-183 · `detectSchema(relpath)`** — 路径前缀 → schema 名映射

`SCHEMAS` 结构（L100）：
```js
{
  member:  { required: [...], optional: [...], enum: {...}, slug_refs: [...] },
  session: { required: [...], optional: [...], enum: {...}, slug_refs: [...] },
  paper:   { required: ['title','description'], optional: [...], slug_refs: [...] },
  theme:   { required: ['title','description'], optional: [...], slug_refs: [...] },
  concept: { required: ['title','description'], optional: [...], slug_refs: [...] },
  generic: { required: ['title'], optional: ['tags'] },
}
```

`slug_refs` 是知识图边的真相源（L97 注释明示），结构：
```js
{ field: 'concept_refs', target: 'concept', kind: 'array' }
```

### §1.3 当前 schema 字段总览（来自 frontmatter.mjs L100-157）

| 类型 | required | optional 含 |
|------|----------|------------|
| member | title / role / status | cluster · year · title_label · research-interests · theme_refs · tags |
| session | title / session_week / lead / status | session_date · paper_refs · themes · participants · concept_refs · tags |
| paper | title / description | status · themes · exemplar · concept_refs · related_papers · tags |
| theme | title / description | owner · co_owners · tags |
| concept | title / description | aliases · related_concepts · parent_concept · tags |
| generic | title | tags |

**关键事实**：**没有任何 schema 包含 `last_reviewed_at` 或 `reviewer` 字段** —— R02 需要新增。

---

## §2 添加一个新 content 类型的"完整路径"

如果要新增 `faq` 类型（R01 的需求），必须改的文件：

| 序号 | 文件 | 行号 / 位置 | 改动性质 |
|------|------|-----------|---------|
| 1 | `scripts/lib/frontmatter.mjs` | L100-157 `SCHEMAS` | 加 `faq: { required, optional, enum, slug_refs }` |
| 2 | `scripts/lib/frontmatter.mjs` | L175-183 `detectSchema()` | 加 `if (relpath.includes('/faq/')) return 'faq';` |
| 3 | `scripts/verify.mjs` | L52 `slugsByType` | 加 `faq: new Set()` |
| 4 | `scripts/verify.mjs` | L116 `replace(/^(papers\|concepts\|...)\//,...)` | 加 `faq` 到正则前缀 |
| 5 | `scripts/build-index.mjs` | L34-40 `URL_PREFIX` | 加 `faq: '/faq/'` |
| 6 | `scripts/build-index.mjs` | L48 `TYPES` | 加 `'faq'` 到数组 |
| 7 | `scripts/build-index.mjs` | L79-108 `collectNodes()` | 加 `else if (schema === 'faq') { ... }` 投影 |
| 8 | `scripts/list.mjs` | L36 `['members','themes',...]` 白名单 | 加 `'faq'` |
| 9 | `astro.config.mjs` | L33-86 `sidebar` 数组 | 加 FAQ entry（建议放在概念词典后） |
| 10 | `scripts/new-faq.mjs` | **新建文件** | 参考 `scripts/new-concept.mjs`（170 行） |
| 11 | `package.json` | L18-32 `scripts` | 加 `"new:faq": "..."` 和 `"list:faq": "..."` |
| 12 | `.agent/skills/add-faq.md` | **新建文件** | 参考 `.agent/skills/add-concept.md`（155 行） |
| 13 | `src/content/docs/faq/<example>.md` | **新建文件** | 1 个 exemplar |
| 14 | `src/content/docs/faq/index.md` | **新建文件** | FAQ 入口页（可选但推荐，参考 concepts/index.md） |
| 15 | `scripts/init-group.mjs` | demo 清洗逻辑 | **是否清洗 demo FAQ** 需要在 RFC 决定 |

**合计 ~15 个 touch point**。RFC 拆 task 时按这个清单拆。

---

## §3 现有 14 个 .agent/skill 文件清单

```
.agent/skills/README.md
.agent/skills/add-concept.md         ← R01 模板参考
.agent/skills/add-member.md
.agent/skills/add-paper-note.md
.agent/skills/bootstrap-new-group.md
.agent/skills/find-related-context.md
.agent/skills/first-week-after-init.md
.agent/skills/personalized-onboarding.md
.agent/skills/post-meeting-recap.md
.agent/skills/refresh-theme.md
.agent/skills/review-pr.md
.agent/skills/setup-comments.md
.agent/skills/setup-deploy.md
.agent/skills/upgrade-template.md
.agent/skills/weekly-digest.md
.agent/skills/weekly-session.md
```

**Skill 文件标准结构**（来自 `add-concept.md` 分析）：
1. `# Skill: <name>` 标题
2. `## 何时调用` — 触发短语清单
3. `## 输入清单` — 必填 / 选填 表格
4. `## 前置检查` — agent 先验证什么
5. `## 模板结构（必备段）` — 文件长什么样
6. `## 执行步骤` — N 步操作
7. `## 不要做的事` — ❌ 清单
8. `## Lessons learned` — 历次演练发现（cycle-N 标记）

---

## §4 Sidebar 结构（astro.config.mjs L33-86）

当前 6 个顶层 entry：
1. 🏠 课题组 — 手动 items（welcome / onboarding / how-to-contribute / roadmap）
2. 🗓️ 共读会议 — `autogenerate: { directory: 'sessions' }`
3. 🧭 研究主线 — `autogenerate: { directory: 'themes' }`
4. 👥 成员 — `autogenerate: { directory: 'members' }` + `collapsed: true`
5. 📚 共读笔记 — 手动嵌套（DeepSeek 子专题 + papers autogenerate）
6. 📔 概念词典 — `autogenerate: { directory: 'concepts' }` + `collapsed: true`

**为 FAQ 加 sidebar 入口**（R01 task）：建议放在「概念词典」之后作为第 7 个 entry，使用 `autogenerate: { directory: 'faq' }` + `collapsed: true`。

**注意**：sidebar 文案是中文 + `translations.en`，新加 entry 必须同步加英文。

---

## §5 Knowledge Graph Build（`scripts/build-index.mjs`）

### §5.1 输出位置
- **L29 `OUT_DIR = src/generated/`**（**不是** `.astro/` —— 注释 L28 明确说 astro build 会清 `.astro/`）
- 文件：`src/generated/knowledge-graph.json`

### §5.2 知识图节点收集（L46-114）
- L48 `TYPES = ['papers','concepts','themes','members','sessions']` — **R01 加 faq 必须改这里**
- 对每个文件解析 frontmatter，按 schema 投影需要的字段
- 跳过 `index.*` 和 generic schema

### §5.3 边构建（L153-193）
- 从 `SCHEMAS[type].slug_refs` 自动派生边
- 双向对等关系（related_concept / related_paper）自动加反向边（L182-190）

### §5.4 聚合视图
- `by_theme` / `by_member` / `by_concept` / `by_tag`
- **没有** `by_faq` —— R01 task 决定是否要建

---

## §6 `pnpm verify` 实际强制什么（来自 verify.mjs 分析）

| 检查 | 实现位置 | 错误等级 |
|------|---------|---------|
| 文件名小写 + 连字符 + 无中文 / 空格 / 大写 / 下划线 | L70-72 | warn |
| frontmatter required 字段缺失 | L100-102 (validateFrontmatter) | **error** |
| frontmatter enum 字段值非法 | L100-102 | **error** |
| frontmatter `title/description/label` 含 `:` 未引号 | L85-96 | **error** |
| `slug_refs` 字段指向的 slug 不存在 | L105-123 | **error** |
| `paper.themes` 为空 | L135-137 | warn |
| `concept.parent_concept` 形成 cycle | L173-176 | warn |
| 跨页链接 `[text](/path/)` 目标存在 | L178-200 | warn |
| `pnpm build` 通过（仅 `--build` 时） | L203-210 | **error** |

**关键事实**：**没有任何"过期 / staleness"检查** —— R02 整个就是新增能力，不会破坏现有规则。

---

## §7 list.mjs 当前能力（用于 R02 staleness-report 设计参考）

`scripts/list.mjs` 接收 subcommand（L26：`members|themes|sessions|papers|concepts` 5 选 1）+ 各种 flag：
- `--json` — JSON 输出
- `--since=Nd` — N 天内（mtime 或 git 历史）
- `--theme=<slug>` — 按主线过滤
- `--role=<role>` — 按角色过滤（仅 members）
- `--source=mtime|git` — 时间过滤源（默认 mtime，但 init 会刷 mtime → 推荐 git）
- `--status=A|M|R` — 仅 git 模式：新增 / 修改 / 重命名

**R02 staleness-report 的两条选择**：
- **方案 A**：作为 `scripts/staleness-report.mjs` 独立脚本
- **方案 B**：作为 `pnpm list:* --stale-only` 的 flag
- **暂不决策**，由 R02 RFC §Work Breakdown 拍板

---

## §8 group.config.yaml schema（仅在 init 后存在）

从 `scripts/init-group.mjs` L435-481 生成，结构：
```yaml
stage: template | initialized | established
group: { name, slug, github, site_url }
pi: { name, github, email, homepage }     # first-week-after-init 填
content: { themes_count, members_count, papers_count, last_session }
deploy: { cloudflare_pages, giscus_enabled }
template: { baseline_commit, last_synced }
```

**当前 demo 仓库（Leon's Group）没有这个文件** — 这是模板原态，只有 `init:group` 后才生成。

**R02 staleness 是否需要 group.config.yaml 字段**？答：**不需要**。staleness 是内容级（每页有 `last_reviewed_at`），不是配置级。

---

## §9 demo 清洗逻辑（init-group.mjs）

`init:group` 在新组运行时会：
- **保留** `papers/` 下 `exemplar: true` 的 paper note（具体由 `init-group.mjs` 中的清洗逻辑决定）
- **清空** 其他 demo 内容

**对 R01 FAQ 的影响**：
- 模板必须带 1 个 FAQ exemplar（让新组上线时不空）
- exemplar 标记机制需要确认：paper 是用 frontmatter `exemplar: true`（来自 frontmatter.mjs L131 注释）。**FAQ 是否复用同字段**？由 R01 RFC 决定（推荐复用，简化心智）。

---

## §10 现有 concepts 例子（作为 FAQ schema 参考）

`src/content/docs/concepts/` 当前 5 个文件：
- `fp8.md` · `grpo.md` · `mla.md` · `moe.md` · `index.md`（入口页）

`concepts/index.md` 是 sidebar `autogenerate` 仍能被覆盖的入口，FAQ 应当复用同模式。

---

## §11 已知失效模式（来自 add-concept.md Lessons learned 段）

需要在 R01 RFC 中预防：
- **#30 (init bug)**：`init:group` 没清洗 `concepts/*.md` 的 demo 段（"在 DeepSeek 里的用法"）。**FAQ 不应继承这个 bug** — R01 必须在 init 清洗逻辑里加 faq 路径。
- **#F4**：scaffold 存在却没在 skill 文档明示（→ R01 skill 文档必须含 `pnpm new:faq` 调用例）。
- **list 调用必须用 `pnpm -s`**（silent）否则 JSON 被脚本头脏。

---

## §12 R01 / R02 涉及但暂不变更的稳定 API

下面这些 API 在 R01/R02 完成后**形状不变**，下游 skill / 用户脚本依赖它们：
- `pnpm list:* --json` 返回 `{ subcommand, count, items: [...] }`
- `pnpm new:* --json` 返回 `{ ok, action, file, slug, ... }`
- `src/generated/knowledge-graph.json` 顶层 keys：`version / generated_at / stats / nodes / edges / backlinks / by_theme / by_member / by_concept / by_tag`
- `.agent/skills/<name>.md` 8 段固定结构

R01 / R02 增量必须**向后兼容**这些约定。

---

## §13 Phase 1 风险预警（feed into R01/R02 §Risk）

| 风险 | 触发 | 防御 |
|------|------|------|
| 添加 faq 类型让现有 verify 报新 warning | 自动检测的旧 paper / concept 引用了 faq slug 但 faq 文件不存在 | 不允许旧文件引用 faq slug，直到 R01 完成 |
| build-index.mjs collectNodes() 跳过 generic — 如果误把 faq 路径漏检测，会被当 generic 跳过 | detectSchema 优先级写错 | task T01-1 单测：跑 `pnpm build:index` 看 stats.faq > 0 |
| init-group.mjs 清洗逻辑漏掉 faq → 新组继承 demo FAQ | 默认 init 不清 faq | task 包含改 init-group.mjs |
| `last_reviewed_at` 加成 required 立刻让所有现有文件报 error | schema required 强制 | R02 必须先 optional，**ratchet 到 required 是 phase 2 决策** |

---

## §14 Done

本文件提供以下 RFC 起草需要的事实：

- [x] 添加 content 类型的 15 个 touch point 清单（§2）
- [x] 现有 schema 字段对照表（§1.3）
- [x] verify.mjs 强制什么 / 不强制什么（§6）
- [x] knowledge-graph.json 结构（§5）
- [x] skill 文件 8 段标准（§3）
- [x] sidebar 结构（§4）
- [x] init-group.mjs demo 清洗机制（§9 + §11）
- [x] R02 不冲突的现有 staleness 工具（§6 + §7）
- [x] 风险预警（§13）

**Iteration 0 完成。下一步：起草 R01 + R02 RFC（Iterations 1+2）。**
