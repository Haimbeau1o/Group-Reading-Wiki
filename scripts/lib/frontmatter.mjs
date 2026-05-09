// 极简 frontmatter 解析（avoid 加 yaml 依赖）。
// 仅支持本仓库使用的格式：顶部 --- 包围的 YAML、单层 key、列表用 - x。
// 复杂场景（嵌套对象 sidebar.order 等）仅识别已知结构。
import { readFileSync } from 'node:fs';

export function parseFrontmatter(filepath) {
  const raw = readFileSync(filepath, 'utf-8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { frontmatter: {}, body: raw };
  const yaml = m[1];
  const fm = {};
  let currentKey = null;
  let currentList = null;
  let nestedKey = null; // 'sidebar' 等
  for (const line of yaml.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    // 列表项
    if (/^\s+-\s/.test(line)) {
      const v = line.replace(/^\s+-\s+/, '').trim();
      if (currentList) {
        currentList.push(v);
      } else if (currentKey && fm[currentKey] && typeof fm[currentKey] === 'object' && !Array.isArray(fm[currentKey]) && Object.keys(fm[currentKey]).length === 0) {
        // 之前认为是嵌套对象，实际是 list — 转成 array
        fm[currentKey] = [v];
        currentList = fm[currentKey];
        nestedKey = null;
      }
      continue;
    }
    // 顶层 key: value
    const top = line.match(/^([a-zA-Z_][\w-]*?):\s*(.*)$/);
    if (top) {
      const [, key, valRaw] = top;
      const val = valRaw.trim();
      currentList = null;
      nestedKey = null;
      if (val === '') {
        // 可能是嵌套对象或列表起点
        currentKey = key;
        fm[key] = {};
        nestedKey = key;
      } else if (val.startsWith('[')) {
        try { fm[key] = JSON.parse(val); } catch { fm[key] = val; }
      } else {
        fm[key] = stripQuotes(val);
      }
      continue;
    }
    // 嵌套 key
    const nested = line.match(/^\s+([a-zA-Z_][\w-]*?):\s*(.*)$/);
    if (nested && nestedKey) {
      const [, k, v] = nested;
      const trimmed = v.trim();
      if (trimmed === '') {
        currentList = [];
        fm[nestedKey][k] = currentList;
      } else {
        fm[nestedKey][k] = parseScalar(trimmed);
      }
      continue;
    }
    // 顶层带列表起始
    if (currentKey && line.match(/^\s+-/)) {
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      currentList = fm[currentKey];
      currentList.push(line.replace(/^\s+-\s+/, '').trim());
    }
  }
  return { frontmatter: fm, body: raw.slice(m[0].length) };
}

function stripQuotes(s) {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return parseScalar(s);
}

function parseScalar(s) {
  // 剥离行内注释： value  # comment
  const noComment = s.replace(/\s+#.*$/, '').trim();
  if (noComment === 'true') return true;
  if (noComment === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(noComment)) return Number(noComment);
  if ((noComment.startsWith('"') && noComment.endsWith('"')) || (noComment.startsWith("'") && noComment.endsWith("'"))) {
    return noComment.slice(1, -1);
  }
  return noComment;
}

// frontmatter 的合规校验（agent 化的 schema check）
//
// `slug_refs` 字段声明哪些字段是"指向其他实体的 slug 列表 / 单 slug"：
//   { field: 'concept_refs', target: 'concept', kind: 'array' }
//   { field: 'parent_concept', target: 'concept', kind: 'scalar' }
// verify.mjs 用它做跨实体死链检查；build-index.mjs 用它生成边。
//
// 设计契约：docs/WIKI_GRAPH_DESIGN.md
export const SCHEMAS = {
  member: {
    required: ['title', 'role', 'status'],
    optional: ['cluster', 'year', 'title_label', 'research-interests', 'theme_refs', 'tags'],
    enum: {
      role: ['大导师', '小导师', '博士生', '硕士生'],
      status: ['active', 'alumni', 'visitor'],
      cluster: ['方向掌舵者', '研究主理人', '学习成长者', '任务驱动者', '流动接触者'],
    },
    slug_refs: [
      { field: 'theme_refs', target: 'theme', kind: 'array' },
    ],
  },
  session: {
    required: ['title', 'session_week', 'lead', 'status'],
    optional: ['session_date', 'paper_refs', 'themes', 'participants', 'concept_refs', 'tags'],
    enum: {
      status: ['upcoming', 'live', 'archived'],
    },
    slug_refs: [
      { field: 'lead', target: 'member', kind: 'scalar' },
      { field: 'participants', target: 'member', kind: 'array' },
      { field: 'paper_refs', target: 'paper', kind: 'array' },
      { field: 'themes', target: 'theme', kind: 'array' },
      { field: 'concept_refs', target: 'concept', kind: 'array' },
    ],
  },
  paper: {
    required: ['title', 'description'],
    optional: ['status', 'themes', 'exemplar', 'concept_refs', 'related_papers', 'tags'],
    // exemplar: true → init:group --reset 时保留（作为"好 paper note"的样板）
    slug_refs: [
      { field: 'themes', target: 'theme', kind: 'array' },
      { field: 'concept_refs', target: 'concept', kind: 'array' },
      { field: 'related_papers', target: 'paper', kind: 'array' },
    ],
  },
  theme: {
    required: ['title', 'description'],
    optional: ['owner', 'co_owners', 'tags'],
    slug_refs: [
      { field: 'owner', target: 'member', kind: 'scalar' },
      { field: 'co_owners', target: 'member', kind: 'array' },
    ],
  },
  concept: {
    required: ['title', 'description'],
    optional: ['aliases', 'related_concepts', 'parent_concept', 'tags'],
    slug_refs: [
      { field: 'related_concepts', target: 'concept', kind: 'array' },
      { field: 'parent_concept', target: 'concept', kind: 'scalar' },
    ],
  },
  generic: {
    required: ['title'],
    optional: ['tags'],
  },
};

export function validateFrontmatter(fm, schema) {
  const errors = [];
  for (const k of schema.required || []) {
    if (fm[k] === undefined || fm[k] === '') errors.push(`missing required: ${k}`);
  }
  if (schema.enum) {
    for (const [k, allowed] of Object.entries(schema.enum)) {
      if (fm[k] !== undefined && !allowed.includes(fm[k])) {
        errors.push(`invalid ${k}: "${fm[k]}" (allowed: ${allowed.join(', ')})`);
      }
    }
  }
  return errors;
}

// 根据文件路径选 schema
export function detectSchema(relpath) {
  if (relpath.includes('/members/') && !relpath.endsWith('/index.mdx') && !relpath.endsWith('/index.md')) return 'member';
  if (relpath.includes('/sessions/digest/')) return 'generic';
  if (relpath.includes('/sessions/') && !relpath.endsWith('/index.mdx')) return 'session';
  if (relpath.includes('/papers/') && !relpath.endsWith('/index.md')) return 'paper';
  if (relpath.includes('/themes/') && !relpath.endsWith('/index.mdx')) return 'theme';
  if (relpath.includes('/concepts/') && !relpath.endsWith('/index.md')) return 'concept';
  return 'generic';
}
