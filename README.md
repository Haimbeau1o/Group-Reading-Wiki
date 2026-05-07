<div align="center">

# Group Reading Wiki

**A reusable, agent-native wiki template for AI / ML research labs.**

可复用、agent 原生的课题组共读 Wiki 模板，为 AI 研究组打造的"共享大脑"。

[![Astro](https://img.shields.io/badge/Astro-6.x-FF5D01?logo=astro&logoColor=white)](https://astro.build/)
[![Starlight](https://img.shields.io/badge/Starlight-0.38-blueviolet)](https://starlight.astro.build/)
[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--SA%204.0-lightgrey.svg)](LICENSE)
[![Agent-native](https://img.shields.io/badge/Agent--native-✓-success)](AGENT_GUIDE.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[**English**](README.en.md) · **简体中文** · [Live Demo](#-live-demo) · [Quick Start](#-快速开始) · [Agent Guide](AGENT_GUIDE.md) · [Contributing](CONTRIBUTING.md)

</div>

---

## 🌟 这是什么

**Group Reading Wiki** 是一个**面向 AI / 大模型研究组**的可复用 wiki 模板。它把"周会共读、论文笔记、研究主线、新人 onboarding、组内记忆沉淀"全部整合在一个 Git 原生的产品里，并且：

- 🤖 **Agent-native** — 后续维护可以**完全交给 AI agent**（Claude / Cursor / Cascade 等）。内置 10 份 skill、3 份 long-term context、机器可读的 verify / list / scaffold CLI。
- 🧬 **Use this template → 一键改组名** — GitHub 顶栏点绿色 **Use this template** 按钮 → `pnpm init:group "Your Group"` 自动清空 demo、替换品牌，30 秒变成你组的 wiki。
- 📚 **学术写作友好** — KaTeX 公式、Mermaid 图、跨术语链接、论文出处规范、中文全文搜索，开箱即用。
- 🌐 **公开 / 私域分层** — 主线、论文解读对外公开吸引合作；个人 reading log、internal playbook 用 Cloudflare Access 锁住。
- 🪶 **静态站点 + 免费部署** — Astro + Cloudflare Pages，0 服务器成本，构建产物 < 5MB。

> **当前仓库**就是一个 live demo —— 内置虚构课题组 **Leon's Group** 演示真实研究组的 wiki 长什么样。

## 📖 目录

- [核心特性](#-核心特性)
- [Live Demo](#-live-demo)
- [快速开始](#-快速开始)
- [架构概览](#-架构概览)
- [Agent-native 维护](#-agent-native-维护)
- [产品模块](#-产品模块)
- [部署](#-部署)
- [Roadmap](#-roadmap)
- [设计哲学](#-设计哲学)
- [贡献](#-贡献)
- [协议](#-协议)

## ✨ 核心特性

| 特性 | 说明 |
|------|------|
| 🗓️ **Sessions 三段式** | Pre-read / Live notes / Post-meeting 绑定周会节奏，wiki 不是"会后纪要"而是全程记录 |
| 🧭 **Themes 研究主线** | 组的研究地图，新人 30 分钟看完就上路 |
| 👥 **双层成员模型** | 简化角色（大/小导师 + 博/硕生）+ 行为聚类（5 cluster），灵活支持各种课题组结构 |
| 🎯 **Onboarding timeline** | Day-1 / 第一周 / 第一月 / 三个月分阶段路径，可被 agent 个性化定制 |
| 📚 **概念词典 + 论文解读** | 跨术语自动超链接，paper note 模板内置"我们组的 take"段 |
| 🔧 **Scaffolding CLI** | `pnpm new:session/paper/member` 一行生成模板；支持 `--json` 给 agent 解析 |
| 🤖 **10 份 Agent skills** | 从 bootstrap、weekly session、post-meeting recap 到 PR review 全场景 |
| ✅ **自检工具** | `pnpm verify` 一键检查 frontmatter schema、链接、命名约定 |
| 🌐 **i18n** | 中文为主语言，英文同等地位（内容可逐步翻译） |

## 🎬 Live Demo

仓库当前内容 = **Leon's Group**（虚构）的真实样貌：

| 模块 | 入口 | 内容规模 |
|------|------|---------|
| 研究主线 | [`/themes/`](src/content/docs/themes/) | 4 条（长上下文 / MoE / Test-time Reasoning / 多模态） |
| 成员 | [`/members/`](src/content/docs/members/) | 15 个占位（PI + 博士后 + 讲师 + 各年级博硕 + RA） |
| 共读 sessions | [`/sessions/`](src/content/docs/sessions/) | W18 完整示例 |
| 论文解读 | [`/deepseek/`](src/content/docs/deepseek/) | DeepSeek-V4 全套深度解读 |
| 概念词典 | [`/concepts/`](src/content/docs/concepts/) | 5 条（MoE / MLA / MTP / FP8 / GRPO） |
| 新人入口 | [`/onboarding/`](src/content/docs/onboarding.md) | 完整 4 阶段 timeline |

> 🔗 **[访问 Live Demo →](https://group-reading-wiki.pages.dev)**

本地预览：

```bash
git clone https://github.com/Haimbeau1o/Group-Reading-Wiki
cd Group-Reading-Wiki
pnpm install
pnpm dev          # → http://localhost:4321
```

## 🚀 快速开始

### 给"你想用它建自己组 wiki"的人

```text
🌟 点顶栏绿色 「Use this template」 按钮 → Create a new repository
   └ 合你心意的仓库名，请勾选 Include all branches，复制后的仓库
     是你的独立项目，和模板仓库没有 upstream 关联。
```

```bash
# 1. clone 你刚创建的新仓库
git clone https://github.com/<your-org>/<your-new-repo>
cd <your-new-repo>
pnpm install

# 2. 一键重塑为你的课题组（清空 demo、替换品牌、含 GitHub / site URL）
pnpm init:group "Your Group Name" \
  --github=<your-org>/<your-new-repo> \
  --site-url=https://your-site.pages.dev

# 3. 起来看
pnpm dev          # → http://localhost:4321
pnpm verify       # 必须 0 warning 才算干净

# 4. commit 你的初始状态
git commit -am "init: <Your Group> wiki"
```

担心以后没法同步模板的改进？读 [docs/UPGRADING.md](docs/UPGRADING.md) — 讲了"骨架 vs 内容"边界和升级命令。

### 给"AI agent / 维护者"的人

```bash
# Agent 友好的命令（都支持 --json）
pnpm verify                            # 自检 frontmatter / 链接 / 命名
pnpm list:members --json               # introspect 仓库状态
pnpm list:sessions --since=7d --json
pnpm new:session 2026-W19 paper-slug --lead=phd-1 --json
```

详细：[**Agent Guide →**](AGENT_GUIDE.md)

## 🏗️ 架构概览

```
Group-Reading-Wiki/
│
├── 📄 AGENT_GUIDE.md            ← Agent 入口（任何 AI 都先读这个）
├── 🤖 .agent/                   ← Agent 长期记忆 + skill 库
│   ├── context/                 ← repo-map / role-model / conventions
│   ├── skills/                  ← 10 个场景化 skill
│   └── templates/               ← 原始模板备份
│
├── 📚 src/content/docs/         ← Astro Starlight 内容（自动转 sidebar）
│   ├── index.mdx                ← 首页 + 本周共读 banner
│   ├── themes/                  ← 研究主线
│   ├── members/                 ← 成员主页
│   ├── sessions/                ← 周会三段式记录
│   ├── papers/                  ← 论文解读
│   ├── concepts/                ← 概念词典
│   ├── onboarding.md            ← 新人入口
│   └── how-to-contribute.md     ← 贡献指南
│
├── 🔧 scripts/                  ← Agent 友好的工具链
│   ├── new-session.mjs          ← scaffolding（支持 --json）
│   ├── new-paper.mjs
│   ├── new-member.mjs
│   ├── init-group.mjs           ← fork 后一键改组（用完自删）
│   ├── verify.mjs               ← schema + link + naming 自检
│   ├── list.mjs                 ← introspect tooling
│   └── lib/frontmatter.mjs      ← 极简 YAML parser + schema 校验
│
├── 🎨 src/styles/               ← 主题（Mermaid / KaTeX 适配）
├── 🌍 src/i18n/                 ← 多语言文案
├── ⚙️  astro.config.mjs         ← 站点 / sidebar / 评论 / 插件配置
└── 📦 .github/                  ← CI workflow + Issue/PR 模板
```

## 🤖 Agent-native 维护

> **核心理念**：这个 wiki 后续维护 95% 工作可以交给 AI agent。**人**只需要定方向、做决策。

### Agent 入口

```text
AGENT_GUIDE.md            ← 通用入口（agent 第一次见仓库读这个）
.agent/context/
  repo-map.md             ← 目录结构、命名约定、自动 sidebar 规则
  role-model.md           ← 双层角色模型 + frontmatter schema
  conventions.md          ← 写作风格、链接规则、commit 信息
```

### 10 个 Skill 覆盖全场景

| Skill | 触发场景 | 文件 |
|-------|---------|------|
| `bootstrap-new-group` | "把模板初始化为我们 X 组用" | [`.agent/skills/bootstrap-new-group.md`](.agent/skills/bootstrap-new-group.md) |
| `weekly-session` | "下周共读 X 论文，让 Y 带读" | [skill →](.agent/skills/weekly-session.md) |
| `post-meeting-recap` | "周会刚结束，整理 transcript" | [skill →](.agent/skills/post-meeting-recap.md) |
| `add-member` | "新成员加入 / 毕业 / 离开" | [skill →](.agent/skills/add-member.md) |
| `add-paper-note` | "我读完 X paper，做笔记" | [skill →](.agent/skills/add-paper-note.md) |
| `add-concept` | "解释 X 术语，加到词典" | [skill →](.agent/skills/add-concept.md) |
| `refresh-theme` | "更新 X 主线的论文清单 / 开放问题" | [skill →](.agent/skills/refresh-theme.md) |
| `personalized-onboarding` | "给新生定制阅读路径" | [skill →](.agent/skills/personalized-onboarding.md) |
| `weekly-digest` | "周日发 wiki 周报" | [skill →](.agent/skills/weekly-digest.md) |
| `review-pr` | "review 这个 PR" | [skill →](.agent/skills/review-pr.md) |

### Agent 工具链

```bash
# 自检（CI 必跑）
pnpm verify                                    # schema + 链接 + 命名
pnpm verify:full                               # 加跑 build

# Introspect（agent 决策前调用）
pnpm list:members --json [--role=博士生]
pnpm list:themes --json
pnpm list:sessions --since=7d --json
pnpm list:papers --theme=long-context --json
pnpm list:concepts --json

# Scaffold（agent 创建时调用）
pnpm new:session 2026-W19 paper-slug --lead=<member> --json
pnpm new:paper <slug> --title="..." --theme=<theme> --json
pnpm new:member <slug> --role=博士生 --year=3 --json
```

每个 skill 独立自包含、有"不要做的事"清单，防止 agent 越权（不自动 commit、不替组员写观点、不暴露 internal 内容）。

## 📦 产品模块

<details>
<summary><b>🗓️ Sessions（共读会议）</b></summary>

每周一次共读，每次产出一个三段式 markdown 文档：

- **Pre-read**（会前 3 天）：必读 / 选读、关联概念、引导问题
- **Live notes**（会议中）：时间结构化讨论记录
- **Post-meeting**（会后 24h）：Key insights（最重要！）+ Action items + 与组工作关联

模板：[`.agent/templates/`](.agent/templates/) · 命令：`pnpm new:session`
</details>

<details>
<summary><b>🧭 Themes（研究主线）</b></summary>

每条主线是组的一个研究地图节点：包含 owner、关键论文、组内工作、开放问题、推荐阅读路径、组内立场。

模板：[`.agent/templates/theme.md`](.agent/templates/theme.md)
</details>

<details>
<summary><b>👥 Members（双层角色模型）</b></summary>

**简化模型**（4 角色）：大导师 / 小导师 / 博士生 / 硕士生 — 跟实际编制对齐
**行为聚类**（5 cluster）：方向掌舵者 / 研究主理人 / 学习成长者 / 任务驱动者 / 流动接触者 — 跟做事方式对齐

每个成员一个独立主页 + reading log + 个性化 onboarding 路径。
</details>

<details>
<summary><b>🎯 Onboarding</b></summary>

通用 timeline：[`onboarding.md`](src/content/docs/onboarding.md)
个性化路径：写在每个成员自己的主页里（用 `personalized-onboarding` skill 生成）。
</details>

<details>
<summary><b>📚 Papers + Concepts</b></summary>

论文解读：每篇必有"我们组的 take"段（PI / 带读人写）。
概念词典：缩写为 slug、首次出现术语自动链接到词典。
</details>

## 🚢 部署

### 推荐：Cloudflare Pages（免费 + CI 自动）

1. Cloudflare Dashboard → **Workers & Pages → Create → Connect to Git**
2. 选你的仓库，构建配置：
   - Build command: `pnpm build`
   - Build output: `dist`
   - Env: `NODE_VERSION=20`
3. 每次 push 自动部署，PR 有独立预览 URL

> 免费额度：500 build/月，无限带宽。一个 wiki 完全够。

### 私域内容（Cloudflare Access）

`/internal/` `/members/<x>/` 等敏感路径用 Cloudflare Access 配置 SSO 鉴权，外部人看不到。

详见 [部署完整文档](src/content/docs/how-to-contribute.md)。

### 替代：Vercel / Netlify / GitHub Pages

均兼容。GitHub Pages 需要在 `astro.config.mjs` 加 `base: '/<repo>/'`。

## 🗺️ Roadmap

- [x] 基础架构（Astro + Starlight + KaTeX + Mermaid + Pagefind）
- [x] 5 个产品模块（sessions / themes / members / onboarding / papers）
- [x] Agent-native 层（AGENT_GUIDE + 10 skills + verify/list 工具）
- [x] Scaffolding CLI（new:* + init:group + --json 模式）
- [ ] **Live demo 部署**到 Cloudflare Pages
- [ ] **真实 agent 端到端验证**（W19 共读 DeepSeek-R1 case）
- [ ] **CI workflow** 跑 `pnpm verify` 阻塞坏 PR
- [ ] **Internal / Private 层**模板（playbook / 招生 / 评估）
- [ ] **Reading log** 模块结构化（聚合页 + 按 author 排序）
- [ ] **English 内容** 完整翻译
- [ ] **更多 agent skills**（fix-broken-link / migrate-old-session / quarterly-review）

## 🎯 设计哲学

1. **绑住周会节奏，不靠个人自觉** — Sessions 三段式是核心载体
2. **贡献力度多样化** — 100 字 reading log = 一行 take = 一次评论 = 词典补充，**都算**
3. **PI 写作成本要极低** — "Leon's takes" 允许一段话
4. **个人主页是 portfolio** — Reading log 自然累积成毕业 track record
5. **新人 onboarding 由学习者维护** — PI 已忘了入门痛点
6. **first draft, ugly, OK** — 写得不完美 + 发出来 > 完美 + 私藏
7. **Agent-friendly by design** — 不是给 agent 加适配层，而是从一开始就为人 + agent 共同维护设计

## 🛠️ 技术栈

- **[Astro 6](https://astro.build/)** + **[Starlight 0.38](https://starlight.astro.build/)** — 静态文档站点
- **[KaTeX](https://katex.org/)** — 数学公式（构建期渲染）
- **[Mermaid](https://mermaid.js.org/)** — 流程图（lazy load 客户端渲染）
- **[Pagefind](https://pagefind.app/)** — 全文搜索（含中文索引）
- **[Giscus](https://giscus.app/)** — GitHub Discussions 评论
- **[Cloudflare Pages](https://pages.cloudflare.com/)** + **[Access](https://www.cloudflare.com/zero-trust/products/access/)** — 部署 + 鉴权

## 🤝 贡献

无论你是用模板的研究组、想改进模板的开发者、还是 AI agent，都欢迎贡献。

- 用法 / Bug 反馈：[New Issue](https://github.com/Haimbeau1o/Group-Reading-Wiki/issues/new/choose)
- 改进模板：请用**传统 fork**（非 Use this template）后开 PR，详见 [CONTRIBUTING.md](CONTRIBUTING.md)
- 用在你课题组：在你的 README 加一句 "Based on [Group-Reading-Wiki](https://github.com/Haimbeau1o/Group-Reading-Wiki)" 让其他组找到

## 📜 协议

- **代码**（`scripts/` `astro.config.mjs` 等）：[MIT](LICENSE)
- **内容**（`src/content/docs/` 下的 markdown）：[CC BY-SA 4.0](LICENSE)

## 🌟 Star History

如果这个模板帮到了你，欢迎 star ⭐ 让更多研究组发现它。

---

<div align="center">

**Group Reading Wiki** · Built with ❤️ for AI research labs · Powered by [Astro Starlight](https://starlight.astro.build/)

[Top ↑](#group-reading-wiki) · [Agent Guide](AGENT_GUIDE.md) · [English](README.en.md)

</div>
