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

1. **建文件**（推荐用 scaffold）：

   ```bash
   pnpm new:concept <slug> --full="<英文全称>" --label="<缩写>" \
     --aliases="<别名1>,<别名2>" --related="<相关 slug>,<相关 slug>" \
     [--parent=<父概念 slug>] [--paper=<已用过该术语的 paper slug>] --json
   ```

   或手动建。frontmatter 必含（cycle-8 起新字段标 ✨，可空但不要省）：

   ```yaml
   ---
   title: <英文全称> (<缩写>)
   description: 一句话定义
   sidebar:
     order: <下一个序号>
     label: <缩写>
   aliases: ["Group Relative Policy Optimization"]   # ✨ 别名（让搜索 / 自动链可命中）
   related_concepts: [ppo]                            # ✨ 相关概念 slug，**双向自动建边**
   parent_concept: ppo                                # ✨ 父概念（GRPO.parent = PPO）；无父填 null
   tags: [rl]                                         # ✨ 小写连字符 tag
   ---
   ```

   > 命名建议：`aliases` 包含全称 + 中文译名 + 常见缩写变体（"Mixture-of-Experts" / "MoE" / "稀疏专家"）。这是 Phase 2 自动链的种子。

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
8. 检查所有引用过该术语的 paper / session 文件：
   - **首次出现处**改成 `[<term>](/concepts/<slug>/)` 链接（正文）
   - **同时**把本 slug 加进对应 paper 的 frontmatter `concept_refs[]` / session 的 `concept_refs[]`（这是知识图反向边的来源；用 `multi_edit` 改 frontmatter）
9. `pnpm verify && pnpm build:index`
10. **看邻居**：

    ```bash
    pnpm -s context:for concepts/<slug> --depth=1
    ```

    应能看到刚刚 backfill 的 paper / session 反向出现在 "papers ←" / "sessions ←" 段。如果为空 → 步骤 8 漏改 frontmatter。

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

### 演练发现（cycle 8 · 知识图集成）

- **#F4 `pnpm new:concept` 其实一直存在**：cycle-5.B 的 `#29` 把它标 TODO 说"没 scaffold"，实际 `package.json` 有 `new:concept` 脚本。cycle-8 已修文档 + 给 scaffold 加 `--aliases` / `--related` / `--parent` / `--tags` flag。
- **#F5 Step 8 的反向回写 frontmatter**：过去只要求"改正文链接"，不够。cycle-8 起**必须**同时把本 slug 加进 paper/session 的 frontmatter `concept_refs[]`，否则 `/concepts/<slug>/` 页 Backlinks 看不到反向。用 `multi_edit` 改 frontmatter，不要重写文件。
- **#F6 Step 10 `context:for` 自检**：build:index 跑完再用 `pnpm -s context:for concepts/<slug>` 验证 "papers ←" / "sessions ←" 真的出现。为空 = Step 8 漏改某个 frontmatter。

### 演练发现（cycle 5.B · mode-fusion 新建 + moe demo 清洗）

- **#29**：无 `pnpm new:concept` scaffold（与 paper / session / member / theme 不一致）。已在执行步骤标 TODO。
- **#30 (init bug)**：`init:group` 没清洗 `concepts/*.md` 里的 "在 DeepSeek 里的用法" 段。已加 Update 路径协议处理 demo 污染。
- **#31**：`concepts/index.md` 标题 "首批 N 条" 写死、moe 描述带 "DeepSeekMoE" demo 文字。Skill Step 7 已明确 "不写死数字"。
- **list 调用统一 `pnpm -s`**：与 weekly-session #25 同根源。已加 ⚠️。
- **"在我们组的用法" 段是核心**：组词典与一般词典的区别。要给 paper / session 链接 + 组关心的开放问题，参考 mode-fusion.md。
