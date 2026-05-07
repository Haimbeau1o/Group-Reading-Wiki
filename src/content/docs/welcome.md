---
title: 欢迎来到 Leon's Group 共读 Wiki
description: 站点定位、阅读路径、社区约定。
sidebar:
  order: 1
---

:::note[这是一个模板 demo]
你正在看到的 **Leon's Group** 是一个**虚构课题组示例**，用来演示这个 [课题组共读 Wiki 模板](https://github.com/Haimbeau1o/Group-Reading-Wiki) 长什么样。想用在你自己组：点仓库顶栏绿色 **Use this template** 按钮 → `pnpm init:group "<你的组名>"` → 一键改成你的。详见仓库 README。
:::

> **一句话**：把每一篇硬核 AI 论文 + 每一次周会讨论 + 每一段研究记忆，沉淀为全组可检索的"共享大脑"。

## 我们想解决什么问题

读前沿 AI 论文（尤其是 DeepSeek、GPT、Gemini、Llama 这种工程量爆表的模型论文）有三个常见痛点：

1. **太长太密**：一篇正文 + 附录 60 页是常态，独自啃很容易半路放弃。
2. **背景知识门槛高**：MoE、MLA、FP8、GRPO、speculative decoding…… 一篇论文里可能堆十个新概念。
3. **没人一起讨论**：读完一个细节没人对答案，疑问只能搁置。

这个站点就是为了让你 **不再一个人读**。

## 三种使用方式

### 1. 当 Wiki 用（读）

左侧导航直接跳到你感兴趣的专题。每篇文章都包含：

- 📌 论文出处、关键图、术语索引
- 🧠 "一句话版本" + "深度版本" 双层解读
- 🔗 跨文章链接（点 MLA 直接跳到概念词典对应词条）

### 2. 当论坛用（问 / 答）

每篇文章底部都嵌入了**评论区**（GitHub Discussions）。读到任何一处不懂的：

- 直接在该页底部发问
- 别人会收到通知并回复
- 有价值的讨论会被作者回填进正文

### 3. 当协作工具用（写）

所有内容都是 Markdown，托管在 GitHub。点击页面底部的 **"在 GitHub 上编辑页面"** 就能直接发起 PR：

- 错别字、链接失效 → 直接改
- 想补一段你的理解 → 加段落，Maintainer review 后合并
- 想发起一个新主题 → 见 [如何参与共读](/how-to-contribute/)

## 推荐阅读路径

刚来的话建议按这个顺序：

1. [DeepSeek 专题概览](/deepseek/overview/) — 总览全家
2. [V4 研究深度解析](/deepseek/v4-research/) — 旗舰之作完整剖析
3. [混合注意力机制](/deepseek/hybrid-attention/) — V4 最硬核的架构创新
4. [视觉原语](/deepseek/visual-primitives/) — DeepSeek-VL 的视觉编码

## 社区约定

- 🤝 **善意优先**：技术讨论可以激烈，但请尊重每一个提问的人。
- 📚 **引用原文**：所有论点尽量给出出处（论文段落 / Issue / commit）。
- ✍️ **小步提交**：宁愿多次小 PR，也不要积攒一个超大 PR。

准备好了？👉 去 [DeepSeek 专题](/deepseek/overview/) 开始第一次共读吧。
