#!/usr/bin/env node
/**
 * pnpm new:faq <slug>
 *   --q="<问题原文>"                  # required, ≤200 字符
 *   --answered-by=<member-slug>        # required
 *   [--asked-by=<member-slug|guest>]   # 默认 "guest"
 *   [--description="<一句话上下文>"]
 *   [--label="<sidebar 简称>"]
 *   [--related-papers=p1,p2]
 *   [--related-concepts=c1,c2]
 *   [--themes=t1,t2]
 *   [--tags=t1,t2]
 *   [--exemplar]                       # 标 frontmatter exemplar: true（模板自带的"好 FAQ"）
 *   [--reviewer=<member-slug>]         # 默认 = answered_by
 *   [--json]
 *
 * 例：
 *   pnpm new:faq how-to-pick-arxiv-papers \
 *     --q="怎么挑值得读的 arXiv paper？" \
 *     --answered-by=leon --themes=test-time-reasoning --tags=paper-reading
 *
 * 在 src/content/docs/faq/<slug>.md 生成 FAQ 模板。
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: pnpm new:faq <slug> --q="..." --answered-by=<slug> [--asked-by=<slug|guest>] [--description="..."] [--json]');
  process.exit(1);
}

const [slug, ...rest] = args;
const opts = Object.fromEntries(
  rest.filter(s => s.startsWith('--')).map(s => {
    const [k, ...v] = s.slice(2).split('=');
    return [k, v.length ? v.join('=') : true];
  })
);

const isJson = !!opts.json;
const question = opts.q || opts.question || '';
const answeredBy = opts['answered-by'] || '';

if (!question || !answeredBy) {
  const err = '✗ --q="..." 和 --answered-by=<slug> 都是必填';
  if (isJson) console.log(JSON.stringify({ ok: false, error: err }));
  else console.error(err);
  process.exit(1);
}

if (question.length > 200) {
  const err = `✗ 问题原文超 200 字符（${question.length}）`;
  if (isJson) console.log(JSON.stringify({ ok: false, error: err }));
  else console.error(err);
  process.exit(1);
}

const askedBy = opts['asked-by'] || 'guest';
const description = opts.description || `${question.slice(0, 80).replace(/[\n\r]/g, ' ')}`;
const labelDefault = question.replace(/[？?！!。.]/g, '').slice(0, 12);
const label = opts.label || labelDefault;
const reviewer = opts.reviewer || answeredBy;
const exemplar = !!opts.exemplar;

const splitCsv = (v) => (typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : []);
const relatedPapers = splitCsv(opts['related-papers']);
const relatedConcepts = splitCsv(opts['related-concepts']);
const themes = splitCsv(opts.themes);
const tags = splitCsv(opts.tags);

const yamlSafe = (s) => /[:#&*!|>%@`,\[\]{}"'\\]/.test(s) ? `"${String(s).replace(/"/g, '\\"')}"` : s;
const yamlList = (arr) => arr.length ? '\n' + arr.map(s => `  - ${s}`).join('\n') : ' []';

const __dirname = dirname(fileURLToPath(import.meta.url));
const faqDir = resolve(__dirname, '..', 'src/content/docs/faq');
const outPath = resolve(faqDir, `${slug}.md`);

if (existsSync(outPath)) {
  const err = `✗ ${outPath} 已存在`;
  if (isJson) console.log(JSON.stringify({ ok: false, error: err }));
  else console.error(err);
  process.exit(1);
}

// 自动算下一个 sidebar.order
let nextOrder = 2;
try {
  if (existsSync(faqDir)) {
    const files = readdirSync(faqDir).filter((f) => f.endsWith('.md') && f !== 'index.md');
    let maxOrder = 1;
    for (const f of files) {
      const content = readFileSync(resolve(faqDir, f), 'utf-8');
      const m = content.match(/^\s*order:\s*(\d+)/m);
      if (m) maxOrder = Math.max(maxOrder, parseInt(m[1], 10));
    }
    nextOrder = maxOrder + 1;
  }
} catch (e) {}

mkdirSync(faqDir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const titleY = yamlSafe(`${question.slice(0, 60)} · FAQ`);
const descY = yamlSafe(description);
const labelY = yamlSafe(label);
const questionY = yamlSafe(question);

const content = `---
title: ${titleY}
description: ${descY}
sidebar:
  order: ${nextOrder}
  label: ${labelY}
question: ${questionY}
asked_by: ${askedBy}
answered_by: ${answeredBy}
related_papers:${yamlList(relatedPapers)}
related_concepts:${yamlList(relatedConcepts)}
themes:${yamlList(themes)}
tags:${yamlList(tags)}
last_reviewed_at: "${today}"
reviewer: ${reviewer ? `"${reviewer}"` : '""'}
${exemplar ? 'exemplar: true\n' : ''}---

## 问题

> ${question}

## 简答（≤200 字）

📝 TODO：一段话答完。如果展开太长，把核心 takeaway 放这段，细节放下面。

## 完整答案

📝 TODO：500-1500 字。建议结构：

1. **背景** —— 为什么这是个问题
2. **我们组的做法** —— 关键判断 / heuristics
3. **常见坑** —— 新人最容易踩的 2-3 个
4. **链回 wiki** —— 链向相关 paper note / concept / session

## 修订历史

- ${today}：首次起草（answered_by=${answeredBy}）
`;

writeFileSync(outPath, content);

const result = {
  ok: true,
  action: 'create',
  file: outPath,
  slug,
  question,
  answered_by: answeredBy,
  asked_by: askedBy,
  sidebar_order: nextOrder,
  last_reviewed_at: today,
};

if (isJson) {
  console.log(JSON.stringify(result));
} else {
  console.log(`✓ created faq/${slug}.md (sidebar order ${nextOrder})`);
  console.log('');
  console.log('Next:');
  console.log(`  1. 写"简答"（≤200 字）`);
  console.log(`  2. 写"完整答案"（500-1500 字，4 段建议结构）`);
  console.log(`  3. 链回 paper / concept / session（用 pnpm -s list:papers / list:concepts --json）`);
  console.log(`  4. pnpm verify && pnpm build:index`);
  console.log(`  5. pnpm -s context:for faq/${slug} --depth=1 → 看 backlinks`);
}
