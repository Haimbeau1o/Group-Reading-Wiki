# Skill: add-paper-note

## 何时调用

用户说类似：

- "我读完 Mixtral，做笔记"
- "建一篇 paper 解读 / 加到 papers/"
- "总结这篇 X 论文 (URL)"
- "对 paper Y 写一篇组内 wiki"

## 输入清单

| 必填 | 字段 | 来源 |
|------|------|------|
| ✓ | paper slug | 从标题推（如 "Mixtral of Experts" → `mixtral`）|
| ✓ | 标题 | 用户提供或从 arXiv 抓 |
| | 关联主线 | 自动建议，让用户确认（参考 `themes/`）|
| | 作者 + 出处 | arXiv ID / 会议 / 链接 |
| | 用户已有的笔记 / 摘录 | 如有，作为草稿基础 |

## 前置检查

1. slug 唯一：`ls src/content/docs/papers/<slug>.md` 不存在
2. 主题映射：`pnpm list:themes --json` 看当前哪些主线，建议最匹配的

## 执行步骤

### 1. 跑脚手架

```bash
pnpm new:paper <slug> --title="<Title>" --theme=<theme-slug>
```

### 2. 编辑生成的 `<slug>.md`

模板有这些段（来自 `scripts/new-paper.mjs`）：

- 元信息（作者 / 机构 / 会议 / arXiv / 关联主线）
- 一句话总结
- 我们组为什么读这篇
- 关键贡献
- 方法
- 关键实验 / 结果
- **我们组的 take** ← 最重要
- 开放问题 / 后续
- 共读历史
- 延伸阅读

### 3. 填内容的优先级

agent 不是替带读人写正文，但可以做这些：

| 段 | agent 该做什么 |
|----|---------------|
| 元信息 | 从 arXiv URL 抓 / 用户提供，**填实** |
| 一句话总结 | **生成 1 句话**（30-50 字）|
| 我们组为什么读这篇 | **建议 1-2 个理由**，关联到 themes 的开放问题 |
| 关键贡献 | 生成 3-5 条 bullet（**保守**：abstract 能确定的才写）|
| 方法 / 实验 | **不替代写**。留占位 `> 占位。带读人补。` |
| 我们组的 take | **不写** —— 这是带读人 / PI 的观点，不能 AI 编 |
| 开放问题 | 生成 2-3 个**有深度**的开放问题（不是 abstract 复述）|
| 延伸阅读 | 自动链相关概念词典词条 / 相关 papers |

### 4. 自动跨链接

读 paper 内容（用户提供的或 abstract），找出：

- 出现的概念术语 → 检查 `concepts/` 是否已有 → 有则链 `[X](/concepts/x/)`，无则**记下来给用户提示** "这些术语没在词典：X, Y, Z，要不要建词条？"
- 引用的相关论文 → 检查 `papers/` 是否已有

### 5. 跑 verify

```bash
pnpm verify
```

### 6. 报告

- 创建 `papers/<slug>.md`
- 填了哪几段（实写 / 留占位）
- 给用户的"待补"清单
- 提示是否要建概念词条（用 `add-concept` skill）

## 检查点

- ✅ frontmatter 完整（title / description / themes / status）
- ✅ 至少"元信息" + "一句话总结"是实内容
- ✅ "我们组的 take" 必须留占位（不能 agent 编）
- ✅ verify 通过

## 与其他 skill 的协作

- 创建 paper note 后，可建议 `weekly-session` skill 把 paper 排到 session
- paper 中的新术语 → 触发 `add-concept` skill
- paper 与 theme 关联 → 可建议 `refresh-theme` skill 把 paper 加到 theme 的"关键论文"列表

## 示例对话

```
用户：写一篇 Mixtral 解读，链接 https://arxiv.org/abs/2401.04088
agent：好。
  - slug: mixtral
  - 主题建议：moe-sparsity（看标题 + 主线匹配）
  确认？
用户：确认

agent：执行...
  ✓ papers/mixtral.md 已建（基于模板）

  从 abstract 提取：
    标题: Mixtral of Experts
    作者: Mistral AI
    出处: arXiv 2401.04088
    一句话: 8 专家 MoE 模型，每 token 激活 2 专家，46.7B 总参数 / 12.9B 激活
    关键贡献: 5 条 bullet（基于 abstract）
    我们组为什么读：建议 2 个理由（关联 moe-sparsity 主线开放问题 #2）
    开放问题: 3 条
    延伸阅读: 自动链 → /concepts/moe/

  留占位（带读人补）:
    - 方法详细描述
    - 实验结果（数字）
    - 我们组的 take

  发现术语未在词典中：
    - SwiGLU
    - sliding window attention（SWA）

  要建这两个概念词条吗（add-concept skill）？

用户：建 SWA

agent：（继续走 add-concept skill 流程）
```

## 不要做的事

- ❌ **不替组员写 take** —— 这条是核心
- ❌ 不抄 paper 大段原文（侵权）
- ❌ 不自动 commit / push
- ❌ 不假定 paper 内容超出 abstract 范围（除非用户提供更多）
