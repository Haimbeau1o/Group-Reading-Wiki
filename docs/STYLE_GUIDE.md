# Wiki 内容风格指南

> 给**人**和**agent**都看的 — 写出来的文章长什么样。

> 📌 这是 **template-level** 的指南，跨课题组复用。具体到你的组的偏好（喜欢中文还是英文、术语习惯等），请额外维护一个 `.agent/notes/group-style.md`。

## 总原则

**一篇好的 wiki 文章服务于"未来某天 5 分钟内重新理解它"，而不是"今天的我已经懂了"**。这意味着：

- 写**为什么这么做**，不只是**做了什么**
- 写**和我们组的关联**，不只是论文复述
- 留**未解问题**，不只是结论
- 给**入口和出口**（推荐前置 / 后续阅读），文章是图的一个节点

## 各类文章的风格 · paper note

> Reference exemplar: [`papers/deepseek-r1.md`](../src/content/docs/papers/deepseek-r1.md)

### 必备结构

```text
1. 元信息表        ← 作者 / arXiv / 发表 / 关联主线 / 关联 session / 带读人 / 状态
2. 一句话总结       ← 一句，带反直觉点
3. 我们组为什么读这篇 ← 关键！这是组内 paper note 与 arXiv 摘要的本质差异
4. 关键贡献         ← 按重要性排，每条 100-300 字解释为什么这一条值得
5. 方法详解         ← 算法 / 公式 / 架构图（公式用 KaTeX）
6. 关键实验 / 结果   ← 表格，对照看数字
7. 我们组的 take    ← 核心！短期 / 中期 / 长期对组里的影响
8. 局限与未解问题    ← 论文承认的 + 我们的额外质疑
9. 开放问题         ← 可作为后续 paper / project 切入点
10. 共读历史        ← 哪几次 session 读过
11. 延伸阅读        ← 前驱 / 同期 / 概念基础 / 组内相关
```

### 应该 vs 不应该

| ✅ 应该 | ❌ 不应该 |
|--------|-----------|
| 写"我们组为什么读这篇" | 抄 arXiv 摘要 |
| 写"我们的 take" 一节 | 只总结作者论点 |
| 写组内成员 [@username](/members/) 的具体观点 | 通篇匿名 |
| 留 3+ 开放问题 | 写得像"读完了，没事了" |
| 链向前驱 paper / 组内 session | 孤岛文章 |
| 用 KaTeX 写公式 `$$...$$` | 截图贴公式 |
| 用表格对照数字 | 长段文字描述实验结果 |
| 标注 `exemplar: true`（如果是组样板） | 普通文章乱标 exemplar |

### 长度

**不限**。R1 那篇约 350 行 markdown，因为 paper 复杂；某些 paper 100 行就讲清了。**密度** > 长度。

## 各类文章的风格 · session 共读笔记

> Reference exemplar: [`sessions/2026-w18-deepseek-v4.md`](../src/content/docs/sessions/2026-w18-deepseek-v4.md)

### 三段式：Pre-read / Live notes / Post-meeting

每段写作时机不同，**不要一次写完**：

| 段 | 写作时机 | 谁写 | 关键 |
|----|----------|------|------|
| Pre-read | 周三–周日 | 带读人 | **3 个引导问题**（不是 30 个） |
| Live notes | 共读现场 | 记录员 | 不必整齐，**带时间戳** |
| Post-meeting | 周二补完 | 带读人 | **Key insights ≤ 3 条** + Action items 真有 owner & deadline |

### 关键不变量

- Action items **必须**带 `@username` + 截止时间（如 `截止 W21`）
- Key insights **必须**联系到组的[研究主线](/themes/)
- 评论区延伸讨论必须 link 到 Giscus（站点已自动注入）

## 各类文章的风格 · theme（研究主线）

> Reference exemplar: [`themes/long-context.md`](../src/content/docs/themes/long-context.md)

主线页**给新人看 30 分钟，看懂组在干嘛**。

必备结构：

```text
1. 一句话定位       ← "我们关心 X，我们不关心 Y"
2. 该方向的 owner   ← 小导师 + 核心博士
3. 关键论文（外部）  ← 链向我们的解读
4. 我们的工作（内部）← 当前进行 / 已发表 / 待启动
5. 我们关心的开放问题
6. 推荐阅读路径（给新人）
7. 该主线的"组内立场" ← 带主观色彩，重要！
```

"组内立场"是关键 —— 比如 long-context 主线明确说 **"我们认为 RAG 长期会输给 native long-context"**。这种立场让新人 30 秒知道组的偏见，比任何"中立综述"有用。

## 各类文章的风格 · concept（概念词典）

> Reference exemplars: [`concepts/grpo/`](../src/content/docs/concepts/grpo/index.md), [`concepts/moe/`](../src/content/docs/concepts/moe/index.md)

每条 100–300 字，可以更长。**给"听过这个词但不懂"的人看**。

必备结构：

```text
1. 定义           ← 一句话
2. 关键性质 / 公式
3. 与相关概念的关系 ← 链向 / 区分（重要！）
4. 我们组用到的地方 ← 链向 paper note 或 session
5. 延伸阅读        ← 1-3 篇 source
```

## 元数据 · frontmatter 约定

每个 .md / .mdx 顶部必须有 frontmatter（YAML），由 [`scripts/verify.mjs`](../scripts/verify.mjs) 校验。

### 通用必填

```yaml
title: 文章标题（含特殊字符如 ":" 必须加引号）
description: 一句话描述（≤ 100 字）
```

### Paper note 专用

```yaml
themes:
  - <theme-slug>      # 关联主线（链入图）
status: draft | published
exemplar: true        # 可选。标记为"组样板"：跨 init:group 保留
```

### Session 专用

```yaml
session_week: 2026-W19
session_date: 2026-05-11
lead: <member-slug>
paper_refs:
  - /papers/<slug>/
themes:
  - <theme-slug>
status: upcoming | live | archived
```

### Member 专用

```yaml
title: <姓名>
role: 大导师 | 小导师 | 博士生 | 硕士生
status: active | alumni | visitor
cluster: 方向掌舵者 | 研究主理人 | 学习成长者 | 任务驱动者 | 流动接触者
```

## 链接约定

**站内链接**用绝对 URL：

✅ `[GRPO](/concepts/grpo/)`
❌ `[GRPO](../concepts/grpo/index.md)`

`pnpm verify` 会自动校验所有 `/path/` 是否对应到实际文件。

## 公式约定

**KaTeX**（站点已配置 rehype-katex）：

```markdown
inline: $\hat A_i = (r_i - \bar r) / \sigma_r$

block:
$$
\mathcal{L}_{\text{GRPO}} = \mathbb{E}_{q, o} [...]
$$
```

❌ 不要：
- LaTeX 截图
- 用 `\\(...\\)` 风格（KaTeX 已用 `$...$`）
- 在 frontmatter 里写公式

## Mermaid 图

站点已配置 `rehype-mermaid-pre`，直接用代码块：

````markdown
```mermaid
graph LR
  A --> B
```
````

## 写作的 Agent 约定

> 给 agent 看：用我们的 skills 系统时该遵守什么。

详见 [`.agent/skills/`](../.agent/skills/) 下各 skill 的 SKILL.md。每个 skill 有自己的"陷阱与最佳实践"小节。

如果你的 agent 写文章违反了本指南：

1. `pnpm verify` 会抓 frontmatter / 链接错
2. CI 会进一步抓
3. PR review 时 maintainer 会指出风格问题

**最坏情况**：写出一篇"长度够但密度低"的文章 — verify 抓不到，但人会看出来。这种情况由 PR review 兜底。

---

> 这个 style guide 自身也是 exemplar — 跨 fork 保留。改进它请提 PR。
