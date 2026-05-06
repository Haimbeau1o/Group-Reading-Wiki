# Skill: refresh-theme

## 何时调用

- "更新 long-context 主线的论文清单"
- "把最近读的 X paper 加到 Y 主线"
- "long-context 主线的开放问题过时了"
- 季度 / 学期开始时定期刷新

## 输入清单

- 主题 slug（如 `long-context`）
- 要追加 / 修改的内容类型（论文清单 / 开放问题 / 推荐路径 / 我们组立场）

## 前置检查

1. `src/content/docs/themes/<slug>.md` 存在
2. `pnpm list:papers --json` 看 papers/ 里跟该 theme 关联的 papers（frontmatter `themes:` 字段）

## 执行步骤

### 类型 1：补关键论文

读 `themes/<slug>.md` 的"关键论文（外部）"段。

1. 用 `list:papers --json --theme=<slug>` 获取已写过解读的 paper
2. 把每个有解读的 paper 链入：`- [Paper Title](/papers/<slug>/) — 一句话点评`
3. 没解读的 arXiv 论文继续保留为外部链接

### 类型 2：补我们组的工作

询问用户要加哪些项目（agent 不能自己知道）。
按格式：

```markdown
- [x] **项目 A** (owner: @member-slug, 状态: 投稿中) — 一句话描述 — [arXiv](url) / [GitHub](url)
- [ ] **项目 B** (owner: @member-slug, 状态: 进行中)
```

### 类型 3：补开放问题

读最近 3-5 个 sessions（`list:sessions --since=90d --theme=<slug>`），从 Key insights 中抽离出新涌现的开放问题。
对话用户：建议 2-3 条新问题，让用户确认后写入。

### 类型 4：更新推荐阅读路径

跟用户确认：哪些 sessions / papers / concepts 现在是"入门必读"。

### 类型 5：更新"我们组的立场"

**只**在用户明确要求时改这段。它是 PI / 主线 owner 的观点，agent 不擅自改。

## 执行后

1. 更新 `themes/index.mdx` 的卡片描述（如果该主线 tagline 变了）
2. `pnpm verify`

## 不要做的事

- ❌ 不擅改"我们组的立场"段
- ❌ 不假定哪条是"我们组的工作"（必须用户确认）
- ❌ 不删除现有内容（除非用户明确说删 X）
- ❌ 不自动 commit
