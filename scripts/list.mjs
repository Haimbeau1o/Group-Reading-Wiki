#!/usr/bin/env node
/**
 * pnpm list:<members|themes|sessions|papers|concepts> [--json] [--since=<Nd>] [--theme=<slug>] [--role=<role>]
 *
 * 让 agent 能 introspect 仓库当前状态。
 *
 * 例：
 *   pnpm list:members --json
 *   pnpm list:sessions --since=7d --json
 *   pnpm list:papers --theme=long-context --json
 */
import { readdirSync, statSync } from 'node:fs';
import { join, basename, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './lib/frontmatter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS = join(ROOT, 'src/content/docs');

const args = process.argv.slice(2);
const subcommand = args[0]; // members / themes / sessions / papers / concepts
const opts = Object.fromEntries(
  args.slice(1).filter(s => s.startsWith('--')).map(s => {
    const [k, ...v] = s.slice(2).split('=');
    return [k, v.length ? v.join('=') : true];
  })
);

if (!['members', 'themes', 'sessions', 'papers', 'concepts'].includes(subcommand)) {
  console.error('Usage: pnpm list:<members|themes|sessions|papers|concepts> [--json] [--since=<Nd>] [--theme=<slug>] [--role=<role>]');
  process.exit(1);
}

const dir = join(DOCS, subcommand);
let files = [];
try {
  files = readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile() && /\.(md|mdx)$/.test(d.name) && !d.name.startsWith('index.'))
    .map(d => join(dir, d.name));
} catch {
  console.error(`No directory: ${dir}`);
  process.exit(1);
}

// 时间过滤（按 mtime 近似）
let since = null;
if (opts.since) {
  const m = String(opts.since).match(/^(\d+)([dwhm])$/);
  if (m) {
    const [, n, unit] = m;
    const ms = { h: 3600e3, d: 86400e3, w: 7 * 86400e3, m: 30 * 86400e3 }[unit];
    since = Date.now() - Number(n) * ms;
  }
}

const items = files
  .map(f => {
    const stat = statSync(f);
    const { frontmatter } = parseFrontmatter(f);
    return {
      slug: basename(f).replace(/\.(md|mdx)$/, ''),
      path: '/' + relative(DOCS, f).replace(/\.(md|mdx)$/, '').replace(/\/index$/, '') + '/',
      file: relative(ROOT, f),
      mtime: stat.mtimeMs,
      mtime_iso: new Date(stat.mtimeMs).toISOString(),
      ...frontmatter,
    };
  })
  .filter(item => {
    if (since && item.mtime < since) return false;
    if (opts.theme && subcommand === 'papers') {
      if (!item.themes || !item.themes.includes(opts.theme)) return false;
    }
    if (opts.theme && subcommand === 'sessions') {
      if (!item.themes || !item.themes.includes(opts.theme)) return false;
    }
    if (opts.role && subcommand === 'members') {
      if (item.role !== opts.role) return false;
    }
    if (opts.status && item.status !== opts.status) return false;
    return true;
  })
  .sort((a, b) => (a.sidebar?.order || 999) - (b.sidebar?.order || 999) || a.slug.localeCompare(b.slug));

if (opts.json) {
  process.stdout.write(JSON.stringify({ subcommand, count: items.length, items }, null, 2) + '\n');
} else {
  console.log(`📋 ${subcommand} · ${items.length} 个`);
  for (const it of items) {
    const extra = [];
    if (it.role) extra.push(it.role);
    if (it.year) extra.push(`year ${it.year}`);
    if (it.status && it.status !== 'active') extra.push(it.status);
    if (it.session_week) extra.push(it.session_week);
    if (it.themes) extra.push(`themes: ${Array.isArray(it.themes) ? it.themes.join(',') : it.themes}`);
    console.log(`  ${it.slug.padEnd(28)} ${it.path.padEnd(40)} ${extra.join(' · ')}`);
  }
}
