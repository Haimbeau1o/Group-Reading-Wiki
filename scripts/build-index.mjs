#!/usr/bin/env node
/**
 * pnpm build:index
 *
 * 扫所有 markdown，按 frontmatter 关系字段（schemas[].slug_refs）构建知识图。
 * 输出：.astro/knowledge-graph.json
 *
 * 设计契约：docs/WIKI_GRAPH_DESIGN.md
 *
 * 输出结构：
 *   { version, generated_at, stats,
 *     nodes:   { "<type>/<slug>": { type, title, slug, url, ...frontmatter projections } },
 *     edges:   [ { from, to, rel } ],
 *     backlinks: { "<type>/<slug>": [ { from, rel } ] },
 *     by_theme:   { "<theme-slug>": { papers, sessions, concepts, owner, co_owners } },
 *     by_member:  { "<member-slug>": { led_sessions, participated_sessions, theme_refs, owns_themes, co_owns_themes } },
 *     by_concept: { "<concept-slug>": { papers, sessions, related_concepts, parent_concept, child_concepts } },
 *     by_tag:     { "<tag>": [ "<type>/<slug>" ] }
 *   }
 */
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter, detectSchema, SCHEMAS } from './lib/frontmatter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS = join(ROOT, 'src/content/docs');
// 写到 src/generated/ 而非 .astro/ —— astro build 会清空 .astro/ 导致页面渲染期读不到
const OUT_DIR = join(ROOT, 'src/generated');
const OUT_FILE = join(OUT_DIR, 'knowledge-graph.json');

// schema → URL prefix
const URL_PREFIX = {
  paper: '/papers/',
  concept: '/concepts/',
  theme: '/themes/',
  member: '/members/',
  session: '/sessions/',
};

/**
 * 收集所有节点
 * @returns Map<"type/slug", node>
 */
function collectNodes() {
  const nodes = new Map();
  const TYPES = ['papers', 'concepts', 'themes', 'members', 'sessions'];

  for (const type of TYPES) {
    const dir = join(DOCS, type);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      // 跳过 index 和子目录（sessions/digest/ 等不进图）
      if (entry.startsWith('index.')) continue;
      const fullpath = join(dir, entry);
      if (!statSync(fullpath).isFile()) continue;
      if (!entry.endsWith('.md') && !entry.endsWith('.mdx')) continue;

      const relpath = relative(ROOT, fullpath);
      const schema = detectSchema(relpath);
      if (schema === 'generic') continue;

      const slug = entry.replace(/\.(md|mdx)$/, '');
      const id = `${schema}/${slug}`;
      const { frontmatter: fm } = parseFrontmatter(fullpath);

      const node = {
        type: schema,
        slug: id,
        bareSlug: slug,
        title: fm.title || slug,
        description: fm.description || '',
        url: `${URL_PREFIX[schema]}${slug}/`,
        tags: Array.isArray(fm.tags) ? fm.tags : [],
      };

      // 按 schema 投影需要的字段
      if (schema === 'paper') {
        node.themes = arrayOf(fm.themes);
        node.concept_refs = arrayOf(fm.concept_refs);
        node.related_papers = arrayOf(fm.related_papers);
        node.exemplar = fm.exemplar === true;
        node.status = fm.status || '';
      } else if (schema === 'concept') {
        node.aliases = arrayOf(fm.aliases);
        node.related_concepts = arrayOf(fm.related_concepts);
        node.parent_concept = fm.parent_concept || null;
      } else if (schema === 'theme') {
        node.owner = fm.owner || null;
        node.co_owners = arrayOf(fm.co_owners);
      } else if (schema === 'member') {
        node.role = fm.role || '';
        node.cluster = fm.cluster || '';
        node.year = fm.year ?? null;
        node.status = fm.status || '';
        node.theme_refs = arrayOf(fm.theme_refs);
        node['research-interests'] = arrayOf(fm['research-interests']);
      } else if (schema === 'session') {
        node.session_week = fm.session_week || '';
        node.session_date = fm.session_date || '';
        node.lead = fm.lead || null;
        node.participants = arrayOf(fm.participants);
        node.paper_refs = arrayOf(fm.paper_refs);
        node.themes = arrayOf(fm.themes);
        node.concept_refs = arrayOf(fm.concept_refs);
        node.status = fm.status || '';
      }

      nodes.set(id, node);
    }
  }
  return nodes;
}

function arrayOf(v) {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null || v === '') return [];
  return [v];
}

/**
 * frontmatter 里 paper_refs 等字段的值有时是 "/papers/foo/" 形式（旧 demo 用过完整 path），
 * 也可能是 "foo" slug。统一规范化成 "<type>/<slug>"。
 */
function normalizeRef(rawValue, targetType) {
  if (!rawValue) return null;
  let s = String(rawValue).trim();
  // 去掉前后斜杠
  s = s.replace(/^\/+|\/+$/g, '');
  // 形如 "papers/deepseek-r1" → "paper/deepseek-r1"
  // type 列表前缀去单数化
  const prefixMap = {
    papers: 'paper',
    concepts: 'concept',
    themes: 'theme',
    members: 'member',
    sessions: 'session',
  };
  for (const [plural, singular] of Object.entries(prefixMap)) {
    if (s.startsWith(`${plural}/`)) {
      return `${singular}/${s.slice(plural.length + 1)}`;
    }
  }
  // 纯 slug：用目标类型前缀
  return `${targetType}/${s}`;
}

/**
 * 从 nodes 推导边
 * @returns Array<{from, to, rel}>
 */
function buildEdges(nodes) {
  const edges = [];
  const push = (from, to, rel) => {
    if (!from || !to || !nodes.has(to)) return; // 引用不存在的节点不加边
    edges.push({ from, to, rel });
  };

  for (const [id, node] of nodes) {
    const schema = SCHEMAS[node.type];
    if (!schema?.slug_refs) continue;

    for (const ref of schema.slug_refs) {
      const value = node[ref.field] ?? node[ref.field.replace(/-/g, '_')];
      if (value === undefined || value === null) continue;

      const rel = relName(node.type, ref);
      if (ref.kind === 'array') {
        for (const v of arrayOf(value)) {
          push(id, normalizeRef(v, ref.target), rel);
        }
      } else {
        push(id, normalizeRef(value, ref.target), rel);
      }
    }
  }

  // 双向对等关系：related_concepts / related_papers 自动加反向边
  // 先把已有边全登记到 existing，再只对缺反向的补齐，避免两边都声明时重复
  const dual = new Set(['related_concept', 'related_paper']);
  const existing = new Set(edges.map(e => `${e.from}|${e.to}|${e.rel}`));
  const original = [...edges];
  for (const e of original) {
    if (!dual.has(e.rel)) continue;
    const reverseKey = `${e.to}|${e.from}|${e.rel}`;
    if (existing.has(reverseKey)) continue;
    existing.add(reverseKey);
    edges.push({ from: e.to, to: e.from, rel: e.rel });
  }

  return edges;
}

function relName(fromType, ref) {
  // 把 schema slug_refs 里的字段名映射成更语义化的 rel
  const map = {
    'paper:themes': 'in_theme',
    'paper:concept_refs': 'uses_concept',
    'paper:related_papers': 'related_paper',
    'concept:related_concepts': 'related_concept',
    'concept:parent_concept': 'parent_concept',
    'theme:owner': 'theme_owner',
    'theme:co_owners': 'theme_co_owner',
    'member:theme_refs': 'interested_in',
    'session:lead': 'led_by',
    'session:participants': 'participated',
    'session:paper_refs': 'discusses_paper',
    'session:themes': 'in_theme',
    'session:concept_refs': 'concept_in_session',
  };
  return map[`${fromType}:${ref.field}`] || ref.field;
}

/**
 * 反向链接索引
 */
function buildBacklinks(edges) {
  const bl = {};
  for (const e of edges) {
    if (!bl[e.to]) bl[e.to] = [];
    bl[e.to].push({ from: e.from, rel: e.rel });
  }
  return bl;
}

/**
 * 按 theme 聚合：旗下 papers / sessions / concepts
 */
function buildByTheme(nodes, edges) {
  const out = {};
  for (const [id, n] of nodes) {
    if (n.type === 'theme') {
      out[n.bareSlug] = {
        papers: [],
        sessions: [],
        concepts: [],
        members_interested: [],
        owner: n.owner,
        co_owners: n.co_owners,
      };
    }
  }
  for (const e of edges) {
    if (e.rel !== 'in_theme' && e.rel !== 'interested_in') continue;
    const themeNode = nodes.get(e.to);
    if (!themeNode || themeNode.type !== 'theme') continue;
    const fromNode = nodes.get(e.from);
    if (!fromNode) continue;
    const bucket = out[themeNode.bareSlug];
    if (e.rel === 'interested_in' && fromNode.type === 'member') {
      bucket.members_interested.push(e.from);
    } else if (e.rel === 'in_theme') {
      if (fromNode.type === 'paper') bucket.papers.push(e.from);
      if (fromNode.type === 'session') bucket.sessions.push(e.from);
    }
  }
  // concepts: 通过 paper.concept_refs 间接（一个 concept 在某 theme 下 = 该 theme 下任何 paper 引用了它）
  for (const e of edges) {
    if (e.rel !== 'uses_concept') continue;
    const paperNode = nodes.get(e.from);
    if (!paperNode || paperNode.type !== 'paper') continue;
    const conceptId = e.to;
    for (const themeRef of paperNode.themes || []) {
      const themeId = normalizeRef(themeRef, 'theme');
      if (!themeId) continue;
      const bareTheme = themeId.replace(/^theme\//, '');
      if (out[bareTheme] && !out[bareTheme].concepts.includes(conceptId)) {
        out[bareTheme].concepts.push(conceptId);
      }
    }
  }
  return out;
}

/**
 * 按 member 聚合
 */
function buildByMember(nodes, edges) {
  const out = {};
  for (const [, n] of nodes) {
    if (n.type === 'member') {
      out[n.bareSlug] = {
        led_sessions: [],
        participated_sessions: [],
        theme_refs: n.theme_refs || [],
        owns_themes: [],
        co_owns_themes: [],
      };
    }
  }
  for (const e of edges) {
    const fromNode = nodes.get(e.from);
    const toNode = nodes.get(e.to);
    if (!toNode || toNode.type !== 'member') continue;
    const bucket = out[toNode.bareSlug];
    if (!bucket) continue;
    if (e.rel === 'led_by' && fromNode?.type === 'session') bucket.led_sessions.push(e.from);
    if (e.rel === 'participated' && fromNode?.type === 'session') bucket.participated_sessions.push(e.from);
    if (e.rel === 'theme_owner' && fromNode?.type === 'theme') bucket.owns_themes.push(e.from);
    if (e.rel === 'theme_co_owner' && fromNode?.type === 'theme') bucket.co_owns_themes.push(e.from);
  }
  return out;
}

/**
 * 按 concept 聚合
 */
function buildByConcept(nodes, edges) {
  const out = {};
  for (const [, n] of nodes) {
    if (n.type === 'concept') {
      out[n.bareSlug] = {
        papers: [],
        sessions: [],
        related_concepts: n.related_concepts || [],
        parent_concept: n.parent_concept,
        child_concepts: [],
      };
    }
  }
  for (const e of edges) {
    const toNode = nodes.get(e.to);
    if (!toNode || toNode.type !== 'concept') continue;
    const bucket = out[toNode.bareSlug];
    if (!bucket) continue;
    if (e.rel === 'uses_concept') bucket.papers.push(e.from);
    if (e.rel === 'concept_in_session') bucket.sessions.push(e.from);
    if (e.rel === 'parent_concept') bucket.child_concepts.push(e.from);
  }
  return out;
}

/**
 * 按 tag 聚合：每个 tag → 用过它的所有节点
 */
function buildByTag(nodes) {
  const out = {};
  for (const [id, n] of nodes) {
    for (const t of n.tags || []) {
      if (!out[t]) out[t] = [];
      out[t].push(id);
    }
  }
  return out;
}

// ───────── main ─────────

const nodes = collectNodes();
const edges = buildEdges(nodes);
const backlinks = buildBacklinks(edges);
const by_theme = buildByTheme(nodes, edges);
const by_member = buildByMember(nodes, edges);
const by_concept = buildByConcept(nodes, edges);
const by_tag = buildByTag(nodes);

const nodesObj = Object.fromEntries(nodes);

const stats = {
  papers: 0, concepts: 0, themes: 0, members: 0, sessions: 0,
};
for (const [, n] of nodes) {
  if (n.type === 'paper') stats.papers++;
  else if (n.type === 'concept') stats.concepts++;
  else if (n.type === 'theme') stats.themes++;
  else if (n.type === 'member') stats.members++;
  else if (n.type === 'session') stats.sessions++;
}

const graph = {
  version: '1',
  generated_at: new Date().toISOString(),
  stats,
  nodes: nodesObj,
  edges,
  backlinks,
  by_theme,
  by_member,
  by_concept,
  by_tag,
};

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(graph, null, 2));

const isJson = process.argv.includes('--json');
if (isJson) {
  console.log(JSON.stringify({ ok: true, file: relative(ROOT, OUT_FILE), stats, edges: edges.length }));
} else {
  console.log(`✅ knowledge-graph.json (${edges.length} edges)`);
  console.log(`   ${OUT_FILE}`);
  console.log(`   nodes: papers=${stats.papers} concepts=${stats.concepts} themes=${stats.themes} members=${stats.members} sessions=${stats.sessions}`);
}
