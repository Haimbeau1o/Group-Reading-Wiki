# 贡献指南

> 网页版：见 [/how-to-contribute/](src/content/docs/how-to-contribute.md)。
> 这里给开发者看的精简版。

## TL;DR

1. **小修改**（错别字、链接修复）：直接在网页右上角点 **Edit page** → GitHub 网页编辑器 → PR
2. **大修改**（新文章、新专题、翻译）：fork → clone → 本地 `pnpm dev` → 改 → PR
3. **不会代码**：在 [Discussions](https://github.com/Haimbeau1o/Group-Reading-Wiki/discussions) 提名论文 / 在文章底部评论区抛问题

## 本地开发

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # 验证生产构建
```

要求：Node ≥ 20，pnpm ≥ 10。

## 内容规范

### 文件位置

| 内容类型 | 路径 | 是否自动进 sidebar |
|----------|------|-------------------|
| DeepSeek 专题文章 | `src/content/docs/deepseek/<slug>.md` | ❌ 改 `astro.config.mjs` |
| 概念词典词条 | `src/content/docs/concepts/<term>.md` | ✅ 自动 |
| 论文解读页 | `src/content/docs/papers/<paper>.md` | ✅ 自动 |
| 新专题（如 qwen） | `src/content/docs/<topic>/` 新建 | ❌ 改 `astro.config.mjs` |
| 文章配图 | `public/docs-assets/<name>.png` | — 正文里写 `/docs-assets/<name>.png` |

### Frontmatter 模板

每篇 `.md` / `.mdx` 顶部必须有：

```yaml
---
title: 标题（H1 + 浏览器 tab）
description: 一句话描述（SEO + 卡片）
sidebar:
  order: 2          # 同级排序，可选
  label: 短标题     # sidebar 显示，可选
---
```

### 写作风格

- **每篇先一句话定位**，再展开。
- **图优先**：能用图说明的不堆公式。Mermaid 直接在 `.md` 里写：
  <pre>```mermaid
  graph LR
    A --> B
  ```</pre>
- **链接概念**：第一次出现的术语链接到 `/concepts/<term>/`。
- **段落短**：每段 ≤ 5 行。
- **给出处**：所有论点给原文 / 论文章节 / commit 链接。

### 概念词典词条模板

```markdown
---
title: <英文全称> (<缩写>)
description: 一句话定义
sidebar:
  label: <缩写>
---

## 一句话定义
## 直觉
## 数学 / 实现
## 在 DeepSeek 里的用法
## 延伸阅读
```

## PR 流程

1. fork 仓库 → 新建分支：`git checkout -b feat/add-mla-concept`
2. 改完后**本地必须 `pnpm build` 通过**
3. commit message 用前缀：`docs: ...` / `concept: ...` / `paper: ...` / `fix: ...`
4. 提 PR，描述里说明：
   - 改了什么
   - 关联的 Issue / Discussion
   - 截图（如果是 UI 相关）

### CI 检查

PR 上会自动跑 `pnpm build`。失败的话点 Actions 看日志。

### review 节奏

- 小修复：通常 24h 内 merge
- 新文章：先 review 大纲（可在 PR 里贴 outline 早期反馈），再 review 全文

## 行为准则

技术讨论可以激烈，但请尊重每一个提问的人。**对事不对人**。

恶意行为（人身攻击、仇恨言论、垃圾信息）会被直接 block。

## 联系

- GitHub Issues / Discussions（首选）
- 后续考虑开 Discord
