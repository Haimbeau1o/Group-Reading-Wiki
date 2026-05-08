# Skill: weekly-digest

## 何时调用

- "周日生成本周 digest"
- "总结一下本周 wiki 活动"
- "发周报给组员"
- 定期任务（推荐每周日固定时间）

## 输出格式

**两个版本**：

1. **Slack / 邮件版**：250-400 字，markdown 格式可直接粘贴
2. **wiki 归档版**：写入 `src/content/docs/sessions/digest/<year-week>.md`（可选）

## 执行步骤

### 1. 收集本周数据

**必须用 `--source=git`**（默认 mtime 不可靠 — init / checkout / 批量改文件都会刷 mtime）：

```bash
# "本周新增"内容（A = Added）
pnpm -s list:sessions --since=7d --source=git --status=A --json
pnpm -s list:papers   --since=7d --source=git --status=A --json
pnpm -s list:concepts --since=7d --source=git --status=A --json

# "本周更新"内容（A 或 M 都包含；不带 --status 则返回窗口内所有动过的）
pnpm -s list:sessions --since=7d --source=git --json

# 提交摘要
git log --since="7 days ago" --pretty=format:"%h %s (%an)"
```

输出 JSON 每条带 `git_status` (A/M/R) 和 `git_date`，方便区分"新建" vs "更新"。

> ⚠ 不要用 `pnpm list:* --since=Nd`（不带 `--source=git`），它过滤的是 filesystem mtime，会把今天 init/checkout 动过的所有文件误报成"本周新增"。

### 2. 结构化生成

Slack 版模板：

```markdown
# 本周 wiki digest · {year}-W{week}

## 🗓️ 本周共读

- **W{week}** · [{paper title}](/sessions/...) · 带读人 @{lead}
  - 关键 insight: {1 句话从该 session 的 Key insights 抽}
  - Action items: N 条

## 📝 本周新增 / 更新

- [+] paper: [{title}](/papers/...)（@{author}）
- [+] concept: [{term}](/concepts/...)（@{author}）
- [~] theme: [{theme}](/themes/...) 更新了开放问题

## 👥 成员动态

- @{member} 写了 N 条 reading log
- @{new-member} 加入

## 📅 下周

- 共读：[W{week+1}](/sessions/...) · 带读人 @{next-lead}
- 提醒：周日前留 pre-read 问题

## 💬 本周值得追问的

> 从 sessions / 评论区抽出 1-2 个值得后续讨论的问题
```

### 3. wiki 归档（可选）

如果用户要求归档，写入 `src/content/docs/sessions/digest/<year-week>.md`，结构同上但更详细，加 frontmatter：

```yaml
---
title: 本周 digest · {week}
description: …
sidebar:
  hidden: true
---
```

`hidden: true` 让 digest 不污染 sidebar，但仍可 URL 访问。

### 4. 不写到 wiki 里的内容

- 个人 reading log 引用时**只链接，不复制原文**（隐私）
- 评论区私下追问内容**不进 digest**

## 检查点

- ✅ 长度 < 400 字（Slack 版）
- ✅ 所有 @ 都是真实成员 slug
- ✅ 所有链接是仓库内有效路径

## 不要做的事

- ❌ 不替成员写 reading log 内容
- ❌ 不暴露 internal/ 路径里的内容（如果将来加了）
- ❌ 不自动发到 Slack（**只生成文本，让用户复制粘贴**）

## 演练发现总结（2026-W19 dogfood）

首次端到端跑通。**重要踩坑**：

1. ✅ **`list.mjs --since=Nd` 用 mtime 不可靠 — 已修复**：cycle-6 后置加了 `--source=git` flag。批量改文件 / init / checkout 刷 mtime 不再误报。**新用法**：`pnpm list:* --since=7d --source=git --status=A`。输出每条带 `git_status` (A/M/R) 和 `git_date`。详见执行步骤 §1。原 mtime 模式作为向后兼容仍可用，但**不要用于 digest 数据收集**。
2. **digest 归档命名规范**：用 lowercase week — `2026-w19.md`（与现有 `2026-w18.md` 一致）。注意文档里的 `<year-week>` 占位易让 agent 写成 `2026-W19.md`，这会破坏归档索引。
3. **多 session 周的处理**：如果一周有 2+ session（罕见，但调度滑动会发生），"本周共读"段每个 session 各一块，主 insight 各抽一条。
4. **Slack 版字符上限按显示字符算**：markdown link 在 Slack 渲染后是显示文本字符数，反引号 / 加粗符号不算入显示。目标 250-400 字按**渲染后**字符数。
5. **digest 与 post-meeting-recap 的边界**：digest 不重写 Key insights，**只挑一条最有信号的引用回 session**。多于一条会和 session 页 Post-meeting 重复。
6. **建议建 `scripts/new-digest.mjs` scaffold**（pending）：自动从 session 页的 frontmatter + Post-meeting 抽数据，避免 agent 手写漏字段。当前每次手写有 misalign 风险。
7. **"💬 本周值得追问的"段最有价值**：是 digest 区别于自动生成 changelog 的关键 — 它强迫 agent 做一次跨 session 的连接（W19 insight ↔ W20 plan），是 PI 最看重的部分。
