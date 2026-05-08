#!/usr/bin/env node
/**
 * pnpm list:<members|themes|sessions|papers|concepts> [--json] [--since=<Nd>] [--theme=<slug>] [--role=<role>] [--source=mtime|git] [--status=A|M|R]
 *
 * 让 agent 能 introspect 仓库当前状态。
 *
 * 例：
 *   pnpm list:members --json
 *   pnpm list:sessions --since=7d --json                          # 默认 mtime（注意：init/checkout 会刷 mtime，不可靠）
 *   pnpm list:sessions --since=7d --source=git --status=A --json  # weekly-digest 推荐：用 git 历史过滤"本周新增"
 *   pnpm list:papers --theme=long-context --json
 *
 * --source=git: 用 git log 而不是 filesystem mtime 过滤；输出多带 git_status / git_date 字段
 * --status:    只在 --source=git 下生效。A=新增、M=修改、R=重命名。可组合 AM 等
 */
import { readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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

// 时间过滤（默认按 mtime；--source=git 时按 git 历史）
let since = null;
let sinceDateIso = null; // git --since= 用 ISO 字符串
if (opts.since) {
  const m = String(opts.since).match(/^(\d+)([dwhm])$/);
  if (m) {
    const [, n, unit] = m;
    const ms = { h: 3600e3, d: 86400e3, w: 7 * 86400e3, m: 30 * 86400e3 }[unit];
    since = Date.now() - Number(n) * ms;
    sinceDateIso = new Date(since).toISOString();
  }
}

const useGit = opts.source === 'git';

/**
 * 用 git log 收集 since 之后每个文件的最终 status + 最近一次 commit 时间。
 * 返回 Map<relpath_from_repo_root, { status, date }>。
 *
 * `git log --since=ISO --name-status --diff-filter=AMR --pretty=format:%cI` 输出形如：
 *   2026-05-08T04:26:19+00:00
 *   A    src/content/docs/papers/foo.md
 *   M    src/content/docs/concepts/bar.md
 *
 *   2026-05-07T11:58:17+00:00
 *   A    src/content/docs/papers/baz.md
 *
 * 我们扫描所有 commit，对每个 path 记录"最早出现的 A"或"最近的 M"，
 * 因为：A 一旦被记录就是真新增；M 用最近的更代表当前状态。
 * 简化策略：取**最近一次 commit 的 status**作为该文件在该窗口的状态。
 */
function collectGitFileMeta(sinceIso) {
  const out = execFileSync('git', [
    '-C', ROOT,
    'log',
    `--since=${sinceIso}`,
    '--name-status',
    '--diff-filter=AMR',
    '--pretty=format:__COMMIT__ %cI',
  ], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

  const meta = new Map(); // relpath -> { status, date }
  let curDate = null;
  for (const line of out.split('\n')) {
    if (!line.trim()) continue;
    if (line.startsWith('__COMMIT__ ')) {
      curDate = line.slice('__COMMIT__ '.length).trim();
      continue;
    }
    // 形如：A\tpath  或  M\tpath  或  R100\told\tnew
    const parts = line.split('\t');
    const rawStatus = parts[0];
    const status = rawStatus[0]; // A/M/R
    const path = status === 'R' ? parts[2] : parts[1];
    if (!path) continue;
    // 策略：A 优先（窗口内被新增过的文件永远算 A，即便后续又 M），
    // 否则取最近一次（git log 顶部 = 最新）的 status / date。
    const prev = meta.get(path);
    if (!prev) {
      meta.set(path, { status, date: curDate });
    } else if (status === 'A' && prev.status !== 'A') {
      // 升级为 A，但保留最近 commit 的 date（用户更关心"什么时候动过"）
      meta.set(path, { status: 'A', date: prev.date });
    }
  }
  return meta;
}

let gitMeta = null;
if (useGit && sinceDateIso) {
  try {
    gitMeta = collectGitFileMeta(sinceDateIso);
  } catch (e) {
    console.error(`⚠ --source=git 失败（不在 git repo 或 git 不可用）：${e.message}`);
    process.exit(2);
  }
}

const wantStatuses = opts.status ? new Set(String(opts.status).toUpperCase().split('')) : null;

const items = files
  .map(f => {
    const stat = statSync(f);
    const { frontmatter } = parseFrontmatter(f);
    const relPath = relative(ROOT, f);
    const gm = gitMeta ? gitMeta.get(relPath) : null;
    return {
      slug: basename(f).replace(/\.(md|mdx)$/, ''),
      path: '/' + relative(DOCS, f).replace(/\.(md|mdx)$/, '').replace(/\/index$/, '') + '/',
      file: relPath,
      mtime: stat.mtimeMs,
      mtime_iso: new Date(stat.mtimeMs).toISOString(),
      ...(gm && { git_status: gm.status, git_date: gm.date }),
      ...frontmatter,
    };
  })
  .filter(item => {
    // 时间窗过滤
    if (since) {
      if (useGit) {
        if (!item.git_status) return false; // 窗口内无 git 改动
        if (wantStatuses && !wantStatuses.has(item.git_status)) return false;
      } else {
        if (item.mtime < since) return false;
      }
    } else if (useGit && wantStatuses) {
      // 没有 since 但指定了 status：仍然需要 git meta
      if (!item.git_status || !wantStatuses.has(item.git_status)) return false;
    }
    if (opts.theme && (subcommand === 'papers' || subcommand === 'sessions')) {
      if (!item.themes || !item.themes.includes(opts.theme)) return false;
    }
    if (opts.role && subcommand === 'members') {
      if (item.role !== opts.role) return false;
    }
    // 注意：opts.status 在 --source=git 模式下指 git A/M/R；非 git 模式下保留旧语义（frontmatter status）
    if (opts.status && !useGit && item.status !== opts.status) return false;
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
    if (it.themes) {
      const t = Array.isArray(it.themes) ? it.themes
        : (typeof it.themes === 'object' ? Object.values(it.themes) : [it.themes]);
      if (t.length) extra.push(`themes: ${t.join(',')}`);
    }
    console.log(`  ${it.slug.padEnd(28)} ${it.path.padEnd(40)} ${extra.join(' · ')}`);
  }
}
