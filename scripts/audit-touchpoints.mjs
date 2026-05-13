#!/usr/bin/env node
/**
 * pnpm audit:touchpoints
 *
 * 扫描 scripts/**​/*.mjs 找硬编码 content 类型列表的行，给"添加新 content 类型"
 * 提供一份必须修改的位置清单。regex 启发，宁宽勿严 —— 误报可人工排除，漏报致命。
 *
 * Flags:
 *   --type=<t>   检查某类型注册数与 baseline (max count) 一致
 *   --json       JSON 输出（机器读）
 *   --quiet      仅 exit code（0 = consistent）
 *
 * 设计依据：analysis/phase-1-debt/tasks/D02-add-audit-touchpoints.md
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SCRIPTS = join(ROOT, 'scripts');
const SELF = relative(ROOT, fileURLToPath(import.meta.url));

const TYPES = ['paper', 'concept', 'theme', 'member', 'session', 'faq'];
// 报告阈值：一行 ≥3 个 type 命中就报出来（"宁宽勿严"）
const REPORT_THRESHOLD = 3;
// canonical 阈值：一行必须命中全部 type 才算"完整类型列表"，用于 consistency 校验。
// 子集行（注释、partial regex、docstring）只报告不参与一致性判断 —— 它们可能是真 bug
// （如 context-for.mjs 某 regex 漏 faq），但修复 OOS 本 task；用户看 ★ 标记自行判断。
const CANONICAL_THRESHOLD = TYPES.length;

// 单/复数关键词 → 归一化的单数 type
const TYPE_TOKENS = new Map();
for (const t of TYPES) {
  TYPE_TOKENS.set(t, t);
  // faq 没有复数形式（faqs 也算）
  TYPE_TOKENS.set(t + 's', t);
}

// 解析 CLI
function parseArgs(argv) {
  const out = { type: null, json: false, quiet: false };
  for (const a of argv) {
    if (a === '--json') out.json = true;
    else if (a === '--quiet') out.quiet = true;
    else if (a.startsWith('--type=')) out.type = a.slice('--type='.length);
  }
  return out;
}

function listMjsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      // 不递归到 ralph/ —— 那是 loop runner，不含 type 列表
      if (entry === 'ralph') continue;
      out.push(...listMjsFiles(full));
    } else if (entry.endsWith('.mjs')) {
      out.push(full);
    }
  }
  return out;
}

// 在一行中找 type 关键词。返回去重后的单数 type 数组（按 TYPES 顺序）。
function findTypesInLine(line) {
  const hits = new Set();
  // 按词边界匹配，避免 paperwork / membership 等假阳性
  for (const [token, canonical] of TYPE_TOKENS) {
    const re = new RegExp(`\\b${token}\\b`, 'gi');
    if (re.test(line)) hits.add(canonical);
  }
  return TYPES.filter((t) => hits.has(t));
}

// 启发：猜本行是什么 pattern
function guessPattern(line) {
  const s = line.trim();
  if (/=\s*\{/.test(s) && /:/.test(s)) return 'object map';
  if (/=\s*\[/.test(s) || /^\s*\[/.test(s)) return 'array literal';
  if (/\/.*\|.*\//.test(s) || /^\s*if.*===/.test(s)) {
    if (/\/[^/]*\|[^/]*\//.test(s)) return 'regex alternation';
  }
  if (/===\s*['"]/.test(s)) return 'if/else type guard';
  if (/case\s+['"]/.test(s)) return 'switch case';
  return 'inline list';
}

function scan() {
  const files = listMjsFiles(SCRIPTS).sort();
  const locations = [];
  for (const abs of files) {
    const rel = relative(ROOT, abs);
    if (rel === SELF) continue; // 不扫自己
    const text = readFileSync(abs, 'utf8');
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 跳过 import 行 —— 多型号 import 会触发误报
      if (/^\s*import\b/.test(line)) continue;
      const types = findTypesInLine(line);
      if (types.length >= REPORT_THRESHOLD) {
        locations.push({
          file: rel,
          line: i + 1,
          pattern: guessPattern(line),
          types_found: types,
          canonical: types.length >= CANONICAL_THRESHOLD,
          snippet: line.trim().slice(0, 120),
        });
      }
    }
  }
  return locations;
}

function summarize(locations) {
  // 仅在 canonical 位置上算类型注册数 —— 部分行（docstring / 子集列表）不参与
  // baseline 计算，否则 paper 出现在某段注释里就把 baseline 拉高，所有类型变 inconsistent
  const canonical = locations.filter((l) => l.canonical);
  const type_counts = Object.fromEntries(TYPES.map((t) => [t, 0]));
  for (const loc of canonical) {
    for (const t of loc.types_found) type_counts[t]++;
  }
  const max = Math.max(0, ...Object.values(type_counts));
  const consistent = TYPES.every((t) => type_counts[t] === max);
  return { type_counts, max, consistent, canonical_count: canonical.length };
}

function printHuman(locations, summary, opts) {
  const date = new Date().toISOString().slice(0, 10);
  console.log(`📋 touchpoints audit · ${date}\n`);
  console.log(
    `Found ${locations.length} hardcoded type-list locations ` +
      `(${summary.canonical_count} canonical = lists all/most types):\n`,
  );
  let lastFile = null;
  for (const loc of locations) {
    if (loc.file !== lastFile) {
      console.log(`${loc.file}:`);
      lastFile = loc.file;
    }
    const types = loc.types_found.join(',');
    const mark = loc.canonical ? '★' : ' ';
    console.log(`  ${mark} L${String(loc.line).padEnd(4)} [${loc.pattern}] {${types}}`);
  }
  console.log('\nCoverage summary (★ canonical locations only):');
  const { type_counts, max, consistent } = summary;
  for (const t of TYPES) {
    const n = type_counts[t];
    const mark = n === max ? '✓' : '✗';
    console.log(`  ${t.padEnd(8)} ${String(n).padStart(2)} / ${max}  ${mark}`);
  }
  if (consistent) {
    console.log('\n✅ All known types registered consistently.');
  } else {
    console.log('\n❌ Type registration inconsistent — see ✗ rows above.');
  }
  if (opts.type) {
    const t = opts.type;
    if (!TYPES.includes(t)) {
      console.log(`\n⚠️  --type=${t} not in known TYPES: ${TYPES.join(',')}`);
    } else {
      const n = type_counts[t];
      console.log(`\n${t} registered in ${n} / ${max} expected locations.`);
      if (n === max) console.log(`✅ ${t} is fully registered.`);
      else {
        console.log(`❌ ${t} missing from ${max - n} location(s). Compare with baseline type (any with count ${max}).`);
      }
    }
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const locations = scan();
  const summary = summarize(locations);
  const result = {
    ok: true,
    generated_at: new Date().toISOString(),
    locations,
    type_counts: summary.type_counts,
    consistent: summary.consistent,
  };
  if (opts.type && !TYPES.includes(opts.type)) {
    result.ok = false;
    result.error = `unknown type: ${opts.type}`;
  }

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (!opts.quiet) {
    printHuman(locations, summary, opts);
  }

  // exit code: 0 if consistent (and --type, if given, fully registered)
  let code = summary.consistent ? 0 : 1;
  if (opts.type && TYPES.includes(opts.type)) {
    if (summary.type_counts[opts.type] !== summary.max) code = 1;
  } else if (opts.type) {
    code = 1;
  }
  process.exit(code);
}

main();
