# AGENT_GUIDE — 给 AI Agent 的本仓库使用手册

> **如果你是 LLM agent**（Claude Code / Cursor / Cascade / Devin / ChatGPT 等），先读这一篇，再读 [`.agent/BOOTSTRAP.md`](.agent/BOOTSTRAP.md) 和具体场景的 skill。**人类用户**也可以读这份，了解 agent 化使用方式。

## 0. 这是什么仓库

一个**可复用的课题组共读 Wiki 模板**。两种使用模式：

1. **看 demo**：仓库内置 "Leon's Group"（虚构课题组）作为 live demo（[live URL](https://group-reading-wiki.pages.dev)）
2. **fork 自用**：其他课题组点 GitHub `Use this template` → `pnpm init:group "<我们组的名字>"` 一键重塑为自己的 wiki

模板设计为 **agent-native** —— 大多数维护工作（建 session、加成员、写 paper note、整理纪要、生成 digest）都可以由 agent 代劳，PI 只负责定方向、审 take。

---

## 1. 进仓库的第一动作（必做）

不要直接读用户的请求就开干。**先判断仓库当前状态**，否则会错调 skill。

```bash
# 第一件事：读 group.config.yaml 看 stage
cat group.config.yaml
```

| `stage` | 含义 | 你下一步 |
|---------|------|---------|
| 文件**不存在** / `template` | 仓库刚 clone，还在 demo 状态 | 调 [`bootstrap-new-group`](.agent/skills/bootstrap-new-group.md) |
| `initialized` | init 跑过，但 `pi.name` 等还空 | 调 [`first-week-after-init`](.agent/skills/first-week-after-init.md) 接管 5 个对话循环 |
| `established` | wiki 已上线、有真实内容 | 按用户具体请求选 skill（见 §2 场景表） |

详细决策树见 [`.agent/BOOTSTRAP.md`](.agent/BOOTSTRAP.md)。

---

## 2. 你（agent）应该知道的核心概念

| 概念 | 文件 | 一句话理解 |
|------|------|----------|
| **真相源** | `group.config.yaml` | 由 init 写入。`stage` / `pi.*` / `content.*` / `template.*` 是 agent 决策依据，不要手 vim |
| **状态机入口** | `.agent/BOOTSTRAP.md` | stage → skill 映射决策树 |
| **角色模型** | `.agent/context/role-model.md` | 双层：简化 4 类（大/小导师/博/硕）↔ 完整 5 类聚类 |
| **目录约定** | `.agent/context/repo-map.md` | 7 个内容模块：sessions / themes / members / concepts / papers / onboarding / how-to-contribute |
| **写作约定** | `.agent/context/conventions.md` | frontmatter schema、命名、跨链接规则 |
| **可用技能** | `.agent/skills/*.md` | 15 个场景 skill（见 §2 场景表） |
| **知识图（cycle-8+）** | `src/generated/knowledge-graph.json` | 由 `pnpm build:index` 生成。用 `pnpm context:for <slug>` 查邻居；写新内容前先跑 |
| **可用脚本** | `package.json` scripts | `pnpm new:*` / `verify` / `list:*` / `update:group-config` |

---

## 3. 场景 → 技能映射（最常查的表）

按 4 类分组。每个 skill 文件底部有"演练发现总结"段记录 dogfood / 静态扫描时踩的坑。

### Onboarding（PI 首次建组）

| 用户说什么 | 你应该读哪个 skill | 主要命令 |
|-----------|------------------|---------|
| "fork 这个模板给我们 X 组用" | [`bootstrap-new-group`](.agent/skills/bootstrap-new-group.md) | `pnpm init:group` |
| "init 完了，下一步呢？" / "帮我填好这个 wiki" | [`first-week-after-init`](.agent/skills/first-week-after-init.md) | 5 个对话循环编排 |
| "新生 X 来了，研究兴趣是 Y" | [`personalized-onboarding`](.agent/skills/personalized-onboarding.md) | 生成定制 reading list |
| "新成员 X 加入了" / "X 毕业了" | [`add-member`](.agent/skills/add-member.md) | `pnpm new:member` |

### 周循环（每周固定）

| 用户说什么 | 你应该读哪个 skill | 主要命令 |
|-----------|------------------|---------|
| "下周共读 X 论文 / 排个 session" | [`weekly-session`](.agent/skills/weekly-session.md) | `pnpm new:session` |
| "周会刚开完，transcript 在 X" | [`post-meeting-recap`](.agent/skills/post-meeting-recap.md) | 编辑现有 session 文件 |
| "周日给我生成本周 digest" | [`weekly-digest`](.agent/skills/weekly-digest.md) | `pnpm list:* --since=7d --source=git --status=A` |
| "更新 long-context 主线" | [`refresh-theme`](.agent/skills/refresh-theme.md) | 编辑 `themes/*.md` |

### 内容增长（按需）

| 用户说什么 | 你应该读哪个 skill | 主要命令 |
|-----------|------------------|---------|
| "我读完 X 论文，做笔记" | [`add-paper-note`](.agent/skills/add-paper-note.md) | `pnpm new:paper` + Keshav 三遍法 |
| "解释一下 GRPO 并加到词典" | [`add-concept`](.agent/skills/add-concept.md) | `pnpm new:concept` |
| "组里有没有写过 X？" / 写新内容前先调研 | [`find-related-context`](.agent/skills/find-related-context.md) | `pnpm context:for <slug>` |
| "把站点上线 / 部署" | [`setup-deploy`](.agent/skills/setup-deploy.md) | Cloudflare Pages 配置 |

### 治理（不常调）

| 用户说什么 | 你应该读哪个 skill | 主要命令 |
|-----------|------------------|---------|
| "启用评论区 / Giscus" | [`setup-comments`](.agent/skills/setup-comments.md) | `pnpm update:group-config --giscus-*` |
| "帮我 review 这个 PR" | [`review-pr`](.agent/skills/review-pr.md) | `gh pr checkout` + `pnpm verify:full` |
| "拉模板最新改进" / "同步 upstream" | [`upgrade-template`](.agent/skills/upgrade-template.md) | `git fetch upstream` + 选择性 checkout |

---

## 4. 你应该遵守的工作流约束

### 4.1 写之前

1. **永远先 `cat group.config.yaml`** 判 stage（见 §1）
2. **检查仓库状态**：`git status` 看是否干净
3. **读相关 skill 全文**（不要只看 §2 场景表的一句话定位）
4. **了解现状**：
   - 全局：`pnpm list:members --json` / `pnpm list:themes --json` / `pnpm list:sessions --source=git --since=7d --json`
   - **针对某节点**（cycle-8 起强烈推荐）：`pnpm -s context:for <slug> [--depth=2]` —— 一次返回该节点 N 跳邻居（papers / concepts / sessions / themes / members），比拼装多个 list:* 命令准。写 paper / session / concept / 给新生定 reading list 前都跑一下；详见 [`find-related-context`](.agent/skills/find-related-context.md) skill

### 4.2 写之中

1. **优先用脚手架命令**（`pnpm new:*`）而不是直接写文件 —— 命令封装了 frontmatter schema 与命名约定
2. **用 `--json` 模式 + `pnpm -s`** 让输出可解析（`-s` 静默 pnpm 自身的 header 输出）
3. **不要修改的文件**（除非用户明确要求）：`package.json`、`astro.config.mjs`、`scripts/*.mjs`、`.agent/*`
4. **改 `group.config.yaml`** → 一律用 `pnpm update:group-config`，不要手 vim（保留注释 + 字段顺序的关键）
5. **agent 起草段必须标 caution banner**：

   ```markdown
   :::caution[Agent 起草 · 等 PI 校对]
   以下内容由 agent 从 paper §3.2 起草，**请 PI 校对准确性**。
   :::
   ```

   方便 PI 一眼看出哪部分是事实复述、哪部分需要判断

### 4.3 写之后

1. **必跑** `pnpm verify`（schema + 链接 + 命名 + slug_refs 死链 + concept cycle）
2. **改了 frontmatter 知识图字段**（`concept_refs` / `theme_refs` / `related_papers` / `aliases` 等）→ 跑 `pnpm build:index`，再 `pnpm context:for <slug>` 验证邻居确实出现（cycle-8 起强制）
3. **重要场景跑** `pnpm verify:full`（额外跑 `pnpm build`，merge 前必跑；`build` 会自动先 `build:index`）
4. **报告**：列出本次创建/修改的文件 + 验证结果 + 是否要 PI 看 git diff
5. **不要自动 commit / push** —— 除非用户**明确**说"commit and push"

### 4.4 错误恢复

- **frontmatter 错误**：`pnpm verify` 报哪个文件哪行；修正后再跑
- **死链**：verify 也会报；如果链接指向已删 demo 路径（如 `/deepseek/...`），整行删掉或问用户替换
- **build 失败**：看 stack trace 定位文件 → 修正 → 再 build
- **不确定怎么做**：**问用户**，不要瞎猜

### 4.5 数据查询的注意事项

- `pnpm list:* --since=Nd` 默认按 **filesystem mtime** 过滤 — `init` / `git checkout` / 批量改文件会刷 mtime → **不可靠**
- `weekly-digest` 等"本周新增"场景**必须加 `--source=git --status=A`**，按 git 历史过滤

---

## 5. 用户对话范例

### 范例 A：周一会后整理（post-meeting-recap）

```
用户：刚开完会，transcript 在 /tmp/w19-meeting.txt，帮我填到 sessions/2026-w19-deepseek-r1.md

agent：（读 .agent/skills/post-meeting-recap.md）好。

  前置检查：
  ✓ sessions/2026-w19-deepseek-r1.md 存在
  ✓ Live notes 还是占位
  ✓ Post-meeting 还是占位

  我会做以下事：
  1. 读 transcript 提取讨论结构（4 时段）
  2. 写 Live notes（按主题切分，不严格按时间）
  3. 写 Post-meeting：5 条 Key insights（带 PI 标记）+ 4 条 Action items（带 W22 这种具体周次）
  4. status 从 upcoming → archived
  5. 跑 pnpm verify

  开始？

用户：开始

agent：（执行）✓ 完成。修改 1 个文件。
       Action items（4 条，已 @）：
         - @phd-senior-1: 最小 GRPO 复现 G=8（截止 W22）
         - @ms-research-1: 补 GRPO 词条（截止 W20）
         - ...
       verify 通过。要 git diff 看一下吗？
```

### 范例 B：bootstrap（新 PI 第一次见仓库）

```
用户：把这个模板初始化为 Wang's NLP Group

agent：（cat group.config.yaml → 不存在，stage = template）
      （读 .agent/skills/bootstrap-new-group.md）

  我会跑 init:group。这会：
    - 替换所有 "Leon's Group" 引用 → "Wang's NLP Group"
    - 删 14 个 demo 成员、4 条 demo themes、deepseek/ 专辑
    - 保留 1 个 PI 模板 + 1 个 example-theme + 1 个 exemplar paper（DeepSeek-R1）
    - 清洗 concepts/*.md 的 "在 DeepSeek 里的用法" 段为通用占位
    - 自删除 init:group 脚本（防重复执行）
    - 写入 group.config.yaml 真相源

  默认全清，要保留全部 demo 内容（DeepSeek 解读 + 完整成员）作参考吗？
  - 不保留（推荐，干净起步）
  - 保留（加 --keep-demo flag）

用户：不保留

agent：（执行 pnpm init:group "Wang's NLP Group" --github=... --site-url=...）
      ✓ init 完成
      ✓ verify 通过

      下一步：你的 stage 是 initialized，建议接 first-week-after-init
      skill 跑 5 个对话循环填好 wiki。要现在开始吗？还是先休息？
```

### 范例 C：first-week-after-init（接 init 后跑 5 loop）

```
用户：init 完了，下一步呢？

agent：（cat group.config.yaml → stage: initialized, pi.name: ""）
      （读 .agent/skills/first-week-after-init.md）

  你处于 initialized 阶段。我会带你走 5 个对话循环：
    1. PI 主页 (~15 min)
    2. 第一条研究主线 (~20 min)
    3. 核心成员 PI + 1-2 学生 (~30 min)
    4. 第一篇 paper note (~45 min)
    5. 部署 + Giscus (~30 min)

  每个循环之间你可以"先停下，明天继续"。
  从循环 1 开始？

用户：开始

agent：（进入循环 1，问 7 轮关于 PI 的问题，逐字段写入 pi.md + group.config.yaml）
```

---

## 6. 你（agent）的不可触碰底线

- ❌ **不要** push 到 main 或开 PR（除非用户**明确**说）
- ❌ **不要**删除现有内容（除非 skill 明确允许，如 `bootstrap-new-group`）
- ❌ **不要**改 LICENSE / README 顶层 / `package.json` 的非 scripts 字段（结构性变更必须用户确认）
- ❌ **不要**在公开 wiki 内容里放占位 ID / API key / 真实邮箱 / 真实电话（除非用户主动给）
- ❌ **不要**伪造贡献署名 — frontmatter 的 `author` / commit message 用 agent + 用户名
- ❌ **不要**改用户写的"我们组的 take"、"PI 立场"、"研究宣言"段 — 这是 PI 个人观点
- ❌ **不要**手 vim `group.config.yaml` —— 用 `pnpm update:group-config`
- ❌ **不要**改其他 skill 文档的"演练发现总结"段 — 那是 dogfood lessons 历史

---

## 7. 给 agent 的核心提示

> **first draft, ugly, OK** — 这个仓库的写作文化鼓励"不完美但发出来"。你写的笔记不必完美，给用户一个**可改的 70% 版本** > 给一个**等审 100% 完美但还没出来**的版本。**记得标 caution banner 让 PI 知道哪段是 agent 起草的**。

> **优先建议、不擅作主张** — 任何不在 skill 明确范围内的操作，先告诉用户你打算做什么、问"开始？"再做。

> **结构化输出** — 跑完一组操作，用一个简表汇报：创建了什么、修改了什么、跳过了什么、有什么 warning。

> **数据查询用 git mode** — `list:* --since=Nd` 别 raw 用，digest / 增量场景永远加 `--source=git`。

---

## 8. 进阶：跨 cycle 沉淀的踩坑历史

每个 skill 文件底部有"演练发现总结"段，记录之前 dogfood / 静态扫描时踩了什么坑、怎么修。**进具体 skill 之前先扫这一段**，能少走至少 30% 弯路。

例如：
- `add-paper-note.md` 提到 "强制 Pass 3 搜索 GitHub/HuggingFace/OpenReview" — 是因为之前 cycle-4 发现 agent 默认只读 abstract
- `weekly-digest.md` 提到 "list.mjs --since=Nd 用 mtime 不可靠" — 是 cycle-6 发现的 P0 bug，已修
- `setup-deploy.md` 提到"手动覆盖 Build command 为 pnpm build" — 是 cycle-5 dry-run 发现的 Cloudflare 默认值坑

---

下一步：读 [`.agent/BOOTSTRAP.md`](.agent/BOOTSTRAP.md) 看 stage 决策树 → 读对应 skill。
