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

> 📝 **TODO**：暂无 `pnpm new:concept` scaffold（与其他类型不一致）。当前手动建文件，参考 `concepts/grpo.md` 或 `concepts/mode-fusion.md` 作模板。后续可加 scaffold 脚本统一。

1. **手动建文件**：复制下面的 frontmatter，写入 `src/content/docs/concepts/<slug>.md`：

   ```yaml
   ---
   title: <英文全称> (<缩写>)
   description: 一句话定义
   sidebar:
     order: <下一个序号>
     label: <缩写>
   ---
   ```

2. 写一句话定义（30-50 字，**严谨**）
3. 写直觉（200-400 字，含一个直观对比 / 类比）
4. 写数学 / 实现（公式用 KaTeX `$...$`、伪代码用 ```python）
5. **"在我们组的用法"段必填** —— 这是组词典区别于一般词典的核心：

   ⚠️ **必须用 `pnpm -s`**（silent）调用，否则 JSON 被脚本头脏。

   ```bash
   # 找用过该术语的 paper / session
   pnpm -s list:papers --json | jq '.items[] | select(.body | test("<term>"; "i"))'
   pnpm -s list:sessions --json | jq '.items[] | select(.body | test("<term>"; "i"))'
   ```

   shape：`{subcommand, count, items: [...]}`，每个 item 含 `slug` / `path` / `title`。

   **必填模式**（参考 `concepts/mode-fusion.md`）：
   - 链向具体 paper note 的 §X 用法
   - 链向 session 的讨论
   - 写出我们组关心的开放问题（不是简单的"还没用过"）

6. 延伸阅读：原论文 + 相关概念
7. 把新词条加到 `concepts/index.md` 的"已上线"列表（不要写死 "首批 N 条"）
8. 检查所有引用过该术语的 paper / session 文件，**首次出现处**改成 `[<term>](/concepts/<slug>/)` 链接
9. `pnpm verify`

## Update 路径（词典已存在但 demo 污染）

`init:group` 当前**没清洗** `concepts/*.md` 的 demo 内容（如 moe.md 的 "在 DeepSeek 里的用法" 段）。这是已知的 init bug。

如果你被触发 `add-concept` 但 slug 已存在，agent 应：

1. **检测是否 demo 污染**：grep `"在 DeepSeek 里的用法"` 之类的 demo-specific 段
2. **替换为 "在我们组的用法"**：参考 mode-fusion.md 的模式（架构对照表 + 我们组关心的开放问题）
3. **更新 description / index 文案**：删掉 demo 残留如 "DeepSeekMoE 的细粒度专家"

## 写作长度

300-800 字。**不超过** 1000 字 —— 词典是速查，不是教程。

## 不要做的事

- ❌ 不复制 paper 大段原文
- ❌ 不写"在我们组没用过" —— 如果真没用过，留占位 + 备注 "待找用例"
- ❌ 不自动 commit

## Lessons learned

### 演练发现（cycle 5.B · mode-fusion 新建 + moe demo 清洗）

- **#29**：无 `pnpm new:concept` scaffold（与 paper / session / member / theme 不一致）。已在执行步骤标 TODO。
- **#30 (init bug)**：`init:group` 没清洗 `concepts/*.md` 里的 "在 DeepSeek 里的用法" 段。已加 Update 路径协议处理 demo 污染。
- **#31**：`concepts/index.md` 标题 "首批 N 条" 写死、moe 描述带 "DeepSeekMoE" demo 文字。Skill Step 7 已明确 "不写死数字"。
- **list 调用统一 `pnpm -s`**：与 weekly-session #25 同根源。已加 ⚠️。
- **"在我们组的用法" 段是核心**：组词典与一般词典的区别。要给 paper / session 链接 + 组关心的开放问题，参考 mode-fusion.md。
