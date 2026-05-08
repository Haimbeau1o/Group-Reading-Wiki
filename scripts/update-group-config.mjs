#!/usr/bin/env node
/**
 * pnpm update:group-config [flags] [--json]
 *
 * 原子修改 group.config.yaml 字段，保留注释 + 格式（不依赖 YAML lib）。
 *
 * 主要给 agent 用，避免手改 yaml 时引号 / 缩进出错。
 *
 * Flags:
 *   --stage=<initialized|established>
 *
 *   --group-name="<name>"        # group.name
 *   --group-slug=<slug>          # group.slug
 *   --group-github=<owner/repo>  # group.github
 *   --site-url=<url>             # group.site_url
 *
 *   --pi-name="<name>"           # pi.name
 *   --pi-github=<gh-username>    # pi.github
 *   --pi-email=<email>           # pi.email
 *   --pi-homepage=<url>          # pi.homepage
 *
 *   --themes-count=<N>           # content.themes_count
 *   --members-count=<N>          # content.members_count
 *   --papers-count=<N>           # content.papers_count
 *   --last-session=<2026-Wxx>    # content.last_session（传 'null' 清空）
 *
 *   --deploy-on=cloudflare       # deploy.cloudflare_pages = true
 *   --deploy-off                 # deploy.cloudflare_pages = false
 *   --giscus-on                  # deploy.giscus_enabled = true
 *   --giscus-off                 # deploy.giscus_enabled = false
 *
 *   --baseline-commit=<sha>      # template.baseline_commit
 *   --last-synced=<YYYY-MM-DD>   # template.last_synced
 *
 *   --json                       # JSON 输出（含每字段 status）
 *   --dry-run                    # 不写盘，仅 diff
 *
 * Examples:
 *   pnpm update:group-config --stage=established
 *   pnpm update:group-config --site-url=https://wang-nlp.pages.dev --deploy-on=cloudflare
 *   pnpm update:group-config --giscus-on --papers-count=3
 *   pnpm update:group-config --last-session=2026-W09 --json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── parse args ─────────────────────────────────────────
const args = process.argv.slice(2);
const opts = {};
for (const a of args) {
  if (!a.startsWith('--')) continue;
  const [k, ...v] = a.slice(2).split('=');
  opts[k] = v.length ? v.join('=') : true;
}
const isJson = !!opts.json;
const dryRun = !!opts['dry-run'];

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = resolve(__dirname, '..', 'group.config.yaml');

let yaml;
try {
  yaml = readFileSync(path, 'utf8');
} catch (e) {
  const msg = `group.config.yaml not found at ${path}. Did you run pnpm init:group?`;
  if (isJson) process.stdout.write(JSON.stringify({ ok: false, error: msg }) + '\n');
  else console.error(`✗ ${msg}`);
  process.exit(1);
}

// ─── helpers ────────────────────────────────────────────

// quote a string for YAML (numbers / booleans / null pass through)
function yamlVal(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return String(v);
  if (typeof v === 'number') return String(v);
  if (typeof v !== 'string') return String(v);
  // booleans / null literal as string
  if (/^(true|false|null)$/i.test(v)) return v.toLowerCase();
  // integer literal
  if (/^-?\d+$/.test(v)) return v;
  // bare-safe identifier
  if (/^[a-zA-Z0-9._\-+/:]+$/.test(v) && !/^[-:]/.test(v)) {
    // URL with colon needs quoting in YAML
    if (v.includes(':')) return `"${v}"`;
    return v;
  }
  // anything else → double-quote with escapes
  return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

// Replace value on a line; preserve `<indent>key: ` prefix + trailing `   # comment`.
function replaceVal(line, newVal) {
  // Match: ^(<prefix-up-to-and-incl-colon-and-spaces>)(value)(opt-trailing-spaces+comment)$
  // Value can be quoted, single token, list value, or empty.
  const m = line.match(/^(\s*[\w-]+:\s*)(\S(?:.*?\S)?|)(\s+#.*)?\s*$/);
  if (!m) return line;
  const prefix = m[1];
  const oldVal = m[2];
  const trailing = m[3] || '';
  // If the line has a comment but no value, oldVal is '' and trailing has the comment.
  // Insert value with at least 1 space before comment.
  const spacing = trailing ? (oldVal ? '' : '   ') : '';
  return `${prefix}${newVal}${spacing}${trailing}`;
}

const changes = [];

/**
 * Update <section>.<key> if section/key exists.
 * If `section` is null, treat key as top-level.
 */
function updateField(section, key, newValue, label) {
  const lines = yaml.split('\n');
  if (!section) {
    // top-level
    const reTop = new RegExp(`^${key}:`);
    for (let i = 0; i < lines.length; i++) {
      if (reTop.test(lines[i])) {
        const before = lines[i];
        lines[i] = replaceVal(before, yamlVal(newValue));
        if (before === lines[i]) {
          changes.push({ field: label, status: 'unchanged' });
        } else {
          changes.push({ field: label, status: 'updated', from: before.trim(), to: lines[i].trim() });
        }
        yaml = lines.join('\n');
        return;
      }
    }
    changes.push({ field: label, status: 'not-found' });
    return;
  }

  // nested: find section header (top-level), then walk indented lines
  const reSec = new RegExp(`^${section}:\\s*$`);
  let inSec = false;
  for (let i = 0; i < lines.length; i++) {
    if (!inSec) {
      if (reSec.test(lines[i])) inSec = true;
      continue;
    }
    // Out of section: top-level key (no leading whitespace, alpha char start)
    if (/^[a-zA-Z]/.test(lines[i])) break;
    // Match indented key
    const reKey = new RegExp(`^(\\s+)${key}:`);
    if (reKey.test(lines[i])) {
      const before = lines[i];
      lines[i] = replaceVal(before, yamlVal(newValue));
      if (before === lines[i]) {
        changes.push({ field: label, status: 'unchanged' });
      } else {
        changes.push({ field: label, status: 'updated', from: before.trim(), to: lines[i].trim() });
      }
      yaml = lines.join('\n');
      return;
    }
  }
  changes.push({ field: label, status: 'not-found' });
}

// ─── apply flags ────────────────────────────────────────

// stage
if (opts.stage) {
  if (!/^(template|initialized|established)$/.test(opts.stage)) {
    const err = `invalid --stage=${opts.stage} (must be: template | initialized | established)`;
    if (isJson) process.stdout.write(JSON.stringify({ ok: false, error: err }) + '\n');
    else console.error(`✗ ${err}`);
    process.exit(1);
  }
  updateField(null, 'stage', opts.stage, 'stage');
}

// group.*
if (opts['group-name']) updateField('group', 'name', opts['group-name'], 'group.name');
if (opts['group-slug']) updateField('group', 'slug', opts['group-slug'], 'group.slug');
if (opts['group-github']) updateField('group', 'github', opts['group-github'], 'group.github');
if (opts['site-url']) updateField('group', 'site_url', opts['site-url'], 'group.site_url');

// pi.*
if (opts['pi-name']) updateField('pi', 'name', opts['pi-name'], 'pi.name');
if (opts['pi-github'] !== undefined) updateField('pi', 'github', opts['pi-github'] === true ? '' : opts['pi-github'], 'pi.github');
if (opts['pi-email']) updateField('pi', 'email', opts['pi-email'], 'pi.email');
if (opts['pi-homepage'] !== undefined) updateField('pi', 'homepage', opts['pi-homepage'] === true ? '' : opts['pi-homepage'], 'pi.homepage');

// content.*
if (opts['themes-count']) updateField('content', 'themes_count', Number(opts['themes-count']), 'content.themes_count');
if (opts['members-count']) updateField('content', 'members_count', Number(opts['members-count']), 'content.members_count');
if (opts['papers-count']) updateField('content', 'papers_count', Number(opts['papers-count']), 'content.papers_count');
if (opts['last-session']) {
  const v = opts['last-session'] === 'null' ? null : opts['last-session'];
  updateField('content', 'last_session', v, 'content.last_session');
}

// deploy.*
if (opts['deploy-on'] === 'cloudflare') updateField('deploy', 'cloudflare_pages', true, 'deploy.cloudflare_pages');
if (opts['deploy-off']) updateField('deploy', 'cloudflare_pages', false, 'deploy.cloudflare_pages');
if (opts['giscus-on']) updateField('deploy', 'giscus_enabled', true, 'deploy.giscus_enabled');
if (opts['giscus-off']) updateField('deploy', 'giscus_enabled', false, 'deploy.giscus_enabled');

// template.*
if (opts['baseline-commit']) updateField('template', 'baseline_commit', opts['baseline-commit'], 'template.baseline_commit');
if (opts['last-synced']) updateField('template', 'last_synced', opts['last-synced'], 'template.last_synced');

// ─── output / write ─────────────────────────────────────

const anyChange = changes.some((c) => c.status === 'updated');
const anyMissing = changes.some((c) => c.status === 'not-found');

if (changes.length === 0) {
  const msg = '没传任何字段。用 --help 看支持的 flag（例 --stage / --site-url / --giscus-on）。';
  if (isJson) process.stdout.write(JSON.stringify({ ok: false, error: msg }) + '\n');
  else console.error(msg);
  process.exit(1);
}

if (!dryRun && anyChange) {
  writeFileSync(path, yaml);
}

if (isJson) {
  process.stdout.write(JSON.stringify({
    ok: !anyMissing,
    file: path,
    written: !dryRun && anyChange,
    dry_run: dryRun,
    changes,
  }) + '\n');
} else {
  console.log(`📋 ${dryRun ? '[dry-run] ' : ''}group.config.yaml`);
  for (const c of changes) {
    if (c.status === 'updated') {
      console.log(`  ✓ ${c.field}`);
      console.log(`      - ${c.from}`);
      console.log(`      + ${c.to}`);
    } else if (c.status === 'unchanged') {
      console.log(`  · ${c.field} (unchanged)`);
    } else {
      console.log(`  ✗ ${c.field} (not found in yaml — schema missing or typo?)`);
    }
  }
  if (dryRun) console.log('\n  (dry-run; nothing written)');
  else if (anyChange) console.log(`\n  written ${path}`);
}

process.exit(anyMissing ? 1 : 0);
