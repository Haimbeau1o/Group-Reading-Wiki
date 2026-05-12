#!/usr/bin/env node
/**
 * pnpm new:member <slug> --role=<大导师|小导师|博士生|硕士生>
 *                       [--year=N]               # 博士 / 硕士：几年级
 *                       [--joined=YYYY-MM]       # 讲师 / postdoc：入职年月
 *                       [--display-name="..."]   # 人话名字（与 slug 不同）
 *                       [--title-label="..."]    # 身份显示（例：讲师 / 助理教授）
 *                       [--interest="..."]       # 一句话研究兴趣 (可多次)
 *                       [--cluster=...]          # 选填，依 role-model.md 决策树才写
 *                       [--theme=<theme-slug>]   # 他主推的主线，会生成跨链
 *                       [--json]
 *
 * 例：
 *   pnpm new:member alex-chen --role=小导师 --title-label=讲师 --joined=2023-03 \
 *                              --display-name="Chen Alex" --theme=reflective-alignment
 *   pnpm new:member zhangsan --role=博士生 --year=3
 *
 * 在 src/content/docs/members/<slug>.md 生成成员主页模板。
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: pnpm new:member <slug> --role=<大导师|小导师|博士生|硕士生> [--year=N | --joined=YYYY-MM] [--display-name="..."] [--title-label="..."] [--interest="..."] [--theme=<slug>] [--cluster=...] [--json]');
  process.exit(1);
}
const [slug, ...rest] = args;
// 收集多次 --interest
const interests = [];
const opts = {};
for (const s of rest) {
  if (!s.startsWith('--')) continue;
  const [k, ...v] = s.slice(2).split('=');
  const val = v.length ? v.join('=') : true;
  if (k === 'interest') interests.push(val);
  else opts[k] = val;
}
const role = opts.role || '博士生';
const year = opts.year || '';
const joined = opts.joined || '';
const displayName = opts['display-name'] || slug;
const titleLabel = opts['title-label'] || '';
const theme = opts.theme || '';
// cluster 默认不填（role-model.md：只有 user 明确 hint 时才写）
const cluster = opts.cluster || '';
const reviewer = opts.reviewer || '';
const today = new Date().toISOString().slice(0, 10);

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '..', 'src/content/docs/members', `${slug}.md`);

if (existsSync(outPath)) {
  console.error(`✗ ${outPath} already exists`);
  process.exit(1);
}
mkdirSync(dirname(outPath), { recursive: true });

// 智能 description
const descParts = [titleLabel || role];
if (year) descParts.push(`${year} 年级`);
else if (joined) descParts.push(`入职 ${joined}`);
const description = descParts.join(' · ');

// frontmatter 字段序
const lines = [
  '---',
  `title: ${displayName}`,
  `description: ${description}`,
  'sidebar:',
  `  label: ${displayName}`,
  `role: ${role}`,
];
if (titleLabel) lines.push(`title_label: ${titleLabel}`);
if (year) lines.push(`year: ${year}`);
if (joined) lines.push(`joined: ${joined}`);
if (cluster) lines.push(`cluster: ${cluster}`);
lines.push('status: active');
if (interests.length) {
  lines.push('research-interests:');
  for (const i of interests) lines.push(`  - ${i}`);
} else {
  lines.push('research-interests:');
  lines.push('  - 待填');
}
lines.push(`last_reviewed_at: "${today}"`);
lines.push(`reviewer: ${reviewer ? `"${reviewer}"` : '""'}`);
lines.push('---');
const frontmatter = lines.join('\n');

const themeBlock = theme
  ? `\n主推主线：【[${theme}](/themes/${theme}/)】\n`
  : '';

const content = `${frontmatter}

## 关于

> 📝 TODO：${displayName} 自己填一段。

## 研究兴趣 / 在做的项目
${themeBlock}
${interests.length ? `关键词：${interests.map(i => '「' + i + '」').join('、')}` : '> 📝 TODO'}

## Reading log

> 周会后的短评、读到一半的想法、踩过的坑都可以写在这里。**100 字也算一条**。

## 联系

- Email: > 📝 TODO
- GitHub: > 📝 TODO（没有就写“无”）
`;

writeFileSync(outPath, content);
if (opts.json) {
  process.stdout.write(JSON.stringify({
    ok: true, action: 'create', file: outPath,
    slug, displayName, role, titleLabel, year, joined, cluster,
    interests, theme,
  }) + '\n');
} else {
  console.log(`✓ Created ${outPath}`);
  console.log(`  记得也在 src/content/docs/members/index.mdx 加入相应分组。`);
  if (theme) console.log(`  记得也在 themes/${theme}.md 的 owner 段加 ${displayName} 的链接。`);
}
