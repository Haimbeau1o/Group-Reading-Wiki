#!/usr/bin/env node
/**
 * pnpm verify [--json]
 *
 * agent 修改完一批文件后跑一次。
 *
 * 检查项：
 *   1. frontmatter schema（按文件类型自动选 schema）
 *   2. 文件名约定（小写、连字符、no 中文 / 空格）
 *   3. 跨页链接：所有 [text](/path/) 是否对应文件存在
 *   4. （可选）build 通过
 *
 * 默认仅快速检查 (1-3)。加 --build 跑完整 build。
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseFrontmatter, validateFrontmatter, detectSchema, SCHEMAS } from './lib/frontmatter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS = join(ROOT, 'src/content/docs');

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const RUN_BUILD = args.includes('--build');

const errors = [];
const warnings = [];

const log = (level, file, msg) => {
  const e = { level, file, msg };
  if (level === 'error') errors.push(e);
  else warnings.push(e);
};

// ── 1. 遍历 + frontmatter check ────────────────────────────────
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(p));
    else if (/\.(md|mdx)$/.test(name.name)) out.push(p);
  }
  return out;
}

const files = walk(DOCS);

const allPaths = new Set(); // 用于第 3 步链接校验
for (const f of files) {
  const rel = relative(ROOT, f);
  // 文件名约定
  const base = f.split('/').pop();
  if (/[\u4e00-\u9fa5\s]/.test(base) || /[A-Z_]/.test(base.replace(/\.mdx?$/, ''))) {
    log('warn', rel, `文件名不规范（应小写+连字符）: ${base}`);
  }
  // 解析 frontmatter
  let fm;
  try {
    fm = parseFrontmatter(f).frontmatter;
  } catch (e) {
    log('error', rel, `frontmatter 解析失败: ${e.message}`);
    continue;
  }
  // 选 schema 校验
  const schemaName = detectSchema(rel);
  const schemaErrors = validateFrontmatter(fm, SCHEMAS[schemaName]);
  for (const m of schemaErrors) log('error', rel, `[schema:${schemaName}] ${m}`);

  // 收集"页面 URL" 给链接校验
  const docsRel = relative(DOCS, f).replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');
  allPaths.add('/' + docsRel + (docsRel ? '/' : ''));
}

// ── 2. 跨页链接 ────────────────────────────────────────────
import { readFileSync } from 'node:fs';
const LINK_RE = /\]\((\/[^)\s#]+?)\/?(?:#[^)]*)?\)/g;

const ignoredPrefixes = ['/docs-assets/', '/_astro/', '/pagefind/', '/static/'];

for (const f of files) {
  const rel = relative(ROOT, f);
  const content = readFileSync(f, 'utf-8');
  let m;
  const seen = new Set();
  while ((m = LINK_RE.exec(content)) !== null) {
    let target = m[1];
    if (ignoredPrefixes.some(p => target.startsWith(p))) continue;
    if (target.startsWith('/en/')) continue; // i18n fallback
    // 标准化为带斜杠结尾
    const norm = target.endsWith('/') ? target : target + '/';
    if (seen.has(norm)) continue;
    seen.add(norm);
    if (!allPaths.has(norm)) {
      log('warn', rel, `link 可能失效: ${target}`);
    }
  }
}

// ── 3. build (可选) ────────────────────────────────────────
if (RUN_BUILD) {
  console.error('Running pnpm build (会较慢)...');
  const res = spawnSync('pnpm', ['build'], { cwd: ROOT, stdio: 'pipe', encoding: 'utf-8' });
  if (res.status !== 0) {
    log('error', '<build>', `pnpm build 失败 (exit ${res.status})`);
    if (!JSON_OUT) console.error(res.stderr || res.stdout);
  }
}

// ── 4. 输出 ────────────────────────────────────────────────
const summary = {
  total_files: files.length,
  errors: errors.length,
  warnings: warnings.length,
  details: [...errors, ...warnings],
};

if (JSON_OUT) {
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
} else {
  console.log(`\n📋 verify · ${files.length} 个文件\n`);
  if (errors.length) {
    console.log(`❌ ${errors.length} 个 error:`);
    for (const e of errors) console.log(`  ${e.file}: ${e.msg}`);
  }
  if (warnings.length) {
    console.log(`⚠️  ${warnings.length} 个 warning:`);
    for (const w of warnings) console.log(`  ${w.file}: ${w.msg}`);
  }
  if (!errors.length && !warnings.length) console.log('✅ 全部通过');
  console.log('');
}

process.exit(errors.length ? 1 : 0);
