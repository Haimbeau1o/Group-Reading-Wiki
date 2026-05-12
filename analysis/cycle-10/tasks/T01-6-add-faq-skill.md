---
rfc: R01
task_id: T01-6
status: pending
depends_on: [T01-5]
estimated_minutes: 30
branch: cycle-10/R01/T01-6-add-faq-skill
files_touched:
  - .agent/skills/add-faq.md
  - .agent/skills/README.md
verification_commands: []
---

# T01-6 · 新建 .agent/skills/add-faq.md

## Context
RFC: `analysis/cycle-10/rfcs/R01-faq-schema.md` §D3
Reference template: `.agent/skills/add-concept.md`（155 行）
Audit: `analysis/cycle-10/00-current-state-audit.md` §3（skill 文件 8 段标准）

## Exact Diff Intent

**改 1：** 新建 `.agent/skills/add-faq.md`（约 130 行）。8 段固定结构：

```markdown
# Skill: add-faq

## 何时调用
- "刚被问了个 X 问题，加到 FAQ"
- "post-meeting-recap 时讨论里出现重复问题 → 收录到 FAQ"
- "新生第一周问的高频问题"
- 在 `add-concept` skill 中遇到"这不是术语问题，是实操问题" → 跳来本 skill
- 在 `personalized-onboarding` skill 中触发：把"师兄反复教的同一件事"沉淀

## 输入清单
| 必填 | 字段 | 推断 |
|------|------|------|
| ✓ | faq slug | kebab-case，建议 verb-noun（`how-to-pick-arxiv-papers`） |
| ✓ | 问题原文 | ≤200 字符 |
| ✓ | 答题人 member-slug | 一般是博后 / 高博 |
| | 提问人 | `guest` 或 member-slug，默认 guest |
| | related_papers | 用 `pnpm -s list:papers --json` 找用例 |
| | related_concepts | 用 `pnpm -s list:concepts --json` 找用例 |
| | themes | 与 paper 类似 |

## 前置检查
- `ls src/content/docs/faq/<slug>.md` 不存在。已存在 → **走 update 路径**（在已有文件追加 / 修订段落）
- `answered_by` 必须对应已存在的 member-slug：`pnpm -s list:members --json | jq -r '.items[].slug' | grep <slug>`

## 模板结构（必备段）
（同 RFC §D2.3 模板）

## 执行步骤
1. **建文件**：
   \`\`\`bash
   pnpm new:faq <slug> \\
     --q="<问题原文>" \\
     --answered-by=<member-slug> \\
     [--asked-by=<member-slug|guest>] \\
     [--related-papers=p1,p2] \\
     [--related-concepts=c1,c2] \\
     [--themes=t1] \\
     --json
   \`\`\`
2. 写"简答"（≤200 字）
3. 写"完整答案"（500-1500 字，4 段建议结构）
4. 链回 paper / concept / session：
   \`\`\`bash
   pnpm -s list:papers --json | jq '.items[] | select(.body | test("<关键词>"; "i"))'
   \`\`\`
5. 把 paper / concept frontmatter 反向加 `related_faq:` 字段
   **⚠ 本 cycle 不做反向边**（R01 §Out of Scope）。**只在 FAQ 文件单向引用**，phase 2 再做反向
6. `pnpm verify && pnpm build:index`
7. `pnpm -s context:for faq/<slug>` 验证反向出现在 backlinks

## 不要做的事
- ❌ 不要把术语解释写成 FAQ —— 那是 concept 的活
- ❌ 不要把项目状态写成 FAQ —— 那是 session / digest 的活
- ❌ 不要写跨届教学指南 —— 那是 onboarding/ 的活
- ❌ 不要把多个问题塞一个 FAQ —— 一个 FAQ = 一个 question
- ❌ 不自动 commit

## Update 路径（FAQ 已存在但需扩写 / 复核）
当 slug 已存在：
1. 读现有内容，判断是否过期 / 答案改了
2. 修订内容 + 把 `last_reviewed_at` 更新为今天 + `reviewer` 改为当前修订者
3. 在 body 末尾加 `## 修订历史` 段（如不存在）

## 写作长度
500-1500 字。**不超过** 2000 字 —— FAQ 是速查，不是教程。

## Lessons learned
（本 skill 是 cycle-10 R01 新建。后续演练发现追加在此。）
```

**改 2：** `.agent/skills/README.md` 在 14 个 skill 列表中加 `add-faq`。**先 cat README.md 看现有结构**再决定插入位置。

## Verification
- `cat .agent/skills/add-faq.md | wc -l` —— 应当 100-150 行
- `grep -E "^##" .agent/skills/add-faq.md` —— 必须含 8 段标题
- `grep "add-faq" .agent/skills/README.md` —— 必须命中

## Rollback
- 删除 `.agent/skills/add-faq.md`
- 撤 `.agent/skills/README.md` 的修改

## Out of Scope
- 不动其它 13 个 skill 文件
- 不做反向边（FAQ → 其他类型自动出现在 backlinks 由知识图处理；其他类型不需要单独加 `related_faq:` 字段）

## Risk
- README.md 现有结构可能不止"清单"格式 —— 改之前先 cat 一遍，仿照现有 skill 的写法
