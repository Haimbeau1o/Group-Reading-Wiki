# 写作与命名约定（Conventions）— agent 必读

## 1. Frontmatter 通用规则

所有 `.md` / `.mdx` 顶部用 YAML frontmatter。**禁止重复 key**（YAML 会解析失败）。

```yaml
---
title: <显示名>            # 必填
description: <一句话>       # 必填，给 SEO + 卡片
sidebar:
  order: <number>          # 选填，越小越靠前
  label: <短名>            # 选填，sidebar 自定义
  hidden: <bool>           # 选填，true 则不在 sidebar 显示
draft: <bool>              # 选填，true 则 build 时跳过该页
---
```

不同模块还有自己的扩展字段（详见 `repo-map.md` / `role-model.md`）。

## 2. 文件命名约定

| 类型 | 格式 | 示例 |
|------|------|------|
| Session | `<week>-<paper-slug>.md` | `2026-w18-deepseek-v4.md` |
| Paper | `<paper-slug>.md`（小写连字符） | `mixtral.md`、`deepseek-r1.md` |
| Concept | `<term-slug>.md`（缩写优先） | `moe.md`、`grpo.md`、`fp8.md` |
| Theme | `<theme-slug>.md`（核心词组） | `long-context.md`、`moe-sparsity.md` |
| Member | `<github-username>.md` 或 `<role-pos>.md` | `zhangsan.md`、`phd-senior-1.md` |

**禁止**：中文文件名、空格、大写、下划线（用连字符）。

## 3. 跨页链接规则

| 引用对象 | 用什么 |
|---------|--------|
| 仓库内页面 | **绝对路径** `/themes/long-context/`（结尾带 `/`） |
| 概念词典 | 第一次出现的术语 → `[MoE](/concepts/moe/)` |
| 成员 | `[张三](/members/zhangsan/)` |
| Session | `[W18 共读](/sessions/2026-w18-deepseek-v4/)` |
| 主线 | `[长上下文主线](/themes/long-context/)` |
| 外部 arXiv | `[Paper Title](https://arxiv.org/abs/xxxx.xxxxx)` |
| 仓库内文件（非 wiki 页） | 在 README / CONTRIBUTING 里：相对路径 `[LICENSE](LICENSE)` |

**链接 anchor**：`/foo/#子标题中文也可` —— Starlight 会自动用中文 slug。

## 4. 写作风格

| 原则 | 含义 |
|------|------|
| **每页先一句话定位** | frontmatter 后第一行用 quote `> **一句话**：...` |
| **图优先** | 能用图说明的不堆公式；用 Mermaid 直接写代码块 |
| **段落短** | 每段 ≤ 5 行 |
| **链接术语** | 第一次出现的术语链向概念词典 |
| **给出处** | 论点给原文 / 论文章节 / commit 链接 |
| **first draft, ugly, OK** | 写不完美 + 发出来 > 完美 + 私藏 |

## 5. Mermaid / KaTeX

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\mathcal{L} = \mathbb{E}[r(x) - \beta \cdot \text{KL}]
$$

流程图：
\`\`\`mermaid
graph LR
  A --> B
  B --> C
\`\`\`
```

公式与图都是**构建期 / 客户端 lazy** 渲染，不影响 build。

## 6. 占位与 TODO 标记

| 标记 | 用途 |
|------|------|
| `> ⚠️ 占位内容。<role> 来填。` | 整页是占位 |
| `（待填）` | 短内联占位 |
| `> 占位。` | 段落级占位 |
| `<!-- TODO: ... -->` | 不可见的开发者备注 |

## 7. 评论 / 讨论位置

| 想表达什么 | 写在哪 |
|-----------|--------|
| 对某 paper 的追问 | paper 页底部 Giscus 评论区 |
| 对某 session 讨论的延伸 | session 页底部评论区 |
| 半成型的 idea / 不规律观点 | 自己 `/members/<x>/` 的 Reading log |
| 组级别决策（要保留为档案） | PR / Discussion |
| 临时聊（找人 / 灌水） | 不在 wiki，用 Slack / 群聊 |

## 8. 不要做的事

- ❌ 在 wiki 里放真实邮箱 / 电话 / API key
- ❌ 复制粘贴 paper 大段文字（侵权 + 影响 SEO）
- ❌ 写跨主线的"通用"page（拆到对应主线下）
- ❌ 用文件名表达元信息（用 frontmatter 字段）
- ❌ 写很长的文件名（超过 50 字符）

## 9. 提交信息（commit message）

agent 提交时（**仅在用户明确要求**）：

```
<type>: <一句话总结>

[可选：详细说明，bullet list]

[可选：协作署名]
Co-authored-by: <user> <email>
```

`<type>` 取值：

- `session:` 加 / 改 session 页
- `paper:` 加 / 改 paper note
- `concept:` 加 / 改概念词典
- `member:` 加 / 改成员页
- `theme:` 加 / 改研究主线
- `docs:` 改 README / CONTRIBUTING / AGENT_GUIDE 等
- `feat:` 加新功能 / 新模块
- `fix:` 修 bug
- `refactor:` 重构（不改行为）

agent 默认**不自动 commit**。
