# Agent Bootstrap — 你（agent）刚进这个仓库该做什么

> **这是任何 AI agent（Claude / Cursor / Cascade / 自定义 agent）进入这个仓库的第一篇必读**。
>
> 读完之后你会知道：仓库当前处于什么阶段、你和用户的关系、下一步该调用哪个 skill。

---

## 你被触发的 4 种场景

用户对你说类似：

| 用户说什么 | 触发场景 |
|----------|---------|
| "帮我初始化这个 wiki" / "把这个模板改成我们组的" | A. 新 PI 第一次见仓库 |
| "这个仓库是什么？我该怎么用它？" / "解释一下这个项目" | B. 用户认知阶段 |
| "帮我写下周共读 X paper 的 session" / "新成员入组" / 任何具体维护任务 | C. 日常维护 |
| 另一个 agent / IDE 让你接管这个仓库 | D. Handoff |

---

## 第一动作：判断阶段（永远先做这步）

仓库根目录的 `group.config.yaml` 是真相源。**`cat group.config.yaml`** 看 `stage` 字段：

| stage 值 | 含义 | 你下一步 |
|---------|------|---------|
| 文件**不存在** | 仓库刚 clone，还在 demo 状态 | → 调 [`bootstrap-new-group`](skills/bootstrap-new-group.md) |
| `template` | 与"不存在"同义（理论上不该出现） | → 调 [`bootstrap-new-group`](skills/bootstrap-new-group.md) |
| `initialized` | `init:group` 已跑，但 `pi.name`、`themes_count`、`papers_count`（除 exemplar 外）还是空 | → 调 [`first-week-after-init`](skills/first-week-after-init.md) |
| `established` | 至少有真实 PI 信息 + 1 条主线 + 1 篇真实 paper note | → 读 [`MAINTAINER_PLAYBOOK.md`](MAINTAINER_PLAYBOOK.md) 决定具体哪个日常 skill |

**判断不出来就问用户**："你能告诉我这个仓库现在到哪一步了吗？刚 clone？刚 init 完？还是已经在用了？"

---

## 你（agent）和用户的关系 —— 重要

**你不是替 PI / 学生写学术内容**。你是**把零散信息整理进结构**的中介。

### ✅ 你做

- 问对问题（PI 给一句"我们关心 long-context"，你问"具体哪 3 个开放问题？哪 5 篇必读？"）
- 把答案填进正确的 markdown / frontmatter / 链接结构
- 跑 `pnpm verify` 确认没破坏一致性
- 用 git 命令做大改动前 confirm
- 给 PI 报告进度："已经填好了 PI 主页和 long-context 主线，下一步要不要建第一个 session？"

### ❌ 你不做

- 替 PI 写"我们组关心什么"。这是 PI 的判断，你来收集和组织
- 替学生总结一篇 paper 的"我们组的 take"。这是学生的批判性思考，你来引导
- 自动 `git commit / push`。大改动让用户先看 `git diff`
- 改 `LICENSE`、改用户的 git remote 地址
- 跑 `pnpm install` / `pnpm build` 之外的破坏性命令（除非用户明确批准）

### 一个具体例子

**PI**: "我们组主要做大模型推理。"

**❌ 坏 agent**: 直接写一条 theme 叫 "Large Language Model Reasoning"，里面 5 篇必读论文是 GPT-4 / Llama / Mistral / Gemini / Claude。— **这不是 PI 的研究主线，你在替他做学术判断**。

**✅ 好 agent**: 问 PI："好。'大模型推理'里面，你具体关心：(a) reasoning trace 监督学习？(b) chain-of-thought 蒸馏？(c) 多步推理的 RL？(d) 推理时计算（test-time compute）？还是别的方向？告诉我你最近在带学生做的 1-2 条具体主线。"

---

## 路由表 —— 各场景的 skill 索引

### 场景 A: 新 PI 第一次见仓库

```
1. cat group.config.yaml  # 不存在 / stage=template
2. 调 .agent/skills/bootstrap-new-group.md
3. 完成 → group.config.yaml 写入 stage=initialized
4. 自动衔接：调 .agent/skills/first-week-after-init.md
5. 完成 → stage=established
```

### 场景 B: 用户问"这是什么仓库"

不要急着调 skill，**先解释**：

> 这是基于 [Group Reading Wiki](https://github.com/Haimbeau1o/Group-Reading-Wiki) 模板创建的课题组共读 wiki。
>
> 它用一个静态网站来沉淀 4 类东西：
> - 📅 **每周共读**（sessions/）— 排周会、记纪要
> - 📚 **论文解读**（papers/）— 深度笔记带"我们组的 take"
> - 🧭 **研究主线**（themes/）— 组的研究地图
> - 👥 **成员主页**（members/）— 看见彼此在想什么
>
> 当前状态：`{读 group.config.yaml.stage}`
>
> 想让我帮你做什么？我可以：
> - 如果还没初始化：跑 `pnpm init:group` 替你清空 demo 改成你组的
> - 如果刚初始化：带你走 5 个对话循环，30 分钟把 PI 主页 + 第一条主线 + 第一个成员 + 第一篇 paper 全填好
> - 如果在用了：每周给你排共读、整理纪要、加新成员

### 场景 C: 具体维护任务

读 `.agent/MAINTAINER_PLAYBOOK.md` 的 skill 索引表决定。

### 场景 D: Agent handoff

读 `.agent/context/repo-map.md` + `conventions.md` + `role-model.md` 三件套获得仓库结构。然后回到场景 A/B/C 判断。

---

## 仓库工具箱（你能用的命令）

所有命令 agent-friendly，都支持 `--json`：

| 命令 | 用途 |
|------|------|
| `pnpm verify` | 检查 frontmatter / 链接 / 命名约定。**任何改动后必跑** |
| `pnpm verify --json` | 给 agent 解析的输出 |
| `pnpm list:members --json` | 查全组成员 |
| `pnpm list:themes --json` | 查所有主线 |
| `pnpm list:sessions --since=7d --json` | 查近期 session |
| `pnpm new:session <Wxx> <slug> --lead=<member>` | 建周会页 |
| `pnpm new:paper <slug> --title=...` | 建论文笔记 |
| `pnpm new:member <slug> --role=...` | 建成员页 |
| `pnpm new:theme <slug> --title=...` | 建主线页 |

---

## 你不该做的事（红线）

1. **不直接 commit / push**。用户应该看 `git diff` 先。
2. **不删 `src/content/docs/papers/deepseek-r1.md`** —— 这是 exemplar，给后来者看"什么叫合格的 paper note"
3. **不改 `LICENSE`、`scripts/`、`.agent/skills/` 内的骨架**。这些是模板归属，要改请向上游模板提 PR
4. **不臆造内容**。PI 没说的研究方向，不要自己编

---

## 元问题：用户想了解"我怎么用 agent 维护"

如果用户说："教我怎么以后跟 agent 协作维护这个 wiki" —— 给他看下面这个心智模型：

```text
日常维护的 4 种触发场景，你跟我说，我做对应的事：

  周一早上："下周共读 <paper>，让 <某人> 带读"
   → 我帮你建 session 页 + 通知模板（weekly-session skill）

  周三晚："共读会刚开完，纪要在这里：<截图 / 文字>"
   → 我帮你把纪要整理成 post-meeting recap（post-meeting-recap skill）

  任何时候："新生 <名> 入组了，方向是 <X>"
   → 我帮你建他的成员主页 + 个性化 onboarding 路径（add-member + personalized-onboarding skill）

  周日晚："本周 wiki 有什么进展？"
   → 我给你一份周报（weekly-digest skill）

每个场景背后都是 .agent/skills/<名>.md 这一份文档驱动我。
你不需要记 skill 名 —— 用人话告诉我就行。
```

---

## 阶段标记规则（写 group.config.yaml 的纪律）

各 skill 在完成关键里程碑时**必须**更新 `group.config.yaml`：

| Skill | 完成时写什么 |
|-------|------------|
| `bootstrap-new-group` | `stage: initialized`（init-group.mjs 已自动写） |
| `first-week-after-init` 循环 1 | `pi.name` / `pi.github` / `pi.email` |
| `first-week-after-init` 循环 2 | `content.themes_count: 1` |
| `first-week-after-init` 循环 3 | `content.members_count: <N>` |
| `first-week-after-init` 循环 4 | `content.papers_count: 2`（exemplar + 第一篇真实） |
| `first-week-after-init` 循环 5 | `deploy.cloudflare_pages: true`、`deploy.giscus_enabled: true`、`stage: established` |
| `weekly-session` | `content.last_session: "YYYY-Wxx"` |
| `add-member` | `content.members_count` +1 |
| `add-paper-note` | `content.papers_count` +1 |
| `upgrade-template` | `template.baseline_commit` / `template.last_synced` |

工具：脚本 `scripts/update-group-config.mjs <key> <value>` 一行命令更新（TODO 待实现）。
现阶段：用 `pnpm verify` 配合手工 yaml 编辑。
