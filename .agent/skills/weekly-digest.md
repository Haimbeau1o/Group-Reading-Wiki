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

```bash
pnpm list:sessions --since=7d --json
pnpm list:papers --since=7d --json
pnpm list:concepts --since=7d --json
git log --since="7 days ago" --pretty=format:"%h %s (%an)"
```

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
