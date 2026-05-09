# Skill: find-related-context

> **通用前置 skill**：写新内容前先问知识图"组里关于 X 的现状是什么"。Cycle-8 起 agent 写任何 paper / concept / session / theme / member 之前**先跑这个**，避免重复造轮子或漏链。

## 何时调用

写之前。具体触发：

- 用户说"我打算写关于 X 的笔记 / session / concept" → 先 find 一下
- 用户说"组里有没有人讨论过 X？" / "Y 这个术语我们写过吗？"
- 自己（agent）准备调 `add-paper-note` / `weekly-session` / `add-concept` / `refresh-theme` 前
- 准备给新生定 reading list（`personalized-onboarding`）前
- review PR 时判断改动是否冲掉已有内容

**不适用**：纯改 frontmatter 字段名 / 修文档 typo / 跑 verify 等不涉及内容创作的操作。

## 输入清单

| 必填 | 字段 |
|------|------|
| ✓ | "焦点" — 一个 slug（`concepts/grpo`）或一个名词（`GRPO` / `long context` / `MoE 路由稳定性`）|
| | 想要的深度（默认 1，扩散看 2）|
| | 输出格式：人读 vs json（默认人读，自动化场景给 `--json`）|

## 执行步骤

### 1. 把"焦点"映射到 slug

如果用户给的是名词、不是 slug：

```bash
# 优先精确 slug
pnpm -s context:for grpo                          # 自动尝试 concepts/grpo / papers/grpo / ...

# 不存在 / 歧义 → fallback 到 list:* + grep
pnpm -s list:concepts --json | jq '.items[] | select(.title | test("GRPO"; "i"))'
pnpm -s list:papers   --json | jq '.items[] | select(.title | test("GRPO"; "i"))'
```

如果**完全找不到** → 这是个"组里还没人写过 X"的明确信号，直接告诉用户："X 还未收录，建议走 add-concept / add-paper-note"。

### 2. 跑 context:for

```bash
# 1 跳邻居（最常用）
pnpm -s context:for <slug>

# 2 跳扩散（写主线 / onboarding 用）
pnpm -s context:for <slug> --depth=2

# json 自动化（脚本里嵌入）
pnpm -s context:for <slug> --json --depth=2
```

### 3. 阅读返回结果

`context:for` 按节点类型分组：

- **papers (←/→)**：哪些 paper note 引用了焦点 / 焦点引用了哪些 paper
- **concepts**：相关 / 父 / 子概念
- **sessions**：哪些 session 讨论过
- **themes**：所属主线
- **members**：owner / led_by / participated

### 4. 把发现报回用户

格式（**强制带"已有 vs 缺口"两段**）：

```
🟢 已有（组里已写过 / 讨论过）：
  - papers/<slug> ··· 一句话定位
  - sessions/<week-slug> ··· 哪次会
  - concepts/<slug> ··· 一行定义
  → 建议：写新内容前**先读这些**，避免重复 + 互相 cross-link

🟡 邻接但未直接覆盖：
  - 主线 themes/<slug> 在管这块，但还没具体 paper
  - concept 父级 X 已有，子 / 应用还没

🔴 缺口（组里还没写过）：
  - 这个角度 / 这条 paper 没人写过 → 建议补
```

如果**全是 🔴**：明确告诉用户"这是空白领域，可以放心写新的"。
如果**已有 🟢**：建议**先**读已有的（避免重复），新写的至少要 `related_papers` / `concept_refs` 链回去。

### 5. （可选）落到具体 skill

根据焦点类型 + 用户意图，建议下一步 skill：

| 焦点类型 | 用户想 | 下一步 skill |
|---------|-------|-------------|
| paper（已有） | 写笔记 | 已有！先读 — 不必重写 |
| paper（缺口） | 写笔记 | `add-paper-note` |
| concept（缺口） | 加词典 | `add-concept` |
| theme（已有但旧） | 刷新 | `refresh-theme` |
| 一周共读 | 排会 | `weekly-session`（**先用本 skill 发现的 concepts 写"关联背景"段**）|
| 新生 | 定路径 | `personalized-onboarding`（用本 skill `--depth=2` 拿主线邻居）|

## 检查点

- ✅ 至少跑了一次 `pnpm -s context:for <focus>`
- ✅ 报告分了 "🟢 已有 / 🟡 邻接 / 🔴 缺口" 三段
- ✅ 用户清楚下一步该调哪个 skill / 是否要写

## 不要做的事

- ❌ 不基于自己（agent）记忆判断"组里有没有"——**始终用 context:for / list:* 验证**
- ❌ 不直接进入 add-paper-note / weekly-session 等创建流程，**先报现状给用户**
- ❌ 不假设 `context:for` 返回为空 = 焦点不存在；可能是：
  - slug 拼错（试 list:* 模糊搜）
  - frontmatter 没填新字段 → `concept_refs` / `theme_refs` 等为空导致没邻居
  - 没跑 `pnpm build:index`（json 是过期的）→ 先跑一次

## 示例对话

```
用户：我想写一篇关于 GRPO 在多模态 reward 设计的笔记

agent：先 find-related-context 看现状。

  $ pnpm -s context:for concepts/grpo --depth=2

  🟢 已有：
    - concepts/grpo ··· "PPO 干掉 critic，用组内相对 reward 当 baseline"
    - papers/deepseek-r1 ··· R1 用 GRPO 涌现 long-CoT（uses_concept）
    - sessions/2026-w19-deepseek-r1 ··· W19 重点讨论了 GRPO（concept_in_session）

  🟡 邻接：
    - themes/test-time-reasoning 主线管这块；GRPO 在 reasoning 场景已上线
    - 父 concepts/ppo 暂无（建议补）

  🔴 缺口：
    - "多模态 reward 设计" 角度，组里 0 篇 paper / session 提过
    - 你要写的这篇可以填上这个 gap

  建议：
    1) 写之前**先读** papers/deepseek-r1 §3 + W19 session 的"Key insights"，避免和 R1 重复
    2) 新 paper note frontmatter 至少：
         concept_refs: [grpo]
         related_papers: [deepseek-r1]
         themes: [test-time-reasoning, multimodal]   # ← 跨主线，需要 PI 确认
    3) 调 add-paper-note skill 起草

  开始？
```

## 演练发现（cycle 8 · 本 skill 首次 dogfood · W22 DeepSeek-R1 续讨论）

- **#F13 默认 depth=1 够用**：初版示例用 `--depth=2`，dogfood 时发现 W22 session 的 2 跳邻居（MTP via moe.related_concept）相关度低，反而让 agent 把"可选扩展"写得太长。实际默认 `--depth=1` 能覆盖 90% 场景；只有主线 overview / onboarding 值得开 2。
- **#F14 `context:for` 人读输出不是 markdown-ready**：agent 拿到 `── 1 跳邻居 ──` 这样的 box-drawing 必须手工改写为 markdown 列表，没法直接贴进 session / theme 页。Workaround：先 `--json` 拿结构化数据，自己 format 成 markdown。建议 cycle-9 给 `context-for.mjs` 加 `--md` / `--format=session-bg` flag。
- **#F15 🟢/🟡/🔴 三段报告很有用**：dogfood 中用这个模板告诉用户"W22 这篇该建 vs 跟 R1 重合" 非常清晰。未来可以考虑脚本化一个 "gap report" 命令。
- **#F16 空邻居 ≠ 空白领域**：一次 context:for 返回空常见原因：(a) frontmatter 知识图字段为空（最常见，见 add-paper-note #F1）；(b) 没跑 build:index；(c) slug 拼错。**先 build:index 再下结论**。
