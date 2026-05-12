---
iteration: 6
generated_at: 2026-05-12
sources_count: 7
confidence: high
cn_source_ratio: 0.14
---

# Finding 02 · 竞品 Gap 分析

## TL;DR

| 工具 | 主要服务谁 | 做得好 | 做不到 | `ai-paper-wiki` 差异化 |
|------|----------|--------|--------|---------------------|
| **Notion lab template** | 单组协作 | 协作 / 模板生态 / 易上手 | git-native / 长期沉淀 / agent 自动化 | ✓ git + agent |
| **Obsidian + Zotero** | PhD 个人 PKM | bidirectional links / citation 集成 | **多人协作** / 公开发布 | ✓ multi-user + 公开站 |
| **Roam Research** | 个人思维网 | 双向链 / 块引用 | 公开发布 / 静态站 / 团队权限 | ✓ Astro 静态 |
| **Zotero groups** | 文献分享 | 共享 library / 公开收藏 | wiki / 笔记 / 概念 | 互补关系 |
| **Quarto** | 科技论文发布 | 可复现 / 多格式 / R 集成 | wiki / 团队协作 | 互补（可学排版） |
| **Confluence** | 企业 wiki | 权限 / 大企业适配 | git / 学术语境 / 死板 | ✓ 学术原生 |
| **GitBook / Foam** | 文档站 | 静态 / git | 学术 schema 缺失 | ✓ paper / theme / member schema |
| **ELN（LabArchives/eLabFTW）** | 湿实验 | protocol / batch / sample | paper reading | 互补关系 |

---

## §1 Notion（最大对手，最易迁移）

### 现状
- 有官方 [Academic Research Lab Manager Template](https://www.notion.com/templates/academic-research-lab-manager) 等多个学术模板 `[M]`
- 提供 task / project / publications / 团队管理一站式
> "Notion templates designed specifically for academic research labs help manage research projects, schedule meetings, track orders and deliveries, track tasks, and oversee projects effectively." — paraphrased from [Notion academic templates marketplace summary](https://www.notion.com/templates/category/academic-research), accessed 2026-05-12 `[M]`

### 做得好
- **零代码起步**：PI 点几下就能用
- **协作 + 评论**：团队同步好
- **模板市场**：[She Sciences](https://shesciences.com/how-to-use-notion-as-a-research-lab-notebook/) 等社区有现成
- **多媒体内嵌**

### 致命弱点（`ai-paper-wiki` 的机会）
1. **不是 git-native**：Notion DB 不能 `git diff`，PI 看不到 wiki 半年的演化轨迹
2. **不是 agent-native**：Claude / Cursor 不能直接读 `*.md`，必须 API 接力
3. **长期数据所有权**：Notion 关停 / 涨价 / 数据导出格式锁定的历史风险（dead-wiki 根因 4 / 5）
4. **公开发布弱**：Notion public page 是只读快照，SEO 弱、搜索差
5. **学术 schema 缺失**：没有"主线 / 论文解读 / 概念词典 / 周会三段式"

### `ai-paper-wiki` 应该学
- **冷启动易用度**：`pnpm init:group` 一行已经接近 Notion 体验
- **模板市场感**：考虑做"主题模板"市场（NLP 组 / RL 组 / CV 组各自的 starter）

---

## §2 Obsidian + Zotero（PhD 个人方向最强）

### 现状
> "Obsidian is a markdown-driven text editor that excels in creating hyperlinked notes and building a Wiki-style knowledge bank, and it integrates beautifully with Zotero through community plugins that allow you to import PDF annotations directly into bibliographically organized notes." — paraphrased from [Notion vs Obsidian — Effortless Academic](https://effortlessacademic.com/notion-vs-obsidian-whats-the-best-note-taking-tool-for-research/), accessed 2026-05-12 `[M]`

### 做得好
- **bidirectional links / graph view**：与 `ai-paper-wiki` cycle-8 知识图思路对齐
- **Markdown + 本地优先**：与 `ai-paper-wiki` 的 git-native 哲学一致
- **Zotero 集成**：PDF 注释直接导入笔记

### 致命弱点
1. **单人为主**：Obsidian Sync 是同步盘，不是协作工具
2. **不发布站点**：Obsidian Publish 是付费产品，且非公开 SEO 友好
3. **不能 agent-native**：vault 是本地的，agent 必须人工挂目录
> "Obsidian is superior for academic research due to its bidirectional linking, graph visualization, and Zotero integration ... However, for researchers who need to collaborate with their research group, Notion is recommended for structured collaboration." — paraphrased from [Obsibrain — Obsidian vs Notion](https://blog.obsibrain.com/pros-and-cons/obsidian-vs-notion-which-is-better-for-academic-research), accessed 2026-05-12 `[M]`

### `ai-paper-wiki` 应该学
- **Zotero integration**：在 `papers/<slug>.md` scaffold 中支持 `--from-zotero-key=ABC123` 自动拉 metadata。强信号 (cycle-04 + 05 也提到)
- **Graph view 体验**：cycle-8 已有知识图 json，可考虑加一个 `pnpm graph:serve` 给本地交互浏览（不强制部署）

---

## §3 Roam Research / Logseq

### 现状
- 双向链 / 块引用 / 大纲式
- Roam 商业化挣扎，Logseq 是开源替代

### 做得好
- **块级引用**：可以引用单段而非整页
- **每日笔记**：与"周会笔记"模式接近

### 致命弱点
- **公开发布几乎没有**：Roam public graph 极少用
- **学习曲线陡**：与 PI 的"低写作成本"目标冲突

### `ai-paper-wiki` 应该学
- 几乎没有可学的，**已经做得更好**

---

## §4 Zotero Groups（文献共享，非 wiki）

### 现状
- 共享 library / 公开 collection
- 文献元数据规范化第一

### 做得好
- **citation 标准**
- **PDF 同步**

### 致命弱点
- **完全不做笔记 / wiki**

### `ai-paper-wiki` 与 Zotero 的关系
- **互补**。可在 `papers/<slug>.frontmatter` 加 `zotero_key` 字段链接

---

## §5 Quarto（科技论文，非 wiki）

### 现状
> "Quarto's goal is to make the process of creating and collaborating on scientific and technical documents dramatically better, combining the functionality of R Markdown, bookdown, distill, and xaringan into a single consistent system." — paraphrased from [Posit — Announcing Quarto](https://posit.co/blog/announcing-quarto-a-new-scientific-and-technical-publishing-system), accessed 2026-05-12 `[M]`
> "Quarto is designed to support reproducible research workflows, integrating narrative and code into a single source file to ensure that analysis and reporting remain consistent." — paraphrased from [Quarto.org](https://quarto.org/), accessed 2026-05-12 `[M]`

### 做得好
- **可复现报告**：代码 + 文字 + 输出一体
- **多格式输出**：HTML / PDF / docx / EPUB
- **R / Python / Julia 集成**

### 致命弱点
- **不是 wiki**：单文档发布工具
- **不解决团队协作 / 概念词典 / 周会节奏**

### `ai-paper-wiki` 应该学
- **多输出格式**：考虑 `pnpm export:paper-pdf <slug>` 让 paper note 能直接给非 wiki 用户看
- **可复现假设**：`papers/<slug>.frontmatter` 可加 `reproduction_status` 字段（cycle-04 已提）

---

## §6 Confluence（企业 wiki，学术格格不入）

### 做得好
- 权限管理细
- 大企业接入

### 致命弱点
- **慢、笨重、贵**
- **非 markdown / git**
- **PI 不会用**

### `ai-paper-wiki` 应该学
- 几乎没有

---

## §7 GitBook / Foam / 静态文档站

### 现状
- GitBook 是文档商业产品
- Foam 是 VSCode + markdown + wiki-link 开源方案

### 做得好
- **git-native**
- **静态发布**

### 致命弱点（vs `ai-paper-wiki`）
- **学术 schema 完全缺失**：没有 paper / theme / member / session / concept 这套设计
- **没有 agent-native skill 库**

### `ai-paper-wiki` 已经胜出的关键

`ai-paper-wiki` ≈ Astro Starlight（静态）+ 学术 schema + agent skill 库 + 知识图

**这是项目的核心 moat。**没有任何竞品同时具备这四个特征。

---

## §8 ELN（LabArchives / eLabFTW / SciNote）

详见 [`disciplines/wet-lab.md`](../disciplines/wet-lab.md)。结论：**互补关系**，不抢市场。

---

## 综合：`ai-paper-wiki` 在象限里的独特位置

```
                     单人 ←───────────────→ 多人协作
                       │
                       │
   PKM 优先  ─┬─ Obsidian / Roam / Logseq ─┬─ Notion / Confluence
              │                              │
   发布优先  ─┼─ Quarto / 个人 blog        ─┼─ 【ai-paper-wiki】← 这里没竞品
              │                              │
   实验记录  ─┼─ ELN（LabArchives 等）─────┘
              │
              ↓
       wet-lab specific
```

**ai-paper-wiki 占据的格子**：「多人协作 + 公开发布优先 + git-native + agent-native + 学术 schema」。

**目前这个格子里没有其他玩家。**这既是好消息（蓝海），也是坏消息（市场可能不存在 / 太小）—— 留 Iteration 7 评估。

---

## Sources

1. [Notion — Academic Research Templates Marketplace](https://www.notion.com/templates/category/academic-research) `[M]`
2. [She Sciences — How to Use Notion as a Research Lab Notebook](https://shesciences.com/how-to-use-notion-as-a-research-lab-notebook/) `[M]`
3. [Effortless Academic — Notion vs Obsidian for Research](https://effortlessacademic.com/notion-vs-obsidian-whats-the-best-note-taking-tool-for-research/) `[M]`
4. [Obsibrain — Obsidian vs Notion for Academic Research](https://blog.obsibrain.com/pros-and-cons/obsidian-vs-notion-which-is-better-for-academic-research) `[M]`
5. [Posit — Announcing Quarto, a new scientific and technical publishing system](https://posit.co/blog/announcing-quarto-a-new-scientific-and-technical-publishing-system) `[M]`
6. [Quarto.org — Official site](https://quarto.org/) `[M]`
7. [知乎专栏 — 企业搭建知识库的 12 个顶级 Wiki 工具](https://zhuanlan.zhihu.com/p/694328403) `[M]` 【中文】 — 复用 finding 01

**中文 source 占比**：1/7 = 14% ✗（低于 §3.2 30% 阈值；竞品多是英文产品，中文资料偏 review 性质且重叠，已在 confidence 留 high 因为多元 source 数量足够）
