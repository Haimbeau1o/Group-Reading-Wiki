#!/usr/bin/env node
/**
 * Smoke test: 模拟"冷 fork 用户"的完整启动路径，验证模板真的可用。
 *
 * 步骤（在 /tmp 里的干净副本执行，不影响 demo）：
 *   1. 拷贝当前 repo（不含 node_modules / dist / .git）
 *   2. 符号链 node_modules（避免重装依赖，约 60s → 1s）
 *   3. pnpm init:group "Smoke Test Lab"     ← 模拟 fork 用户第一步
 *   4. pnpm new:member alice --role=博士生   ← 创建第一个成员
 *   5. pnpm new:paper smoke-test-paper ...   ← 创建第一篇 paper note
 *   6. pnpm new:session 2026-W20 ...         ← 创建第一个 session
 *   7. pnpm verify                           ← 必须 0 error + 0 warning
 *   8. (可选) pnpm build                      ← --with-build 开启
 *
 * 用法：
 *   node scripts/smoke-test-fork.mjs            # 默认跑完整流程（不含 build）
 *   node scripts/smoke-test-fork.mjs --with-build  # 额外跑 astro build
 *   node scripts/smoke-test-fork.mjs --keep     # 成功后也保留 tmp 目录
 *   node scripts/smoke-test-fork.mjs --verbose  # 打印每步详细输出
 *
 * 退出码：
 *   0 = 全部通过（fork 用户路径可用）
 *   1 = 某一步失败（输出会保留 tmp 路径供调试）
 *
 * 这是"fork 用户能不能用"的唯一真相。CI 会跑这个 gate。
 */
import { execSync, spawnSync } from 'node:child_process';
import { cpSync, rmSync, mkdirSync, symlinkSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
const WITH_BUILD = args.includes('--with-build');
const KEEP_ON_SUCCESS = args.includes('--keep');
const VERBOSE = args.includes('--verbose');

const timestamp = Date.now();
const TMP_ROOT = join(tmpdir(), `gwiki-smoke-${timestamp}`);

// ─────────────────────────────────────────────────────────────
// 工具：跑命令、打印进度
// ─────────────────────────────────────────────────────────────

let stepNumber = 0;
const step = (name) => {
  stepNumber++;
  console.log(`\n─── Step ${stepNumber}: ${name} ───`);
};

function run(cmd, opts = {}) {
  const cwd = opts.cwd || TMP_ROOT;
  if (VERBOSE) console.log(`  $ ${cmd}  (in ${cwd})`);
  try {
    const out = execSync(cmd, {
      cwd,
      encoding: 'utf-8',
      stdio: VERBOSE ? 'inherit' : 'pipe',
      env: { ...process.env, FORCE_COLOR: '0' },
    });
    return { ok: true, out: out || '' };
  } catch (e) {
    return {
      ok: false,
      out: (e.stdout || '') + (e.stderr || ''),
      error: e.message,
    };
  }
}

function fail(msg, detail = '') {
  console.error(`\n❌ FAIL: ${msg}`);
  if (detail) console.error(detail.slice(0, 3000));
  console.error(`\n📁 Artifacts preserved at: ${TMP_ROOT}`);
  console.error(`   cd ${TMP_ROOT} && pnpm verify  # 手动调试`);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// Step 1: 建 tmp 目录 + 拷贝 repo
// ─────────────────────────────────────────────────────────────

step('Setup — 拷贝 repo 到 tmp，模拟 fork 后的干净副本');

mkdirSync(TMP_ROOT, { recursive: true });

const EXCLUDE = new Set([
  'node_modules', 'dist', '.astro', '.git', '.DS_Store',
  '.cache', '.next', '.output',
]);

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE.has(name.name)) continue;
    const from = join(src, name.name);
    const to = join(dest, name.name);
    if (name.isDirectory()) copyDir(from, to);
    else cpSync(from, to);
  }
}

copyDir(SRC_ROOT, TMP_ROOT);
console.log(`  ✓ Copied repo → ${TMP_ROOT}`);

// Step 1b: 依赖安装
// - 默认（快速模式）：符号链 node_modules（~1s），适合 verify-only 的本地迭代
// - --with-build：符号链会让 Astro/Vite 路径解析混乱，必须真实 install
const srcModules = join(SRC_ROOT, 'node_modules');
const destModules = join(TMP_ROOT, 'node_modules');
if (WITH_BUILD || !existsSync(srcModules)) {
  console.log(`  → Running pnpm install --prefer-offline (needed for real build; ~15s with cache)`);
  const res = run('pnpm install --prefer-offline');
  if (!res.ok) fail('pnpm install failed in smoke test', res.out);
  console.log(`  ✓ Dependencies installed`);
} else {
  symlinkSync(srcModules, destModules, 'dir');
  console.log(`  ✓ Symlinked node_modules (verify-only fast mode; use --with-build for real install)`);
}

// ─────────────────────────────────────────────────────────────
// Step 2: init:group
// ─────────────────────────────────────────────────────────────

step('init:group — 模拟"我要把这个模板转成我自己组的 wiki"');

const GROUP_NAME = `Smoke Test Lab ${timestamp}`;
const res2 = run(`node scripts/init-group.mjs "${GROUP_NAME}"`);
if (!res2.ok) fail('init:group failed', res2.out);
console.log(`  ✓ init:group "${GROUP_NAME}" succeeded`);

// 验证：init:group 是否自删除了
if (existsSync(join(TMP_ROOT, 'scripts/init-group.mjs'))) {
  console.log(`  ⚠ scripts/init-group.mjs 未自删除（预期行为：自删除）`);
}

// ─────────────────────────────────────────────────────────────
// Step 3-5: 模拟首周工作
// ─────────────────────────────────────────────────────────────

step('new:member — 创建第一个成员');
const res3 = run('node scripts/new-member.mjs alice --role=博士生 --year=3');
if (!res3.ok) fail('new:member failed', res3.out);
console.log('  ✓ members/alice.md created');

step('new:paper — 创建第一篇 paper note');
const res4 = run(
  'node scripts/new-paper.mjs smoke-test-paper --title="Smoke Test Paper" --theme=example-theme'
);
if (!res4.ok) fail('new:paper failed', res4.out);
console.log('  ✓ papers/smoke-test-paper.md created');

step('new:session — 创建第一个 session');
const res5 = run(
  'node scripts/new-session.mjs 2026-W20 smoke-test-paper --lead=alice --paper=papers/smoke-test-paper'
);
if (!res5.ok) fail('new:session failed', res5.out);
console.log('  ✓ sessions/2026-w20-smoke-test-paper.md created');

// ─────────────────────────────────────────────────────────────
// Step 6: verify — 这是核心 gate
// ─────────────────────────────────────────────────────────────

step('verify — 核心 gate：必须 0 error + 0 warning');

const res6 = run('node scripts/verify.mjs');
if (!res6.ok) {
  fail('verify reports errors', res6.out);
}

// 即使 verify 退出码 0，也要检查 warning（我们要求 0 warning）
const warningMatch = res6.out.match(/(\d+)\s*个\s*warning/);
const warningCount = warningMatch ? parseInt(warningMatch[1]) : 0;
if (warningCount > 0) {
  console.error(`\n⚠️  verify 通过但有 ${warningCount} 个 warning：`);
  const warningLines = res6.out.split('\n').filter(l => l.includes('失效') || l.includes('可能'));
  warningLines.slice(0, 40).forEach(l => console.error(`    ${l.trim()}`));
  if (warningLines.length > 40) console.error(`    ... 还有 ${warningLines.length - 40} 个`);
  fail(
    `Fork 用户的冷启动路径有 ${warningCount} 个 broken reference。`,
    '这意味着 init:group 后留下了 dangling link — 模板对 fork 用户不完整可用。'
  );
}
console.log(`  ✓ verify 通过，0 error 0 warning`);

// ─────────────────────────────────────────────────────────────
// Step 7 (可选): build
// ─────────────────────────────────────────────────────────────

if (WITH_BUILD) {
  step('build — 额外验证：astro build 成功');
  const res7 = run('node_modules/.bin/astro build', { cwd: TMP_ROOT });
  if (!res7.ok) fail('astro build failed', res7.out);

  const pageMatch = res7.out.match(/(\d+)\s+page\(s\) built/);
  const pages = pageMatch ? pageMatch[1] : '?';
  console.log(`  ✓ Built ${pages} pages`);
}

// ─────────────────────────────────────────────────────────────
// Cleanup + 报告
// ─────────────────────────────────────────────────────────────

if (!KEEP_ON_SUCCESS) {
  rmSync(TMP_ROOT, { recursive: true, force: true });
}

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  Smoke test PASSED

   Fork 用户的冷启动路径端到端可用：
     git clone → pnpm install → pnpm init:group →
     pnpm new:member → pnpm new:paper → pnpm new:session →
     pnpm verify (0 warnings) ${WITH_BUILD ? '→ pnpm build' : ''}

   这是"模板可用性"的唯一真相。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
