#!/usr/bin/env node
/**
 * pnpm migrate:paper-concepts [--dry-run] [--json]
 *
 * 一次性迁移：扫所有 papers/*.md 正文里"关联概念"行的 [text](/concepts/<slug>/) 链接，
 * 写进 frontmatter 的 concept_refs[]（去重，保持插入顺序）。
 *
 * 设计契约：docs/WIKI_GRAPH_DESIGN.md §6.1
 *
 * 安全规则：
 *  - 幂等：concept_refs 里已有的 slug 不重复添加
 *  - 不删除 frontmatter 已写的 slug
 *  - --dry-run：只打印改动，不写文件
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './lib/frontmatter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PAPERS = join(ROOT, 'src/content/docs/papers');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const JSON_OUT = args.includes('--json');

const CONCEPT_LINK_RE = /\[([^\]]+)\]\(\/concepts\/([a-z0-9-]+)\/?\)/g;

function listPapers() {
  return readdirSync(PAPERS)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
    .filter(f => !f.startsWith('index.'))
    .map(f => join(PAPERS, f))
    .filter(p => statSync(p).isFile());
}

function extractConceptSlugs(body) {
  const out = [];
  let m;
  CONCEPT_LINK_RE.lastIndex = 0;
  while ((m = CONCEPT_LINK_RE.exec(body)) !== null) {
    if (!out.includes(m[2])) out.push(m[2]);
  }
  return out;
}

/**
 * 注入 concept_refs 到 frontmatter。极简实现：
 *  - 已存在 concept_refs: 行 → 在其下追加缺失的 slug 项
 *  - 不存在 → 在 frontmatter 末尾（--- 上一行）插入完整字段
 *
 * 简化前提：本仓库的 frontmatter 都是顶层 key + 列表用 - x 形式（lib/frontmatter.mjs 同假设）
 */
function injectConceptRefs(raw, slugs, existing) {
  const fmMatch = raw.match(/^(---\n)([\s\S]*?)(\n---)/);
  if (!fmMatch) return null;
  const [, head, body, tail] = fmMatch;

  const missing = slugs.filter(s => !existing.includes(s));
  if (missing.length === 0) return null;

  let newBody;
  if (existing.length > 0 || /^concept_refs:\s*$/m.test(body) || /^concept_refs:\s*\[/m.test(body)) {
    // 已有字段：找到 concept_refs 段，在末尾追加
    // 处理两种格式：
    //   concept_refs: [a, b]    （inline array）
    //   concept_refs:           （block list）
    //     - a
    //     - b
    if (/^concept_refs:\s*\[/m.test(body)) {
      // inline array → 转 block 形式更稳
      newBody = body.replace(/^concept_refs:\s*\[([^\]]*)\]/m, () => {
        const all = [...existing, ...missing];
        return 'concept_refs:\n' + all.map(s => `  - ${s}`).join('\n');
      });
    } else {
      // block list：在最后一个 concept_refs 子项后追加
      const lines = body.split('\n');
      let lastIdx = -1;
      let inField = false;
      for (let i = 0; i < lines.length; i++) {
        if (/^concept_refs:\s*$/.test(lines[i])) { inField = true; lastIdx = i; continue; }
        if (inField) {
          if (/^\s+-\s/.test(lines[i])) { lastIdx = i; continue; }
          if (/^\s/.test(lines[i]) && lines[i].trim() === '') continue;
          // 离开了 concept_refs 块
          inField = false;
        }
      }
      if (lastIdx >= 0) {
        const insertAt = lastIdx + 1;
        const newLines = [...lines.slice(0, insertAt), ...missing.map(s => `  - ${s}`), ...lines.slice(insertAt)];
        newBody = newLines.join('\n');
      } else {
        // 没找到，简单追加
        newBody = body.trimEnd() + '\nconcept_refs:\n' + missing.map(s => `  - ${s}`).join('\n');
      }
    }
  } else {
    // 全新字段：追加到 frontmatter 末尾
    newBody = body.trimEnd() + '\nconcept_refs:\n' + missing.map(s => `  - ${s}`).join('\n');
  }

  return head + newBody + tail + raw.slice(fmMatch[0].length);
}

const changes = [];

for (const f of listPapers()) {
  const raw = readFileSync(f, 'utf-8');
  const { frontmatter: fm, body } = parseFrontmatter(f);
  const found = extractConceptSlugs(body);
  if (found.length === 0) continue;

  const existing = Array.isArray(fm.concept_refs) ? fm.concept_refs.map(String) : [];
  const missing = found.filter(s => !existing.includes(s));
  if (missing.length === 0) continue;

  const newRaw = injectConceptRefs(raw, found, existing);
  if (!newRaw) continue;

  const rel = relative(ROOT, f);
  changes.push({ file: rel, added: missing, existed: existing });

  if (!DRY) writeFileSync(f, newRaw);
}

if (JSON_OUT) {
  process.stdout.write(JSON.stringify({ dry: DRY, changes }, null, 2) + '\n');
} else {
  if (changes.length === 0) {
    console.log('✅ 无需迁移：所有 paper 的 concept 链接都已在 frontmatter');
  } else {
    console.log(`${DRY ? '🔍 dry-run' : '✏️  应用'} · ${changes.length} 个 paper${DRY ? ' (将)' : ''}更新：\n`);
    for (const c of changes) {
      console.log(`  ${c.file}`);
      console.log(`    + concept_refs: ${c.added.join(', ')}`);
      if (c.existed.length) console.log(`    (已有: ${c.existed.join(', ')})`);
    }
    if (DRY) console.log('\n（去掉 --dry-run 真改）');
  }
}
