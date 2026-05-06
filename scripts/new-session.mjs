#!/usr/bin/env node
/**
 * pnpm new:session <week> <slug> [--lead=<member>] [--paper=<paper-slug>]
 *
 * 例：
 *   pnpm new:session 2026-W19 mixtral-of-experts --lead=phd-senior-2 --paper=papers/mixtral
 *
 * 自动在 src/content/docs/sessions/ 下生成 <week-slug>.md 模板。
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: pnpm new:session <week> <slug> [--lead=<member>] [--paper=<paper-slug>]');
  console.error('Example: pnpm new:session 2026-W19 mixtral-of-experts --lead=phd-senior-2');
  process.exit(1);
}

const [week, slug, ...rest] = args;
const opts = Object.fromEntries(
  rest.filter(s => s.startsWith('--')).map(s => {
    const [k, ...v] = s.slice(2).split('=');
    return [k, v.join('=')];
  })
);

const lead = opts.lead || '<带读人>';
const paperRef = opts.paper ? `\n  - /${opts.paper}/` : '';
const today = new Date().toISOString().slice(0, 10);

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'src/content/docs/sessions', `${week.toLowerCase()}-${slug}.md`);

if (existsSync(outPath)) {
  console.error(`✗ ${outPath} already exists`);
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });

const content = `---
title: ${week} · ${slug}
description: ${week} 周会共读。带读人：${lead}。
sidebar:
  label: ${week} · ${slug}
session_week: ${week}
session_date: ${today}
lead: ${lead}
paper_refs:${paperRef}
themes: []
status: upcoming
---

> 自动生成的 session 模板。请带读人在周三前完成 Pre-read 部分。

## 📅 元信息

| 字段 | 值 |
|------|----|
| **周次** | ${week} |
| **时间** | （待填）周一 14:00–15:30 |
| **带读人** | [${lead}](/members/${lead}/) |
| **会议地点** | 实验室 + 腾讯会议 |
| **主 paper** | （待填） |
| **关联主线** | （待填，链向 /themes/ 下相关主线） |

---

## 1. 📝 Pre-read（会前）

### 必读

- （待带读人填）

### 选读

- （可选）

### 引导问题（带读人提）

1. ?
2. ?
3. ?

### 大家的 pre-read 问题

> 在评论区抛你看不懂或想讨论的点。
>
> *@……*：（在底部 Giscus 评论或直接 PR 加到这里）

---

## 2. 🎯 Live notes（会中）

> 带读人或指定记录员实时记。

### 14:00–14:20 · 引入

…

### 14:20–14:50 · 主体

…

### 14:50–15:10 · 关键讨论

…

### 15:10–15:30 · 自由讨论

…

---

## 3. 💡 Post-meeting（会后）

> **带读人在周二补完**。

### Key insights

1. …

### Action items

- [ ] **@${lead}**：…
- [ ] **@……**：…

### 与组工作的关联

- 直接关联：…
- 启发：…

### 评论区延伸讨论

> 在底部继续。
`;

writeFileSync(outPath, content);

if (opts.json) {
  process.stdout.write(JSON.stringify({ ok: true, action: 'create', file: outPath, slug, week, lead }) + '\n');
} else {
  console.log(`✓ Created ${outPath}`);
  console.log(`  Edit it, then commit: git add ${outPath}`);
}
