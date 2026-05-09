<div align="center">

# Group Reading Wiki

**可复用、agent 原生的课题组共读 Wiki 模板。**
A reusable, agent-native wiki template for AI / ML research labs.

[![Astro](https://img.shields.io/badge/Astro-6.x-FF5D01?logo=astro&logoColor=white)](https://astro.build/)
[![Starlight](https://img.shields.io/badge/Starlight-0.38-blueviolet)](https://starlight.astro.build/)
[![Code: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--SA%204.0-lightgrey.svg)](LICENSE)
[![Agent-native](https://img.shields.io/badge/Agent--native-✓-success)](AGENT_GUIDE.md)

[**Live Demo**](https://group-reading-wiki.pages.dev) · [Quick Start](#-快速开始) · [Agent Guide](AGENT_GUIDE.md) · [English](README.en.md)

</div>

---

## 解决什么问题

你的课题组每周都开周会，但：

- 笔记永远停在某个学生本地的 markdown 里，会后没人去翻
- 新生入组要找师兄要"必读 paper 列表"，每届都重做一遍
- 上学期讨论的关键 insight，半年后没人记得是谁先提的
- PI 写一段研究观点要打开 Notion / 飞书 / 微信群三个地方
- 论文读了一堆，组内都没人知道彼此的 take

**Group Reading Wiki** 把周会节奏 / 论文笔记 / 研究主线 / 成员主页 / 概念词典放进一个 git 原生的静态站点，**95% 后续维护交给 AI agent**（Claude / Cursor / Cascade 等），PI 只负责定方向、审 take。

---

## 30 秒上手

```text
1. 点 GitHub 顶栏绿色 [Use this template] 创建你的仓库

2. clone 下来跑：
     pnpm install
     pnpm init:group "Your Group Name" \
       --github=<your-org>/<your-repo> \
       --site-url=https://your-site.pages.dev

3. 打开 Claude / Cursor / Cascade，对它说：
     "读 .agent/BOOTSTRAP.md，帮我填好 wiki"
   → agent 自动调 first-week-after-init skill
   → 5 个对话循环（PI 主页 / 主线 / 成员 / 第一篇 paper / 部署）

4. push → Cloudflare Pages 自动部署 → 上线
```

总耗时：~2 小时把空架子填成可上线 wiki。期间 PI 只回答问题，所有写文件的事 agent 做。

---

## 🎬 Live Demo

仓库当前内容 = 一个虚构课题组 **Leon's Group**（专注 DeepSeek 系列大模型解读）的 live wiki：

> 🔗 **<https://group-reading-wiki.pages.dev>**

| 模块 | 入口 | 内容 |
|------|------|------|
| 研究主线 | [`/themes/`](src/content/docs/themes/) | 4 条（长上下文 / MoE / Test-time Reasoning / 多模态） |
| 成员 | [`/members/`](src/content/docs/members/) | 15 个占位（PI + 博士后 + 各年级博硕 + RA） |
| 共读 sessions | [`/sessions/`](src/content/docs/sessions/) | W18 / W19 完整三段式 + W18 weekly digest |
| 论文解读 | [`/papers/`](src/content/docs/papers/) | DeepSeek-R1 PI-grade 解读（exemplar，跨 init 保留） |
| 深度专辑 | [`/deepseek/`](src/content/docs/deepseek/) | DeepSeek-V4 长上下文 + 混合注意力 + 视觉栈深度文章 |
| 概念词典 | [`/concepts/`](src/content/docs/concepts/) | 5 条（MoE / MLA / MTP / FP8 / GRPO） |
| 新人入口 | [`/onboarding/`](src/content/docs/onboarding.md) | Day-1 / 第一周 / 第一月 / 三个月 |

> 用 `pnpm init:group` 跑出来的新仓库会**自动清空** Leon's Group 这些 demo 内容，只保留通用骨架 + 1 个 exemplar paper note。

本地预览：

```bash
git clone https://github.com/Haimbeau1o/Group-Reading-Wiki
cd Group-Reading-Wiki
pnpm install
pnpm dev          # → http://localhost:4321
```

---

## 🚀 快速开始

### 路径 A · 我是 PI，要建组 wiki

最推荐：让 agent 接管。

```bash
# 1. 点 [Use this template] → clone 下来
git clone https://github.com/<your-org>/<your-new-repo>
cd <your-new-repo>
pnpm install

# 2. 一键改组（清空 demo + 替换品牌 + 写 group.config.yaml）
pnpm init:group "Your Group" \
  --github=<your-org>/<your-new-repo> \
  --site-url=https://your-site.pages.dev

# 3. agent 接管：跟你的 IDE 助手说一句话
#    "读 .agent/BOOTSTRAP.md，帮我填好 wiki"
#    它会自动跑 first-week-after-init 的 5 个对话循环

# 4. 验证 + commit
pnpm verify        # 必须 0 warning
git commit -am "init: <Your Group> wiki"

# 5. 部署到 Cloudflare Pages（10 分钟，详见 §部署）
```

后续要同步模板的改进，读 [`docs/UPGRADING.md`](docs/UPGRADING.md) 或调用 `upgrade-template` skill。

### 路径 B · 我想 contribute 模板 / 学 agent-native 设计

```bash
# 不要点 Use this template — 用传统 fork 才能给上游提 PR
git clone https://github.com/<your-fork>/Group-Reading-Wiki
cd Group-Reading-Wiki
pnpm install
pnpm dev                    # 跑 demo 看现状
ls .agent/skills/           # 14 个场景化 skill 是核心
cat AGENT_GUIDE.md          # 模板设计的入口文档
```

详见 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

---

## 🎯 能做什么 / 不能做什么

### ✅ 能做

- **结构化沉淀**：15 个 agent skill 覆盖周会、论文、概念、成员、主线、digest、PR review、模板升级、find-related-context
- **知识图（cycle-8+）**：frontmatter 写 `concept_refs` / `related_papers` / `theme_refs` 等显式关系，构建期生成 `src/generated/knowledge-graph.json`；每页底部自动渲染 **Backlinks**（反向链接）/ **旗下内容**（主线）/ **参与记录**（成员）— 无需手维护反向链
- **scaffold + 自检**：`pnpm new:session/paper/member/theme/concept` 一行生成模板（scaffold 已支持 `--concept-refs` / `--related-papers` / `--aliases` / `--co-owners` 等知识图字段 flag），`pnpm verify` 检 schema/链接/命名/死 slug/cycle
- **状态机驱动**：`group.config.yaml` 是 agent 真相源，`stage` 字段（template → initialized → established）决定调哪个 skill
- **冷启动友好**：`pnpm init:group` 30 秒清空 demo、替换品牌、写好配置
- **公私分层**：主线 / 论文解读对外公开吸引合作；个人 reading log / internal playbook 用 Cloudflare Access 锁
- **学术写作**：KaTeX 公式、Mermaid 图、跨术语自动链接、中英文全文搜索（Pagefind）

### ❌ 不能做

- **不替你做研究判断** —"我们组的 take"段必须 PI / 带读人写，agent 只起草事实部分
- **不会自动 commit / push** — 每个 skill 写完都让你看 `git diff` 再决定
- **不会替你写论文笔记内容** — agent 抓 arXiv 元信息 + 起草骨架 + caution banner 标注 agent-draft 段，正文 / take 你写
- **不替代周会本身** — wiki 是周会的**沉淀**，会还是要开
- **不自动翻译英文** — i18n 留 TODO 让人手工译，机翻质量不达标

---

## 🤖 Agent-native 怎么用

### 1. 真相源：`group.config.yaml`

`pnpm init:group` 写入。Agent 进仓库**第一件事**读这个，判断当前状态：

```yaml
stage: initialized          # template | initialized | established
group:
  name: "Your Group"
  github: "your-org/your-repo"
  site_url: "https://..."
pi:
  name: ""                  # first-week-after-init 循环 1 填
  github: ""
content:
  themes_count: 0
  members_count: 1
  papers_count: 1
template:
  baseline_commit: ""       # upgrade-template 维护
  last_synced: ""
```

不要手工改 `stage` —— 由各 skill 在完成关键里程碑后写入。改其他字段用 `pnpm update:group-config`（原子操作，保留 yaml 注释）。

### 2. 第一周编排：5 个对话循环

`first-week-after-init` skill 把"从空架子到上线"拆成 5 个独立可中断的循环：

| 循环 | 主题 | 时长 | 完成判据 |
|------|------|------|---------|
| 1 | PI 主页 | ~15 min | `members/pi.md` 真实，`pi.*` 字段填好 |
| 2 | 第一条研究主线 | ~20 min | `themes/<slug>.md` 一条真实主线 |
| 3 | 核心成员（PI + 1-2 学生） | ~30 min | `members/` ≥ 2 个真实成员 |
| 4 | 第一篇 paper note | ~45 min | `papers/<slug>.md` 含"我们组的 take" |
| 5 | 部署 + Giscus | ~30 min | 站点上线、`stage: established` |

每个循环之间 PI 可以"先停下，明天继续"。Agent 每次重新进入先 `cat group.config.yaml` 看进度。

### 3. 14 个场景化 Skill

按使用频率分 4 类。每个 skill 独立自包含、有"不要做的事"清单。

**Onboarding**

| Skill | 触发 |
|-------|------|
| [`bootstrap-new-group`](.agent/skills/bootstrap-new-group.md) | "把模板初始化为 X 组" |
| [`first-week-after-init`](.agent/skills/first-week-after-init.md) | init 完了，5 个 loop 接管 |
| [`personalized-onboarding`](.agent/skills/personalized-onboarding.md) | 给新生定制阅读路径 |
| [`add-member`](.agent/skills/add-member.md) | 新成员 / 毕业 / alumni |

**周循环**

| Skill | 触发 |
|-------|------|
| [`weekly-session`](.agent/skills/weekly-session.md) | 下周共读 X 论文 |
| [`post-meeting-recap`](.agent/skills/post-meeting-recap.md) | 周会刚结束，整理 transcript |
| [`weekly-digest`](.agent/skills/weekly-digest.md) | 周日发 wiki 周报 |
| [`refresh-theme`](.agent/skills/refresh-theme.md) | 更新主线论文 / 开放问题 |

**内容增长**

| Skill | 触发 |
|-------|------|
| [`add-paper-note`](.agent/skills/add-paper-note.md) | 我读完 X paper，做笔记 |
| [`add-concept`](.agent/skills/add-concept.md) | 解释 X 术语，加到词典 |
| [`find-related-context`](.agent/skills/find-related-context.md) | 写新内容前先问知识图"组里关于 X 的现状是什么" |
| [`setup-deploy`](.agent/skills/setup-deploy.md) | 上线到 Cloudflare Pages |

**治理**

| Skill | 触发 |
|-------|------|
| [`setup-comments`](.agent/skills/setup-comments.md) | 启用 Giscus 评论 |
| [`review-pr`](.agent/skills/review-pr.md) | review 这个 PR |
| [`upgrade-template`](.agent/skills/upgrade-template.md) | 同步上游模板改进 |

### 4. 工具链

```bash
# 自检（CI 必跑）
pnpm verify                                    # schema + 链接 + 命名 + slug_refs 死链 + concept cycle（快）
pnpm verify:full                               # 加跑 build（merge 前必跑）

# 知识图（cycle-8+，写新内容前必跑 context:for）
pnpm build:index                                       # 生成 src/generated/knowledge-graph.json
pnpm context:for concepts/grpo [--depth=2] [--json]    # 看节点 N 跳邻居，写新内容前先问

# Introspect（agent 决策前调用）
pnpm list:members --json [--role=博士生]
pnpm list:sessions --since=7d --source=git --status=A --json
pnpm list:papers --theme=long-context --json

# Scaffold（agent 创建时调用）
pnpm new:session 2026-W19 paper-slug --lead=<member> --json
pnpm new:paper <slug> --title="..." --theme=<theme> --json
pnpm new:member <slug> --role=博士生 --year=3 --json
pnpm new:theme "<name>" --slug=<slug> --json
pnpm new:concept <slug> --full="..." --label="..." --json

# 原子改 group.config.yaml（保留 yaml 注释，不要手 vim）
pnpm update:group-config --site-url=... --giscus-repo-id=... --baseline-commit=...
```

> ⚠ `list:* --since=Nd` 默认按文件 mtime 过滤，**会被 init / git checkout 刷 mtime 干扰**。digest / 增量场景必须加 `--source=git`，按 git 历史过滤。

---

## 🏗️ 架构概览

```
Group-Reading-Wiki/
│
├── AGENT_GUIDE.md            ← Agent 入口（任何 AI 第一次见仓库读这个）
├── group.config.yaml         ← Agent 真相源（init 时生成）
│
├── .agent/                   ← Agent 长期记忆 + skill 库
│   ├── BOOTSTRAP.md          ← stage 状态机入口
│   ├── context/              ← repo-map / role-model / conventions
│   ├── skills/               ← 14 个场景化 skill
│   └── templates/            ← 原始模板备份
│
├── src/content/docs/         ← Astro Starlight 内容（自动转 sidebar）
│   ├── themes/ members/ sessions/ papers/ concepts/
│   ├── onboarding.md  welcome.md  roadmap.md
│   └── en/                   ← 英文镜像（i18n）
│
├── scripts/                  ← Agent 友好的工具链（每个支持 --json）
│   ├── init-group.mjs        ← Use-template 后一键改组（含 demo 清洗）
│   ├── verify.mjs            ← schema + link + naming 自检
│   ├── list.mjs              ← introspect（含 --source=git mode）
│   ├── new-{session,paper,member,theme,concept}.mjs
│   ├── update-group-config.mjs ← 原子改 yaml（保留注释）
│   └── smoke-test-fork.mjs   ← 冷启动 E2E
│
├── docs/                     ← 维护文档（UPGRADING / STYLE_GUIDE / MAINTAINER_PLAYBOOK）
└── .github/workflows/        ← CI（verify on PR）
```

详细：[`.agent/context/repo-map.md`](.agent/context/repo-map.md)

---

## 🚢 部署

### 推荐：Cloudflare Pages（免费 + CI 自动）

1. Cloudflare Dashboard → **Workers & Pages → Create → Connect to Git → 选你的仓库**
2. 构建配置：
   - Framework preset：`Astro`
   - ⚠ **手动覆盖** Build command 为 `pnpm build`（preset 默认 `npx astro build`，monorepo 易出错）
   - Build output：`dist`
   - Env：`NODE_VERSION=22.12`
3. ⚠ 如果仓库在 **GitHub 组织**下：先在 org settings → Third-party access → Cloudflare Pages 做 **org-level 授权**，否则 OAuth flow 会卡
4. 部署成功后回写：
   ```bash
   pnpm update:group-config --deploy-url=https://<your-sub>.pages.dev
   ```

每次 push 自动部署，PR 有独立预览 URL。免费额度 500 build/月 + 无限带宽，对 wiki 完全够。

### Giscus 评论（可选）

1. 装 [Giscus GitHub App](https://github.com/apps/giscus) 到你的仓库
2. 仓库 Settings → General → Features → **Discussions ON**
3. 去 [giscus.app/zh-CN](https://giscus.app/zh-CN) 配置，复制 2 个 runtime ID（`data-repo-id` + `data-category-id`）
4. 写回：
   ```bash
   pnpm update:group-config \
     --giscus-repo-id=R_kg... \
     --giscus-category-id=DIC_kw...
   ```

详见 [`setup-deploy`](.agent/skills/setup-deploy.md) / [`setup-comments`](.agent/skills/setup-comments.md) skill。

### 私域内容（Cloudflare Access）

`/internal/`、`/members/<x>/` 等敏感路径用 Cloudflare Access 配 SSO 鉴权，外部人看不到。免费额度内。

### 替代部署：Vercel / Netlify / GitHub Pages

均兼容。GitHub Pages 需在 `astro.config.mjs` 加 `base: '/<repo>/'`。

---

## 💡 使用建议

- **写得不完美 + 发出来 > 完美 + 私藏** — 占位 / TODO 段不会让 verify 报错；agent 起草段会带 caution banner 标注，PI 后审就好
- **PI 写作成本要极低** — "PI 的 take" 段允许一段话；让 agent 起草初稿，PI 改两笔即可
- **用 Discussions 评论区让组员低成本贡献** — 不必每次开 PR，一句话也算

---

## 🛠️ 技术栈

- **[Astro 6](https://astro.build/)** + **[Starlight 0.38](https://starlight.astro.build/)** — 静态文档站点
- **[KaTeX](https://katex.org/)** — 数学公式（构建期渲染）
- **[Mermaid](https://mermaid.js.org/)** — 流程图（lazy load 客户端渲染）
- **[Pagefind](https://pagefind.app/)** — 全文搜索（含中文分词）
- **[Giscus](https://giscus.app/)** — GitHub Discussions 评论
- **[Cloudflare Pages](https://pages.cloudflare.com/)** + **[Access](https://www.cloudflare.com/zero-trust/products/access/)** — 部署 + 鉴权
- Node 22.12+ · pnpm 10.x

---

## 🤝 贡献

- **用模板的研究组** — 在你的 README 加一句 `Based on [Group-Reading-Wiki](https://github.com/Haimbeau1o/Group-Reading-Wiki)`，让其他组找到
- **想改进模板的开发者** — 用**传统 fork**（不是 Use this template！）后开 PR，详见 [`CONTRIBUTING.md`](CONTRIBUTING.md)

报 bug：[New Issue](https://github.com/Haimbeau1o/Group-Reading-Wiki/issues/new/choose)

---

## 📜 协议

- **代码**（`scripts/` `astro.config.mjs` `.agent/skills/` 等）：[MIT](LICENSE)
- **内容**（`src/content/docs/` 下的 markdown）：[CC BY-SA 4.0](LICENSE)

---

<div align="center">

**Group Reading Wiki** · Built for AI research labs · Powered by [Astro Starlight](https://starlight.astro.build/)

[Top ↑](#group-reading-wiki) · [Agent Guide](AGENT_GUIDE.md) · [English](README.en.md)

</div>
