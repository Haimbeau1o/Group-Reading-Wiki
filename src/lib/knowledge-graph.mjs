// 共享：在 Astro 组件 / 其他构建脚本里读取知识图。
// 设计契约：docs/WIKI_GRAPH_DESIGN.md
//
// 直接 import JSON：Vite 会在构建期 bundle 内容进页面 chunk。
// pnpm build 脚本保证了 build:index 在 astro build 前跑一次。
import graphData from '../generated/knowledge-graph.json' with { type: 'json' };

const EMPTY = {
  version: '1', stats: {}, nodes: {}, edges: [], backlinks: {},
  by_theme: {}, by_member: {}, by_concept: {}, by_tag: {},
};

export function loadGraph() {
  return graphData || EMPTY;
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
