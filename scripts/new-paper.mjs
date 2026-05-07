#!/usr/bin/env node
/**
 * pnpm new:paper <slug>
 *   [--arxiv=<id>]                 # 自动从 arXiv API 抓元数据（推荐）
 *   [--title="..."]                # 不传 --arxiv 时手填
 *   [--theme=<theme-slug>]
 *   [--lead=<member-slug>]         # 该论文的带读人 / take owner
 *   [--json]
 *
 * 例：
 *   pnpm new:paper qwen3 --arxiv=2505.09388 --theme=reflective-alignment --lead=alex-chen
 *   pnpm new:paper mixtral --title="Mixtral of Experts" --theme=moe-sparsity
 *
 * 在 src/content/docs/papers/<slug>.md 生成解读模板。
 *
 * --arxiv 行为：
 *   1. 调 https://export.arxiv.org/api/query?id_list=<id> 拿 Atom XML
 *   2. 解析 title / authors / summary(abstract) / published / primary_category
 *   3. 自动填 元信息 + 一句话总结（abstract 头一句）
 *   4. 关键贡献从 abstract 抑出（标 caution: agent 起草）
 *   5. take 段保留为 caution: 待 PI/lead review
 *
 * 网络失败时降级到 manual --title 模式。
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: pnpm new:paper <slug> [--arxiv=<id>] [--title="..."] [--theme=<slug>] [--lead=<member-slug>] [--json]');
  process.exit(1);
}

const [slug, ...rest] = args;
const opts = Object.fromEntries(
  rest.filter(s => s.startsWith('--')).map(s => {
    const [k, ...v] = s.slice(2).split('=');
    return [k, v.length ? v.join('=') : true];
  })
);

const isJson = !!opts.json;
const arxivId = opts.arxiv || '';
const theme = opts.theme || '';
const lead = opts.lead || '';

// YAML 安全引号
const yamlSafe = (s) => /[:#&*!|>%@`,\[\]{}"'\\]/.test(s) ? `"${String(s).replace(/"/g, '\\"')}"` : s;

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'src/content/docs/papers', `${slug}.md`);

if (existsSync(outPath)) {
  if (isJson) console.log(JSON.stringify({ ok: false, error: `${outPath} already exists` }));
  else console.error(`✗ ${outPath} already exists`);
  process.exit(1);
}

// ─── arXiv 元数据抓取 ─────────────────────────────────────
async function fetchArxiv(id) {
  const url = `https://export.arxiv.org/api/query?id_list=${id}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'group-wiki-template/1.0' } });
  if (!res.ok) throw new Error(`arXiv API HTTP ${res.status}`);
  const xml = await res.text();
  if (xml.includes('<opensearch:totalResults>0</opensearch:totalResults>')) {
    throw new Error(`arXiv ID 不存在: ${id}`);
  }
  // 简单 regex 解析（够用 — Atom XML 结构稳定）
  const pick = (tag) => {
    const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return m ? m[1].trim().replace(/\s+/g, ' ') : '';
  };
  const title = pick('title').replace(/^.*?<title[^>]*>/, '').replace(/^arXiv Query.*/, '');
  // entry 内的 title 是第二个 <title>
  const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/);
  if (!entryMatch) throw new Error('arXiv 返回未含 entry');
  const entry = entryMatch[1];
  const entryPick = (tag) => {
    const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return m ? m[1].trim().replace(/\s+/g, ' ') : '';
  };
  const entryAttr = (re) => {
    const m = entry.match(re);
    return m ? m[1] : '';
  };
  const authorRegex = /<author>\s*<name>([^<]+)<\/name>\s*<\/author>/g;
  const authors = [];
  let am;
  while ((am = authorRegex.exec(entry))) authors.push(am[1].trim());

  return {
    id,
    title: entryPick('title'),
    abstract: entryPick('summary'),
    authors,
    published: entryPick('published').slice(0, 10), // YYYY-MM-DD
    primary_category: entryAttr(/<arxiv:primary_category[^>]*term="([^"]+)"/),
  };
}

// ─── 主流程 ──────────────────────────────────────────────
let title = opts.title || slug;
let abstract = '';
let authors = [];
let published = '';
let primaryCategory = '';
let usedArxiv = false;
let firstSentence = '';

if (arxivId) {
  try {
    const meta = await fetchArxiv(arxivId);
    title = meta.title;
    abstract = meta.abstract;
    authors = meta.authors;
    published = meta.published;
    primaryCategory = meta.primary_category;
    usedArxiv = true;
    // 取 abstract 第一句（"...。" 或 ". " 切）
    const firstStop = abstract.search(/[.。](?=\s|$)/);
    firstSentence = firstStop > 0 ? abstract.slice(0, firstStop + 1).trim() : abstract.slice(0, 200) + '…';
  } catch (e) {
    if (isJson) console.error(JSON.stringify({ warn: `arXiv fetch failed: ${e.message}, falling back to manual`, slug }));
    else console.warn(`⚠ arXiv 抓取失败 (${e.message})，降级到手填模式`);
  }
}

mkdirSync(dirname(outPath), { recursive: true });

// 作者展示：>3 位用 "Author1, Author2, ... et al."
const authorDisplay = authors.length === 0
  ? '…'
  : authors.length <= 3
    ? authors.join(', ')
    : `${authors.slice(0, 3).join(', ')}, et al. (${authors.length} authors)`;

const titleY = yamlSafe(title);
const descY = yamlSafe(`论文解读 · ${title}`);

// 元信息块（如果抓到 arXiv，填全；否则留 …）
const metaBlock = usedArxiv
  ? `- **标题**：${title}
- **作者**：${authorDisplay}
- **arXiv**：[${arxivId}](https://arxiv.org/abs/${arxivId})
- **发布日期**：${published}
- **主分类**：${primaryCategory}${theme ? `\n- **关联主线**：[${theme}](/themes/${theme}/)` : ''}${lead ? `\n- **带读人**：[${lead}](/members/${lead}/)` : ''}`
  : `- **标题**：${title}
- **作者**：…
- **机构**：…
- **会议 / arXiv**：…
- **发布日期**：…${theme ? `\n- **关联主线**：[${theme}](/themes/${theme}/)` : ''}${lead ? `\n- **带读人**：[${lead}](/members/${lead}/)` : ''}`;

// 一句话总结
const summaryBlock = usedArxiv
  ? `:::caution[🤖 Agent 起草 · 待 ${lead || '带读人'} review]
下面这段是从 abstract 第一句直接派生的，**不算正式总结**。读后请改写为更精准的"一句话定位"，并删除本 caution 块。
:::

${firstSentence}`
  : `> 📝 TODO：一句话定位本论文（核心问题 / 主要贡献）。`;

// 关键贡献：abstract 派生（保守版）
const contribBlock = usedArxiv
  ? `:::caution[🤖 Agent 起草 · 待 ${lead || '带读人'} 读后修订]
下面是从 abstract 抑出的"作者声称的贡献"——**不等于真实贡献**。读后请重写：
1) 删去自夸成分；2) 补上 abstract 没说但你认为重要的；3) 删 caution 块。
:::

${abstract.length > 50 ? `> 摘要原文：\n> ${abstract.slice(0, 600)}${abstract.length > 600 ? '…' : ''}` : '> 📝 TODO'}

读后填**实际贡献**（建议 3–5 条，每条一句话不要 jargon）：

1. > 📝 TODO
2. > 📝 TODO
3. > 📝 TODO`
  : `> 📝 TODO：3–5 条，每条一句话不要 jargon。`;

// take 段：始终是 caution
const takeBlock = `:::caution[🤖 待 ${lead || 'PI / 带读人'} 撰写 · agent 不替写]
take 段是 wiki 的灵魂，**必须由 PI 或带读人写**，不能 agent 自动生成。
建议结构（PEEL）：Point（一句立场）→ Evidence（这篇支撑你立场的证据）→ Explanation（你的解读）→ Link（连到主线 / 其他论文）。

参考引导问题（不要依次填，拍出立场）：

1. **这篇最值得我们学的点是什么**？为什么是这个，不是其他热度更高的点？
2. **它绕开了什么 / 你不同意什么**？局限是什么？
3. **如果让我们复现 / 扩展，先做什么**？最小可行实验是什么？
4. **连到我们哪条主线**${theme ? `（[${theme}](/themes/${theme}/)）` : ''}，这篇是支撑还是反驳？
:::`;

const content = `---
title: ${titleY}
description: ${descY}
sidebar:
  label: ${titleY}
${theme ? `themes:\n  - ${theme}\n` : ''}${lead ? `lead: ${lead}\n` : ''}status: draft
${usedArxiv ? `arxiv: ${arxivId}\n` : ''}---

${usedArxiv ? '' : '> ⚠️ Draft。请贡献者填充。\n'}
## 元信息

${metaBlock}

## 一句话总结

${summaryBlock}

## 我们组为什么读这篇

> 📝 TODO：${lead || 'PI'} 填一句话。为什么这篇值得我们读、连到哪个具体问题。
> *agent 不替写——这是研究判断。*

## 关键贡献

${contribBlock}

## 方法

> 📝 TODO：带读人读完论文后填。建议小标题：
> - 整体框架（一段 + 一张架构图引用）
> - 核心创新（最关键的 1–2 个技术点）
> - 实现细节（hyperparams / 工程 trick）

## 关键实验 / 结果

> 📝 TODO：读后填。建议结构：
> - **主结果**：哪些 benchmark 上多少分，相对前 SOTA 的相对提升
> - **消融**：哪些组件最重要（删了之后掉多少分）
> - **失败模式**：作者承认的弱点 + 你发现的隐藏弱点
> - **复现性**：code/data 是否公开？算力门槛？

## 我们组的 take

${takeBlock}

## 开放问题 / 后续

> 📝 TODO：${lead || '带读人'} 提 1–3 个**真正未解**的问题（不是已被同期论文解决的）。

## Counter-evidence / 反向证据

> 📝 TODO（可选但推荐）：列 1–2 篇与本文论点**冲突或局限化**的工作${theme ? `；如果在 [${theme}](/themes/${theme}/) 主线上，作为对照阅读。` : '。'}

## 复现性 checklist

- [ ] 代码公开
- [ ] 数据公开
- [ ] 模型权重公开
- [ ] 报告了 hyperparams
- [ ] 报告了 hardware / 算力门槛
- [ ] 报告了 random seeds / 误差棒

## 共读历史

> 自动汇总 sessions 中讨论过这篇 paper 的记录（待功能上线）。

## 延伸阅读

- **原论文**：${usedArxiv ? `[arXiv:${arxivId}](https://arxiv.org/abs/${arxivId})` : '…'}
- **相关概念**：> 📝 TODO（如指向 wiki 概念词典页）
- **相关论文**：> 📝 TODO（同方向 1–3 篇）
`;

writeFileSync(outPath, content);

const result = {
  ok: true,
  action: 'create',
  file: outPath,
  slug,
  title,
  theme,
  lead,
  arxiv: arxivId,
  arxiv_fetched: usedArxiv,
  authors_count: authors.length,
};

if (isJson) {
  console.log(JSON.stringify(result));
} else {
  console.log(`✓ created ${outPath.replace(resolve(__dirname, '..') + '/', '')}`);
  if (usedArxiv) {
    console.log(`✓ arXiv 元数据已抓取 (${authors.length} authors, ${published}, ${primaryCategory})`);
    console.log(`✓ 一句话总结 + 关键贡献 已 agent 起草（带 caution banner，待 review）`);
  } else if (arxivId) {
    console.log(`⚠ arXiv 抓取失败，请手填元信息段`);
  }
  console.log('');
  console.log('Next:');
  console.log(`  1. ${lead ? `${lead} 读论文 → 填方法 / 实验 / 反向证据 / 复现性 checklist` : '指定带读人 (--lead=<member-slug>) 并交给他'}`);
  console.log(`  2. PI / 带读人**手写** take 段（agent 不替写）`);
  console.log(`  3. 修订 / 删除 caution 块后 frontmatter status: draft → published`);
  console.log(`  4. pnpm verify`);
  if (theme) {
    console.log(`  5. 编辑 themes/${theme}.md 把这篇加到「关键论文（外部）」段`);
  }
}
