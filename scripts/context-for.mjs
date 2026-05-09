#!/usr/bin/env node
/**
 * pnpm context:for <slug> [--depth=N] [--json | --md | --format=session-bg]
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
const isMd = !!flags.md || flags.format === 'md';
const isSessionBg = flags.format === 'session-bg';
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
} else if (isSessionBg) {
  printSessionBackground(result);
} else if (isMd) {
  printMarkdown(result);
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

/**
 * --md: 泛用 markdown 输出。agent 可直接贴到任何 markdown 文档。
 */
function printMarkdown(r) {
  const TYPE_LABEL = { papers: 'Papers', concepts: 'Concepts', themes: 'Themes', members: 'Members', sessions: 'Sessions' };
  const c = r.center;
  console.log(`## ${c.title}`);
  console.log('');
  console.log(`- **type**: ${c.type}`);
  console.log(`- **url**: [${c.url}](${c.url})`);
  if (c.description) console.log(`- **description**: ${c.description}`);
  console.log('');
  for (let d = 1; d <= depth; d++) {
    const layer = r[`depth_${d}`];
    if (!layer) continue;
    console.log(`### ${d} 跳邻居`);
    console.log('');
    for (const [type, items] of Object.entries(layer)) {
      console.log(`**${TYPE_LABEL[type] || type}** (${items.length})`);
      console.log('');
      for (const it of items) {
        const arrow = it.direction === 'out' ? '→' : '←';
        console.log(`- ${arrow} [${it.title}](${it.url}) — \`${it.rel}\``);
      }
      console.log('');
    }
  }
}

/**
 * --format=session-bg: 专门给 weekly-session 的 "0. 关联背景" 段用的格式。
 * 产出 agent 可直接贴进 session markdown 的 4 段（概念前置 / 前情 / 主线 / 其他）。
 * 只用 depth_1；depth_2 默认不进 session-bg（信噪比低，见 skill #35）。
 */
function printSessionBackground(r) {
  const c = r.center;
  const layer = r.depth_1 || {};
  console.log(`## 0. 🔗 关联背景`);
  console.log('');
  // 把内部 singular slug (paper/xx) 还原成用户习惯的复数写法 (papers/xx)
  const displaySlug = String(c.slug).replace(/^(paper|concept|theme|member|session)\//, (_, t) => `${t}s/`);
  console.log(`:::caution[🤖 Agent 起草 · 由 \`pnpm context:for ${displaySlug} --format=session-bg\` 自动产出]`);
  console.log(`下面的链接 100% 来自构建期知识图；文字解读由 lead 校对后删 caution。`);
  console.log(':::');
  console.log('');

  const concepts = layer.concepts || [];
  if (concepts.length) {
    console.log(`**概念前置**（建议会前过一遍词典页）：`);
    console.log('');
    for (const it of concepts) {
      console.log(`- [${it.title}](${it.url}) — 📝 lead 补一行定位`);
    }
    console.log('');
  }

  const sessions = (layer.sessions || []).filter(s => s.direction === 'in' || s.rel === 'discusses_paper');
  if (sessions.length) {
    console.log(`**前情回顾**：`);
    console.log('');
    for (const it of sessions) {
      console.log(`- [${it.title}](${it.url}) — 📝 lead 补讨论要点`);
    }
    console.log('');
  }

  const themes = layer.themes || [];
  if (themes.length) {
    console.log(`**主线坐标**：`);
    console.log('');
    for (const it of themes) {
      console.log(`- [${it.title}](${it.url}) — 本次仍在此主线下`);
    }
    console.log('');
  }

  const papers = (layer.papers || []).filter(p => p.rel === 'related_paper');
  if (papers.length) {
    console.log(`**同方向对照阅读**：`);
    console.log('');
    for (const it of papers) {
      console.log(`- [${it.title}](${it.url})`);
    }
    console.log('');
  }

  if (!concepts.length && !sessions.length && !themes.length && !papers.length) {
    console.log(`> 📝 没有找到知识图邻居。可能原因：(a) \`${c.slug}\` frontmatter 的 \`concept_refs\` / \`themes\` 字段为空；(b) 没跑 \`pnpm build:index\`。`);
  }
}
