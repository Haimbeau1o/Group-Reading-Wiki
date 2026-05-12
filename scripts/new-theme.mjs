#!/usr/bin/env node
/**
 * pnpm new:theme <slug> --title="<主线名称>" [--label="<sidebar 短名>"]
 *                       [--description="<一句话>"] [--owner=<member-slug>]
 *                       [--co-owners=a,b]   # ✨ 知识图：核心博士 slug
 *                       [--tags=t1,t2]      # ✨
 *                       [--json]
 *
 * 例：
 *   pnpm new:theme reflective-alignment --title="LLM 自我反思与对齐" --label="反思与对齐"
 *
 * 这个脚本会：
 *   1. 在 src/content/docs/themes/<slug>.md 生成主线模板（含 TODO 标记）
 *   2. 在 src/content/docs/themes/index.mdx 加一行链接（如果该 slug 未列入）
 *
 * 这是 first-week-after-init skill 循环 2 的支撑脚本。
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const opts = Object.fromEntries(
  args
    .filter(s => s.startsWith('--'))
    .map(s => {
      const [k, ...v] = s.slice(2).split('=');
      return [k, v.length ? v.join('=') : true];
    })
);

if (positional.length < 1) {
  console.error('Usage: pnpm new:theme <slug> --title="<主线名称>" [--label=<...>] [--description=<...>] [--owner=<member-slug>] [--json]');
  process.exit(1);
}

const slug = positional[0];
const title = opts.title || slug;
const label = opts.label || title;
const description = opts.description || `${title} —— 一句话定位（请补充）。`;
const owner = opts.owner || '';
const isJson = !!opts.json;

// 知识图字段（cycle-8）
const splitCsv = (v) => (typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : []);
const coOwners = splitCsv(opts['co-owners']);
const tags = splitCsv(opts.tags);
const reviewer = opts.reviewer || '';
const today = new Date().toISOString().slice(0, 10);
const yamlList = (arr) => arr.length ? '\n' + arr.map(s => `  - ${s}`).join('\n') : ' []';

// YAML 安全引号
const yamlSafe = (s) =>
  /[:#&*!|>%@`,\[\]{}"'\\]/.test(s)
    ? `"${String(s).replace(/"/g, '\\"')}"`
    : s;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const themesDir = resolve(ROOT, 'src/content/docs/themes');
const outPath = resolve(themesDir, `${slug}.md`);
const indexPath = resolve(themesDir, 'index.mdx');

if (existsSync(outPath)) {
  const msg = `theme already exists: ${outPath}`;
  if (isJson) console.log(JSON.stringify({ ok: false, error: msg }));
  else console.error(`✗ ${msg}`);
  process.exit(1);
}

mkdirSync(themesDir, { recursive: true });

const ownerLine = owner
  ? `- **Owner**：[${owner}](/members/${owner}/)`
  : `- **Owner**：[占位](/members/)（TODO：指定一个核心 PhD / 小导师）`;

const content = `---
title: ${yamlSafe(title)}
description: ${yamlSafe(description)}
sidebar:
  order: 1
  label: ${yamlSafe(label)}
owner: ${owner || 'null'}
co_owners:${yamlList(coOwners)}
tags:${yamlList(tags)}
last_reviewed_at: "${today}"
reviewer: ${reviewer ? `"${reviewer}"` : '""'}
---

## 一句话定位

我们关心一个问题：**...**（PI 来填）

我们**不**关心：> 📝 TODO PI 补充。

## 该方向的 owner

${ownerLine}

## 关键论文（外部）

> 📝 TODO：列 5 篇必读（奠基 1–2 + 近期 SOTA 2–3 + counter 0–1）。

## 我们的工作（内部）

> 📝 TODO：列在做的项目 / 已发的论文 / 进行中的代码 / 数据。

## 我们关心的开放问题

> 📝 TODO：列 3 个**未解决**的问题（不是已解决的、不是教科书的）。

## 推荐阅读路径（给新人）

> 📝 TODO：等组里有几篇 paper note 后回来填。

## 该主线的「组内立场」

> 📝 TODO：1 段，写"我们组与其他在这个话题上的差异化立场"。
`;

writeFileSync(outPath, content);

// 更新 themes/index.mdx：在 "## 当前主线" 段下加一行（如果还没引用过这个 slug）
if (existsSync(indexPath)) {
  let idx = readFileSync(indexPath, 'utf-8');
  const linkLine = `- **[${title}](/themes/${slug}/)** — ${description}`;
  if (!idx.includes(`/themes/${slug}/`)) {
    if (/##\s*当前主线/.test(idx)) {
      idx = idx.replace(
        /(##\s*当前主线\s*\n\n?)/,
        `$1${linkLine}\n\n`
      );
    } else {
      // fallback: append at end
      idx = idx.trimEnd() + `\n\n## 当前主线\n\n${linkLine}\n`;
    }
    writeFileSync(indexPath, idx);
  }
}

const result = {
  ok: true,
  slug,
  title,
  path: outPath.replace(ROOT + '/', ''),
  index_updated: true,
};

if (isJson) {
  console.log(JSON.stringify(result));
} else {
  console.log(`✓ created ${result.path}`);
  console.log(`✓ updated themes/index.mdx`);
  console.log('');
  console.log('Next:');
  console.log(`  1. PI 填 6 个 TODO 段（一句话定位 / 不关心 / 5 篇必读 / 3 开放问题 / 阅读路径 / 组内立场）`);
  console.log(`  2. pnpm verify`);
  console.log(`  3. 编辑 group.config.yaml 把 content.themes_count + 1`);
}
