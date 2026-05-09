#!/usr/bin/env node
/**
 * pnpm context:for <slug> [--depth=N] [--json]
 *
 * 给定一个节点 slug，返回它在知识图中的 N 跳邻居。
 * agent 写新内容（paper note / session / theme refresh 等）前调用，拿到结构化上下文。
 *
 * 设计契约：docs/WIKI_GRAPH_DESIGN.md §4.1
 *
 * 用法：
 *   pnpm context:for concepts/grpo --json
 *   pnpm context:for grpo --depth=2          # type 前缀可省，自动推断
 *   pnpm context:for papers/deepseek-r1 --json
 *
 * <slug> 接受形式：
 *   - "concepts/grpo"  / "concept/grpo"      （带 type 前缀，明确）
 *   - "grpo"                                  （裸 slug，自动尝试所有类型，歧义时报错）
 *
 * 退出码：
 *   0  正常
 *   1  slug 找不到 / 歧义
 *   2  index 文件不存在（提示先跑 pnpm build:index）
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INDEX = join(ROOT, 'src/generated/knowledge-graph.json');

const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, ...v] = a.slice(2).split('=');
    return [k, v.length ? v.join('=') : true];
  })
);

const isJson = !!flags.json;
const depth = flags.depth ? Math.max(1, parseInt(flags.depth, 10)) : 1;

if (positional.length === 0) {
  console.error('Usage: pnpm context:for <slug> [--depth=N] [--json]');
  console.error('  e.g. pnpm context:for concepts/grpo --json');
  process.exit(1);
}

if (!existsSync(INDEX)) {
  console.error(`❌ ${INDEX} 不存在。先跑：pnpm build:index`);
  process.exit(2);
}

const graph = JSON.parse(readFileSync(INDEX, 'utf-8'));

// ───── 解析 slug ─────
const rawSlug = positional[0];
const resolvedId = resolveSlug(rawSlug, graph);
if (!resolvedId) {
  console.error(`❌ 找不到节点：${rawSlug}`);
  console.error(`   提示：用 type/slug 形式（如 concepts/grpo），或确认 pnpm build:index 已重跑`);
  process.exit(1);
}

const center = graph.nodes[resolvedId];
if (!center) {
  console.error(`❌ resolved 但 nodes[${resolvedId}] 不存在`);
  process.exit(1);
}

// ───── 收集 N 跳邻居 ─────
const result = {
  center: {
    slug: resolvedId,
    type: center.type,
    title: center.title,
    url: center.url,
    description: center.description || '',
  },
};

const visited = new Set([resolvedId]);
let frontier = [resolvedId];

for (let d = 1; d <= depth; d++) {
  const layer = collectNeighbors(frontier, graph, visited);
  if (layer.length === 0) break;
  result[`depth_${d}`] = groupByType(layer, graph);
  frontier = layer.map(n => n.id);
  layer.forEach(n => visited.add(n.id));
}

// ───── 输出 ─────
if (isJson) {
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
} else {
  printHuman(result);
}

// ───────────────── helpers ─────────────────

function resolveSlug(raw, g) {
  let s = String(raw).trim().replace(/^\/+|\/+$/g, '');

  // 复数 → 单数前缀
  const prefixMap = {
    papers: 'paper', concepts: 'concept', themes: 'theme',
    members: 'member', sessions: 'session',
  };
  for (const [plural, singular] of Object.entries(prefixMap)) {
    if (s.startsWith(`${plural}/`)) {
      s = `${singular}/${s.slice(plural.length + 1)}`;
      break;
    }
  }

  // 已带 type 前缀
  if (/^(paper|concept|theme|member|session)\//.test(s)) {
    return g.nodes[s] ? s : null;
  }

  // 裸 slug：尝试所有类型
  const candidates = [];
  for (const t of ['paper', 'concept', 'theme', 'member', 'session']) {
    const id = `${t}/${s}`;
    if (g.nodes[id]) candidates.push(id);
  }
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    console.error(`❌ 歧义：'${raw}' 在多个类型下都存在：`);
    for (const c of candidates) console.error(`   - ${c}`);
    console.error(`   请用完整 type/slug 形式`);
    return null;
  }
  return null;
}

/**
 * 给定一组节点 id，返回它们的所有外向 / 反向邻居（去掉 visited 中的）。
 */
function collectNeighbors(ids, g, visited) {
  const out = [];
  const seen = new Set();
  for (const id of ids) {
    // 正向边：id → other
    for (const e of g.edges) {
      if (e.from !== id) continue;
      if (visited.has(e.to) || seen.has(e.to)) continue;
      if (!g.nodes[e.to]) continue;
      seen.add(e.to);
      out.push({ id: e.to, rel: e.rel, direction: 'out' });
    }
    // 反向：从 backlinks 拿
    const bl = g.backlinks[id] || [];
    for (const b of bl) {
      if (visited.has(b.from) || seen.has(b.from)) continue;
      if (!g.nodes[b.from]) continue;
      seen.add(b.from);
      out.push({ id: b.from, rel: b.rel, direction: 'in' });
    }
  }
  return out;
}

function groupByType(layer, g) {
  const buckets = {
    papers: [], concepts: [], themes: [], members: [], sessions: [],
  };
  const map = { paper: 'papers', concept: 'concepts', theme: 'themes', member: 'members', session: 'sessions' };
  for (const item of layer) {
    const node = g.nodes[item.id];
    if (!node) continue;
    const bucket = buckets[map[node.type]];
    if (!bucket) continue;
    bucket.push({
      slug: item.id,
      title: node.title,
      url: node.url,
      rel: item.rel,
      direction: item.direction,
    });
  }
  // 删空桶
  for (const k of Object.keys(buckets)) {
    if (buckets[k].length === 0) delete buckets[k];
  }
  return buckets;
}

function printHuman(r) {
  const c = r.center;
  console.log(`\n📍 ${c.type}: ${c.title}`);
  console.log(`   ${c.url}`);
  if (c.description) console.log(`   ${c.description}`);

  for (let d = 1; d <= depth; d++) {
    const layer = r[`depth_${d}`];
    if (!layer) continue;
    console.log(`\n── ${d} 跳邻居 ──`);
    for (const [type, items] of Object.entries(layer)) {
      console.log(`\n  ${type} (${items.length})`);
      for (const it of items) {
        const arrow = it.direction === 'out' ? '→' : '←';
        console.log(`    ${arrow} ${it.title}`);
        console.log(`       ${it.url}  [${it.rel}]`);
      }
    }
  }
  console.log('');
}
