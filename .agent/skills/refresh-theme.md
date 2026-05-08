# Skill: refresh-theme

## 何时调用

- "更新 long-context 主线的论文清单"
- "把最近读的 X paper 加到 Y 主线"
- "long-context 主线的开放问题过时了"
- 季度 / 学期开始时定期刷新

## 不适用场景（→ 别的 skill）

- 主线**首次填充**（占位还都是 TODO / 待补）→ 用 [`first-week-after-init`](./first-week-after-init.md) 或 [`bootstrap-new-group`](./bootstrap-new-group.md)
- 创建**新主线** → 用 `pnpm new:theme "<name>"` scaffold
- 改"我们组的立场"段（PI 个人观点）→ 让 PI 自己写，agent 不动

> 判断标准：如果 theme 文件里**至少 30% 内容是 PI 已填的真实信息**（非 TODO / 占位），适用 refresh-theme；否则属于首次填充。

## 输入清单

- 主题 slug（如 `long-context`）
- 要追加 / 修改的内容类型（论文清单 / 开放问题 / 推荐路径 / 我们组立场）

## 前置检查

1. `src/content/docs/themes/<slug>.md` 存在
2. `pnpm list:papers --json` 看 papers/ 里跟该 theme 关联的 papers（frontmatter `themes:` 字段）

## 执行步骤

### 类型 1：补关键论文

读 `themes/<slug>.md` 的"关键论文（外部）"段。

1. 用 `pnpm -s list:papers --json --theme=<slug>` 获取已写过解读的组内 paper note
2. 已写解读 → 链入内部路径：`- [Paper Title](/papers/<slug>/) — 一句话点评（≤ 30 字）`
3. 没解读的 arXiv 论文继续保留为外部链接：`- *待补*：[arXiv 标题](https://arxiv.org/abs/...) — 为什么值得读`
4. **去重**：如果某 paper 在两段里都出现（外部 + 已上线），保留"已上线"段那条，删"待补"那条
5. **清理孤立文字**（init 后遗症）：theme 文件里如果出现 `DeepSeek-V4 研究深度解析` 这种没有 link 的纯文本（init `sanitizeDemoLinks` 剥光的残留），整行删掉或问用户是否替换为该方向新的代表 paper

### 类型 2：补我们组的工作

询问用户要加哪些项目（agent 不能自己知道）。
按格式：

```markdown
- [x] **项目 A** (owner: @member-slug, 状态: 投稿中) — 一句话描述 — [arXiv](url) / [GitHub](url)
- [ ] **项目 B** (owner: @member-slug, 状态: 进行中)
```

### 类型 3：补开放问题

具体步骤：

```bash
# 1. 列出该主线最近 3-6 个月内动过的 sessions（用 git 模式避免 mtime 假阳性）
pnpm -s list:sessions --theme=<slug> --since=180d --source=git --json

# 2. 对每个 session 文件，重点读两段：
#    - "## 3. 💡 Post-meeting" → "Key insights" 子段
#    - "评论区延伸讨论" 段（如果有）
```

从这些 Key insights 里**抽出还没在 theme 文件"开放问题"段出现过的新问题**，按 PI 视角改写为：

- 1 句话能说清
- 是**问题**（带 ? 或"如何"），不是结论
- 能被未来实验/paper 推进（可证伪）

**别**直接复制 insight 原文 — Insight 是已有的洞察，开放问题是它引出的下一步追问。

对话流程：

```
agent: 我从 W18 / W19 两个 session 抽出 3 条候选开放问题：
  1. "敏感度分层"思想能不能挪到 MoE 训练稳定性？（来自 W18 §3）
  2. GRPO 在 non-verifiable reward 任务上能不能用 LLM-as-judge 当代理？（来自 W19）
  3. ...
  哪几条加进 long-context 主线？
用户: 1 加 (但改下措辞)，2 不要 (那是 reasoning 主线的)
```

确认后写入 theme 的"我们关心的开放问题"段，**追加在末尾**，不删旧问题。

### 类型 4：更新推荐阅读路径

跟用户确认：哪些 sessions / papers / concepts 现在是"入门必读"。

### 类型 5：更新"我们组的立场"

**只**在用户明确要求时改这段。它是 PI / 主线 owner 的观点，agent 不擅自改。

## 执行后

1. 更新 `themes/index.mdx` 的卡片描述（**只在该主线 tagline / 一句话定位变了时**改 — 用 `update-group-config` 不适用，这里是 mdx，直接 edit）
2. `pnpm verify`
3. 报告给用户：改了哪几段、新增 N 条 paper / 开放问题 / 项目，建议看 git diff

## frontmatter 处理边界

- ❌ **不动** `title` / `description` / `sidebar.label`（这是 starlight schema 字段，改了影响 routing / sidebar）
- ✅ 可加 / 改自定义字段如 `last_refreshed: 2026-W19`（如果约定有）

## 不要做的事

- ❌ 不擅改"我们组的立场"段
- ❌ 不假定哪条是"我们组的工作"（必须用户确认）
- ❌ 不删除现有内容（除非用户明确说删 X）— 即便看起来过时，先标 `~~strikethrough~~` 让用户决定
- ❌ 不自动 commit
- ❌ 不动 frontmatter `title` / `description`（见上节）

## 演练对话示例

```
用户：long-context 主线要补一下，最近读了 deepseek-r1。

agent：好。先扫描当前状态…

  ✓ themes/long-context.md 存在（不是占位 — 已有 PI 真实内容 ≥ 30%，适用 refresh-theme）
  ✓ list:papers --theme=long-context 找到 1 篇组内解读：deepseek-r1
  ⚠ 发现 1 处 init 残留：第 22 行 "DeepSeek-V4 研究深度解析" 是孤立文字（init 剥光的链接）

  我打算做：
  - Type 1（关键论文）：把 deepseek-r1 加到"已上线解读"段；处理孤立文字（删 / 替换？请确认）
  - Type 3（开放问题）：扫 W18 / W19 session，建议追加 2 条新问题

  Type 2（组内项目）/ Type 4（推荐阅读路径）/ Type 5（组内立场）这次不动？

用户：Type 1 把孤立文字删了，Type 3 跑一下看候选

agent：（写入 + 列出 Type 3 候选...）
```

## 演练发现总结（2026-05 静态扫描）

未做端到端 dogfood，但静态扫描发现 6 处缺陷已合并到本文档：

1. ✅ 加了 first-fill vs refresh 边界判断（30% 真实信息阈值）
2. ✅ Type-3 数据源具体化（`list:sessions --source=git --since=180d`）
3. ✅ Type-1 增加 init 后孤立文字清理子协议
4. ✅ frontmatter 处理边界明确（不动 starlight schema 字段）
5. ✅ 加了完整演练对话示例
6. ✅ Type-1 去重规则（外部 vs 已上线）

**待真实 dogfood 验证**：上面所有改动都是静态推断；下一次 PI 真用 refresh-theme 时记录踩坑。
