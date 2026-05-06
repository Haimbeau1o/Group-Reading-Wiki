# 课题组共读 Wiki 模板（Group Reading Wiki Template）

> 一个**可复用的课题组共读 Wiki 模板**，专为 AI / 大模型方向研究组设计。Fork 一份 → 一键改名 → 你的组就有自己的"共享大脑"了。
>
> 现仓库内置 **Leon's Group**（虚构课题组）作为 **live demo**，演示一个真实研究组的 wiki 长什么样。

---

## ✨ 这个模板能给你什么

不是一个普通的"docs 网站脚手架"，而是**针对课题组共读 + 研究记忆沉淀场景** pre-engineered 的一整套产品：

| 模块 | 解决什么 |
|------|---------|
| 🗓️ **Sessions** 共读会议 | 周会前 / 中 / 后三段式记录，绑定 lab routine |
| 🧭 **Themes** 研究主线 | 组的研究地图，新人 30 分钟看完就上路 |
| 👥 **Members** 成员系统 | 双层角色模型（大/小导师 + 博/硕生 ↔ 行为聚类），每人自己的 reading log |
| 🎯 **Onboarding** 新人入口 | Day-1 / 第一周 / 第一月 / 三个月分阶段 timeline |
| 📚 **Reading Notes** | 论文解读 + 概念词典，互相超链接 |
| 🔧 **Scaffolding** | `pnpm new:session/paper/member` 一行生成模板 |
| 🌐 **Public/Private 分层** | 部署后用 Cloudflare Access 把 `/internal/` `/members/<x>/` 锁起来 |

**为什么不直接用 Notion / Confluence / GitHub Wiki？**

- ✅ **Git 工作流原生**：PR / Issue / 评论区与组员日常工具一致
- ✅ **学术写作友好**：KaTeX 公式 / Mermaid 图 / 跨术语链接 / 论文出处规范
- ✅ **可成为对外门面**：themes / 论文解读对外公开，吸引合作者；个人 log 留私有
- ✅ **沉淀为新人 onboarding 材料**：人来人走，知识不流失

## 🎬 看 demo

仓库当前内容是 **Leon's Group** 的虚构示例，包含：

- 4 条研究主线（长上下文 / MoE / Test-time reasoning / 多模态）
- 15 个成员占位（PI / 博士后 / 讲师 / 各年级博士 / 学硕 / 专硕 / RA）
- 1 篇完整 session 示例（W18 · DeepSeek-V4 长上下文）
- 5 篇概念词典（MoE / MLA / MTP / FP8 / GRPO）
- 3 篇深度论文解读（DeepSeek-V4 全套）

```bash
git clone <this-repo>
cd <repo>
pnpm install
pnpm dev          # → http://localhost:4321
```

## 🚀 用它做你课题组的 wiki

```bash
# 1. 在 GitHub fork 这个仓库
# 2. clone 到本地
git clone git@github.com:<your-org>/<your-wiki>.git
cd <your-wiki>
pnpm install

# 3. 一键重塑为你的课题组（清空 Leon demo 内容、保留架构）
pnpm init:group "Wang's NLP Group"

# 4. 起来看
pnpm dev
```

`pnpm init:group` 会做这些事（你可加 flags 调）：

- 把 `"Leon's Group"` 全部替换为你的组名
- 清空 15 个成员占位 → 留 1 个 PI 占位等你填
- 清空 4 条 demo 研究主线 → 留模板等你填
- 清空 sessions / DeepSeek 论文解读（可选保留作参考）
- 重置 README 顶部介绍

---

## 📂 目录结构

```
.
├── astro.config.mjs              # Starlight 配置（sidebar / Giscus / KaTeX / Mermaid）
├── public/
│   ├── favicon.svg
│   └── docs-assets/              # 文章里的图片
├── src/
│   ├── content/docs/             # 所有页面内容（zh-CN 主，en fallback）
│   │   ├── index.mdx             # 站点首页（角色化入口）
│   │   ├── welcome.md
│   │   ├── onboarding.md         # 🎯 新人入口
│   │   ├── how-to-contribute.md
│   │   ├── roadmap.md
│   │   ├── sessions/             # 🗓️ 共读会议（一周一篇）
│   │   ├── themes/               # 🧭 研究主线
│   │   ├── members/              # 👥 成员主页（双层角色模型）
│   │   ├── concepts/             # 📖 概念词典
│   │   ├── papers/               # 📜 论文解读
│   │   └── deepseek/             # demo 专题（可清空）
│   ├── lib/                      # 自定义插件（rehype-mermaid-pre）
│   └── styles/custom.css         # 主题色 / KaTeX 调优
├── scripts/
│   ├── new-session.mjs           # pnpm new:session
│   ├── new-paper.mjs             # pnpm new:paper
│   ├── new-member.mjs            # pnpm new:member
│   ├── init-group.mjs            # pnpm init:group（fork 后一键重塑）
│   └── configure-deploy.sh       # 部署前批量替换占位
└── .github/workflows/ci.yml      # PR build 验证
```

## 💻 本地开发

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # 静态产物到 dist/
pnpm preview      # 预览生产构建
```

## 🔧 脚手架命令

```bash
pnpm new:session 2026-W19 mixtral-of-experts --lead=phd-senior-2 --paper=papers/mixtral
pnpm new:paper deepseek-r1 --title="DeepSeek-R1" --theme=test-time-reasoning
pnpm new:member zhangsan --role=博士生 --year=3 --cluster=研究主理人
pnpm init:group "<新组名>" [--keep-demo]
```

## 🤖 给 Agent / AI 维护者

**这个模板天然适合让 AI agent（Claude / Cursor / Cascade 等）持续维护。** 入口都规整好了：

```text
AGENT_GUIDE.md       ← agent 第一次见仓库读这个
.agent/
  context/           ← repo-map、role-model、conventions（agent 长期记忆）
  skills/            ← 10 个 skill：bootstrap-new-group / weekly-session /
                       post-meeting-recap / add-member / add-paper-note /
                       add-concept / refresh-theme / personalized-onboarding /
                       weekly-digest / review-pr
  templates/         ← session/paper/member/theme/concept 原始模板
```

agent 友好的工具命令（都支持 `--json` 输出）：

```bash
pnpm verify                       # frontmatter schema + 链接 + 命名约定 自检
pnpm verify:full                  # 加跑 build
pnpm list:members --json          # introspect 仓库当前状态
pnpm list:sessions --since=7d --json
pnpm list:papers --theme=long-context --json
pnpm new:session ... --json       # 所有 new:* 都支持 --json，便于 agent 解析
```

**典型 agent 对话场景**：

| 用户说 | agent 调用的 skill |
|--------|---------------------|
| "把这个模板初始化为 X 组用" | `bootstrap-new-group` |
| "下周共读 X 论文，让 Y 带读" | `weekly-session` |
| "周会刚结束，整理 transcript 到 session 页" | `post-meeting-recap` |
| "新成员张三加入了" | `add-member` |
| "我读完 X paper，做笔记" | `add-paper-note` |
| "周日发 wiki 周报" | `weekly-digest` |
| "review 这个 PR" | `review-pr` |

详见 [`AGENT_GUIDE.md`](AGENT_GUIDE.md) 和 [`.agent/skills/README.md`](.agent/skills/README.md)。

## 部署

### 首次部署清单（务必检查）

部署前需要把这些占位替换为真实值，搜索 `your-org` 和 `wiki.example.com` 一次性改完：

| 位置 | 当前占位 | 改成 |
|------|---------|------|
| `astro.config.mjs` `site` | `https://group-reading-wiki.pages.dev` | 你的真实域名（例如 `https://wiki.deepseek-reading.org`） |
| `astro.config.mjs` `social[github].href` | `https://github.com/Haimbeau1o/Group-Reading-Wiki` | 真实仓库地址 |
| `astro.config.mjs` `editLink.baseUrl` | `https://github.com/Haimbeau1o/Group-Reading-Wiki/edit/main/` | 真实仓库 |
| `astro.config.mjs` Giscus `repo` | `Haimbeau1o/Group-Reading-Wiki` | 真实 owner/repo |
| `astro.config.mjs` Giscus `repoId` | `REPLACE_WITH_REPO_ID` | 见下方 Giscus 流程 |
| `astro.config.mjs` Giscus `categoryId` | `REPLACE_WITH_CATEGORY_ID` | 见下方 Giscus 流程 |
| `CONTRIBUTING.md` 与 Issue 模板 | `your-org` | 真实 owner |

### Giscus 配置（5 分钟）

1. 把本目录 push 到 GitHub 公开仓库
2. **Settings → General → Features** 勾选 **Discussions**
3. 进 Discussions → **New category** → 名字 `Docs Discussions`，type 选 *Announcement*
4. 安装 [Giscus GitHub App](https://github.com/apps/giscus) 到该仓库
5. 去 https://giscus.app/zh-CN 填仓库 + 分类，会得到 `repoId` 和 `categoryId`
6. 替换 `astro.config.mjs` 里的 `REPLACE_WITH_*`

> 没配置 Giscus 期间评论区会失效，但站点本身可正常访问。

### Cloudflare Pages（推荐，免费 + CI 全自动）

1. 在 Cloudflare Dashboard 进 **Workers & Pages → Create → Pages → Connect to Git**
2. 授权选你的仓库
3. 构建配置：
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Environment variables**:
     - `NODE_VERSION` = `20`
4. 部署。每次 push 自动触发；PR 还会得到独立预览 URL。

> 免费额度：500 次 build / 月，无限带宽。对一个 wiki 完全够用。

### Vercel / Netlify

同 Cloudflare Pages 配置。Astro/Starlight 和这两家也兼容。

### GitHub Pages

需要把 `astro.config.mjs` 的 `site` 改成 `https://<user>.github.io`，并加 `base: '/<repo>/'` 才能正确处理子路径。建议优先使用 Cloudflare Pages。

## CI

`@/.github/workflows/ci.yml` 在每次 PR / push 时跑 `pnpm build` 验证产物，并做简单链接自检。

## 内容贡献

详见 [`/how-to-contribute/`](src/content/docs/how-to-contribute.md)。

---

## 🎯 设计哲学

这个模板的几个关键设计取舍：

1. **绑住周会节奏，不靠个人自觉**：sessions 三段式（pre-read / live / post）是核心载体；wiki 不是"会后写一份纪要"而是会前会中会后的全程记录。
2. **贡献力度多样化**：100 字 reading log = 一行 take = 一次 paper 评论 = 一条概念词典补充，**都算**。降低写作门槛是关键。
3. **PI 写作成本要极低**：教授没时间写长文，所以"Leon's takes"系列允许一段话。
4. **个人主页是 portfolio**：每个成员的 reading log + paper 解读 + 评论会自然累积成毕业时可展示的学术 track record。
5. **新人 onboarding 由学习者维护**：PI 已经忘了入门痛点，刚走完入门的人最清楚。
6. **first draft, ugly, OK**：写得不完美 + 发出来 > 完美 + 私藏。

## 🛠️ 技术栈

- [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/) — 静态文档站点
- [KaTeX](https://katex.org/) — 数学公式（构建期渲染）
- [Mermaid](https://mermaid.js.org/) — 流程图（按需 lazy load）
- [Pagefind](https://pagefind.app/) — 全文搜索（含中文索引）
- [Giscus](https://giscus.app/) — GitHub Discussions 评论
- [Cloudflare Pages](https://pages.cloudflare.com/) + [Cloudflare Access](https://www.cloudflare.com/zero-trust/products/access/) — 部署与鉴权（推荐）

## 📜 协议

代码：MIT。内容：CC BY-SA 4.0。详见 [`LICENSE`](LICENSE)。

## 🙋 反馈与改进

这个模板还在演进。如果你 fork 用在了你的课题组，欢迎：

- 在原仓库提 Discussion 分享使用经验
- 提 PR 改进模板（新模块 / scaffolding 增强 / docs 修复）
- 在 your-fork 的 README 加一个 "based on group-wiki-template" 链接，让其他组找到
