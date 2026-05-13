---
rfc: R02
task_id: T02-2
status: pending
depends_on: [T02-1]
estimated_minutes: 60
branch: cycle-10/R02/T02-2-staleness-report
files_touched:
  - scripts/staleness-report.mjs
verification_commands:
  - pnpm verify
---

# T02-2 · 新建 scripts/staleness-report.mjs

## Context
RFC: `analysis/cycle-10/rfcs/R02-staleness-tracking.md` §D4

## Exact Diff Intent

新建 `scripts/staleness-report.mjs`（约 180 行）。结构：

### 顶部 jsdoc

```
pnpm staleness-report
  [--type=papers|concepts|themes|members|sessions|faq|all]   # default: all
  [--cadence=6m|12m|24m]                                     # override
  [--include-unreviewed]                                     # default: true
  [--reviewer=<member-slug>]
  [--unowned-only]
  [--json]
  [--quiet]
```

### 实现

1. **imports**：`readdirSync` / `statSync` / `readFileSync` from `node:fs`，`join` / `relative` from `node:path`，`parseFrontmatter` / `detectSchema` from `./lib/frontmatter.mjs`

2. **parseCadence(str)** helper：
   - "6m" → 180 天
   - "12m" → 365 天
   - "24m" → 730 天
   - "indefinite" → Infinity
   - 其他 → throw

3. **typeDefaultCadence(type)** helper：
   - concept / theme → "6m"
   - paper / session / member / faq → "12m"
   - generic → "indefinite"

4. **遍历** `src/content/docs/**/*.{md,mdx}`，跳过 index 和 generic

5. **对每个文件**：
   - `detectSchema(relpath)` 拿 type
   - 解析 frontmatter 拿 `last_reviewed_at` / `reviewer` / `review_cadence`
   - `review_cadence` 缺省 → 用 typeDefaultCadence(type)
   - 算 days_since：`Math.floor((today - new Date(last_reviewed_at)) / 86400000)`
   - 如果 days_since > parseCadence(cadence) → status='stale'
   - 如果 last_reviewed_at 缺 → status='unreviewed'（当 `--include-unreviewed` 默认 true）
   - 否则 status='fresh'

6. **filter**：
   - `--type` 不为 'all' → 只看该 type
   - `--reviewer=<slug>` → 只看 reviewer = slug
   - `--unowned-only` → 只看 reviewer 字段空

7. **sort**：
   - status === 'stale' 优先（days_since 倒序）
   - status === 'unreviewed' 在后
   - fresh 不输出（仅计入 stats）

8. **输出**：
   - `--json` → 按 RFC §D4.3 JSON 形态
   - `--quiet` → 仅 exit code，无输出
   - 人类可读模式 → 按 RFC §D4.3 console format

9. **exit code**：
   - 全 fresh → 0
   - 有 stale 或 unreviewed → 1
   - 脚本错（YAML parse fail 等）→ 2

10. **日期解析**：严格 `YYYY-MM-DD`。其他格式（含中文、含斜杠）→ log warn + 当 unreviewed

## Verification

- `pnpm staleness-report --json` —— 输出符合 D4.3 JSON 结构
- `pnpm staleness-report --quiet; echo $?` —— 当前所有内容都未填 last_reviewed_at → exit 1（unreviewed 多）
- `pnpm staleness-report --type=concepts` —— 只看 concepts
- `pnpm staleness-report --reviewer=leo` —— 只看 reviewer=leo（应当空，因为还没 backfill）
- 临时建一个 concept 含 `last_reviewed_at: "2024-01-01"` + `review_cadence: "6m"` → 必须出现在 stale；删掉后再跑应当不在

## Rollback
- 删除 `scripts/staleness-report.mjs`

## Out of Scope
- 不动 verify.mjs（不让 staleness 进 CI）
- 不动 package.json（T02-4 处理）
- 不 backfill（T02-6 处理）
- 不写 advisory CI workflow（phase 2）

## Risk
- 日期 timezone 误差 → 用 UTC 当天（`new Date().toISOString().slice(0,10)`）
- 性能：30+ 文件遍历应当 <1s。如果未来 1000+ 文件需要优化（不在本 RFC）
- 漏读 frontmatter 字段 → 直接当 unreviewed 即可，**不要抛错中断报告**
