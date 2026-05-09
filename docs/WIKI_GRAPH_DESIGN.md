# Wiki Knowledge Graph · 设计契约

> Cycle-8 / v1.0 的核心增量。把 wiki 从"按文件组织的 markdown 站"升级为**显式知识图**：双向连接、多维聚合、可机读、给 agent 一个"先查上下文再写"的工具。
>
> 本文档锁定 schema 字段 / json 结构 / 组件 API / verify 规则。**实现期间不允许偏离**，要改先回头改本文档。

## 1. 设计原则

1. **Frontmatter 是真相源**，markdown 正文里的链接是渲染后果，不是关系定义
2. **关系反向自动推导**，作者只写正向（写 `papers/X` 的 `concept_refs: [grpo]`，不需要在 `concepts/grpo` 里手维护反向）
3. **构建期生成索引**，运行时零成本（静态站点哲学不变）
4. **schema 改动向后兼容**，新字段全 optional，老内容不报错只是缺关系
5. **agent 工具用 json**，组件用 Astro，二者共享同一份 `.astro/knowledge-graph.json`

## 2. Schema 扩展

> 新字段 ✨ 标记。所有新字段 **optional**，老内容不会因缺字段而 verify 失败。

### 2.1 `papers/<slug>.md`

```yaml
title: ""                       # 必填（已有）
description: ""                 # 必填（已有）
themes: []                      # 已有（slug 列表）
status: "published"             # 已有
exemplar: false                 # 已有

concept_refs: []         # ✨ slug 列表，引用的概念
related_papers: []       # ✨ slug 列表，cites / extends / contrasts
tags: []                 # ✨ 自由 tag（小写连字符）
```

### 2.2 `concepts/<slug>.md`

```yaml
title: ""                # 已有
description: ""          # 已有

aliases: []              # ✨ 别名（用于自动链接 / 搜索匹配）
related_concepts: []     # ✨ slug 列表，相关概念（无方向 = 对等关联）
parent_concept: null     # ✨ slug，父概念（GRPO.parent = PPO 这种）
tags: []                 # ✨
```

### 2.3 `themes/<slug>.md`

```yaml
title: ""                # 已有
description: ""          # 已有

owner: null              # ✨ member slug（小导师 / PI）
co_owners: []            # ✨ member slug 列表（核心博士）
tags: []                 # ✨
```

### 2.4 `sessions/<slug>.md`

```yaml
title: ""                # 已有
session_week: ""         # 已有
session_date: ""         # 已有
lead: ""                 # 已有（member slug）
paper_refs: []           # 已有
themes: []               # 已有
status: ""               # 已有

participants: []         # ✨ member slug 列表（除了 lead）
concept_refs: []         # ✨ session 中重点讨论的概念
tags: []                 # ✨
```

### 2.5 `members/<slug>.md`

```yaml
# 已有字段全保留
research-interests: []   # 已有：自由文本字符串

theme_refs: []           # ✨ slug 列表，结构化的研究兴趣（与 research-interests 并存，迁移期）
tags: []                 # ✨
```

> ⚠ `members.theme_refs` 是 `research-interests` 的结构化版。Phase 1 让二者并存，phase 2 由迁移脚本把字符串映射到 theme slug，最终去除 `research-interests`。

## 3. `.astro/knowledge-graph.json` 结构

构建期由 `scripts/build-index.mjs` 生成。`.astro/` 不进 git。

```json
{
  "version": "1",
  "generated_at": "2026-05-09T10:30:00Z",
  "stats": {
    "papers": 1, "concepts": 5, "themes": 4, "members": 15, "sessions": 4
  },
  "nodes": {
    "papers/deepseek-r1": {
      "type": "paper",
      "title": "DeepSeek-R1: Incentivizing Reasoning ...",
      "slug": "papers/deepseek-r1",
      "url": "/papers/deepseek-r1/",
      "themes": ["test-time-reasoning"],
      "concept_refs": ["grpo", "moe", "mla"],
      "related_papers": [],
      "tags": ["rl", "reasoning"]
    },
    "concepts/grpo": {
      "type": "concept",
      "title": "GRPO",
      "aliases": ["Group Relative Policy Optimization"],
      "related_concepts": ["ppo"],
      "parent_concept": "ppo",
      "tags": []
    }
  },
  "edges": [
    { "from": "papers/deepseek-r1", "to": "concepts/grpo", "rel": "uses_concept" },
    { "from": "papers/deepseek-r1", "to": "themes/test-time-reasoning", "rel": "in_theme" },
    { "from": "sessions/2026-w19-deepseek-r1", "to": "papers/deepseek-r1", "rel": "discusses_paper" },
    { "from": "sessions/2026-w19-deepseek-r1", "to": "members/phd-senior-1", "rel": "led_by" }
  ],
  "backlinks": {
    "concepts/grpo": [
      { "from": "papers/deepseek-r1", "rel": "uses_concept" },
      { "from": "sessions/2026-w19-deepseek-r1", "rel": "concept_in_session" }
    ],
    "members/phd-senior-1": [
      { "from": "sessions/2026-w19-deepseek-r1", "rel": "led_by" }
    ]
  },
  "by_theme": {
    "test-time-reasoning": {
      "papers": ["papers/deepseek-r1"],
      "sessions": ["sessions/2026-w19-deepseek-r1"],
      "concepts": ["concepts/grpo"],
      "owner": "members/postdoc-1",
      "co_owners": []
    }
  },
  "by_member": {
    "phd-senior-1": {
      "led_sessions": ["sessions/2026-w19-deepseek-r1"],
      "participated_sessions": [],
      "theme_refs": ["test-time-reasoning"]
    }
  },
  "by_concept": {
    "grpo": {
      "papers": ["papers/deepseek-r1"],
      "sessions": ["sessions/2026-w19-deepseek-r1"],
      "related_concepts": ["ppo"]
    }
  },
  "by_tag": {
    "rl": ["papers/deepseek-r1", "concepts/grpo"]
  }
}
```

### 边的类型表

| `rel` | from → to | 来源 |
|------|-----------|------|
| `in_theme` | paper / session → theme | `papers.themes[]` / `sessions.themes[]` |
| `uses_concept` | paper → concept | `papers.concept_refs[]` |
| `concept_in_session` | session → concept | `sessions.concept_refs[]` |
| `discusses_paper` | session → paper | `sessions.paper_refs[]` |
| `led_by` | session → member | `sessions.lead` |
| `participated` | session → member | `sessions.participants[]` |
| `related_concept` | concept → concept | `concepts.related_concepts[]`（双向加边） |
| `parent_concept` | concept → concept | `concepts.parent_concept` |
| `related_paper` | paper → paper | `papers.related_papers[]`（双向加边） |
| `theme_owner` | theme → member | `themes.owner` |
| `theme_co_owner` | theme → member | `themes.co_owners[]` |
| `interested_in` | member → theme | `members.theme_refs[]` |

## 4. 工具 API

### 4.1 `pnpm context:for <slug> [--depth=N] [--json]`

返回该节点的 N 跳邻居。默认 `--depth=1`。

`<slug>` 可省 type 前缀（`grpo` 自动尝试 `concepts/grpo` / `papers/grpo` / ...）。歧义时报错。

```bash
pnpm context:for concepts/grpo --json --depth=2
```

输出：

```json
{
  "center": { "slug": "concepts/grpo", "type": "concept", "title": "GRPO" },
  "depth_1": {
    "papers": [{ "slug": "papers/deepseek-r1", "title": "...", "rel": "uses_concept" }],
    "concepts": [{ "slug": "concepts/ppo", "rel": "parent_concept" }],
    "sessions": [{ "slug": "sessions/2026-w19-deepseek-r1", "rel": "concept_in_session" }]
  },
  "depth_2": { ... }
}
```

非 `--json` 模式输出人类可读的列表。

### 4.2 `pnpm build:index`

显式跑一遍 `build-index.mjs` 生成 json（`pnpm build` 会自动调用）。

### 4.3 `pnpm verify` 扩展规则

| 规则 | severity |
|------|---------|
| `concept_refs[i]` 指向不存在的 concept slug | error |
| `related_papers[i]` 指向不存在的 paper slug | error |
| `themes[i]` / `theme_refs[i]` 指向不存在的 theme slug | error |
| `owner` / `co_owners[i]` 指向不存在的 member slug | error |
| `parent_concept` 指向不存在 | error |
| `related_concepts` 形成 cycle（A → B → A 不算 cycle 因双向；A → B → C → A 才算） | warn |
| `paper.themes[]` 为空 | warn（鼓励至少绑一条主线） |
| `theme.owner` 为 null | info（PI 还没指定 owner） |

## 5. Astro 组件 API

### 5.1 `<Backlinks page={Astro.url.pathname} />`

读 `.astro/knowledge-graph.json`，按类型分组渲染该页的反向链接：

```
## 🔗 反向链接

### 引用本文的论文
- [DeepSeek-R1](/papers/deepseek-r1/) — uses_concept

### 在以下 session 中讨论过
- [W19 · DeepSeek-R1](/sessions/2026-w19-deepseek-r1/) — concept_in_session
```

只显示有 backlinks 的类型。**完全无 backlinks 的页面隐藏整个组件**。

### 5.2 `<ThemePages slug={...} />`

主线页底部自动插入"旗下内容"段：

```
## 📚 旗下内容

### 论文（1）
- [DeepSeek-R1](...)

### 共读 session（1）
- [W19 · DeepSeek-R1](...)

### 概念（1）
- [GRPO](...)
```

### 5.3 `<MemberActivity slug={...} />`

成员页底部自动插入：

```
## 📋 参与记录

### 带读的 sessions（1）
- [W19 · DeepSeek-R1](/sessions/...) — 2026-05-11

### 关联主线
- [Test-time Reasoning](/themes/...)
```

### 5.4 注入策略

每篇 paper / concept / theme / member / session 在 markdown 末尾**人工不可见**地由 Starlight `head` slot / `footer` slot 注入这些组件。或者改 layout 让组件自动渲染。**实现期间确定**：先尝试用 Starlight 文档自带的 layout override（`Footer.astro`），失败再走 frontmatter 钩子。

## 6. Migration

### 6.1 `scripts/migrate-paper-concepts.mjs`

扫所有 `papers/*.md`，提取正文中"关联概念"行 / 表格里的 `[X](/concepts/<slug>/)` 链接，写进 frontmatter `concept_refs[]`。

```bash
pnpm migrate:paper-concepts --dry-run     # 预览改动
pnpm migrate:paper-concepts               # 真改
```

幂等：已写入 frontmatter 的 slug 不重复添加。

### 6.2 一次性 backfill

cycle-8 内一次性跑：
- DeepSeek-R1 paper → 提取出 `[grpo, moe, mla]`
- 5 concepts 手工补 `aliases` / `related_concepts`：
  - `moe` related: `mla`（同样 DeepSeek 系列）
  - `grpo` parent: 待定（PPO 没有 concept 页则不填）
  - `mla` related: `moe`
  - `mtp` related: `moe`
  - `fp8` 独立
- 4 themes 加 owner（暂指向 `members/postdoc-1` 等占位）

## 7. Skill 改动

| Skill | 改动 |
|-------|------|
| `add-paper-note` | 起草 frontmatter 时**必须**填 `concept_refs` / `themes`；正文写完后建议作者跑 `pnpm context:for <自己的 slug>` 确认邻居合理 |
| `add-concept` | 起草时填 `aliases` / `related_concepts`（让 agent 推断同义词，PI 校对） |
| `refresh-theme` | 跑 `pnpm context:for themes/<slug> --json` 拿旗下 paper / session 摘要再写 |
| `weekly-session` | scaffold 时 lead 写好 `paper_refs` / `themes` 后，**调 `pnpm context:for papers/<x>` 把相关 concepts / 之前 sessions 写进 session 的"关联背景"段** |
| `personalized-onboarding` | 用 `by_theme` 聚合给新生定制 reading list（"你感兴趣 X 主线 → 这里有 N 篇 paper / N 个 concept"） |
| `find-related-context` ✨ NEW | 通用：给 agent 一个"我要写关于 X 的内容，先告诉我组里有什么相关的"工具 |

## 8. 不在 Phase 1 范围

- ❌ Concept 自动链接（remark plugin 扫正文 first-occurrence）→ **Phase 2**
- ❌ `[[wiki-link]]` 语法 → **不做**（A 已够）
- ❌ 知识图谱可视化页 `/graph/` → **Phase 3**
- ❌ 全局 tag 聚合页 `/tags/<tag>/` → **Phase 2**
- ❌ Reading log 自动从 sessions 抽 quote 到成员页 → **Phase 2**
- ❌ Embedding / 向量检索 → **不做**（Pagefind 够）

## 9. 文件清单（Phase 1 新增 / 修改）

新增：
- `docs/WIKI_GRAPH_DESIGN.md`（本文档）
- `scripts/build-index.mjs`
- `scripts/context-for.mjs`
- `scripts/migrate-paper-concepts.mjs`
- `src/components/Backlinks.astro`
- `src/components/ThemePages.astro`
- `src/components/MemberActivity.astro`
- `.agent/skills/find-related-context.md`

修改：
- `scripts/lib/frontmatter.mjs`（schema 扩展 + 新 verify 规则）
- `scripts/verify.mjs`（调用扩展的 schema check + cycle 检测）
- `package.json`（新增 scripts）
- `astro.config.mjs`（如需 layout override）
- `.agent/skills/{add-paper-note,add-concept,refresh-theme,weekly-session,personalized-onboarding}.md`
- `scripts/new-{paper,session,concept,theme}.mjs`（scaffold 新字段）
- `AGENT_GUIDE.md`（新增 §wiki graph）
- `README.md` / `README.en.md`（精简提一句）
- `src/content/docs/papers/deepseek-r1.md`（backfill）
- `src/content/docs/concepts/*.md`（backfill aliases / related）
- `src/content/docs/themes/*.md`（backfill owner）

## 10. 成功标准（Phase 1 完成判据）

- [ ] `pnpm verify` 通过，新 schema 检查激活
- [ ] `pnpm build` 自动跑 `build:index`，生成 `.astro/knowledge-graph.json`
- [ ] `pnpm context:for concepts/grpo --json` 正确返回邻居
- [ ] `pnpm dev` 看 `/concepts/grpo/` 页面底部有 Backlinks 自动渲染
- [ ] `/themes/test-time-reasoning/` 底部自动列旗下 paper / session
- [ ] `/members/phd-senior-1/` 底部自动列其 lead 的 session
- [ ] dogfood：以"为 W22 准备 session"假场景跑一遍，证明 agent 调 `context:for` 能拿到合理邻居
- [ ] AGENT_GUIDE / README 更新
- [ ] cycle-8 lessons learned 写回相关 skill 底部

---

确认本文档无误 → 开始 Task 2 (schema 扩展)。
