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
- ✅ Action items 都有 @ 和具体动作
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
