# Skill: add-paper-note

> **写一篇课题组共读 paper 的解读**。Agent 充分发挥论文阅读 + 总结能力，但**任何研究判断必须由 PI / 带读人确认**。
>
> 这个 skill 是 wiki 灵魂的来源 —— paper note 质量决定了 wiki 的价值。

---

## 何时调用

用户说类似：

- "我读完 \<paper\>，做笔记" / "建一篇 paper 解读"
- "总结这篇 X 论文 (URL / arXiv ID)"
- "对 paper Y 写一篇组内 wiki"
- 在 `first-week-after-init` 循环 4 自动进入

## 输入清单

| 必填 | 字段 | 来源 / Agent 怎么拿 |
|------|------|---------------------|
| ✓ | paper slug | 从标题派生（"Mixtral of Experts" → `mixtral`），全英文小写连字符 |
| ✓ | 标题 | 用户给 / arXiv API 自动 |
| ✓ | **arXiv ID** 或论文 URL | 强烈推荐，能让脚本自动抓元数据 |
| ✓ | 关联主线 (`--theme=<slug>`) | 用 `pnpm list:themes --json` 看，让 PI 确认匹配 |
|    | 带读人 (`--lead=<member-slug>`) | take 段的责任人 |
|    | 用户已有的笔记 / 摘录 | 如有，作为草稿基础 |

---

## 前置：4 个检查（必走）

### 检查 1：slug 唯一

```bash
ls src/content/docs/papers/<slug>.md  # 应该 not found
```

如已存在 → 问用户是要改名还是 update 现有。

### 检查 2：主题匹配 surface

`pnpm list:themes --json` 看当前主线，**Agent 自己读 abstract** 判断 paper 与候选主线的契合度，给 PI 三档建议：

- 🟢 **强匹配**：paper 核心问题 = 主线核心问题 → 直接挂
- 🟡 **部分匹配**：paper 某一节触及主线 → 用 caution 写"以 X 节为接点"
- 🔴 **不匹配**：paper 与所有现有主线都偏 → 不挂主线 / 提议建新主线

不要默默挂 —— **明确告诉 PI 判断结果让他选**。这是循环 2 一致性检查的延伸。

### 检查 3：是否已有相关 paper

```bash
pnpm list:papers --json
```

看是否已有同主题论文。如有 → 提示"papers/foo 也是这个方向，写完这篇可以考虑加 cross-reference"。

### 检查 4：网络可达 arXiv

如果用户给了 arXiv ID，先试 `curl -s -m 10 https://export.arxiv.org/api/query?id_list=<id>` —— 失败则降级到手填模式，不要硬挂。

---

## 论文阅读方法（agent 怎么读）

> **Agent 是助手，不是 PI**。Agent 的输出**永远**是 "起草" 或 "证据汇总"，不是研究判断。

### Keshav 三遍阅读法（Agent 全部三遍可读）

#### 第一遍（5–10 分钟）— "five C's"

读：**title / abstract / introduction / section headings / conclusions**。Agent 输出：

1. **Category** — 这是什么类型论文？（measurement / analytical / system / theory / position）
2. **Context** — 它在哪个研究脉络？（前置工作 + 同期对手）
3. **Correctness** — 假设看起来站得住吗？（红旗：依赖很强假设、单一数据集、无消融）
4. **Contributions** — abstract 声称的主要贡献（**注意：这是声称，不是真贡献**）
5. **Clarity** — 写得清不清？（影响后续阅读时间分配）

→ 写进 paper note 的 **元信息 + 一句话总结**段

#### 第二遍（30–60 分钟）— 仔细读

读 figures + methods + 关键 experiments。**忽略证明细节**。Agent 输出：

- 整体框架（一句话 + 对架构图的 caption）
- 核心创新 1–2 个（删掉次要的）
- **关键实验**的 main result（数字 + 相对前 SOTA 提升）
- **作者承认的弱点**（discussion / limitations 段）

→ 写进 paper note 的 **方法 + 关键实验**段（**带 caution banner，待 lead review**）

#### 第三遍（1+ 小时，可选）— 虚拟复现 / 同行交叉验证

**强制协议：Agent 必须执行下列搜索，不能跳过**（即使 Pass 1+2 已经读得很仔细）。

| 来源 | 搜索方法 | 拿什么 |
|------|---------|-------|
| **arXiv abs page** | `https://arxiv.org/abs/<id>` | bib + comments 字段（有时含 venue / 代码链接）|
| **GitHub** | 搜 `<paper-title> github` 或读 abs/HTML 末尾 footnote 的 repo 链接 | code 公开度 / star 数 / 最近 commit / Issues 里的复现讨论 |
| **HuggingFace** | 搜 `<model-name> huggingface` 或 `https://huggingface.co/papers/<id>` | 模型 / 数据 是否公开 + 社区评论 |
| **OpenReview** | 搜 `openreview <paper-title>` | reviewer 评分 + meta-review + author rebuttal（最贴近真相的 ground truth）|
| **Papers with Code** | `paperswithcode.com/paper/<slug>` | 代码 + 复现实现 + leaderboard 位置 |
| **Twitter / Hacker News** | 搜 `<arxiv-id>` 或 `<paper-title>` | 同行第一反应（注意筛选）|
| **同期对照工作** | 搜 abstract 里的关键 method name + "vs" / "compared with" | 谁先做的 / 谁更好 |

Agent **必须**至少跑 GitHub + HuggingFace + OpenReview 三个，把发现写进：
- 复现性 checklist（具体打勾依据）
- Counter-evidence 段（找到的对照工作）
- Lessons learned（如果发现复现争议）

→ 写进 paper note 的 **复现性 checklist + Counter-evidence + 延伸阅读**段

**Pass 3 不是可选**。即使 paper 看起来"太新"或"没人讨论"，搜出"找不到讨论"本身也是信息（说明社区还没接住）。

### 批判性阅读 — 5 个标准追问（写时落到 take 段引导）

1. **Problem clarity**：他们解决的问题是真问题，还是自己造的？
2. **Solution novelty**：这个方法 vs 三个最近的同方向工作，差异在哪？（**不是它们的 abstract，是 method 段**）
3. **Evidence sufficiency**：实验 design 能否证伪？多少 random seeds？
4. **Limitation honesty**：作者承认了几个弱点？没承认的有哪些？
5. **Generalization claim**：他们说"work on X"——X 真的代表他们说的范畴吗？

→ 这 5 题是 **take 段的脚手架**，但**不能 agent 自己答**。agent 在 take 段 caution banner 里把这 5 个问题列出来，让 lead 拍立场。

### Active reading 提示词（agent 自查闭环 — 强制）

Agent 在生成内容前**必须显式过一遍下列 5 题**，每题在脑里给"能答 / 不能答"判断：

- [ ] **Q1** 一句话讲清楚 paper 的"招"是什么
- [ ] **Q2** 一句话讲清楚 paper 没解决的最大问题
- [ ] **Q3** 这篇用什么 benchmark？数字相对前 SOTA 提升多少？
- [ ] **Q4** 代码 / 数据 / 模型权重哪些公开？
- [ ] **Q5** 我能用一段话向**没读过这篇**的同事解释这工作吗

#### 自查未过的处理协议（强制）

| 不能答的题 | Agent 必须做 |
|-----------|------------|
| Q1 / Q2 / Q5 | **多抓 1-2 个 chunk**（重点读 Intro / Discussion / Conclusion），最多 5 个 chunk 上限。仍答不出 → 在 paper note 顶部加 caution: "agent 未充分读懂"，明确指向 lead |
| Q3 | 读 Experiments / Eval 章节的 chunk；找到主结果表（Table 1/2 通常是）+ §1 末尾的 headline numbers |
| Q4 | 走 Pass 3 协议（GitHub / HF / OpenReview） |

**禁止**：自查未过仍直接起草成稿。情愿少写、多标 TODO，也不要编。

#### 上限熔断

Agent 累计抓 chunk ≥ 5 仍 Q1+Q2+Q5 不能答 → **停止起草**，输出："agent 抓 5 chunk 仍未读懂 \<paper\>，建议 lead 自己读 paper PDF 后填核心段。我已填的内容仅是 abstract 派生 + Pass 3 同行交叉验证。"

这是诚实信号 —— 比写一篇看似完整但事实错乱的笔记好。

---

## 执行步骤

### 1. 跑脚手架（推荐用 `--arxiv` 让脚本自动抓元数据）

```bash
pnpm new:paper <slug> \
  --arxiv=<arxiv-id> \
  --theme=<theme-slug> \
  --lead=<member-slug> \
  --json
```

这会自动：
- 抓 arXiv API（title / authors / abstract / published / category）
- 填元信息段
- 起草一句话总结（abstract 第一句，**带 caution**）
- 起草关键贡献（abstract 抑出，**带 caution**）
- take 段保留为 caution + 5 个引导问题
- frontmatter status: `draft`，arxiv 字段写入

### 2. Agent 富化（按优先级，每条都带显式 caution 标记）

| 段 | Agent 该做 | 必须 caution? |
|----|-----------|---------------|
| 元信息 | arXiv 自动填 | 否（事实） |
| 一句话总结 | abstract 起草 | **是**（让 lead 改） |
| 我们组为什么读 | **不替写** | — |
| 关键贡献 | abstract + 第二遍读后修订 | **是**（声称 ≠ 真贡献） |
| 方法 | 第二遍读出来的整体框架 | **是**（细节让 lead 补） |
| 关键实验 | 主结果数字 + 作者承认弱点 | **是** |
| **我们组的 take** | **绝不替写**，只放引导问题 | **是**（强制 caution） |
| 开放问题 | 第三遍读后基于 Counter-evidence 起草 | **是**（建议） |
| Counter-evidence | 找 1–2 篇对照 / 反驳工作（搜 OpenReview / Twitter / 同期论文） | **是**（标"agent 找的，未必全"） |
| 复现性 checklist | 抓 GitHub / HF / 论文检查 | 否（事实可查） |
| 延伸阅读 | 自动链 wiki concepts / 已有 papers | 否 |

### 3. 关键设计：Caution banner 标准格式

每个 agent 起草的段都要在顶上加：

```markdown
:::caution[🤖 Agent 起草 · 待 <lead-name> review]
下面这段是 agent 从 <abstract / 方法节 / GitHub README> **起草**的初稿，
**未经带读人修订前不算正式**。修订完请删 caution + status:draft → published。
:::
```

PI / 带读人完成 review 的契约：
1. 删除 caution 块
2. 修订内容（自由删改）
3. frontmatter `status: draft` → `published`

`pnpm verify` 在未来版本可以加 gate：含 caution banner 的 paper 不能 `status: published`。

### 4. 自动跨链发现 — 强制 add-concept 联动

Agent 起草完后，**强制走 5 步**：

#### 4.1 枚举候选术语

从笔记里抽出**所有**可能是"概念"的名词短语 —— 优先：缩写（GRPO / MoE / RLHF）、方法名（mode fusion / strong-to-weak distillation）、新数据集（AIME'24 / LiveCodeBench）。

不要漏掉 figures / equations 里出现的命名实体。

#### 4.2 与现有词典比对

```bash
ls src/content/docs/concepts/
```

把候选术语对照已有 slugs（去掉空格、小写、连字符）。

#### 4.3 输出 3 类清单（必须给 PI）

```text
🔗 已链：A, B  (词典已有，paper note 里加链)
🆕 新术语：X, Y, Z  (词典缺，建议建词条)
🟡 边界：P, Q  (太通用如 "neural network"，不必建)
```

#### 4.4 强制询问 PI（不能跳过）

> "新术语 X / Y / Z 词典里没有。要建吗？我可以一次为你过 N 个 add-concept 流程：每个 1 分钟。"

PI 回答：
- "全建" → 逐个走 `add-concept` skill
- "只建 X" → 单条走
- "都不建" → 在 paper note 的"延伸阅读 → 相关概念"段保留为纯文本，标 TODO 待词典建好后回链

#### 4.5 触发 add-concept

每个被选中的术语，**调用 add-concept skill**（参 `add-concept.md`）。每个 concept 完成后回到 paper note 把术语换成 `[X](/concepts/x/)` 链接。

---

### 4-bis. 引用的关键论文

- 检查 `papers/` 是否已有 → 有则链 → 没有则**建议**加到 "Counter-evidence" 或 "延伸阅读"
- **方法名 / 模型名**：暂不强制建索引，plain text 即可

### 5. 主线页双向更新

修改 `themes/<theme>.md` 的 "关键论文（外部）" 段，加这篇：

```markdown
- [<paper title>](/papers/<slug>/) — \<一句话定位\>
```

### 6. 跑 verify

```bash
pnpm verify
```

### 7. 报告 PI

格式：

```text
✓ papers/<slug>.md 已建（基于 arXiv <id> 自动抓取）
✓ 主线 <theme> 的关键论文段已加 cross-link
✓ verify 通过

Agent 起草段（**待 <lead> review**）：
  - 一句话总结
  - 关键贡献（abstract 派生）
  - 方法（第二遍读出来的框架）
  - 关键实验（主结果 + 作者弱点）
  - Counter-evidence（找到 N 篇对照）
  - 开放问题（建议 N 个）

PI / <lead> 必须做：
  - 我们组为什么读这篇（agent 不替写）
  - 我们组的 take（agent 不替写，5 个引导问题已放好）
  - 修订 / 删除 caution 块 → status: published

发现新术语未在词典：A, B, C
要建吗（add-concept skill）？
```

---

## 检查点

- ✅ frontmatter 完整（title / description / themes / lead / status / arxiv）
- ✅ 元信息段全部填实（不留 …）
- ✅ 至少"一句话总结" + "关键贡献" 段有内容（哪怕带 caution）
- ✅ "我们组为什么读" + "我们组的 take" 必须留 caution 或 TODO（agent 不替写）
- ✅ 复现性 checklist 至少 3 项打勾（事实可查）
- ✅ pnpm verify 通过

## 与其他 skill 的协作

| 触发 | skill |
|------|-------|
| 创建后想排周会共读 | `weekly-session` |
| paper 里有新术语 | `add-concept` |
| 此 paper 应改主线"关键论文"段 | `refresh-theme` |
| paper 完成后周日生成本周 digest | `weekly-digest` |

## 示例对话

```
用户：写一篇 Mixtral 解读，arXiv 2401.04088
agent：好。先做 4 个前置检查：
  - slug = `mixtral`，未存在 ✓
  - 主线匹配：你建过 moe-sparsity 主线，paper 核心是 sparse activation MoE → 🟢 强匹配
  - 已有同主题论文：暂无
  - 网络可达 arXiv ✓
  
  我会跑 pnpm new:paper mixtral --arxiv=2401.04088 --theme=moe-sparsity
  带读人是谁？（默认无，我建议 phd-2 因为他在 moe-sparsity 主线上）
用户：phd-2

agent：执行 + Keshav 三遍读 abstract → method → 复现性…

  ✓ papers/mixtral.md 已建
    元信息：title / 8 authors / 2024-01-08 / cs.LG / arXiv 2401.04088
    一句话总结（caution）："Mixtral 8x7B 是 8 专家 MoE，每 token 激活 2 专家..."
    关键贡献（caution，4 条）：8x7B sparse routing / 32k context / Apache 2.0 / 多语言
    方法（caution）：架构图引用 + 路由实现要点
    关键实验（caution）：MMLU 70.6, code-bench 提升 13%, 作者承认 routing 不稳定
    Counter-evidence（caution）：找到 2 篇 — Switch Transformer 同期, GShard 早期
    复现性 checklist：✓ code, ✓ weights, ✗ training data, ✓ hyperparams
  
  ✓ themes/moe-sparsity.md 关键论文段已加 cross-link
  ✓ verify 通过

  PI / phd-2 必须做：
    - "我们组为什么读" 段
    - "我们组的 take" 段（5 个引导问题已放好）
    - review 5 个 caution 块、删 banner、status → published

  发现新术语未在词典：SwiGLU, sliding window attention
  要建词条吗？
用户：建 SWA

agent：（走 add-concept skill）
```

---

## 不要做的事

- ❌ **不替带读人写 take 段**（核心红线）
- ❌ **不替 PI 写"我们组为什么读"**
- ❌ 不抄 paper 大段原文（版权 + 信噪比低）
- ❌ 不假定 paper 内容超出 abstract / method 范围（**除非 agent 真读了 PDF**）
- ❌ 不自动 `git commit / push`
- ❌ 不在没跑 arXiv API 的情况下编造作者 / 出处

---

## Agent 自查 — 提交前问自己

1. 我哪些段是从证据里提的？（abstract / method / GitHub）哪些是猜的？猜的全部带 caution。
2. take 段我有写吗？**绝不能有**。
3. 我引用的"作者声称的贡献" 和 "我认为的真实贡献" 区分了吗？
4. 我对引用的数字 / benchmark 名字有信心吗？还是从 abstract 抑出后没核对？没核对的标 caution。
5. PI 看这份笔记，能否在 5 分钟内决定"这篇是否值得排周会共读"？如果不能，是 agent 没把"我们组为什么读"的引导问题摆好。

---

## Lessons learned（agent 维护此 skill）

- **Abstract 不是真贡献**。Abstract 是作者营销 deck，paper note 不能让 abstract 等于贡献。
- **Take 段是 wiki 的灵魂**。不论 PI / lead 多忙，agent 必须 push-back 让他写。中间档：agent 可起草 + 强制 caution + status gate。
- **Counter-evidence 段是质量分水岭**。无 counter-evidence 的 paper note 容易变成宣传册。Agent 主动找 1–2 篇对照能让 wiki 显著更可信。
- **复现性 checklist 必填**。哪怕全打 ✗，也比留空有用 —— 是 wiki 对学生说"我们关心可复现"的 signal。
- **三遍阅读法的边界**：第三遍（虚拟复现）agent 的判断力差于人，能做的是 "找信息源汇报"，不是 "下结论"。

### 演练发现（Qwen3 二刷 cycle 4）

- **#15 修复**：原 skill 把 Pass 3 写成"可选" → agent 真演练时跳过。已改为**强制协议**+具体来源表（GitHub / HF / OpenReview / Papers with Code 等）。
- **#16 修复**：原 skill 提到 add-concept 但只是"记下来报给 PI" → agent 容易遗忘。已改为**强制 5 步联动**：枚举 → 比对 → 三类清单 → 询问 PI → 触发 add-concept。
- **#17 修复**：原 skill 给了 5 题 active-reading checklist 但没说"答不出怎么办" → agent 会跳过。已改为**强制自查闭环 + 上限熔断（5 chunk 仍读不懂则停起草）**。这条是 agent 诚实信号的核心。
- **新指导原则**：起草段一定带 "已读 §X + §Y" 来源标注。这次 Qwen3 笔记每个 caution banner 都标了源章节，让 lead review 时可定位。
