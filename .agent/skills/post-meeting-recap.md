# Skill: post-meeting-recap

## 何时调用

用户说类似：

- "周会刚结束，transcript 在 X，整理纪要"
- "我把会议录音转成文字了，帮我填到 W19 session"
- "整理今天周会到 sessions/2026-wXX"
- 用户粘贴一段会议讨论文字，让你转成结构化纪要

## 输入清单

| 必填 | 字段 | 来源 |
|------|------|------|
| ✓ | 目标 session 文件路径 | 从用户消息推断或问 |
| ✓ | transcript / 讨论原文 | 用户提供（粘贴 / 文件路径） |
| | 是否要 @ 成员 | 默认会从 transcript 中识别人名并 @ |

## 前置检查

1. 目标 session 文件存在：`ls src/content/docs/sessions/<file>`
2. 当前 session 页的"Live notes"和"Post-meeting"段还没有实质内容（只有占位）—— 否则**先告诉用户已有内容，问是否覆盖**

## 执行步骤

### 1. 解析 transcript

从 transcript 中识别四类信息：

- **时间结构**：哪段时间在讲什么（如"前 20 分钟讲了 X"）
- **关键讨论点**：值得记录的反驳 / 提问 / 异议
- **Key insights**：被多人确认或 PI 强调的洞见（**最重要**）
- **Action items**：谁要做什么、deadline

### 2. 写入 session 页

**只改两节**，frontmatter 和 Pre-read 段不动。

#### Live notes 段
按时间结构展开。可以用 markdown 三级标题切分时间段。每个时段下用 bullet list 概括讨论。

不必逐字逐句，**抓主干** —— 一段 30 分钟讨论压缩成 5-10 个 bullet。

#### Post-meeting 段

##### Key insights

**这是最重要的输出**。3-7 条，每条一句话能讲清的"组级别"洞察。**不是事实复述**，而是讨论中产生的**抽象概念 / 通用原则 / 与组工作的连接**。

格式示例：

```markdown
1. **混合注意力的本质是 memory hierarchy**：把 SWA / CSA / HCA 看成 L1/L2/L3 cache 的局部性...
2. **精度混合的"敏感度分层"思想**比具体数值更值得抽象 —— 这是个**通用工程原则**...
3. **CSA Indexer 的独立性**让它有可能作为可移植模块接到我们组现有 baseline...
```

##### Action items

```markdown
- [ ] **@<member-slug>**：（具体行动）（截止日期）
- [ ] **@<member-slug>**：…
```

@ 人名要用 `/members/` 中真实存在的 slug，不在的话**问用户**或留 `@<待 PI 指派>`。

##### 与组工作的关联

简短一段，把会议讨论 link 到具体 themes 或正在做的项目。

### 3. 更新 frontmatter

把 `status: live` 改为 `status: archived`（如果 schema 支持的话）。

### 4. 跑 verify

```bash
pnpm verify
```

### 5. 报告给用户

格式化清单：

- 修改了哪个文件、哪几节
- 抽出了几条 key insights、几个 action items
- 提到了哪些人，是否都在成员列表里
- 是否有 ambiguous 的内容（建议用户人工确认）

## 检查点

- ✅ Live notes 至少 5 条 bullet（一节会议讨论比这少说明 transcript 太短或没消化好）
- ✅ Key insights 3-7 条，每条都是抽象 take-away（不是事实）
- ✅ Action items 都有 markdown-link `@`、具体动作、**具体截止周次**（`W22` 而非"下周"）
- ✅ frontmatter 的 `status` 已从 `live` 改成 `archived`
- ✅ verify 通过
- ✅ frontmatter 没有重复 key

## 错误处理

| 情况 | 处理 |
|------|------|
| transcript 太短（< 500 字）信息不够 | 不强行编造；告诉用户"信息不足，建议人工补" |
| transcript 中提到的某个人不在成员列表 | 在 action item 中用 `@<待匹配>`，附备注让用户补充 |
| Pre-read 段已经有内容 | **保留不动**，只改 Live + Post |
| Live notes 段已经有内容 | 问用户：覆盖 / 追加 / 跳过 |

## 示例对话

```
用户：周会结束。transcript 在 /tmp/w18-meeting.txt，整理到 W18 session。
agent：好。

  ✓ sessions/2026-w18-deepseek-v4.md 存在
  ✓ Live notes 还是占位
  ✓ Post-meeting 还是占位

  开始解析 transcript… (4231 字)

  我会写：
  - Live notes：6 条时间段 bullet（约 30 行）
  - Key insights：5 条抽象洞察
  - Action items：3 条带 @
  - 与组工作的关联：1 段，连到 long-context 主线

  注意：transcript 中提到 "小王" 不在成员列表，可能是哪位？
用户：phd-mid-2

agent：好。
       （写入 + verify）✓

       完成。修改：sessions/2026-w18-deepseek-v4.md
       Live notes: 写入 6 条时段 bullet
       Key insights:
         1. 混合注意力的本质是 memory hierarchy
         2. 精度混合的敏感度分层是通用工程原则
         3. CSA Indexer 可作为独立模块
         4. ...
         5. ...
       Action items:
         - @phd-senior-1: 把 indexer 模块化在 baseline 上跑 ablation (截止 W21)
         - @postdoc-1: 评估接入可行性
         - @ms-research-1: 补 SWA 概念词条
       关联：链回 long-context 主线 § 开放问题 #1

       建议你看一遍 git diff 确认 Key insights 准确度。要 commit 吗？
用户：先不 commit
```

## 不要做的事

- ❌ 不动 frontmatter 里的 `lead` / `paper_refs` / `themes`
- ❌ 不改 Pre-read 段（那是会前的）
- ❌ 不编造 transcript 没有的内容
- ❌ 不自动 git commit / push

## 演练发现总结（2026-W19 dogfood）

首次端到端跑通。改进点：

1. **@username 必须是 markdown link 而非裸文本**：写成 `[@phd-senior-1](/members/phd-senior-1/)`，不要写 `@phd-senior-1`，否则不渲染成可点链接。本文档示例已修正。
2. **Live notes 顶部加 transcript 溯源行**：写一行 `> 由 post-meeting-recap skill 从会议 transcript 抽取，PI/带读人请校对。`，方便 PI 知道这是 agent 起草、需要校对（也可加入 transcript 文件路径或 hash）。
3. **Action items 必须带具体截止周次**：`截止 W22` / `截止 W20` 这种硬日期，不要 `截止下周` / `尽快`。已加入检查点。
4. **status 字段是项目约定**：`status: archived` 不是 starlight schema 强校验，verify 不会 catch。skill 必须主动改。
5. **时段切分允许重叠**：transcript 时间戳常前后重叠（讨论延伸），切分时按**主题**而非严格时间区间（同一主题的发言放一段，时间区间标"约 14:15–14:30"）。
6. **Pre-read 段不动 + 但讨论中回答的 pre-read 问题应在 Live notes 里回链**：例如带读人的引导问题 #3 在会议中被讨论了，Live notes 段应在对应时段标"回应引导问题 #3"，让读者前后串得起来。
7. **Key insights 要"可被复用到其他 paper / project"**：判断标准 — 这条 insight 拿到下一篇 paper 还能用吗？能 → 留；只是事实 → 移到 Live notes。本次 5 条都通过这个测试（如"算力预算重分配"可复用到 DPO / KTO 评估）。
