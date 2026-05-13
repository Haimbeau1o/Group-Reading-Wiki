#!/usr/bin/env node
/**
 * pnpm new:concept <slug>
 *   [--full="<英文全称>"]            # 例 "Mixture of Experts"
 *   [--label="<侧栏简称>"]            # 例 "MoE"，默认用 slug 大写
 *   [--description="<一句话定义>"]   # 30-50 字
 *   [--paper=<paper-slug>]           # 与之关联的 paper 的 slug（用作"在我们组的用法"段起点）
 *   [--aliases=a,b,c]                # ✨ 别名（逗号分隔，搜索 / 自动链种子）
 *   [--related=x,y]                  # ✨ 相关 concept slug（双向自动建边）
 *   [--parent=<concept-slug>]        # ✨ 父概念 slug（GRPO.parent = PPO）
 *   [--tags=t1,t2]                   # ✨
 *   [--json]
 *
 * 例：
 *   pnpm new:concept moe --full="Mixture of Experts" --label="MoE"
 *   pnpm new:concept mode-fusion --full="Thinking Mode Fusion" --paper=qwen3
 *
 * 在 src/content/docs/concepts/<slug>.md 生成词条模板。
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { yamlSafe, yamlList, yamlListQuoted, splitCsv, today as todayFn } from './lib/scaffold-helpers.mjs';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: pnpm new:concept <slug> [--full="..."] [--label=...] [--description="..."] [--paper=<slug>] [--json]');
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
const fullName = opts.full || slug;
const label = opts.label || slug.toUpperCase();
const description = opts.description || `（一句话定义 — 30–50 字）`;
const linkedPaper = opts.paper || '';

// 知识图字段（cycle-8）
const aliases = splitCsv(opts.aliases);
const relatedConcepts = splitCsv(opts.related);
const parentConcept = opts.parent || '';
const tags = splitCsv(opts.tags);
const reviewer = opts.reviewer || '';
const today = todayFn();

const __dirname = dirname(fileURLToPath(import.meta.url));
const conceptsDir = resolve(__dirname, '..', 'src/content/docs/concepts');
const outPath = resolve(conceptsDir, `${slug}.md`);

if (existsSync(outPath)) {
  if (isJson) console.log(JSON.stringify({ ok: false, error: `${outPath} already exists` }));
  else console.error(`✗ ${outPath} already exists`);
  process.exit(1);
}

// 自动算下一个 sidebar.order（max + 1）
let nextOrder = 2;
try {
  const files = readdirSync(conceptsDir).filter((f) => f.endsWith('.md') && f !== 'index.md');
  let maxOrder = 1;
  for (const f of files) {
    const content = readFileSync(resolve(conceptsDir, f), 'utf-8');
    const m = content.match(/^\s*order:\s*(\d+)/m);
    if (m) maxOrder = Math.max(maxOrder, parseInt(m[1], 10));
  }
  nextOrder = maxOrder + 1;
} catch (e) {
  // 目录不存在 / 读取失败，用默认值
}

mkdirSync(dirname(outPath), { recursive: true });

const titleY = yamlSafe(`${fullName} (${label})`);
const descY = yamlSafe(description);

// "在我们组的用法" 段：如果传了 --paper，给一个起点链接；否则全 TODO
const usageBlock = linkedPaper
  ? `:::caution[🤖 Agent 起草 · 待维护人填实]
下面是 agent 根据 \`--paper=${linkedPaper}\` 推断的起点。读后请补：(a) 该 paper 中的具体 §X 用法；(b) 我们组关心的开放问题；(c) 删 caution 块。
:::

- [${linkedPaper} paper note](/papers/${linkedPaper}/) — 这个术语在该 paper 中的用法（**📝 待补具体 §X**）
- 📝 TODO：我们组关心的开放问题（参考 \`concepts/mode-fusion.md\` 的写法 —— 不只是定义，要带组的视角）`
  : `> 📝 TODO：列出该术语在我们组 paper / session 中出现的位置 + 链接，以及我们组关心的开放问题。
>
> 参考 \`concepts/mode-fusion.md\` 的写法：架构对照表 + 我们组关心的开放问题列表。
>
> 用 \`pnpm -s list:papers --json\` 和 \`pnpm -s list:sessions --json\` 查找用例。`;

const content = `---
title: ${titleY}
description: ${descY}
sidebar:
  order: ${nextOrder}
  label: ${label}
aliases:${yamlListQuoted(aliases)}
related_concepts:${yamlList(relatedConcepts)}
parent_concept: ${parentConcept || 'null'}
tags:${yamlList(tags)}
last_reviewed_at: "${today}"
reviewer: ${reviewer ? `"${reviewer}"` : '""'}
---

## 一句话定义

> 📝 TODO：30–50 字，**严谨**。${description !== '（一句话定义 — 30–50 字）' ? '已从 --description 拷贝到 frontmatter，可在此扩展。' : ''}

## 直觉

> 📝 TODO：200–400 字。
>
> 解决了什么问题？为什么需要它？给一个直观对比 / 类比。

## 数学 / 实现

> 📝 TODO：最小可读。
>
> - 公式用 KaTeX：\`$y = Wx + b$\`
> - 伪代码用 \`\`\`python
> - **不要复制 paper 大段原文**（词典是速查，不是教程）

## 在我们组的用法

${usageBlock}

## 延伸阅读

- 原论文：📝 TODO
- 相关词条：📝 TODO（如 [GRPO](/concepts/grpo/) · [MoE](/concepts/moe/)）
- 站外：📝 TODO（一篇高质量讲解 / blog / video）
`;

writeFileSync(outPath, content);

const result = {
  ok: true,
  action: 'create',
  file: outPath,
  slug,
  full_name: fullName,
  label,
  sidebar_order: nextOrder,
  linked_paper: linkedPaper,
};

if (isJson) {
  console.log(JSON.stringify(result));
} else {
  console.log(`✓ created concepts/${slug}.md (sidebar order ${nextOrder})`);
  console.log('');
  console.log('Next:');
  console.log(`  1. 填 一句话定义 / 直觉 / 数学 三段（每段都标 📝 TODO）`);
  console.log(`  2. **必填** "在我们组的用法"段 —— 这是组词典与一般词典的核心区别`);
  console.log(`  3. 把新词条加到 concepts/index.md 的 "已上线" 列表`);
  console.log(`  4. 检查所有引用过 "${label}" 的 paper / session 文件，**首次出现处**改成 [${label}](/concepts/${slug}/)`);
  console.log(`  5. pnpm verify`);
  if (linkedPaper) {
    console.log(`  6. 编辑 papers/${linkedPaper}.md 把术语首次出现处链到本词条`);
  }
}
