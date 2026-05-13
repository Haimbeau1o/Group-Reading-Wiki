---
rfc: R02
task_id: T02-6
status: pending
depends_on: [T02-1]
estimated_minutes: 30
branch: cycle-10/R02/T02-6-backfill
files_touched:
  - src/content/docs/papers/*.md
  - src/content/docs/concepts/*.md
  - src/content/docs/themes/*.md
  - src/content/docs/members/*.md
  - src/content/docs/sessions/*.md
  - src/content/docs/faq/*.md
verification_commands:
  - pnpm verify
  - pnpm staleness-report --quiet
---

# T02-6 · backfill 现有 content 文件加 last_reviewed_at + reviewer

## Context
RFC: `analysis/cycle-10/rfcs/R02-staleness-tracking.md` §D backfill + §Risk "backfill 集中"

## Exact Diff Intent

### 方案选择

**采用方案 A（简单的 today backfill）**。RFC §Risk 已标"6 个月后会集体过期"为已知缺陷，phase 2 决策是否升级到 git log 推算。

理由：
- 方案 B（git log 推算）的实现复杂度 ≈ 一个独立 task
- backfill date 不一定对应"实际复核"，方案 A 反而更诚实（"系统级 backfill，请尽快人工 review"）
- 6 个月后集体过期可以变成主动驱动 review 的事件

### 实施

写一个一次性脚本 `scripts/backfill-staleness.mjs`（仅本 task 用，完成后可保留作未来复用）：

```js
#!/usr/bin/env node
// 一次性脚本：给所有 src/content/docs/**/*.md 加 last_reviewed_at + reviewer
// 跳过 index.* 和 generic schema 的文件
// 已有 last_reviewed_at 字段的文件 → 不动

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectSchema } from './lib/frontmatter.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'src/content/docs');
const TODAY = new Date().toISOString().slice(0, 10);

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx)$/.test(e.name)) out.push(p);
  }
  return out;
}

let touched = 0, skipped = 0;
for (const f of walk(DOCS)) {
  const rel = relative(ROOT, f);
  const schema = detectSchema(rel);
  if (schema === 'generic') { skipped++; continue; }
  if (f.endsWith('/index.md') || f.endsWith('/index.mdx')) { skipped++; continue; }

  const raw = readFileSync(f, 'utf-8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) { skipped++; continue; }

  if (/^last_reviewed_at:/m.test(m[1])) { skipped++; continue; } // 已有

  // 在 frontmatter 末尾（"---" 之前）追加
  const newFm = m[1] + `\nlast_reviewed_at: "${TODAY}"\nreviewer: ""`;
  const newContent = raw.replace(/^---\n[\s\S]*?\n---/, `---\n${newFm}\n---`);
  writeFileSync(f, newContent);
  touched++;
}
console.log(`✅ backfill: touched=${touched}, skipped=${skipped}`);
```

跑：
```bash
node scripts/backfill-staleness.mjs
```

### 完成判据

- `grep -l "last_reviewed_at" src/content/docs/**/*.md | wc -l` —— 应当 = 全部非 index、非 generic 文件数（约 30 个）
- 抽样查 3 个文件（不同类型）：frontmatter 含两行，**正文 / 已有字段全部不变**

## Verification
- `pnpm verify` —— 0 warning（optional 字段加了不报）
- `pnpm staleness-report --quiet; echo $?` —— exit 0（所有文件 last_reviewed_at = today，cadence 内）
- `pnpm staleness-report --json | jq '.stats'` —— `unreviewed: 0`（全 backfill 完了）

## Rollback
- 单 commit revert（git 一次干净撤回所有 backfill）
- 删除 `scripts/backfill-staleness.mjs`（如认为是一次性的）

## Out of Scope
- 不填 reviewer 字段（留 `""` 让人手填）—— 因为 backfill 没法知道每页谁该负责
- 不用 git log 推算"最后实质改动" —— 已知缺陷，phase 2

## Risk
- 脚本写错 → 改坏现有 frontmatter。**先在 1 个文件 dry-run**（提取 content 看 diff 不真写），再全量
- 现有 frontmatter 有 trailing 空格 / 不规则缩进 → regex 匹配可能不准。**改完跑 `pnpm verify` 必须 0 error**
- backfill 完发现 staleness-report 集体过期 6 个月后 —— **已知问题，写进 R02-completion-report**
