#!/usr/bin/env node
/**
 * pnpm staleness-report
 *   [--type=papers|concepts|themes|members|sessions|faq|all]   # 默认 all
 *   [--cadence=6m|12m|24m]                                     # 强制覆盖类型默认
 *   [--include-unreviewed]                                     # 未填 last_reviewed_at 也算 stale（默认 true）
 *   [--reviewer=<member-slug>]                                 # 仅看某人负责的
 *   [--unowned-only]                                           # 仅显示 reviewer 字段为空的
 *   [--json]
 *   [--quiet]
 *
 * Exit code:
 *   0 — 全 fresh
 *   1 — 有 stale 或 unreviewed
 *   2 — 脚本错（YAML 解析失败等）
 *
 * 设计契约：analysis/cycle-10/rfcs/R02-staleness-tracking.md
 */
import { readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, detectSchema } from './lib/frontmatter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS = join(ROOT, 'src/content/docs');

// ───────── arg parsing ─────────
const args = process.argv.slice(2);
const opts = Object.fromEntries(
  args.filter(s => s.startsWith('--')).map(s => {
    const [k, ...v] = s.slice(2).split('=');
    return [k, v.length ? v.join('=') : true];
  })
);

const TYPE_FILTER = opts.type || 'all';
const CADENCE_OVERRIDE = opts.cadence || null;
const INCLUDE_UNREVIEWED = opts['include-unreviewed'] !== 'false'; // 默认 true
const REVIEWER_FILTER = opts.reviewer || null;
const UNOWNED_ONLY = !!opts['unowned-only'];
const JSON_OUT = !!opts.json;
const QUIET = !!opts.quiet;

const VALID_TYPES = ['paper', 'concept', 'theme', 'member', 'session', 'faq'];
const PLURAL_TO_SINGULAR = { papers: 'paper', concepts: 'concept', themes: 'theme', members: 'member', sessions: 'session', faq: 'faq' };

let typeFilterSingular = null;
if (TYPE_FILTER !== 'all') {
  typeFilterSingular = PLURAL_TO_SINGULAR[TYPE_FILTER] || TYPE_FILTER;
  if (!VALID_TYPES.includes(typeFilterSingular)) {
    console.error(`✗ unknown --type=${TYPE_FILTER}. Valid: ${Object.keys(PLURAL_TO_SINGULAR).join('|')}`);
    process.exit(2);
  }
}

// ───────── helpers ─────────
function parseCadence(str) {
  if (!str || str === 'indefinite') return Infinity;
  const m = String(str).match(/^(\d+)m$/);
  if (!m) throw new Error(`invalid cadence: ${str}`);
  const months = parseInt(m[1], 10);
  return months * 30; // 30 天 / 月
}

function typeDefaultCadence(type) {
  if (type === 'concept' || type === 'theme') return '6m';
  if (type === 'paper' || type === 'session' || type === 'member' || type === 'faq') return '12m';
  return 'indefinite';
}

function todayUtc() {
  return new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
}

function parseDate(s) {
  if (!s || typeof s !== 'string') return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(`${s}T00:00:00Z`);
  if (isNaN(d.getTime())) return null;
  return d;
}

// ───────── walk + collect ─────────
function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const TODAY = todayUtc();
const items = [];

for (const f of walk(DOCS)) {
  const rel = relative(ROOT, f);
  if (/\/index\.(md|mdx)$/.test(rel)) continue;
  const type = detectSchema(rel);
  if (type === 'generic') continue;
  if (typeFilterSingular && type !== typeFilterSingular) continue;

  let fm;
  try {
    fm = parseFrontmatter(f).frontmatter;
  } catch {
    continue; // 损坏的 frontmatter 跳过，verify 会单独报
  }

  const reviewer = fm.reviewer || '';
  if (REVIEWER_FILTER && reviewer !== REVIEWER_FILTER) continue;
  if (UNOWNED_ONLY && reviewer) continue;

  const cadenceStr = CADENCE_OVERRIDE || fm.review_cadence || typeDefaultCadence(type);
  let cadenceDays;
  try {
    cadenceDays = parseCadence(cadenceStr);
  } catch {
    cadenceDays = parseCadence(typeDefaultCadence(type));
  }

  const lastReviewedRaw = fm.last_reviewed_at || null;
  const lastReviewed = parseDate(lastReviewedRaw);
  let daysSince = null;
  let status = 'fresh';

  if (!lastReviewed) {
    if (INCLUDE_UNREVIEWED) status = 'unreviewed';
    else status = 'fresh';
  } else {
    daysSince = Math.floor((TODAY - lastReviewed) / 86400000);
    if (daysSince > cadenceDays) status = 'stale';
  }

  items.push({
    file: rel.replace(/^src\/content\/docs\//, ''),
    type,
    last_reviewed_at: lastReviewedRaw,
    reviewer: reviewer || null,
    review_cadence: cadenceStr,
    days_since: daysSince,
    status,
  });
}

// ───────── sort + summarize ─────────
const stale = items.filter(i => i.status === 'stale').sort((a, b) => (b.days_since ?? 0) - (a.days_since ?? 0));
const unreviewed = items.filter(i => i.status === 'unreviewed');
const fresh = items.filter(i => i.status === 'fresh');

const stats = {
  total: items.length,
  stale: stale.length,
  unreviewed: unreviewed.length,
  fresh: fresh.length,
};

const result = {
  ok: true,
  generated_at: new Date().toISOString(),
  filters: {
    type: TYPE_FILTER,
    cadence: CADENCE_OVERRIDE,
    include_unreviewed: INCLUDE_UNREVIEWED,
    reviewer: REVIEWER_FILTER,
    unowned_only: UNOWNED_ONLY,
  },
  stats,
  items: [...stale, ...unreviewed], // fresh 不输出
};

// ───────── output ─────────
if (QUIET) {
  // 仅 exit code
} else if (JSON_OUT) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`\n📋 staleness-report · ${result.generated_at.slice(0, 10)}`);
  if (TYPE_FILTER !== 'all') console.log(`   filter: type=${TYPE_FILTER}`);
  if (REVIEWER_FILTER) console.log(`   filter: reviewer=${REVIEWER_FILTER}`);
  if (UNOWNED_ONLY) console.log(`   filter: unowned-only`);
  console.log(`   stats: total=${stats.total}, stale=${stats.stale}, unreviewed=${stats.unreviewed}, fresh=${stats.fresh}`);
  console.log('');

  if (stale.length) {
    console.log('STALE (last reviewed > cadence):');
    for (const it of stale) {
      const rev = it.reviewer || '<unset>';
      console.log(`  ⏰ ${it.file}  last_reviewed=${it.last_reviewed_at} (${it.days_since}d ago, cadence=${it.review_cadence})  reviewer=${rev}`);
    }
    console.log('');
  }
  if (unreviewed.length) {
    console.log('UNREVIEWED (no last_reviewed_at):');
    for (const it of unreviewed) {
      const rev = it.reviewer || '<unset>';
      console.log(`  ❓ ${it.file}  reviewer=${rev}`);
    }
    console.log('');
  }
  if (!stale.length && !unreviewed.length) {
    console.log('✅ all fresh');
    console.log('');
  }
}

process.exit((stale.length || unreviewed.length) ? 1 : 0);
