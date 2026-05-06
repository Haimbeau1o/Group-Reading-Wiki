#!/usr/bin/env node
/**
 * pnpm new:member <slug> --role=<大导师|小导师|博士生|硕士生> [--year=N] [--cluster=...]
 *
 * 例：
 *   pnpm new:member zhangsan --role=博士生 --year=3 --cluster=研究主理人
 *
 * 在 src/content/docs/members/<slug>.md 生成成员主页模板。
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: pnpm new:member <slug> --role=<大导师|小导师|博士生|硕士生> [--year=N] [--cluster=...]');
  process.exit(1);
}
const [slug, ...rest] = args;
const opts = Object.fromEntries(
  rest.filter(s => s.startsWith('--')).map(s => {
    const [k, ...v] = s.slice(2).split('=');
    return [k, v.length ? v.join('=') : true];
  })
);
const role = opts.role || '博士生';
const year = opts.year || '';
const cluster = opts.cluster || '学习成长者';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'src/content/docs/members', `${slug}.md`);

if (existsSync(outPath)) {
  console.error(`✗ ${outPath} already exists`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });

const content = `---
title: ${slug}
description: ${role}${year ? ` · ${year} 年级` : ''}
sidebar:
  label: ${slug}
role: ${role}
${year ? `year: ${year}\n` : ''}cluster: ${cluster}
status: active
research-interests:
  - （待填）
---

## 关于

> 一段话自我介绍。

## 研究兴趣 / 在做的项目

…

## Reading log

> 周会后的短评、读到一半的想法、踩过的坑都可以写在这里。**100 字也算一条**。

### 第一条

…

## 联系

- Email: …
- GitHub: …
`;

writeFileSync(outPath, content);
if (opts.json) {
  process.stdout.write(JSON.stringify({ ok: true, action: 'create', file: outPath, slug, role, year, cluster }) + '\n');
} else {
  console.log(`✓ Created ${outPath}`);
  console.log(`  记得也在 src/content/docs/members/index.mdx 加入相应分组。`);
}
