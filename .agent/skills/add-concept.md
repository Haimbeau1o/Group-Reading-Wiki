# Skill: add-concept

## 何时调用

- "解释一下 GRPO，加到词典"
- "X 这个术语没收录，建一条"
- "把 SWA / KV cache / DPO 加到 concepts/"
- 在 `add-paper-note` skill 中遇到未收录术语，触发本 skill

## 输入清单

| 必填 | 字段 | 推断 |
|------|------|------|
| ✓ | term slug | 缩写优先（如 `moe`、`grpo`、`fp8`），多词用连字符 |
| ✓ | 全称 | 英文全称（如 `Mixture of Experts`） |
| | 中文译名 | 选填 |
| | 在哪些组内 paper / session 中出现过 | 用 `pnpm list:papers --json` `list:sessions --json` 搜 |

## 前置检查

`ls src/content/docs/concepts/<slug>.md` 不存在。如果存在，不是新增 → **走 update 路径**（在已有文件追加 / 修订段落）。

## 模板结构（必备段）

```markdown
---
title: <英文全称> (<缩写>)
description: 一句话定义。
sidebar:
  order: <next>
  label: <缩写>
---

## 一句话定义

…

## 直觉

…

## 数学 / 实现

…

## 在我们组的用法

> 占位 / 已有内容：链向具体 paper / session / theme
> 例：[XX paper 解读](/papers/xx) §3 用了它；与 [theme-slug 主线](/themes/theme-slug/) 开放问题 #2 相关。

## 延伸阅读

- 原论文：…
- 相关词条：…
- 站内：…
```

## 执行步骤

1. **手动建文件**（没有专门 scaffold；可以参考 `concepts/moe.md` 等已有词条作模板）
2. 写一句话定义（30-50 字，**严谨**）
3. 写直觉（200-400 字，含一个直观对比 / 类比）
4. 写数学 / 实现（公式用 KaTeX `$...$`、伪代码用 ```python）
5. **"在我们组的用法"段必填**：通过 `pnpm list:papers --json` `list:sessions --json` 找到该术语在组里出现过的地方，列链接
6. 延伸阅读：原论文 + 相关概念
7. 把新词条加到 `concepts/index.md` 的"已上线"列表（保持字母 / 主题分组）
8. 检查所有引用过该术语的 paper / session 文件，**首次出现处**改成 `[<term>](/concepts/<slug>/)` 链接
9. `pnpm verify`

## 写作长度

300-800 字。**不超过** 1000 字 —— 词典是速查，不是教程。

## 不要做的事

- ❌ 不复制 paper 大段原文
- ❌ 不写"在我们组没用过" —— 如果真没用过，留占位 + 备注 "待找用例"
- ❌ 不自动 commit
