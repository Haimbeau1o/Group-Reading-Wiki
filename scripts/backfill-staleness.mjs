#!/usr/bin/env node
/**
 * 一次性 backfill：给所有 src/content/docs/**\/*.md 加 last_reviewed_at + reviewer
 *
 * - 跳过 index.* 和 generic schema 的文件
 * - 已有 last_reviewed_at 字段的文件 → 不动
 * - 在 frontmatter 末尾（"---" 之前）追加：
 *     last_reviewed_at: "<today YYYY-MM-DD>"
 *     reviewer: ""
 *
 * 已知缺陷：所有 backfill 时间集中（= today），6 个月后会"集体过期"集体爆 unreviewed。
 * Phase 2 决策：升级到 git log 推算"最后实质改动日"作 backfill。
 *
 * 设计契约：analysis/cycle-10/rfcs/R02-staleness-tracking.md §D backfill + §Risk
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectSchema } from './lib/frontmatter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
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

let touched = 0, skipped = 0, alreadyHad = 0;
const touchedFiles = [];

for (const f of walk(DOCS)) {
  const rel = relative(ROOT, f);
  const schema = detectSchema(rel);

  if (schema === 'generic') { skipped++; continue; }
  if (/\/index\.(md|mdx)$/.test(f)) { skipped++; continue; }

  const raw = readFileSync(f, 'utf-8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) { skipped++; continue; }

  if (/^last_reviewed_at:/m.test(m[1])) { alreadyHad++; continue; }

  // 在 frontmatter 末尾追加
  const newFm = m[1] + `\nlast_reviewed_at: "${TODAY}"\nreviewer: ""`;
  const newContent = raw.replace(/^---\n[\s\S]*?\n---/, `---\n${newFm}\n---`);
  writeFileSync(f, newContent);
  touched++;
  touchedFiles.push(rel.replace(/^src\/content\/docs\//, ''));
}

console.log(`✅ backfill: touched=${touched}, already-had=${alreadyHad}, skipped=${skipped}`);
if (touched > 0) {
  console.log('  files:');
  for (const f of touchedFiles) console.log(`    ${f}`);
}
