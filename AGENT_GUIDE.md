# AGENT_GUIDE — 给 AI Agent 的本仓库使用手册

> **如果你是 LLM agent**（Claude Code / Cursor / Cascade / Devin / ChatGPT 等），先读完这一篇，再读 `.agent/context/` 与 `.agent/skills/`。**人类用户**也可以读这份，了解 agent 化使用方式。

## 0. 这是什么仓库

一个**可复用的课题组共读 Wiki 模板**。两种使用模式：

1. **看 demo**：仓库内置 "Leon's Group"（虚构课题组）作为 live demo
2. **fork 自用**：其他课题组 fork 后跑 `pnpm init:group "<我们组的名字>"` 一键重塑为自己的 wiki

模板设计为 **agent-native** —— 大多数维护工作（建 session、加成员、整理纪要、生成 digest）都可以由 agent 代劳。

## 1. 你（agent）应该知道的核心概念

| 概念 | 文件 | 一句话理解 |
|------|------|----------|
| **角色模型** | `.agent/context/role-model.md` | 双层：简化 4 类（大/小导师/博/硕）↔ 完整 5 类聚类 |
| **目录约定** | `.agent/context/repo-map.md` | 7 个内容模块：sessions / themes / members / concepts / papers / onboarding / how-to-contribute |
| **写作约定** | `.agent/context/conventions.md` | frontmatter schema、命名、跨链接规则 |
| **可用技能** | `.agent/skills/*.md` | 10 个 skill，按场景索引见下表 |
| **可用脚本** | `package.json` scripts | `pnpm new:session/paper/member`、`pnpm verify`、`pnpm list:*` |

## 2. 场景 → 技能映射（你最常用的查询表）

| 用户说什么 | 你应该读哪个 skill | 主要命令 |
|-----------|------------------|---------|
| "fork 这个模板给我们 X 组用" | `bootstrap-new-group.md` | `pnpm init:group` |
| "这周共读 X 论文 / 排个 session" | `weekly-session.md` | `pnpm new:session` |
| "我把会议录音转成文字了，帮我整理纪要" | `post-meeting-recap.md` | （编辑现有 session 文件） |
| "新成员 X 加入了" | `add-member.md` | `pnpm new:member` |
| "我读完 X 论文，做笔记" | `add-paper-note.md` | `pnpm new:paper` |
| "解释一下 GRPO 并加到词典" | `add-concept.md` | （创建 `concepts/<term>.md`） |
| "更新 long-context 主线" | `refresh-theme.md` | （编辑 `themes/*.md`） |
| "新生 X 来了，研究兴趣是 Y" | `personalized-onboarding.md` | （生成定制 reading list） |
| "周日给我生成本周 digest" | `weekly-digest.md` | `pnpm list:sessions --since=7d` |
| "帮我 review 这个 PR" | `review-pr.md` | （检查约定 + build） |

## 3. 你应该遵守的工作流约束

### 3.1 写之前

1. **先读 context**：`.agent/context/` 三份 + 相关 skill
2. **检查仓库状态**：`git status` 看是否干净
3. **了解现状**：`pnpm list:members --json` / `pnpm list:themes --json` / `pnpm list:sessions --json`

### 3.2 写之中

1. **优先用脚手架命令**（`pnpm new:*`）而不是直接写文件 —— 命令封装了 frontmatter schema 与命名约定
2. **用 `--json` 模式**让输出可解析
3. **不要修改的文件**（除非用户明确要求）：`package.json`、`astro.config.mjs`、`scripts/*.mjs`、`.agent/*`

### 3.3 写之后

1. **必跑** `pnpm verify`（build + 链接自检 + frontmatter schema）
2. **报告**：列出本次创建/修改的文件 + 验证结果
3. **不要自动 commit / push** —— 除非用户明确说"commit and push"

### 3.4 错误恢复

- frontmatter 错误：`pnpm verify` 会报哪个文件哪行；修正后再跑
- build 失败：看 stack trace 定位文件 → 修正 → 再 build
- 不确定怎么做：**问用户**，不要瞎猜

## 4. 用户对话范例

下面是典型 agent ↔ 用户对话（agent 可以用作 reference）：

### 范例 A: 周一会后整理

```
用户：刚开完会，transcript 在 /tmp/w19-meeting.txt，帮我填到 sessions/2026-w19-mixtral.md
agent：（读 .agent/skills/post-meeting-recap.md）好。

  我会做以下事：
  1. 读 transcript 提取讨论结构
  2. 写到 W19 session 页的 Live notes 与 Post-meeting 两节
  3. 提取 action items 并 @ 对应成员
  4. 不动 frontmatter
  5. 跑 pnpm verify

  开始？
用户：开始
agent：（执行）✓ 完成。修改了 1 个文件。
       Action items 抽取了 3 条：
         - @phd-senior-2: 复现 Mixtral routing 的 ablation
         - @postdoc-1: 评估能否接到我们 baseline
         - @ms-research-2: 补 Switch Transformer 概念词条
       verify 通过。要不要 git diff 看一下？
```

### 范例 B: bootstrap

```
用户：把这个模板初始化为 Wang's NLP Group
agent：（读 .agent/skills/bootstrap-new-group.md）

  我会跑 `pnpm init:group "Wang's NLP Group"`。这会：
    - 替换所有 "Leon's Group" → "Wang's NLP Group"
    - 删 14 个 demo 成员、4 条 demo themes、1 个 demo session、deepseek 论文解读
    - 留 1 个 PI 模板 + 1 个主线模板 + 简化首页
    - 自删除 init:group 脚本（防止重复执行）

  要保留 demo 内容（DeepSeek 解读 + 概念词典）作参考吗？建议保留概念词典。
用户：保留概念词典，删 deepseek
agent：（执行 `pnpm init:group "Wang's NLP Group" --keep-concepts`）...
```

## 5. 你（agent）的不可触碰底线

- ❌ **不要** push 到 main 或开 PR（除非用户**明确**说）
- ❌ **不要**删除现有内容（除非 skill 明确允许，如 `bootstrap-new-group`）
- ❌ **不要**改 LICENSE / README 顶层（结构性变更必须用户确认）
- ❌ **不要**在公开的 wiki 内容里放占位 ID / API key / 真实邮箱（除非用户主动给）
- ❌ **不要**伪造贡献署名 —— frontmatter 的 `author` / commit message 用 agent + 用户名

## 6. 给 agent 的核心提示

> **first draft, ugly, OK** —— 这个仓库的写作文化鼓励"不完美但发出来"。你写出来的笔记不必追求完美，给用户一个**可改的 70% 版本** > 给一个**等审 100% 完美但还没出来**的版本。

> **优先建议、不擅作主张** —— 任何不在 skill 明确范围内的操作，先告诉用户你打算做什么、问"开始？"再做。

> **结构化输出** —— 当跑完一组操作，用一个简表汇报：创建了什么、修改了什么、跳过了什么、有什么 warning。

---

下一步：读 `.agent/context/repo-map.md` 了解仓库布局。
