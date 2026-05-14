#!/usr/bin/env node
/**
 * pnpm new:session <week> <slug> [--lead=<member>] [--paper=<paper-slug>]
 *   [--title="<session 标题>"]  # ✨ 显式标题；否则默认 "<week> · <slug>"
 *   [--participants=a,b,c]   # ✨ 知识图：除 lead 外参与者 slug
 *   [--concept-refs=x,y]     # ✨ 知识图：本次重点 concept slug
 *   [--themes=t1,t2]         # ✨ 显式绑主线；否则从 --paper 自动继承
 *   [--tags=t1,t2]           # ✨
 *
 * 例：
 *   pnpm new:session 2026-W19 mixtral-of-experts --lead=phd-senior-2 --paper=papers/mixtral
 *   pnpm new:session 2026-W22 r1-followup --paper=papers/deepseek-r1 \
 *                    --title="W22 · DeepSeek-R1 续讨论"
 *
 * 自动在 src/content/docs/sessions/ 下生成 <week-slug>.md 模板。
 *
 * --paper=papers/X 时：若 X.md 的 frontmatter 有 themes，会自动继承到 session
 * （除非显式传 --themes=... 覆盖）。避免 session 漏挂主线。
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { yamlSafe, yamlList, splitCsv, today as todayFn } from './lib/scaffold-helpers.mjs';

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
    return [k, v.length ? v.join('=') : true];
  })
);

const lead = opts.lead || '<带读人>';
const paperRef = opts.paper ? `\n  - /${opts.paper}/` : ' []';
const today = todayFn();
const reviewer = opts.reviewer || '';

// 知识图字段（cycle-8）
const participants = splitCsv(opts.participants);
const conceptRefs = splitCsv(opts['concept-refs']);
const tags = splitCsv(opts.tags);

const __dirname = dirname(fileURLToPath(import.meta.url));

// themes: 优先 --themes=... 显式；否则若 --paper 指向的文件 frontmatter 有 themes 就继承
let themes = splitCsv(opts.themes);
let themesInheritedFrom = '';
if (themes.length === 0 && opts.paper) {
  const paperBase = String(opts.paper).replace(/^\/+|\/+$/g, '').replace(/^papers?\//, '');
  const paperPath = resolve(__dirname, '..', 'src/content/docs/papers', `${paperBase}.md`);
  if (existsSync(paperPath)) {
    const raw = readFileSync(paperPath, 'utf-8');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      // 极简 YAML：支持 block list `themes:\n  - a\n  - b` 和 flow list `themes: [a, b]`
      const blockMatch = fmMatch[1].match(/^themes:\s*\n((?:\s+-\s+.+\n?)+)/m);
      const flowMatch = fmMatch[1].match(/^themes:\s*\[([^\]]*)\]/m);
      if (blockMatch) {
        themes = blockMatch[1].split('\n').map(l => l.replace(/^\s+-\s+/, '').trim()).filter(Boolean);
      } else if (flowMatch) {
        themes = flowMatch[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      }
      if (themes.length > 0) themesInheritedFrom = `papers/${paperBase}`;
    }
  }
}

const titleY = yamlSafe(opts.title || `${week} · ${slug}`);
const descY = yamlSafe(`${week} 周会共读。带读人：${lead}。`);

const outPath = resolve(__dirname, '..', 'src/content/docs/sessions', `${week.toLowerCase()}-${slug}.md`);

if (existsSync(outPath)) {
  console.error(`✗ ${outPath} already exists`);
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });

const content = `---
title: ${titleY}
description: ${descY}
sidebar:
  label: ${titleY}
session_week: ${week}
session_date: ${today}
lead: ${lead}
paper_refs:${paperRef}
themes:${yamlList(themes)}
participants:${yamlList(participants)}
concept_refs:${yamlList(conceptRefs)}
tags:${yamlList(tags)}
status: upcoming
last_reviewed_at: "${today}"
reviewer: ${reviewer ? `"${reviewer}"` : '""'}
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

## 0. 🔗 关联背景

> 由 \`pnpm context:for papers/<paper-slug>\` 拿到的邻居写在这里 —— 让没参会的人 5 分钟拉到坐标系。
>
> - 概念前置：（待 lead 用 context:for 拿到的 concepts 填）
> - 前情：（同 theme / 引用同 paper 的历史 sessions）
> - 同主线：（其他 papers）
>
> *agent 起草段：跑 \`pnpm -s context:for papers/<slug> --json --depth=2\` 后把邻居改写到这里，删除本提示。*

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
  process.stdout.write(JSON.stringify({
    ok: true, action: 'create', file: outPath, slug, week, lead,
    themes, themes_inherited_from: themesInheritedFrom,
  }) + '\n');
} else {
  console.log(`✓ Created ${outPath}`);
  if (themesInheritedFrom) {
    console.log(`  ℹ themes 从 ${themesInheritedFrom} 继承：[${themes.join(', ')}]`);
  }
  console.log(`  Edit it, then commit: git add ${outPath}`);
}
