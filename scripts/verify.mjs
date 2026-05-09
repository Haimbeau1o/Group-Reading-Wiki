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
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
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

// 收集每类的 slug 集合，给 slug_refs 死链检查用
const slugsByType = { paper: new Set(), concept: new Set(), theme: new Set(), member: new Set(), session: new Set() };
for (const f of files) {
  const rel = relative(ROOT, f);
  const schema = detectSchema(rel);
  if (!slugsByType[schema]) continue;
  const base = f.split('/').pop().replace(/\.(md|mdx)$/, '');
  if (base === 'index') continue;
  slugsByType[schema].add(base);
}

// related_concepts 邻接表，用于 cycle 检测
const conceptParentEdges = []; // [{from, to}] from parent_concept (单向，可成 cycle)

const allPaths = new Set(); // 用于跨页链接校验
for (const f of files) {
  const rel = relative(ROOT, f);
  // 文件名约定
  const base = f.split('/').pop();
  if (/[\u4e00-\u9fa5\s]/.test(base) || /[A-Z_]/.test(base.replace(/\.mdx?$/, ''))) {
    log('warn', rel, `文件名不规范（应小写+连字符）: ${base}`);
  }
  // 解析 frontmatter
  let fm, raw;
  try {
    const parsed = parseFrontmatter(f);
    fm = parsed.frontmatter;
  } catch (e) {
    log('error', rel, `frontmatter 解析失败: ${e.message}`);
    continue;
  }
  // YAML 健康检查：title / description 含 ':' 但没引号会让 Astro YAML parser 失败
  raw = readFileSync(f, 'utf-8');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      // top-level scalar，含一个以上 ':' 但没用引号包住值
      const m = line.match(/^(title|description|label):\s*(.+)$/);
      if (m) {
        const v = m[2].trim();
        if (!v.startsWith('"') && !v.startsWith("'") && (v.match(/:/g) || []).length >= 1 && !/^[\d\w-]+$/.test(v.split(':')[0])) {
          // value 含 ':' 且未加引号 → Astro YAML 大概率会 fail
          log('error', rel, `frontmatter ${m[1]} 含 ':' 但未加引号 → 必须改成 ${m[1]}: "${v}"`);
        }
      }
    }
  }
  // 选 schema 校验
  const schemaName = detectSchema(rel);
  const schema = SCHEMAS[schemaName];
  const schemaErrors = validateFrontmatter(fm, schema);
  for (const m of schemaErrors) log('error', rel, `[schema:${schemaName}] ${m}`);

  // slug_refs 死链检查（设计契约 §4.3）
  if (schema?.slug_refs) {
    for (const ref of schema.slug_refs) {
      const value = fm[ref.field];
      if (value === undefined || value === null || value === '') continue;
      const targetSet = slugsByType[ref.target];
      if (!targetSet) continue;
      const values = ref.kind === 'array'
        ? (Array.isArray(value) ? value : [value])
        : [value];
      for (const v of values) {
        const slug = String(v).trim().replace(/^\/+|\/+$/g, '')
          .replace(/^(papers|concepts|themes|members|sessions)\//, '');
        if (!slug) continue;
        if (!targetSet.has(slug)) {
          log('error', rel, `[graph] ${ref.field} → ${ref.target}/${slug} 不存在`);
        }
      }
    }
  }

  // 收集 concept.parent_concept / concept.related_concepts 给 cycle 检测
  if (schemaName === 'concept') {
    const myBase = f.split('/').pop().replace(/\.(md|mdx)$/, '');
    if (fm.parent_concept) {
      const parentSlug = String(fm.parent_concept).trim().replace(/^concepts?\//, '');
      conceptParentEdges.push({ from: myBase, to: parentSlug });
    }
  }

  // paper.themes 为空 → warn（鼓励至少绑一条主线）
  if (schemaName === 'paper' && (!fm.themes || (Array.isArray(fm.themes) && fm.themes.length === 0))) {
    log('warn', rel, `[graph] paper 没有绑定 theme（建议至少 1 条）`);
  }

  // 收集"页面 URL" 给链接校验
  const docsRel = relative(DOCS, f).replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');
  allPaths.add('/' + docsRel + (docsRel ? '/' : ''));
}

// ── 1.5 concept parent_concept cycle 检测 ────────────────────
function detectCycle(edges) {
  // 构邻接表
  const adj = {};
  for (const e of edges) {
    if (!adj[e.from]) adj[e.from] = [];
    adj[e.from].push(e.to);
  }
  const visited = new Set();
  const onStack = new Set();
  const cycles = [];

  function dfs(node, path) {
    if (onStack.has(node)) {
      const idx = path.indexOf(node);
      cycles.push(path.slice(idx).concat(node));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    onStack.add(node);
    for (const next of adj[node] || []) dfs(next, [...path, node]);
    onStack.delete(node);
  }

  for (const start of Object.keys(adj)) dfs(start, []);
  return cycles;
}

const cycles = detectCycle(conceptParentEdges);
for (const c of cycles) {
  log('warn', '<graph>', `[graph] parent_concept 形成 cycle: ${c.join(' → ')}`);
}

// ── 2. 跨页链接 ────────────────────────────────────────────
const LINK_RE = /\]\((\/[^)\s#]+?)\/?(?:#[^)]*)?\)/g;

const ignoredPrefixes = ['/docs-assets/', '/_astro/', '/pagefind/', '/static/', '/.agent/', '/.github/'];

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
