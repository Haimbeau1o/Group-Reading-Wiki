# 仓库地图（Repo Map）

> 给 agent 用的目录语义说明。每个目录"做什么、写什么、不写什么、文件命名"。

## 顶层

```
.
├── astro.config.mjs        ← Starlight + sidebar + Giscus + plugin 配置（**只在用户明确要求时改**）
├── package.json            ← scripts 入口（**只在加新 script 时改**）
├── README.md               ← 模板自身介绍（structural change 需用户确认）
├── CONTRIBUTING.md         ← 给人类贡献者
├── AGENT_GUIDE.md          ← 给 agent
├── LICENSE                 ← MIT (code) + CC BY-SA 4.0 (content)（**永远不改**）
├── .gitignore
├── .agent/                 ← 你正在工作的目录
├── .github/                ← Issue / PR 模板 + CI workflow
├── public/
│   └── docs-assets/        ← 文章里的图片（PNG / SVG）
├── scripts/                ← 脚手架 .mjs 与 .sh
└── src/
```

## src/ 下

```
src/
├── content/docs/           ← 唯一内容目录（所有页面）
├── lib/
│   └── rehype-mermaid-pre.mjs   ← 自定义 rehype 插件（不要改）
└── styles/
    └── custom.css          ← 主题色 / KaTeX 调优
```

## src/content/docs/ — 所有页面（zh-CN 主，英文 fallback）

| 路径 | 类型 | 命名约定 | frontmatter 必填 | 谁在写 |
|------|------|---------|----------------|-------|
| `index.mdx` | 站点首页 | 固定 | `title` `template: splash` `hero` | template 维护者 |
| `welcome.md` | 欢迎页 | 固定 | `title` `description` | 通用 |
| `onboarding.md` | 新人入口 | 固定 | 同上 | **学习者维护**（PI 不写） |
| `how-to-contribute.md` | 贡献指南 | 固定 | 同上 | template 维护者 |
| `roadmap.md` | 路线图 | 固定 | 同上 | PI / template 维护者 |
| `sessions/` | 共读会议 | `<week>-<paper-slug>.md`（如 `2026-w18-deepseek-v4.md`） | `title` `session_week` `lead` `status` | **带读人** |
| `sessions/index.mdx` | sessions 索引 | 固定 | `title` `sidebar.order: 0` | 自动维护 |
| `themes/` | 研究主线 | `<theme-slug>.md`（如 `long-context.md`） | `title` `description` | 该方向 owner |
| `themes/index.mdx` | themes 索引 | 固定 | `sidebar.order: 0` | PI |
| `members/` | 成员主页 | `<slug>.md`（小写连字符，如 `phd-senior-1.md`） | `title` `role` `status` | **本人** |
| `members/index.mdx` | 成员索引 | 固定 | `sidebar.order: 0` | 自动维护 |
| `concepts/` | 概念词典 | `<term-slug>.md`（如 `moe.md`） | `title` `description` | 任何贡献者 |
| `concepts/index.md` | 词典索引 | 固定 | `sidebar.order: 1` | 自动维护 |
| `papers/` | 论文解读 | `<paper-slug>.md` | `title` `description` | 共读带读人 / 投稿者 |
| `papers/index.md` | 论文索引 | 固定 | `sidebar.order: 1` | 自动维护 |
| `deepseek/` | demo 专题 | 现有 4 文件 | 同上 | demo only，可删 |

### 自动 sidebar 收录规则

`astro.config.mjs` 的 sidebar 配置里：

- `autogenerate: { directory: 'xxx' }` → **该目录下所有 `.md` / `.mdx` 自动出现在 sidebar**
- 用 `frontmatter.sidebar.order` 控制排序（小在前）
- 用 `frontmatter.sidebar.label` 自定义显示文本
- 用 `frontmatter.draft: true` 让该页面**不**出现在 sidebar（仍可直接 URL 访问）

**含义**：你（agent）创建一个新 `themes/foo.md` → 自动出现在左侧导航 → **不要忘了用 `sidebar.order` 排序**。

## 文件类型选择：`.md` vs `.mdx`

- 纯 markdown 内容 + frontmatter → 用 `.md`
- 需要 import Astro / Starlight 组件（`<Card>` `<CardGrid>` `<LinkCard>` `<Tabs>` 等）→ 用 `.mdx`
- 索引页（index）通常是 `.mdx`（要用 CardGrid）

## 公开 vs 内部（部署后由 Cloudflare Access 控制）

| 路径 | 当前可见性 | 部署后建议 |
|------|----------|-----------|
| `/` `/welcome/` `/onboarding/` | 公开 | 公开 |
| `/themes/` | 公开 | 公开（对外门面） |
| `/papers/` `/concepts/` | 公开 | 公开 |
| `/members/` `/members/<x>/` | 公开 | **可选**：组员主页对内，索引页对外 |
| `/sessions/` | 公开 | **建议内部** |
| `/internal/`（待加） | — | **必须内部** |

## 可执行命令清单

| 命令 | 作用 | agent 何时用 |
|------|------|--------------|
| `pnpm dev` | 起 dev server | 用户要本地预览时建议手动跑 |
| `pnpm build` | 静态构建 | 验证产物时跑 |
| `pnpm verify` | build + frontmatter schema + 链接 | **每次写完批量内容必跑** |
| `pnpm new:session <week> <slug>` | 建 session | 排周会时 |
| `pnpm new:paper <slug>` | 建 paper note | 写论文解读时 |
| `pnpm new:member <slug>` | 建成员主页 | 新成员入组时 |
| `pnpm init:group "<name>"` | 重塑模板 | bootstrap 流程，**仅一次** |
| `pnpm list:members [--json]` | 当前成员 | 需要知道有谁时 |
| `pnpm list:themes [--json]` | 当前主线 | 需要知道有什么主线时 |
| `pnpm list:sessions [--json] [--since=Nd]` | 历史 session | 生成 weekly digest 等 |

详见各 skill 文件中的具体调用方式。
