#!/usr/bin/env node
/**
 * pnpm new:paper <slug> [--title=<title>] [--theme=<theme-slug>]
 *
 * 例：
 *   pnpm new:paper mixtral --title="Mixtral of Experts" --theme=moe-sparsity
 *
 * 在 src/content/docs/papers/<slug>.md 生成解读模板。
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: pnpm new:paper <slug> [--title=<title>] [--theme=<theme-slug>]');
  process.exit(1);
}

const [slug, ...rest] = args;
const opts = Object.fromEntries(
  rest.filter(s => s.startsWith('--')).map(s => {
    const [k, ...v] = s.slice(2).split('=');
    return [k, v.join('=')];
  })
);
const title = opts.title || slug;
const theme = opts.theme || 'long-context';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'src/content/docs/papers', `${slug}.md`);

if (existsSync(outPath)) {
  console.error(`✗ ${outPath} already exists`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });

const content = `---
title: ${title}
description: 论文解读 · ${title}
sidebar:
  label: ${title}
themes:
  - ${theme}
status: draft
---

> ⚠️ Draft。请贡献者填充。

## 元信息

- **作者**：…
- **机构**：…
- **会议 / arXiv**：…
- **发表日期**：…
- **关联主线**：[${theme}](/themes/${theme}/)

## 一句话总结

…

## 我们组为什么读这篇

…

## 关键贡献

1. …
2. …
3. …

## 方法

…

## 关键实验 / 结果

…

## 我们组的 take

> 与我们 [研究主线](/themes/${theme}/) 的关联：…

## 开放问题 / 后续

- …

## 共读历史

> 自动汇总 sessions 中讨论过这篇 paper 的记录（待功能上线）。

## 延伸阅读

- 原论文链接：…
- 相关概念：…
- 相关论文：…
`;

writeFileSync(outPath, content);
console.log(`✓ Created ${outPath}`);
