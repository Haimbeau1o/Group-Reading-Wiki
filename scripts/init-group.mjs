#!/usr/bin/env node
/**
 * 用 GitHub Template 创建新仓库后，一键把 demo 重塑为你课题组的初始 wiki。
 *
 * 用法：
 *   pnpm init:group "Wang's NLP Group"
 *   pnpm init:group "Wang's NLP Group" --github=wang-lab/wang-nlp-wiki
 *   pnpm init:group "Wang's NLP Group" --github=wang-lab/wang-nlp-wiki \
 *                                      --site-url=https://wang-nlp.pages.dev
 *   pnpm init:group "Wang's NLP Group" --keep-demo      # 保留 DeepSeek 解读
 *   pnpm init:group "Wang's NLP Group" --keep-members   # 保留 15 成员占位
 *   pnpm init:group "Wang's NLP Group" --dry-run        # 仅打印，不动手
 *
 * --github=owner/repo  若未给：自动读 git remote origin；读不到用占位符
 * --site-url=URL        若未给：用占位 https://YOUR-SITE.pages.dev
 *
 * 这个脚本会：
 *   1. 把所有 "Leon's Group" / 原 GitHub URL / 原 site URL 替换为你的
 *   2. 清 astro.config.mjs 的 title / description / social / editLink /
 *      giscus 为你的或占位（giscus 需 pnpm setup:comments 后续填）
 *   3. 删除 15 成员占位（默认保留 leon.md → 重命名为 pi.md 模板）
 *   4. 清空 4 条 demo 主线，留一个 example-theme.md 模板
 *   5. 删除 sessions 示例（保留 exemplar 标记的）
 *   6. 默认删除 deepseek/ 全套（除非 --keep-demo）
 *   7. 重置 README 顶部为你的组名
 *   8. 自我删除（执行完删掉本脚本 + package.json 的 init:group 命令）
 *
 * 已经 init 过的项目不应再次运行。
 */
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync, renameSync, unlinkSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './lib/frontmatter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
const positional = args.filter(a => !a.startsWith('--'));
const flagsRaw = args.filter(a => a.startsWith('--'));
const flags = new Set(flagsRaw.filter(a => !a.includes('=')));
const kvFlags = Object.fromEntries(
  flagsRaw.filter(a => a.includes('='))
    .map(a => { const [k, ...v] = a.slice(2).split('='); return [k, v.join('=')]; })
);

if (positional.length < 1) {
  console.error('Usage: pnpm init:group "<Group Name>" [--github=owner/repo] [--site-url=URL] [--keep-demo] [--keep-members] [--dry-run]');
  process.exit(1);
}

const NEW_NAME = positional[0];
const KEEP_DEMO = flags.has('--keep-demo');
const KEEP_MEMBERS = flags.has('--keep-members');
const DRY_RUN = flags.has('--dry-run');

// ── GitHub 仓库与站点 URL：CLI > git remote > 占位符 ─────────
const GITHUB_REPO = kvFlags['github'] || detectGithubOriginRepo() || 'YOUR_GITHUB_OWNER/YOUR_REPO';
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
const SITE_URL = kvFlags['site-url'] || 'https://YOUR-SITE.pages.dev';
const USING_PLACEHOLDER_GITHUB = GITHUB_REPO === 'YOUR_GITHUB_OWNER/YOUR_REPO';
const USING_PLACEHOLDER_SITE = SITE_URL === 'https://YOUR-SITE.pages.dev';

function detectGithubOriginRepo() {
  try {
    const out = execSync('git remote get-url origin', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    // 匹配 https://github.com/owner/repo(.git) 或 git@github.com:owner/repo(.git)
    const m = out.match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?$/);
    if (m && m[1] !== 'Haimbeau1o') return `${m[1]}/${m[2]}`;
    return null;
  } catch { return null; }
}

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
console.log(`   github:      ${GITHUB_REPO}${USING_PLACEHOLDER_GITHUB ? '  (placeholder — edit later)' : ''}`);
console.log(`   site-url:    ${SITE_URL}${USING_PLACEHOLDER_SITE ? '  (placeholder — edit later)' : ''}`);
console.log(`   keep-demo: ${KEEP_DEMO}, keep-members: ${KEEP_MEMBERS}, dry-run: ${DRY_RUN}\n`);

// 1. 全局文本替换 ────────────────────────────────────
const NAME_REPLACEMENTS = [
  // 组名
  ["Leon's Group", NEW_NAME],
  ["leon-group-wiki", slugify(NEW_NAME) + '-wiki'],
  // 原 GitHub repo URL（所有形式）
  ['https://github.com/Haimbeau1o/Group-Reading-Wiki', GITHUB_URL],
  ['Haimbeau1o/Group-Reading-Wiki', GITHUB_REPO],
  // 原站点 URL
  ['https://group-reading-wiki.pages.dev', SITE_URL],
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

  // 5.5. 同步从 astro.config.mjs 删除 DeepSeek 专题 sidebar group
  //      否则 build 会崩（指向已删除的 slug）
  sanitizeAstroSidebar();

  // 5.6. 扫描保留页，去除 / 改写 demo-specific 链和段落
  //      这是 template-safe 的关键：让保留的 welcome/onboarding/roadmap 等
  //      不再谈 Leon's Group 的 DeepSeek 专题 / 具体主线 / 具体成员
  sanitizeDemoLinks();
}

// 5.7. 中和 giscus 配置（repoId / categoryId 是原模板 repo 的，用户必须重配）
//      保留结构但注释掉，让 setup:comments wizard（或用户手工）填入
sanitizeAstroGiscus();

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
> 基于 [group-wiki-template](https://github.com/Haimbeau1o/Group-Reading-Wiki) 构建。
> 想同步模板的最新改进？见 [\`docs/UPGRADING.md\`](docs/UPGRADING.md)。

## 本地开发

\`\`\`bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # 静态产物到 dist/
pnpm verify       # 校验 frontmatter / 链接，必须 0 warning
\`\`\`

## 脚手架

\`\`\`bash
pnpm new:session 2026-W19 paper-slug --lead=<member>
pnpm new:paper paper-slug --title="<Title>" --theme=<theme>
pnpm new:member <slug> --role=<大导师|小导师|博士生|硕士生>
\`\`\`

## 部署

推荐 Cloudflare Pages（0 服务器成本，全球 CDN）。部署步骤见 \`docs/UPGRADING.md\` 或模板原仓库 README 的"部署"小节。

## Agent 维护

想让 AI agent 帮你日常维护这个 wiki？先读 [\`.agent/MAINTAINER_PLAYBOOK.md\`](.agent/MAINTAINER_PLAYBOOK.md)。

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
console.log(`     1. pnpm verify → 应 0 error 0 warning`);
console.log(`     2. pnpm dev → 看一下当前样子（http://localhost:4321）`);
console.log(`     3. 编辑 src/content/docs/members/pi.md 填 PI 信息`);
console.log(`     4. 复制 src/content/docs/themes/example-theme.md 为你的主线`);
console.log(`     5. pnpm new:member <你> --role=博士生 创建第一个成员`);
console.log(`     6. git commit -am "init: ${NEW_NAME} wiki"`);

if (USING_PLACEHOLDER_GITHUB || USING_PLACEHOLDER_SITE) {
  console.log(`\n⚠️  检测到占位符，下面几处需要你手工改为真实值：`);
  if (USING_PLACEHOLDER_GITHUB) {
    console.log(`\n   GITHUB URL（当前=YOUR_GITHUB_OWNER/YOUR_REPO）：`);
    console.log(`     grep -r 'YOUR_GITHUB_OWNER/YOUR_REPO' src/ astro.config.mjs README.md`);
  }
  if (USING_PLACEHOLDER_SITE) {
    console.log(`\n   SITE URL（当前=YOUR-SITE.pages.dev）：`);
    console.log(`     astro.config.mjs 的 \`site\` 字段，决定 OG 标签和 canonical`);
  }
  console.log(`\n   或重跑：pnpm init:group "<Group>" --github=... --site-url=...`);
}
console.log(`\n📌 评论区（giscus）：默认已注释占位。想启用参见 docs/UPGRADING.md 的"评论区"段或 pnpm setup:comments（TODO）。`);
console.log(`📚 从模板升级骨架：docs/UPGRADING.md\n`);

/**
 * 中和 astro.config.mjs 的 giscus 块：把模板仓库的 repoId / categoryId 换成占位，
 * 并在上方加 TODO 注释，让用户清楚需要手工填。
 * 这样即使用户不部署，运行 build 也不会因 giscus 报错（插件设计对空 id 宽容）。
 */
function sanitizeAstroGiscus() {
  const p = join(ROOT, 'astro.config.mjs');
  if (!existsSync(p)) return;
  let content = readFileSync(p, 'utf-8');
  const before = content;

  // 把具体的 repoId / categoryId 换成占位（不匹配真实 repo，giscus 会静默失败）
  content = content.replace(/repoId:\s*'R_[^']+'/,    "repoId: 'REPLACE_ME_WITH_YOUR_REPO_ID'");
  content = content.replace(/categoryId:\s*'DIC_[^']+'/, "categoryId: 'REPLACE_ME_WITH_YOUR_CATEGORY_ID'");

  // 在 giscus({ 上方加 TODO 提示（如果还没加）
  if (!content.includes('TODO(setup:comments)')) {
    content = content.replace(
      /(\s+plugins:\s*\[\s*\n)(\s+)giscus\(\{/,
      `$1$2// TODO(setup:comments): 替换 repoId / categoryId 为你仓库的（详见 docs/UPGRADING.md）\n$2giscus({`
    );
  }

  if (content !== before) {
    if (!DRY_RUN) writeFileSync(p, content);
    log(`✏ sanitized astro.config.mjs (giscus repoId / categoryId placeholdered)`);
  }
}

/**
 * 从 astro.config.mjs 删除 DeepSeek 专题 sidebar group。
 * 匹配从 `{ label: '🐋 DeepSeek 专题',` 到该 group 的 `},` 结束。
 */
function sanitizeAstroSidebar() {
  const p = join(ROOT, 'astro.config.mjs');
  if (!existsSync(p)) return;
  let content = readFileSync(p, 'utf-8');
  const before = content.length;
  // 整个 DeepSeek 专题 group 的块（包括 items 数组）
  content = content.replace(
    /\s*\{\s*label:\s*'[🐋\s]*DeepSeek[^']*',\s*items:\s*\[[\s\S]*?\],\s*\},/,
    ''
  );
  if (content.length !== before) {
    if (!DRY_RUN) writeFileSync(p, content);
    log(`✏ sanitized astro.config.mjs (removed DeepSeek 专题 sidebar group)`);
  }
}

/**
 * 扫描保留的 .md / .mdx 文件，清洗 demo-specific 引用：
 *   1. 精准重写：welcome / pi / papers/index / roadmap 等 demo-heavy 页
 *   2. 正则去链兜底：剩余任何 [text](/deepseek/...) / [text](/themes/<demo>/) /
 *      [text](/members/<demo>/) / [text](/sessions/2026-w\d+-...) → 只保留 text
 * 这样 fork 用户默认拿到的站点 0 broken link，prose 上"你们组的真实内容"留空。
 */
function sanitizeDemoLinks() {
  // 需要精准重写的 demo-heavy 文件（整段换，不靠 regex）
  rewriteWelcomeMd();
  rewritePiMd();
  rewriteRoadmapMd();
  rewritePapersIndexMd();
  rewriteOnboardingMd();

  // 正则兜底：扫描所有保留的 .md / .mdx，把 demo-pattern 链接去掉
  const allFiles = walkFiles(
    join(ROOT, 'src/content/docs'),
    p => /\.(md|mdx)$/.test(p)
  );
  const DEMO_LINK_PATTERNS = [
    // [text](/deepseek/...) 或 (/en/deepseek/...)
    /\[([^\]]+)\]\(\/(?:en\/)?deepseek\/[^)]+\)/g,
    // [text](/themes/<demo-theme>/)
    /\[([^\]]+)\]\(\/themes\/(?:long-context|moe-sparsity|test-time-reasoning|multimodal)[^)]*\)/g,
    // [text](/members/<demo-member>/)
    /\[([^\]]+)\]\(\/members\/(?:leon|postdoc-\d|lecturer-\d|phd-senior-\d|phd-mid-\d|phd-new-\d|ms-research-\d|ms-eng-\d|ug-ra-\d)[^)]*\)/g,
    // [text](/sessions/2026-w\d+-xxx/)
    /\[([^\]]+)\]\(\/sessions\/\d{4}-w\d+[^)]*\)/g,
  ];
  // LinkCard/ Card JSX 里的 href="/deepseek/..." 属性（可能在 .mdx 里）
  const LINKCARD_PATTERNS = [
    /<LinkCard[^>]*href=["']\/(?:en\/)?deepseek\/[^"']*["'][^>]*\/>/g,
    /\s*href=["']\/(?:en\/)?deepseek\/[^"']*["']/g,
  ];

  for (const f of allFiles) {
    let content = readFileSync(f, 'utf-8');
    const before = content;
    for (const re of DEMO_LINK_PATTERNS) {
      content = content.replace(re, '$1');
    }
    for (const re of LINKCARD_PATTERNS) {
      content = content.replace(re, '');
    }
    if (content !== before && !DRY_RUN) {
      writeFileSync(f, content);
      log(`🧹 sanitized links in ${f.replace(ROOT + '/', '')}`);
    }
  }
}

function rewriteWelcomeMd() {
  const p = join(ROOT, 'src/content/docs/welcome.md');
  if (!existsSync(p)) return;
  let content = readFileSync(p, 'utf-8');

  // 替换 title "欢迎来到 Leon's Group 共读 Wiki" → 通用
  content = content.replace(
    /^title: 欢迎来到.*共读 Wiki$/m,
    `title: 欢迎来到 ${NEW_NAME} 共读 Wiki`
  );

  // 删除 demo-note 段（:::note[这是一个模板 demo] ... :::）
  content = content.replace(/:::note\[这是一个模板 demo\][\s\S]*?:::\n\n?/, '');

  // 替换"推荐阅读路径"整节（到下一个 ## 为止）
  content = content.replace(
    /## 推荐阅读路径\n[\s\S]*?(?=\n## |$)/,
    `## 推荐阅读路径

> 待补。本组还没有共读内容 —— 用 \`pnpm new:paper\` / \`pnpm new:session\` 创建第一篇，
> 然后回来这里推荐给新人。

`
  );

  // 最后一行 "准备好了？👉 去 [DeepSeek 专题](/deepseek/overview/) 开始第一次共读吧。"
  content = content.replace(
    /准备好了？[\s\S]*?第一次共读吧。?\s*$/,
    `准备好了？先看看 [研究主线](/themes/)，加入 [第一次共读](/sessions/)。`
  );

  if (!DRY_RUN) writeFileSync(p, content);
  log(`✏ rewrote welcome.md (stripped demo content)`);
}

function rewritePiMd() {
  // pi.md 由 init-group 从 leon.md 重命名而来（早先步骤已处理姓名）。
  // 这里进一步清洗其中的 demo 链。
  const p = join(ROOT, 'src/content/docs/members/pi.md');
  if (!existsSync(p)) return;
  let content = readFileSync(p, 'utf-8');

  // 替换 "当前主推方向" 段（到下一个 ##）
  content = content.replace(
    /## 当前主推方向\n[\s\S]*?(?=\n## )/,
    `## 当前主推方向

> 待 PI 填：列出你最关心的 2-3 条研究主线，用站内链接。
> 例：我目前最关心 **[主线 A](/themes/)** 和 **[主线 B](/themes/)**。

`
  );

  if (!DRY_RUN) writeFileSync(p, content);
  log(`✏ rewrote members/pi.md (stripped demo theme/member links)`);
}

function rewriteRoadmapMd() {
  const p = join(ROOT, 'src/content/docs/roadmap.md');
  if (!existsSync(p)) return;
  let content = readFileSync(p, 'utf-8');

  // 删除 "DeepSeek 专题（v0.1）" block（到下一个 ### 为止）
  content = content.replace(
    /### DeepSeek 专题（v0\.1）\n[\s\S]*?(?=\n### |\n## )/,
    ''
  );

  if (!DRY_RUN) writeFileSync(p, content);
  log(`✏ rewrote roadmap.md (removed DeepSeek demo block)`);
}

function rewritePapersIndexMd() {
  const p = join(ROOT, 'src/content/docs/papers/index.md');
  if (!existsSync(p)) return;
  const content = `---
title: 论文索引
description: 按时间线和主题整理的共读论文清单。
sidebar:
  order: 1
  label: 索引
---

> 📚 **滚动更新**。每篇 paper note 是"事实卡片"（一篇论文一页）；
> 跨多篇的叙事性深度专辑放在 \`/<topic>/\` 下（见 [STYLE_GUIDE](../../docs/STYLE_GUIDE.md)）。

## 已发表 paper notes

> 用 \`pnpm new:paper <slug>\` 创建。完成后列到这里。

| 时间 | 论文 | 状态 |
|------|------|------|
| — | — | — |

## 已提名 / 待读

> 通过 [GitHub Discussions](../..) 的 *"提名"* 模板收集。
`;
  if (!DRY_RUN) writeFileSync(p, content);
  log(`✏ rewrote papers/index.md`);
}

function rewriteOnboardingMd() {
  const p = join(ROOT, 'src/content/docs/onboarding.md');
  if (!existsSync(p)) return;
  let content = readFileSync(p, 'utf-8');

  // description 替换 Leon's Group → 通用
  content = content.replace(
    /description: 刚加入.*？跟着/,
    `description: 刚加入 ${NEW_NAME}？跟着`
  );

  // "看一遍上周的共读笔记" 一行替换
  content = content.replace(
    /\| 看一遍上周的 \[共读笔记\][^|]*\|[^|]*\|\n/,
    `| 看一遍近期 [共读 session](/sessions/)，对组里气氛有点感觉 | 30 分钟 |\n`
  );

  // "就读：1. xxx 2. yyy" 跟在 "例如想入门..." 后面的 demo 清单
  content = content.replace(
    /例如想入门长上下文，就读：\n\n1\. [\s\S]*?\n\n不感兴趣？没关系，\*\*默认从 V4 概览开始\*\*——它是所有方向的共同起点。\n/,
    `例如跟着你感兴趣的主线走 session 和 paper note。\n\n不知道从哪开始？先翻 [research 主线](/themes/) 挑一条最近的 [session](/sessions/)。\n`
  );

  // Reading log 示例里的 [V4 研究](/deepseek/...) → 泛化
  content = content.replace(
    /读了 \[V4 研究\]\(\/deepseek\/v4-research\/\)/,
    `读了 [某篇 paper note](/papers/)`
  );

  if (!DRY_RUN) writeFileSync(p, content);
  log(`✏ rewrote onboarding.md (stripped demo-specific examples)`);
}

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
