---
rfc: R01
task_id: T01-5
status: pending
depends_on: [T01-1, T01-4]
estimated_minutes: 45
branch: cycle-10/R01/T01-5-new-faq-scaffold
files_touched:
  - scripts/new-faq.mjs
verification_commands:
  - pnpm new:faq --help-or-dry
  - pnpm verify
---

# T01-5 · 新建 scripts/new-faq.mjs scaffold

## Context
RFC: `analysis/cycle-10/rfcs/R01-faq-schema.md` §D2
Reference template: `scripts/new-concept.mjs`（170 行）

## Exact Diff Intent

新建文件 `scripts/new-faq.mjs`（约 130 行）。参考 `new-concept.mjs` 结构：

1. **顶部 jsdoc** 描述命令签名（来自 RFC §D2.1）：
   ```
   pnpm new:faq <slug>
     --q="..." (required)
     --answered-by=<member-slug> (required)
     [--asked-by=<member-slug|guest>] (default: guest)
     [--description="..."]
     [--label="..."]
     [--related-papers=p1,p2]
     [--related-concepts=c1,c2]
     [--themes=t1,t2]
     [--tags=t1,t2]
     [--exemplar]
     [--reviewer=<member-slug>]
     [--json]
   ```

2. **参数解析**：同 new-concept.mjs L24-36

3. **必填校验**：
   - `--q` 必须有值
   - `--answered-by` 必须有值
   - 否则 console.error usage + exit 1

4. **slug 检查**：`src/content/docs/faq/<slug>.md` 已存在则报错 exit 1

5. **sidebar.order 自动算**：扫 `src/content/docs/faq/` 下所有 .md（非 index）的 `order:` max + 1（同 new-concept.mjs L67-80）

6. **YAML 安全引号** helper 复用 new-concept.mjs L51-55 模式

7. **生成 frontmatter + 模板正文**（按 RFC §D2.3 模板）：
   ```yaml
   ---
   title: <截短的 q>
   description: <description 或自动生成>
   sidebar:
     order: <next>
     label: <label>
   question: <q>
   asked_by: <asked_by 默认 guest>
   answered_by: <answered_by>
   related_papers:<list>
   related_concepts:<list>
   themes:<list>
   tags:<list>
   last_reviewed_at: "<today YYYY-MM-DD>"
   reviewer: <reviewer 或 answered_by>
   ${exemplar ? 'exemplar: true' : ''}
   ---

   ## 问题
   > <q>

   ## 简答（≤200 字）
   📝 TODO：...

   ## 完整答案
   📝 TODO：500-1500 字。建议结构：
   1. 背景 ...
   2. 我们组的做法 ...
   3. 常见坑 ...
   4. 链回 wiki ...
   ```

8. **JSON 输出 vs human-readable 输出**：同 new-concept.mjs L144-169 模式

## Verification
- `pnpm new:faq test-faq --q="测试问题" --answered-by=leo --json` —— 必须成功输出 JSON
- 检查生成的 `src/content/docs/faq/test-faq.md`：
  - frontmatter 含 11 个字段
  - `last_reviewed_at` 是今天日期
  - body 含 4 段模板
- `pnpm verify` —— 0 warning
- **验证完 `rm src/content/docs/faq/test-faq.md`**（不留测试文件）

## Rollback
- 删除 `scripts/new-faq.mjs` 即可

## Out of Scope
- 不动 init-group.mjs 清洗（T01-7 处理）
- 不写 add-faq skill（T01-6 处理）
- 不建 faq/index.md（T01-8 处理）

## Risk
- `answered-by` 写错成不存在的 member-slug → verify 会报死链 error。**Scaffold 不验证 slug 真实性**（让 verify 来报，避免双重维护）
- date 字段格式必须 `YYYY-MM-DD`（与 R02 staleness-report 解析一致）。用 `new Date().toISOString().slice(0,10)`
