// 共享：在 Astro 组件 / 其他构建脚本里读取知识图。
// 设计契约：docs/WIKI_GRAPH_DESIGN.md
//
// 运行时 fs.readFileSync（而不是 import ... assert { type: 'json' }）：
// - astro build / dev 可能在 build:index 尚未跑过的状态启动，缺文件时能降级成空图而非崩
// - SSG 渲染期一次读取+缓存，产物里只有渲染后的 HTML，不会 bundle json 进每个 page chunk
// - pnpm build 脚本仍保证 build:index 在 astro build 之前生成真 json
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GRAPH_PATH = resolve(__dirname, '../generated/knowledge-graph.json');

const EMPTY = {
  version: '1', stats: {}, nodes: {}, edges: [], backlinks: {},
  by_theme: {}, by_member: {}, by_concept: {}, by_tag: {},
};

let _cache = null;
export function loadGraph() {
  if (_cache) return _cache;
  if (!existsSync(GRAPH_PATH)) {
    console.warn('[knowledge-graph] src/generated/knowledge-graph.json 不存在；按空图渲染。运行 pnpm build:index 生成。');
    _cache = EMPTY;
    return _cache;
  }
  try {
    _cache = JSON.parse(readFileSync(GRAPH_PATH, 'utf-8'));
    return _cache;
  } catch (e) {
    console.warn(`[knowledge-graph] 解析失败（${e.message}），按空图渲染`);
    _cache = EMPTY;
    return _cache;
  }
}

/**
 * 给定 Astro.url.pathname (如 "/concepts/grpo/" 或 "/en/concepts/grpo/")，
 * 返回 graph 节点 id ("concept/grpo")，或 null。
 */
export function pathnameToNodeId(pathname) {
  if (!pathname) return null;
  const trimmed = pathname.replace(/^\/+|\/+$/g, '');
  const parts = trimmed.split('/').filter(Boolean);
  // 去掉 i18n 前缀
  if (parts[0] === 'en') parts.shift();
  if (parts.length < 2) return null;
  const [plural, slug] = parts;
  const map = {
    papers: 'paper', concepts: 'concept', themes: 'theme',
    members: 'member', sessions: 'session',
  };
  const type = map[plural];
  if (!type) return null;
  // sessions/digest/<x> 不进图
  if (plural === 'sessions' && slug === 'digest') return null;
  return `${type}/${slug}`;
}

/**
 * 拿一组 node id，转成可渲染的 { slug, title, url } 列表（去掉不存在的）。
 */
export function expandNodes(graph, ids) {
  const out = [];
  for (const id of ids || []) {
    const n = graph.nodes[id];
    if (!n) continue;
    out.push({ slug: id, title: n.title, url: n.url, type: n.type });
  }
  return out;
}
