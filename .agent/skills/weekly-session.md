# Skill: weekly-session

## 何时调用

用户说类似：

- "下周共读 Mixtral / DeepSeek-R1 / X 论文"
- "建一个 W19 的 session"
- "排下周的周会页面"
- "PI 选定了下周读 X，建个页面"

## 输入清单

| 必填 | 字段 | 推断方式 |
|------|------|---------|
| ✓ | 周次 | `2026-W19` 之类；可问用户、或从今天日期推 (W = ISO week) |
| ✓ | paper slug | 从 paper 标题推（小写、连字符），如 "Mixtral of Experts" → `mixtral-of-experts` |
| ✓ | 带读人 | 必须问用户。值用 `/members/<slug>` 中的 slug |
| | 主 paper 链接 | arXiv / 项目主页 URL |
| | paper 标题（中英文） | 给 session 标题用 |
| | 关联主线 | 哪条 `/themes/` 主线，可建议 |
| | 会议时间 / 地点 | 默认填占位，由用户改 |

### 主线不相关怎么办（常见）

如果 paper 跟现有主线都不强相关（如 Mixtral 跟 reflective-alignment）：

1. **优先选项**：在 session 页的关联主线标 "弱相关"，仍指向现有主线 + 说明为什么贴（主线的开放问题可能哪里暴露）。这是默认。
2. **进阶选项**：如果连续 2-3 篇 paper 都不强相关 → push-back，让 PI 考虑是否该建新主线（走 `add-theme` skill）。
3. **不要选**：不要默认推到 `themes: []` 空数组 —— 空主线意味着 "孤点 paper"，让 wiki 看起来 不成体系。

## 前置检查

⚠️ **必须用 `pnpm -s`**（silent）调用 list 脚本，否则 pnpm 会在 stdout 加脚本头，JSON 被脏。

```bash
# 检查带读人
real_member=$(pnpm -s list:members --json | jq -r '.items[] | select(.slug=="<lead-slug>")')
# 检查同名 session
exists=$(pnpm -s list:sessions --json | jq -r '.items[] | select(.session_week=="<week>")')
```

JSON 返回 shape：

```json
{"subcommand": "members", "count": 2, "items": [{"slug": "...", ...}]}
```

字段名须注意：session 的周次字段是 **`session_week`**，不是 `week`。

## 执行步骤

1. **建 paper page**（如果还没有）：

```bash
pnpm new:paper <paper-slug> --title="<Title>" --theme=<theme-slug>
```

2. **建 session page**：

```bash
pnpm new:session <week> <paper-slug> --lead=<member-slug> --paper=papers/<paper-slug>
```

3. **填充 Pre-read 部分**（覆盖默认占位）：
   - 必读：链向刚建的 `papers/<paper-slug>`，指明重点章节
   - 选读：相关概念词典 / 历史 sessions
   - 引导问题：根据 paper 摘要 + 关联主线**生成 3 个**有深度的问题（不是 "what is X"，而是 "why X over Y" / "what's the trade-off"）

3-bis. **写"关联背景"段（cycle-8 起强制，cycle-9 起一条命令搞定）**

在 Pre-read 之前 / `## 0. 关联背景` 段，用 cycle-9 加的 `--format=session-bg` 直接产 markdown：

```bash
pnpm -s context:for papers/<paper-slug> --format=session-bg
```

输出是可直接粘贴的 markdown，含 caution banner + **概念前置** + **前情回顾** + **主线坐标** + **同方向对照阅读** 四段。Lead 只需按每条后面的 `📝 lead 补一行定位` 提示补文字，然后删 caution。

通用场景（不限 session）用 `--md` 拿结构化 markdown：

```bash
pnpm -s context:for <slug> --md [--depth=2]
```

**原始人读模式**（快速扫一眼不打算贴）：

```bash
pnpm -s context:for papers/<paper-slug>        # 默认 depth=1，彩色终端列表
```

> 只有"可选扩展"段可考虑 `--depth=2` 多挑 1-2 条；2 跳邻居信噪比低（见 #35），不要一股脑全贴。

3-ter. **填 frontmatter 知识图字段**

```yaml
participants: [phd-1, phd-2]        # ✨ 除 lead 外的预计 / 实际参与者
concept_refs: [grpo, moe]           # ✨ 本次重点讨论的 concept slug（来自 3-bis 拿到的列表，PI / lead 选）
tags: [rl, reasoning]               # ✨
```

`participants` 即使在 status: upcoming 时**也建议预填**（让 `/members/<x>/` 能反显"将参与"）；会后由 post-meeting-recap 校对实际到场。

4. **更新首页 banner**：

修改 `src/content/docs/index.mdx` 的 "📅 本周共读" 区块。

**首次**（init:group 后第一次建 session）：占位是 “> 还没有 session。运行 `pnpm new:session ...`”，需完整替换为 LinkCard：

```mdx
## 📅 本周共读

<LinkCard
  title="W<XX> · <Paper Title>"
  description="带读：<lead> · <时间> · 重点 <章节提示>"
  href="/sessions/<week>-<slug>/"
/>
```

**后续**：已有 LinkCard，只需 edit `title` / `description` / `href` 三个字段。

5. **跑 verify**：

```bash
pnpm verify
```

6. **报告**：列出创建/修改的文件 + 提示用户去填什么

## 检查点

- ✅ `src/content/docs/sessions/<week>-<slug>.md` 存在
- ✅ `src/content/docs/papers/<slug>.md` 存在
- ✅ session frontmatter 中 `lead` 是有效成员 slug
- ✅ session 页内的 `/papers/<slug>/` 链接能跳通
- ✅ 首页 LinkCard 指向新 session

## 引导问题生成原则

agent 生成 3 个 pre-read 问题时遵循：

1. **第 1 题**：核心方法 trade-off （对比另一种做法）
2. **第 2 题**：实现细节里的非显然选择（"为什么 X 维度用 FP4 而其他维度用 FP8"）
3. **第 3 题**：与组内研究主线的连接（"这个能不能挪到我们组的 baseline 上？"）

避免：
- ❌ 简单事实题（abstract 里就有答案）
- ❌ 笼统题（"这篇论文好不好"）

## 示例对话

```
用户：下周（W19）共读 DeepSeek-R1，让 phd-senior-1 带读
agent：好。

  ✓ phd-senior-1 是有效成员
  ✓ W19 还没有 session
  ✓ /papers/deepseek-r1 还不存在

  我会做：
  1. 建 papers/deepseek-r1.md 模板
  2. 建 sessions/2026-w19-deepseek-r1.md，带读人 phd-senior-1
  3. Pre-read 部分加上：
     - 必读: papers/deepseek-r1, 重点 §3 GRPO + §4 涌现行为
     - 选读: concepts/grpo
     - 3 个引导问题（基于 R1 论文的 RL 涌现 reasoning 主题）
  4. 更新首页 banner

  关联主线选 test-time-reasoning 还是另指定？
用户：test-time-reasoning
agent：（执行 4 步 + verify）✓

  完成。修改：
    + src/content/docs/papers/deepseek-r1.md (新)
    + src/content/docs/sessions/2026-w19-deepseek-r1.md (新)
    ~ src/content/docs/index.mdx (banner 更新)

  Pre-read 引导问题（已写入 session 页）：
    1. R1-Zero 不用 SFT 直接 RL 涌现 long CoT —— 与传统 RLHF 流程相比，
       省略 SFT 的代价是什么？什么任务上行不通？
    2. GRPO 用组内归一化作 baseline —— group size G 该怎么选？
       与 PPO 用 critic 的方差差异？
    3. 我们组现有 baseline 上能不能直接接 GRPO？
       reward 设计上有哪些痛点？

  下一步：
    - phd-senior-1 周三前补完 papers/deepseek-r1.md 的方法 + 实验小节
    - 大家周日前在 session 页留 pre-read 问题
```

## 不要做的事

- ❌ 不自动 commit / push
- ❌ 不替带读人写实质内容（只填模板和引导问题）
- ❌ 不假定 paper 的具体细节（如果不确定，留 `（待填）`）

## Lessons learned（端到端跑 R1 / W19 时踩的坑）

> 这一节由历次实战沉淀。后续 agent 跑这个 skill 时**先读这一节**，避免重复踩坑。

### 1. paper title 含 `:` 必须加 YAML 引号

`new:paper deepseek-r1 --title="DeepSeek-R1: Incentivizing..."` 生成的 frontmatter：

```yaml
title: DeepSeek-R1: Incentivizing Reasoning via RL   ← Astro YAML parser 失败
```

**正确**：脚手架脚本的 `yamlSafe()` 会自动检测并加引号。如果是手写 frontmatter，记得：
```yaml
title: "DeepSeek-R1: Incentivizing Reasoning via RL"
```

`pnpm verify` 会预警这个问题。

### 2. paper note 是 exemplar 时记得标 `exemplar: true`

如果你写的 paper note **足够好可作为"组样板"**（示范"什么是好的组内 paper note"），加：

```yaml
exemplar: true
```

这样 `pnpm init:group` 重置 demo 内容时**会保留这一篇**。R1 paper note 就是这样。

判断标准：
- 该 paper note 写满了 [STYLE_GUIDE](../../docs/STYLE_GUIDE.md) 全部 11 节
- 有真实组内 take / 开放问题（不是占位）
- 内容在 6 个月内仍有教学价值

### 3. session 是未来周次时不要伪造 post-meeting

**不要** 在 session 还没开（status: upcoming）时写 Live notes / Post-meeting 段。

正确做法：把这两段留空（或 `…` 占位），由带读人在会后填。

例外：纯 demo 场景下，**过去**的 session（W18）可以填满作示范。

### 4. 引导问题要"显然不在 abstract 里"

R1 的好问题：

- ✅ "GRPO 在 partial-credit reward 下还稳吗？"（论文没充分实验）
- ✅ "G = 16 是不是 sweet spot？G 自适应有没有意义？"（论文没 ablation）

R1 的烂问题：

- ❌ "什么是 GRPO？"（abstract 第二句就有）
- ❌ "R1 比 GPT-4 强吗？"（看 Table 1 即可）

**判断标准**：问题要逼带读人**离开 paper**才能答 — 翻其他工作、想我们组工作、或承认不知道。

### 5. 跨 session 的链接必须用绝对路径

```markdown
✅ [W18 共读](/sessions/2026-w18-deepseek-v4/)
❌ [W18 共读](../sessions/2026-w18-deepseek-v4.md)
```

verify 会抓 broken link。

### 6. 创建完成后**必须**跑 verify

```bash
pnpm verify
```

如果有 error，**必须修完再说"完成"**。fail-fast 在 agent 流程里特别重要，否则错误会传染（坏链接被复制粘贴到下个 session）。

### 8. 演练发现（cycle 8 · W22 DeepSeek-R1 续讨论 dogfood）

- **#32 scaffold 不继承 `--paper` 的 themes**：`new:session --paper=papers/deepseek-r1` 生成的 `themes:` 仍为 `[]`。Agent 必须在 3-ter 步手补 `themes:`，否则主线页漏挂。建议 cycle-9 让 `new-session.mjs` 读 `--paper` 指向文件 frontmatter 自动继承 themes。
- **#33 scaffold title 默认是 slug 拼接**（`2026-W22 · deepseek-r1-followup`），sidebar 难看。Agent 要 follow-up edit title。建议 cycle-9 给 `new-session.mjs` 加 `--title=` flag。
- **#34 `context:for` 人读模式不是 markdown**：带 box-drawing 字符（──）+ emoji，复制到"0. 关联背景"段得手改成 `- [Title](/path/)` 列表。建议 cycle-9 加 `--md` flag。
- **#35 2 跳邻居信噪比低**：MTP 通过 `related_concept(moe)` 间接命中 depth=2，但对"本周共读关联背景"相关度低。实践：`--depth=1` 就够用；只有做 personalized-onboarding 才值得开 depth=2。本 skill 3-bis 已建议 depth=2，dogfood 后改口 —— 默认用 depth=2 拿到 members/2-跳 concepts 可挑 1-2 条放进"可选扩展"，不要一股脑全贴。
- **#36 知识图反向通路验证**：W22 session 的 `concept_refs: [grpo, moe]` 自动让 `/concepts/grpo/` 和 `/concepts/moe/` 页底部 Backlinks 多一条"W22"。反向链路 ✅（build:index 产出 42 edges，35→42 = +7 符合预期：1 paper + 2 concepts + 1 theme + 1 lead + 2 participants）。
  - 🔴 **cycle-8 post-commit 修正**：首次提交里写的是 "39→46 = +7"，跨 cycle 回头复盘时发现 `build-index.mjs` 双向 `related_concepts` 有 dedup bug（mla↔moe / moe↔mtp 各多算 1 条），`parseScalar()` 把 YAML `null` 当字符串 "null"（触发 parent_concept 死链误报）。两个 bug 都已 one-line fix，真实基线是 35 edges（非 39）。数字虚高 4，方向仍对。

### 7. 演练发现（cycle 5.A · Mixtral W10 演练）

- **#24**：原 skill 输入清单没说"主线都不强相关怎么办"。已加三档处理协议（默认 / 进阶 / 不要选）。
- **#25**：原 skill 写 `pnpm list:members --json`，实际 pnpm 默认会在 stdout 加脚本头，JSON 被脏。统一改为 `pnpm -s list:*`。
- **#26**：原 skill 没说返回 shape 是 `{subcommand, count, items}`，agent 第一次跑会 `string indices must be integers` 报错。已加示例 + shape 文档。
- **#27**：session 周次字段名实际是 `session_week`，不是 `week`。已修文档。
- **#28**：首页 banner 第一次没 LinkCard 给 edit（占位是纯文字）。已加首次 / 后续两种处理。
