---
debt_id: D03
status: pending
estimated_minutes: 60
depends_on: []
branch: phase-1-debt/D03-extract-scaffold-helpers
files_touched:
  - scripts/lib/scaffold-helpers.mjs
  - scripts/new-paper.mjs
  - scripts/new-session.mjs
  - scripts/new-concept.mjs
  - scripts/new-theme.mjs
  - scripts/new-member.mjs
  - scripts/new-faq.mjs
verification_commands:
  - pnpm verify
  - "node scripts/audit-touchpoints.mjs --quiet"
  - "pnpm new:concept ralph-d03-test --full=Test --json"
  - "pnpm new:paper ralph-d03-test --title=Test --json"
  - "pnpm new:session 2026-W98 ralph-d03-test --lead=leon --json"
  - "pnpm new:theme ralph-d03-test --title=Test --json"
  - "pnpm new:member ralph-d03-test --role=博士生 --json"
  - "pnpm new:faq ralph-d03-test --q=Test? --answered-by=leon --json"
  - "rm -f src/content/docs/concepts/ralph-d03-test.md src/content/docs/papers/ralph-d03-test.md src/content/docs/sessions/2026-w98-ralph-d03-test.md src/content/docs/themes/ralph-d03-test.md src/content/docs/members/ralph-d03-test.md src/content/docs/faq/ralph-d03-test.md"
  - "git checkout HEAD -- src/content/docs/themes/index.mdx"
  - pnpm verify
---

# D03 · 抽 `scripts/lib/scaffold-helpers.mjs` 共享模块

## Context

cycle-10 phase 1 retrospective（`cycle-10-phase1-report.md` §"暴露的弱点" #3）：
> 6 个 `new-*.mjs` scaffold 模板风格差异：new-paper / session / concept / theme / faq 用模板字符串，new-member 用 `lines.push()` 数组拼。**`yamlSafe` / `yamlList` 也在 6 个文件各自重复定义**，下次加 frontmatter 字段要改 6 处。

本 task **只**做共享 helper 抽离，**不**统一 lines.push vs 模板字符串风格（那个改动太大，phase 2 决策）。

## Exact Diff Intent

### 改 1：新建 `scripts/lib/scaffold-helpers.mjs`

```js
// scripts/lib/scaffold-helpers.mjs
// 6 个 new-*.mjs 共用的小工具。提取来源：phase-1-debt D03。
// 行为必须与现有 inline 定义完全等价（已逐字段验证）。

/**
 * 把不安全的 YAML scalar 包引号（含 : # & * ! | > % @ ` , [ ] { } " ' \ 任一即包）
 */
export const yamlSafe = (s) =>
  /[:#&*!|>%@`,\[\]{}"'\\]/.test(s)
    ? `"${String(s).replace(/"/g, '\\"')}"`
    : s;

/**
 * 数组渲染为 YAML block list；空数组渲染为 flow `[]`
 * - ['a', 'b'] → '\n  - a\n  - b'
 * - []          → ' []'
 */
export const yamlList = (arr) =>
  arr.length ? '\n' + arr.map(s => `  - ${s}`).join('\n') : ' []';

/**
 * 带引号 / safe 处理的 yamlList（new-concept aliases 用过）
 */
export const yamlListQuoted = (arr) =>
  arr.length ? '\n' + arr.map(s => `  - ${yamlSafe(s)}`).join('\n') : ' []';

/**
 * 把 --foo=a,b,c 拆成 ['a','b','c']
 */
export const splitCsv = (v) =>
  typeof v === 'string'
    ? v.split(',').map(s => s.trim()).filter(Boolean)
    : [];

/**
 * 今天 ISO 日期 (UTC, YYYY-MM-DD)。R02 scaffold last_reviewed_at 用。
 */
export const today = () => new Date().toISOString().slice(0, 10);
```

### 改 2-7：每个 `new-*.mjs` 替换

For each of `new-paper.mjs` / `new-session.mjs` / `new-concept.mjs` / `new-theme.mjs` / `new-member.mjs` / `new-faq.mjs`：

1. 在 imports 区加：
   ```js
   import { yamlSafe, yamlList, splitCsv, today as todayFn } from './lib/scaffold-helpers.mjs';
   ```
   （`new-concept.mjs` 还需要 `yamlListQuoted`）

2. **删除**该文件内 inline 定义的 `yamlSafe` / `yamlList` / `splitCsv`

3. 把 `const today = new Date().toISOString().slice(0, 10);` 替换为 `const today = todayFn();`
   （T02-3 R02 加的 today const 也用 helper）

4. **保留** 文件内本地定义的 helper 如果它有特殊行为（例：new-member 的 lines.push 不动）

**关键约束**：每个 scaffold 改动**必须行为等价**。即改前改后用同一组 flag 跑 scaffold，生成的 `.md` 文件 byte-by-byte 相同。

## Verification

按 verification_commands 顺序：

1. `pnpm verify` —— pre-test baseline
2. `node scripts/audit-touchpoints.mjs --quiet` —— D02 已加的 helper，确认没引入新 hardcoded 类型
3. 跑 6 个 scaffold 生成测试文件
4. **逐对比** 6 个生成的文件 frontmatter 与改之前（手动对比 / git stash 对比）
5. 清理测试文件
6. `pnpm verify` —— 0 warning

**额外** —— 在 task 实施过程中，**先把 D03 helper 抽出来 commit**，再单独 commit 每个 scaffold 改动（每个 scaffold 是一个 sub-commit on the same branch）—— 这样 review 时能逐 scaffold 看是否行为等价。

### 等价性自检

每个 scaffold 改前先跑：

```bash
pnpm new:concept compare-pre --full="Test compare" --label="TC" --json > /tmp/d03-concept-pre.json
cat src/content/docs/concepts/compare-pre.md > /tmp/d03-concept-pre.md
rm src/content/docs/concepts/compare-pre.md
```

改后跑：

```bash
pnpm new:concept compare-post --full="Test compare" --label="TC" --json > /tmp/d03-concept-post.json
cat src/content/docs/concepts/compare-post.md > /tmp/d03-concept-post.md
rm src/content/docs/concepts/compare-post.md
```

**只允许的 diff**：slug `compare-pre` vs `compare-post` + 日期（如果跨日跑了）。所有其它 byte 必须相同。

> 注：因 6 个 scaffold 改动有微妙差异，Ralph 可能选择**只**抽 helper 但**不**改 scaffold（视为 D03 的最小可行 version）。如果触发了 sub-task 范围歧义 → `RALPH_LOOP_AMBIGUOUS: D03 scaffold refactor scope unclear`，让用户判断。

## Rollback

每个 scaffold 改动是独立 commit on 同一 branch。Revert 顺序：scaffold revert（按 commit 倒序）→ helper file 删除 → branch 撤。

## Out of Scope

- ❌ 统一 `lines.push` vs 模板字符串风格（new-member vs others）—— 行为风险高
- ❌ 重写 scaffold 模板内容 / 字段顺序
- ❌ 加新功能（如 `--dry-run`）
- ❌ 改 `scripts/new-faq.mjs` 内部 `yamlSafe` 因为它在 T01-5 时就一致 —— 仅做 import 替换

## Risk

| Risk | Likelihood | Impact | 缓解 |
|------|-----------|--------|------|
| 微妙行为差异（如 yamlSafe 某 regex 顺序导致输出不同） | 中 | 中 | 等价性自检（diff 测试） |
| 测试文件清理不彻底（保留 6 个垃圾文件） | 中 | 低 | verification_commands 含批 rm + 终 verify |
| themes/index.mdx 因新 theme 引用变脏（同 T02-3 经验） | 中 | 低 | verification_commands 含 `git checkout HEAD -- themes/index.mdx` |
| Helper API 设计错（如 yamlList vs yamlListQuoted 边界） | 低 | 高 | 保留 `yamlListQuoted` 单独 export（new-concept 用）—— 不混到 yamlList |
