# Skill: weekly-session

## 何时调用

用户说类似：

- "下周共读 Mixtral / DeepSeek-R1 / X 论文"
- "建一个 W19 的 session"
- "排下周的周会页面"
- "PI 选定了下周读 X，建个页面"

## 输入清单

| 必填 | 字段 | 推断方式 |
|------|------|---------|
| ✓ | 周次 | `2026-W19` 之类；可问用户、或从今天日期推 (W = ISO week) |
| ✓ | paper slug | 从 paper 标题推（小写、连字符），如 "Mixtral of Experts" → `mixtral-of-experts` |
| ✓ | 带读人 | 必须问用户。值用 `/members/<slug>` 中的 slug |
| | 主 paper 链接 | arXiv / 项目主页 URL |
| | paper 标题（中英文） | 给 session 标题用 |
| | 关联主线 | 哪条 `/themes/` 主线，可建议 |
| | 会议时间 / 地点 | 默认填占位，由用户改 |

## 前置检查

1. 用 `pnpm list:members --json` 确认带读人 slug 真的存在
2. 用 `pnpm list:sessions --json` 看是否已有同名 session（避免重复）

## 执行步骤

1. **建 paper page**（如果还没有）：

```bash
pnpm new:paper <paper-slug> --title="<Title>" --theme=<theme-slug>
```

2. **建 session page**：

```bash
pnpm new:session <week> <paper-slug> --lead=<member-slug> --paper=papers/<paper-slug>
```

3. **填充 Pre-read 部分**（覆盖默认占位）：
   - 必读：链向刚建的 `papers/<paper-slug>`，指明重点章节
   - 选读：相关概念词典 / 历史 sessions
   - 引导问题：根据 paper 摘要 + 关联主线**生成 3 个**有深度的问题（不是 "what is X"，而是 "why X over Y" / "what's the trade-off"）

4. **更新首页 banner**：

修改 `src/content/docs/index.mdx` 的"📅 本周共读" LinkCard，把 href 和 title 指到新 session。

5. **跑 verify**：

```bash
pnpm verify
```

6. **报告**：列出创建/修改的文件 + 提示用户去填什么

## 检查点

- ✅ `src/content/docs/sessions/<week>-<slug>.md` 存在
- ✅ `src/content/docs/papers/<slug>.md` 存在
- ✅ session frontmatter 中 `lead` 是有效成员 slug
- ✅ session 页内的 `/papers/<slug>/` 链接能跳通
- ✅ 首页 LinkCard 指向新 session

## 引导问题生成原则

agent 生成 3 个 pre-read 问题时遵循：

1. **第 1 题**：核心方法 trade-off （对比另一种做法）
2. **第 2 题**：实现细节里的非显然选择（"为什么 X 维度用 FP4 而其他维度用 FP8"）
3. **第 3 题**：与组内研究主线的连接（"这个能不能挪到我们组的 baseline 上？"）

避免：
- ❌ 简单事实题（abstract 里就有答案）
- ❌ 笼统题（"这篇论文好不好"）

## 示例对话

```
用户：下周（W19）共读 DeepSeek-R1，让 phd-senior-1 带读
agent：好。

  ✓ phd-senior-1 是有效成员
  ✓ W19 还没有 session
  ✓ /papers/deepseek-r1 还不存在

  我会做：
  1. 建 papers/deepseek-r1.md 模板
  2. 建 sessions/2026-w19-deepseek-r1.md，带读人 phd-senior-1
  3. Pre-read 部分加上：
     - 必读: papers/deepseek-r1, 重点 §3 GRPO + §4 涌现行为
     - 选读: concepts/grpo
     - 3 个引导问题（基于 R1 论文的 RL 涌现 reasoning 主题）
  4. 更新首页 banner

  关联主线选 test-time-reasoning 还是另指定？
用户：test-time-reasoning
agent：（执行 4 步 + verify）✓

  完成。修改：
    + src/content/docs/papers/deepseek-r1.md (新)
    + src/content/docs/sessions/2026-w19-deepseek-r1.md (新)
    ~ src/content/docs/index.mdx (banner 更新)

  Pre-read 引导问题（已写入 session 页）：
    1. R1-Zero 不用 SFT 直接 RL 涌现 long CoT —— 与传统 RLHF 流程相比，
       省略 SFT 的代价是什么？什么任务上行不通？
    2. GRPO 用组内归一化作 baseline —— group size G 该怎么选？
       与 PPO 用 critic 的方差差异？
    3. 我们组现有 baseline 上能不能直接接 GRPO？
       reward 设计上有哪些痛点？

  下一步：
    - phd-senior-1 周三前补完 papers/deepseek-r1.md 的方法 + 实验小节
    - 大家周日前在 session 页留 pre-read 问题
```

## 不要做的事

- ❌ 不自动 commit / push
- ❌ 不替带读人写实质内容（只填模板和引导问题）
- ❌ 不假定 paper 的具体细节（如果不确定，留 `（待填）`）
