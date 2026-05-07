#!/usr/bin/env node
/**
 * Fork 后一键把 Leon's Group demo 重塑为你课题组的初始 wiki。
 *
 * 用法：
 *   pnpm init:group "Wang's NLP Group"               # 标准：清空 demo 内容
 *   pnpm init:group "Wang's NLP Group" --keep-demo   # 保留 DeepSeek 解读 + 5 概念词典作参考
 *   pnpm init:group "Wang's NLP Group" --keep-members  # 保留 15 个成员占位框架
 *   pnpm init:group "Wang's NLP Group" --dry-run     # 仅列出会改/删的文件，不动手
 *
 * 这个脚本会：
 *   1. 把所有出现的 "Leon's Group" 替换为你的组名
 *   2. 删除 15 个成员占位文件（默认保留 leon.md，重命名为 pi.md 模板）
 *   3. 清空 4 条 demo 主线，保留 1 个空白模板
 *   4. 删除 sessions 示例
 *   5. 默认删除 deepseek/ 全套解读（除非 --keep-demo）
 *   6. 重置 README 顶部为 "<新组名>" 的 wiki 介绍
 *   7. 自我删除（执行完成后从 scripts/ 中删去 init-group.mjs，避免误用）
 *
 * 已经完整的项目（已 fork 用过本脚本的）不应再次运行。
 */
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync, renameSync, unlinkSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './lib/frontmatter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const flags = new Set(args.filter(a => a.startsWith('--')));

if (positional.length < 1) {
  console.error('Usage: pnpm init:group "<New Group Name>" [--keep-demo] [--keep-members] [--dry-run]');
  process.exit(1);
}

const NEW_NAME = positional[0];
const KEEP_DEMO = flags.has('--keep-demo');
const KEEP_MEMBERS = flags.has('--keep-members');
const DRY_RUN = flags.has('--dry-run');

const log = (m) => console.log(DRY_RUN ? `[dry-run] ${m}` : m);

const replaceInFile = (path, replacements) => {
  if (!existsSync(path)) return;
  let content = readFileSync(path, 'utf-8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    if (!DRY_RUN) writeFileSync(path, content);
    log(`✏ updated ${path.replace(ROOT + '/', '')}`);
  }
};

const removePath = (relPath) => {
  const path = join(ROOT, relPath);
  if (!existsSync(path)) return;
  if (!DRY_RUN) rmSync(path, { recursive: true, force: true });
  log(`🗑 removed ${relPath}`);
};

const walkFiles = (dir, filter = () => true) => {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...walkFiles(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
};

console.log(`\n🚀 Initializing group: "${NEW_NAME}"`);
console.log(`   keep-demo: ${KEEP_DEMO}, keep-members: ${KEEP_MEMBERS}, dry-run: ${DRY_RUN}\n`);

// 1. 全局文本替换 ────────────────────────────────────
const NAME_REPLACEMENTS = [
  ["Leon's Group", NEW_NAME],
  ["leon-group-wiki", slugify(NEW_NAME) + '-wiki'],
];

const allTextFiles = [
  ...walkFiles(join(ROOT, 'src/content/docs'), p => /\.(md|mdx)$/.test(p)),
  join(ROOT, 'astro.config.mjs'),
  join(ROOT, 'package.json'),
  join(ROOT, 'README.md'),
  join(ROOT, 'CONTRIBUTING.md'),
];

for (const f of allTextFiles) replaceInFile(f, NAME_REPLACEMENTS);

// 2. 清空成员占位（保留 leon.md → pi.md 模板）─────────────
if (!KEEP_MEMBERS) {
  const memberPlaceholders = [
    'postdoc-1', 'lecturer-1',
    'phd-senior-1', 'phd-senior-2',
    'phd-mid-1', 'phd-mid-2',
    'phd-new-1', 'phd-new-2',
    'ms-research-1', 'ms-research-2', 'ms-research-3',
    'ms-eng-1', 'ms-eng-2', 'ug-ra-1',
  ];
  for (const slug of memberPlaceholders) {
    removePath(`src/content/docs/members/${slug}.md`);
  }

  // leon.md → pi.md 重命名为 PI 通用模板
  const leonPath = join(ROOT, 'src/content/docs/members/leon.md');
  const piPath = join(ROOT, 'src/content/docs/members/pi.md');
  if (existsSync(leonPath) && !DRY_RUN) {
    let content = readFileSync(leonPath, 'utf-8');
    content = content
      .replace(/title: Leon\b/, 'title: <PI 姓名>')
      .replace(/Leon\(PI\)/g, '<PI 姓名> (PI)')
      .replace(/Leon \(PI\)/g, '<PI 姓名> (PI)')
      .replace(/Leon's takes/g, '<PI 姓名> 的 takes')
      .replace(/leon@example\.com/, '<email>')
      .replace(/github: leon/, 'github: <github-id>');
    writeFileSync(piPath, content);
    unlinkSync(leonPath);
    log(`✏ renamed members/leon.md → members/pi.md (templated)`);
  } else {
    log(`✏ renamed members/leon.md → members/pi.md (templated)`);
  }

  // 重写 members/index.mdx 为最简
  const indexPath = join(ROOT, 'src/content/docs/members/index.mdx');
  const newIndex = `---
title: 课题组成员
description: 成员列表，按角色分组。
sidebar:
  order: 0
  label: 成员总览
---

import { LinkCard, CardGrid } from '@astrojs/starlight/components';

> 用 \`pnpm new:member <slug> --role=<大导师|小导师|博士生|硕士生>\` 创建成员主页。

## 🎓 大导师

<CardGrid>
  <LinkCard title="<PI 姓名>" description="PI · 课题组负责人" href="/members/pi/" />
</CardGrid>

## 👨‍🏫 小导师

> （还没有）

## 🧑‍💻 博士生

> （还没有）

## 📘 硕士生

> （还没有）

---

## 历届成员 / Alumni

> 待补。
`;
  if (!DRY_RUN) writeFileSync(indexPath, newIndex);
  log(`✏ rewrote members/index.mdx`);
}

// 3. 清空 themes（保留 1 个空模板）──────────────────
const themesToRemove = ['long-context.md', 'moe-sparsity.md', 'test-time-reasoning.md', 'multimodal.md'];
for (const f of themesToRemove) removePath(`src/content/docs/themes/${f}`);

// 写一个示范主线模板
const themeTemplatePath = join(ROOT, 'src/content/docs/themes/example-theme.md');
const themeTemplate = `---
title: <主线名称>
description: 一句话定位你这条研究主线。
sidebar:
  order: 1
  label: <主线名称>
---

> ⚠️ 模板。复制本文件并改名（\`mv example-theme.md your-theme.md\`），然后填实际内容。

## 一句话定位

我们关心：**...**

我们**不**关心：...

## 该方向的 owner

- **小导师**：[占位](/members/)
- **核心博士**：[占位](/members/)

## 关键论文（外部）

- [paper 1] - 链向我们的解读（待写）
- [paper 2]

## 我们的工作（内部）

- [ ] 项目 A
- [ ] 项目 B

## 我们关心的开放问题

1. ?

## 推荐阅读路径（给新人）

1. **第一周**：…
2. **第二周**：…

## 该主线的"组内立场"

> ...
`;
if (!DRY_RUN) writeFileSync(themeTemplatePath, themeTemplate);
log(`✏ wrote themes/example-theme.md (template)`);

// 重写 themes/index.mdx 为简版
const themesIndex = join(ROOT, 'src/content/docs/themes/index.mdx');
const newThemesIndex = `---
title: 研究主线
description: 课题组关心的研究方向地图。
sidebar:
  order: 0
  label: 主线总览
---

> 这一页给谁看：新人 30 分钟看完 = 知道组里在干嘛。

## 当前主线

> 用 [example-theme](/themes/example-theme/) 作为模板，复制改名后添加你的主线。
> 添加后请同时在本页加链接。
`;
if (!DRY_RUN) writeFileSync(themesIndex, newThemesIndex);
log(`✏ rewrote themes/index.mdx`);

// 4. 清空 sessions ──────────────────────────────────
// 删除 sessions/*.md 和 sessions/digest/*，除了 frontmatter 含 exemplar: true 的
cleanDirHonorExemplar('src/content/docs/sessions');
cleanDirHonorExemplar('src/content/docs/sessions/digest');

// 4.5. 清空 papers/ 但保留 exemplar ─────────────────
// R1 paper note 有 exemplar: true → 默认保留作"什么是好 paper note"样板
cleanDirHonorExemplar('src/content/docs/papers');
const sessionsIndex = join(ROOT, 'src/content/docs/sessions/index.mdx');
const newSessionsIndex = `---
title: 共读会议（Sessions）
description: 课题组每周共读，会前 / 会中 / 会后全流程。
sidebar:
  order: 0
  label: Sessions 总览
---

> 用 \`pnpm new:session <week> <slug>\` 创建新一周的 session 模板。

## 🎯 这一周

> 还没有。

## 📜 历史归档

> 还没有。
`;
if (!DRY_RUN) writeFileSync(sessionsIndex, newSessionsIndex);
log(`✏ rewrote sessions/index.mdx`);

// 5. 默认清空 deepseek 解读（除非 --keep-demo）─────────
if (!KEEP_DEMO) {
  removePath('src/content/docs/deepseek');
  // 同时清空文章里引用的图片资源
  removePath('public/docs-assets');
  // 概念词典：保留作参考（任何 AI 组都能用），但用户可以手动删
}

// 6. 修改首页 hero ──────────────────────────────────
const indexMdx = join(ROOT, 'src/content/docs/index.mdx');
if (existsSync(indexMdx)) {
  let content = readFileSync(indexMdx, 'utf-8');
  content = content.replace(
    /## 📅 本周共读\n\n<LinkCard[\s\S]*?\/>\n/,
    '## 📅 本周共读\n\n> 还没有 session。运行 `pnpm new:session 2026-Wxx <slug>` 创建第一篇。\n'
  );
  // 移除指向已删除 deepseek 页的引用
  if (!KEEP_DEMO) {
    content = content.replace(/\s*<LinkCard\s*[^>]*deepseek[^>]*\/>\s*/g, '');
  }
  if (!DRY_RUN) writeFileSync(indexMdx, content);
  log(`✏ updated index.mdx`);
}

// 7. 重置 README ────────────────────────────────────
const readmePath = join(ROOT, 'README.md');
const newReadme = `# ${NEW_NAME} · 共读 Wiki

> 课题组共享大脑：共读、笔记、研究记忆、新人入口。
>
> 基于 [group-wiki-template](https://github.com/Haimbeau1o/Group-Reading-Wiki)（替换为模板原仓库链接）。

## 本地开发

\`\`\`bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # 静态产物到 dist/
\`\`\`

## 脚手架

\`\`\`bash
pnpm new:session 2026-W19 paper-slug --lead=<member>
pnpm new:paper paper-slug --title="<Title>" --theme=<theme>
pnpm new:member <slug> --role=<大导师|小导师|博士生|硕士生>
\`\`\`

## 部署

详见模板原仓库 README 的"部署"小节（推荐 Cloudflare Pages + Cloudflare Access）。

## 协议

代码 MIT。内容 CC BY-SA 4.0。
`;
if (!DRY_RUN) writeFileSync(readmePath, newReadme);
log(`✏ rewrote README.md`);

// 8. 自删除 init-group 脚本 + package.json 中的命令 ────
if (!DRY_RUN) {
  // 从 package.json 移除 init:group 脚本
  const pkgPath = join(ROOT, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  delete pkg.scripts['init:group'];
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  // 删自身
  const self = fileURLToPath(import.meta.url);
  unlinkSync(self);
}
log(`🗑 self-removed: scripts/init-group.mjs (and package.json:scripts.init:group)`);

console.log(`\n✅ Done. Your group's wiki is initialized: "${NEW_NAME}"`);
console.log(`   Next:`);
console.log(`     1. pnpm dev → 看一下当前样子`);
console.log(`     2. 编辑 src/content/docs/members/pi.md 填 PI 信息`);
console.log(`     3. 复制 src/content/docs/themes/example-theme.md 为你的主线`);
console.log(`     4. pnpm new:member <你> --role=博士生 创建第一个成员`);
console.log(`     5. git commit -am "init: ${NEW_NAME} wiki"`);

/**
 * 清空一个目录里的 .md / .mdx 文件，但保留：
 *   - index.md / index.mdx（保留）
 *   - frontmatter 有 `exemplar: true` 的（作样板）
 *
 * 这样 R1 这类"组样板"内容会自动跨 init:group 保留，不需要 --keep-demo。
 */
function cleanDirHonorExemplar(relDir) {
  const dir = join(ROOT, relDir);
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (!name.isFile()) continue;
    if (!/\.(md|mdx)$/.test(name.name)) continue;
    if (/^index\.(md|mdx)$/.test(name.name)) continue;
    const p = join(dir, name.name);
    try {
      const fm = parseFrontmatter(p).frontmatter;
      if (fm.exemplar === true || fm.exemplar === 'true') {
        log(`🛡 kept ${relDir}/${name.name} (exemplar)`);
        continue;
      }
    } catch (e) {
      // ignore parse errors, treat as not exemplar
    }
    if (!DRY_RUN) unlinkSync(p);
    log(`🗑 removed ${relDir}/${name.name}`);
  }
}

function slugify(s) {
  return s.toLowerCase()
    .replace(/'/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
