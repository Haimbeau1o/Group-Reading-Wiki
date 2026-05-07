---
title: 如何参与共读
description: 三种贡献路径：评论 / PR / 提名论文。
sidebar:
  order: 2
---

无论你是想"提个问题"还是"重写一整章"，下面这三条路径都欢迎。

## 路径 A：在评论区提问 / 补充（最低门槛）

每篇文章底部都有 **Giscus 评论区**（基于 GitHub Discussions）。

1. 用 GitHub 账号登录
2. 在原文段落对应位置发问 / 评论
3. 别的读者或维护者会订阅这个 Discussion，得到回复后你会收到通知

> 推荐做法：**贴上原文段落的关键句**，方便后来者定位。

## 路径 B：直接 PR 改进文章（最有价值）

每个页面底部（最后一次更新时间上方）都有 **在 GitHub 上编辑页面** 链接，点进去就是 GitHub Web 编辑器。

### 适合 PR 的修改

- ✅ 错别字、术语统一、链接修复
- ✅ 补一张图、补一段你的注解（用 Markdown `> [!NOTE]` 块）
- ✅ 翻译某一节到 `en/` 子目录
- ✅ 修正技术错误（请在 PR 描述里给出原文出处）

### PR 流程

```bash
# 1. Fork 仓库后克隆
git clone https://github.com/your-fork/ai-paper-wiki.git
cd ai-paper-wiki

# 2. 安装依赖并起本地服务
pnpm install
pnpm dev   # http://localhost:4321

# 3. 在 src/content/docs/ 下编辑 .md / .mdx
# 4. 提交 PR，CI 会自动 build 验证
```

### 写作风格

- **每篇文章先给"一句话定位"**，再展开。
- **图优先**：能用图说明的不要堆公式。
- **链接概念词典**：第一次出现的术语必须链接到 `/concepts/<term>/`。
- **段落短**：移动端友好，每段不超过 5 行。

## 路径 C：提名一篇论文 {#提名一篇论文}

想推荐下一周共读哪篇？开一个 GitHub Discussion，按这个模板：

```markdown
## 论文标题
[Paper Title](https://arxiv.org/abs/...)

## 为什么值得读
- 1-3 条理由

## 我能贡献什么
- [ ] 写一段背景介绍
- [ ] 复现 / 测试关键实验
- [ ] 翻译某节
- [ ] 我只是想旁观学习
```

## 维护者节奏

- 🗓️ 每周日：盘点本周新提名的论文，挑 1 篇定为下周共读主题
- 📝 周一发布共读 issue，列出可认领的章节
- 📢 周五汇总笔记，合并进 wiki

## 联系方式

- GitHub Issues / Discussions（首选）
- 后续会开 Discord 或微信群，关注首页公告
