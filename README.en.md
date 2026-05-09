<div align="center">

# Group Reading Wiki

**A reusable, agent-native wiki template for AI / ML research labs.**
可复用、agent 原生的课题组共读 Wiki 模板。

[![Astro](https://img.shields.io/badge/Astro-6.x-FF5D01?logo=astro&logoColor=white)](https://astro.build/)
[![Starlight](https://img.shields.io/badge/Starlight-0.38-blueviolet)](https://starlight.astro.build/)
[![Code: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--SA%204.0-lightgrey.svg)](LICENSE)
[![Agent-native](https://img.shields.io/badge/Agent--native-✓-success)](AGENT_GUIDE.md)

[**Live Demo**](https://group-reading-wiki.pages.dev) · [Quick Start](#-quick-start) · [Agent Guide](AGENT_GUIDE.md) · [简体中文](README.md)

</div>

---

## What problem does it solve

Your lab meets weekly to read papers, but:

- Notes live in some student's local markdown — nobody opens them after the meeting
- New PhDs ask their senior for a "must-read paper list" — every cohort redoes the work
- A key insight from last semester? Nobody remembers who first raised it
- The PI writes a research opinion across Notion / Slack / WeChat — fragmented
- Members read papers individually, but the lab has no idea what each other thinks

**Group Reading Wiki** consolidates weekly sessions / paper notes / research themes / member pages / concept glossary into a single git-native static site, and **hands 95% of the maintenance work to AI agents** (Claude / Cursor / Cascade etc.). The PI only has to set direction and review takes.

---

## 30-second walkthrough

```text
1. Click the green [Use this template] button on GitHub to create your repo

2. Clone it locally and run:
     pnpm install
     pnpm init:group "Your Group Name" \
       --github=<your-org>/<your-repo> \
       --site-url=https://your-site.pages.dev

3. Open Claude / Cursor / Cascade and tell it:
     "Read .agent/BOOTSTRAP.md and help me fill in the wiki"
   → agent automatically invokes the first-week-after-init skill
   → 5 conversational loops (PI page / theme / members / first paper / deploy)

4. push → Cloudflare Pages auto-deploys → live
```

Total time: ~2 hours from empty scaffold to a live wiki. The PI just answers questions; agent writes every file.

---

## 🎬 Live Demo

This repo's current content = a fictional lab **Leon's Group** (focused on the DeepSeek model series) running as a live wiki:

> 🔗 **<https://group-reading-wiki.pages.dev>**

| Module | Entry | Content |
|--------|-------|---------|
| Research themes | [`/themes/`](src/content/docs/themes/) | 4 (long-context / MoE / Test-time Reasoning / multimodal) |
| Members | [`/members/`](src/content/docs/members/) | 15 placeholders (PI + postdoc + PhDs across years + master + RA) |
| Reading sessions | [`/sessions/`](src/content/docs/sessions/) | W18 / W19 full three-section + W18 weekly digest |
| Paper notes | [`/papers/`](src/content/docs/papers/) | DeepSeek-R1 PI-grade write-up (exemplar, kept across `init`) |
| Deep dives | [`/deepseek/`](src/content/docs/deepseek/) | DeepSeek-V4 long-context + hybrid attention + visual stack |
| Concept glossary | [`/concepts/`](src/content/docs/concepts/) | 5 (MoE / MLA / MTP / FP8 / GRPO) |
| New-member entry | [`/onboarding/`](src/content/docs/onboarding.md) | Day-1 / first week / first month / 3 months |

> When you run `pnpm init:group`, all of Leon's Group demo content is **automatically wiped**, leaving only the generic skeleton + 1 exemplar paper note.

Local preview:

```bash
git clone https://github.com/Haimbeau1o/Group-Reading-Wiki
cd Group-Reading-Wiki
pnpm install
pnpm dev          # → http://localhost:4321
```

---

## 🚀 Quick Start

### Path A · I'm a PI, I want to set up my lab's wiki

Recommended: let the agent take over.

```bash
# 1. Click [Use this template] → clone your new repo
git clone https://github.com/<your-org>/<your-new-repo>
cd <your-new-repo>
pnpm install

# 2. One-shot rebrand (clears demo + replaces brand + writes group.config.yaml)
pnpm init:group "Your Group" \
  --github=<your-org>/<your-new-repo> \
  --site-url=https://your-site.pages.dev

# 3. Hand off to your IDE assistant
#    "Read .agent/BOOTSTRAP.md and help me fill in the wiki"
#    It will run the 5 conversational loops of first-week-after-init

# 4. Verify + commit
pnpm verify        # must be 0 warnings
git commit -am "init: <Your Group> wiki"

# 5. Deploy to Cloudflare Pages (10 minutes — see §Deployment)
```

To pull future improvements from the template, see [`docs/UPGRADING.md`](docs/UPGRADING.md) or invoke the `upgrade-template` skill.

### Path B · I want to contribute to the template / study the agent-native design

```bash
# Don't click Use this template — use a traditional fork to send PRs upstream
git clone https://github.com/<your-fork>/Group-Reading-Wiki
cd Group-Reading-Wiki
pnpm install
pnpm dev                    # run the demo
ls .agent/skills/           # 14 scenario skills are the core
cat AGENT_GUIDE.md          # the design entry doc
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## 🎯 What it does / What it doesn't

### ✅ It does

- **Structured consolidation**: 15 agent skills cover sessions, papers, concepts, members, themes, digest, PR review, template upgrade, find-related-context
- **Knowledge graph (cycle-8+)**: write explicit relations in frontmatter (`concept_refs` / `related_papers` / `theme_refs` ...); build step generates `src/generated/knowledge-graph.json`; every page footer auto-renders **Backlinks** / **ThemePages** / **MemberActivity** — no manual reverse-link maintenance
- **Scaffold + self-check**: `pnpm new:session/paper/member/theme/concept` produce templates in one line (with knowledge-graph flags `--concept-refs` / `--related-papers` / `--aliases` / `--co-owners`); `pnpm verify` checks schema/links/naming/dead-slug/cycles
- **State-machine driven**: `group.config.yaml` is the agent's source of truth; the `stage` field (template → initialized → established) decides which skill to invoke
- **Cold-start friendly**: `pnpm init:group` clears demo, rebrands, and writes config in 30s
- **Public / private layering**: themes and paper notes go public to attract collaborators; personal reading logs / internal playbooks stay behind Cloudflare Access
- **Academic writing**: KaTeX, Mermaid, cross-term hyperlinks, full-text search (Pagefind, with CJK)

### ❌ It does not

- **Won't make research judgments for you** — the "our group's take" section must be written by the PI / session lead; the agent only drafts factual content
- **Won't auto-commit / push** — every skill ends by showing you a `git diff` for your decision
- **Won't write paper-note content for you** — agent fetches arXiv metadata + drafts the skeleton + tags agent-draft sections with a caution banner; the body and take are yours
- **Doesn't replace the meeting itself** — the wiki is the **deposit** of weekly meetings; the meetings still happen
- **Doesn't auto-translate to English** — i18n leaves TODOs for human translation; machine translation isn't good enough

---

## 🤖 How agent-native works

### 1. Source of truth: `group.config.yaml`

Written by `pnpm init:group`. The agent reads this file **first** when entering the repo to figure out current state:

```yaml
stage: initialized          # template | initialized | established
group:
  name: "Your Group"
  github: "your-org/your-repo"
  site_url: "https://..."
pi:
  name: ""                  # filled by first-week-after-init loop 1
  github: ""
content:
  themes_count: 0
  members_count: 1
  papers_count: 1
template:
  baseline_commit: ""       # maintained by upgrade-template
  last_synced: ""
```

Don't edit `stage` by hand — skills write it after key milestones. For other fields use `pnpm update:group-config` (atomic, preserves yaml comments).

### 2. First-week orchestration: 5 conversational loops

The `first-week-after-init` skill splits "from empty scaffold to live site" into 5 independent, interruptible loops:

| Loop | Topic | Time | Done when |
|------|-------|------|-----------|
| 1 | PI page | ~15 min | `members/pi.md` is real, `pi.*` fields filled |
| 2 | First research theme | ~20 min | `themes/<slug>.md` is one real theme |
| 3 | Core members (PI + 1-2 students) | ~30 min | `members/` has ≥ 2 real members |
| 4 | First paper note | ~45 min | `papers/<slug>.md` contains "our group's take" |
| 5 | Deploy + Giscus | ~30 min | site live, `stage: established` |

Between loops the PI can pause anytime. The agent re-enters by `cat group.config.yaml` to see progress.

### 3. 14 scenario skills

Grouped by usage frequency. Each skill is self-contained with a "must not do" list.

**Onboarding**

| Skill | Trigger |
|-------|---------|
| [`bootstrap-new-group`](.agent/skills/bootstrap-new-group.md) | "Initialize the template for X group" |
| [`first-week-after-init`](.agent/skills/first-week-after-init.md) | init done — 5 loops take over |
| [`personalized-onboarding`](.agent/skills/personalized-onboarding.md) | Tailor a reading path for new student |
| [`add-member`](.agent/skills/add-member.md) | New / graduating / alumni member |

**Weekly cycle**

| Skill | Trigger |
|-------|---------|
| [`weekly-session`](.agent/skills/weekly-session.md) | Plan next-week's reading |
| [`post-meeting-recap`](.agent/skills/post-meeting-recap.md) | Meeting just ended, organize transcript |
| [`weekly-digest`](.agent/skills/weekly-digest.md) | Sunday wiki digest |
| [`refresh-theme`](.agent/skills/refresh-theme.md) | Update a theme's papers / open questions |

**Content growth**

| Skill | Trigger |
|-------|---------|
| [`add-paper-note`](.agent/skills/add-paper-note.md) | I finished reading paper X, write notes |
| [`add-concept`](.agent/skills/add-concept.md) | Explain term X, add to glossary |
| [`find-related-context`](.agent/skills/find-related-context.md) | Before writing, ask the knowledge graph "what does the group already have on X" |
| [`setup-deploy`](.agent/skills/setup-deploy.md) | Go live on Cloudflare Pages |

**Governance**

| Skill | Trigger |
|-------|---------|
| [`setup-comments`](.agent/skills/setup-comments.md) | Enable Giscus comments |
| [`review-pr`](.agent/skills/review-pr.md) | Review this PR |
| [`upgrade-template`](.agent/skills/upgrade-template.md) | Sync upstream template improvements |

### 4. Tooling

```bash
# Self-check (CI must run)
pnpm verify                                    # schema + links + naming + slug_refs + concept cycles (fast)
pnpm verify:full                               # adds pnpm build (must run before merge)

# Knowledge graph (cycle-8+, run context:for before drafting new content)
pnpm build:index                                       # writes src/generated/knowledge-graph.json
pnpm context:for concepts/grpo [--depth=2] [--json]    # N-hop neighbors of any node

# Introspection (agent calls before deciding)
pnpm list:members --json [--role=博士生]
pnpm list:sessions --since=7d --source=git --status=A --json
pnpm list:papers --theme=long-context --json

# Scaffolding (agent calls when creating)
pnpm new:session 2026-W19 paper-slug --lead=<member> --json
pnpm new:paper <slug> --title="..." --theme=<theme> --json
pnpm new:member <slug> --role=博士生 --year=3 --json
pnpm new:theme "<name>" --slug=<slug> --json
pnpm new:concept <slug> --full="..." --label="..." --json

# Atomic edits to group.config.yaml (preserves comments — don't hand-edit)
pnpm update:group-config --site-url=... --giscus-repo-id=... --baseline-commit=...
```

> ⚠ `list:* --since=Nd` filters by file mtime by default, **which gets clobbered by `init` / `git checkout`**. For digest / incremental flows always pass `--source=git` to filter by git history instead.

---

## 🏗️ Architecture

```
Group-Reading-Wiki/
│
├── AGENT_GUIDE.md            ← Agent entry (every AI reads this first)
├── group.config.yaml         ← Agent source of truth (generated by init)
│
├── .agent/                   ← Agent long-term memory + skill library
│   ├── BOOTSTRAP.md          ← stage state-machine entry
│   ├── context/              ← repo-map / role-model / conventions
│   ├── skills/               ← 14 scenario skills
│   └── templates/            ← raw template backups
│
├── src/content/docs/         ← Astro Starlight content (auto sidebar)
│   ├── themes/ members/ sessions/ papers/ concepts/
│   ├── onboarding.md  welcome.md  roadmap.md
│   └── en/                   ← English mirror (i18n)
│
├── scripts/                  ← Agent-friendly tooling (each supports --json)
│   ├── init-group.mjs        ← One-shot rebrand after Use-template (incl. demo cleanup)
│   ├── verify.mjs            ← schema + link + naming self-check
│   ├── list.mjs              ← introspection (incl. --source=git mode)
│   ├── new-{session,paper,member,theme,concept}.mjs
│   ├── update-group-config.mjs ← atomic yaml edits (preserves comments)
│   └── smoke-test-fork.mjs   ← cold-start E2E
│
├── docs/                     ← Maintenance docs (UPGRADING / STYLE_GUIDE / MAINTAINER_PLAYBOOK)
└── .github/workflows/        ← CI (verify on PR)
```

Details: [`.agent/context/repo-map.md`](.agent/context/repo-map.md)

---

## 🚢 Deployment

### Recommended: Cloudflare Pages (free + auto CI)

1. Cloudflare Dashboard → **Workers & Pages → Create → Connect to Git → choose your repo**
2. Build settings:
   - Framework preset: `Astro`
   - ⚠ **Manually override** the build command to `pnpm build` (the preset's default `npx astro build` is brittle in monorepos)
   - Build output: `dist`
   - Env: `NODE_VERSION=22.12`
3. ⚠ If your repo is under a **GitHub organization**: first authorize Cloudflare Pages at **org settings → Third-party access → Cloudflare Pages**, otherwise the OAuth flow stalls
4. After deploy succeeds, write back:
   ```bash
   pnpm update:group-config --deploy-url=https://<your-sub>.pages.dev
   ```

Every push auto-deploys; PRs get isolated preview URLs. Free tier: 500 builds/month + unlimited bandwidth — more than enough for a wiki.

### Giscus comments (optional)

1. Install the [Giscus GitHub App](https://github.com/apps/giscus) on your repo
2. Repo Settings → General → Features → **Discussions ON**
3. Configure at [giscus.app](https://giscus.app/), copy the 2 runtime IDs (`data-repo-id` and `data-category-id`)
4. Write back:
   ```bash
   pnpm update:group-config \
     --giscus-repo-id=R_kg... \
     --giscus-category-id=DIC_kw...
   ```

See [`setup-deploy`](.agent/skills/setup-deploy.md) / [`setup-comments`](.agent/skills/setup-comments.md).

### Private content (Cloudflare Access)

Lock paths like `/internal/`, `/members/<x>/` behind Cloudflare Access SSO. Free tier is sufficient.

### Alternative: Vercel / Netlify / GitHub Pages

All compatible. GitHub Pages requires `base: '/<repo>/'` in `astro.config.mjs`.

---

## 💡 Tips

- **Imperfect-but-published > polished-but-private** — TODO / placeholder sections don't fail `verify`; agent-drafted sections are tagged with a caution banner for the PI to review later
- **Keep PI writing cost minimal** — "PI's take" sections accept a single paragraph; let the agent draft, the PI tweaks two sentences
- **Use Discussions for low-cost contributions** — no need to open a PR for every change; a single sentence in comments counts

---

## 🛠️ Tech stack

- **[Astro 6](https://astro.build/)** + **[Starlight 0.38](https://starlight.astro.build/)** — static documentation site
- **[KaTeX](https://katex.org/)** — math rendering (build-time)
- **[Mermaid](https://mermaid.js.org/)** — diagrams (lazy client-side)
- **[Pagefind](https://pagefind.app/)** — full-text search (with CJK)
- **[Giscus](https://giscus.app/)** — GitHub Discussions comments
- **[Cloudflare Pages](https://pages.cloudflare.com/)** + **[Access](https://www.cloudflare.com/zero-trust/products/access/)** — hosting + auth
- Node 22.12+ · pnpm 10.x

---

## 🤝 Contributing

- **Labs using the template** — add a line `Based on [Group-Reading-Wiki](https://github.com/Haimbeau1o/Group-Reading-Wiki)` to your README so others can find it
- **Developers improving the template** — use a **traditional fork** (not Use-this-template!) and open a PR; see [`CONTRIBUTING.md`](CONTRIBUTING.md)

Bug reports: [New Issue](https://github.com/Haimbeau1o/Group-Reading-Wiki/issues/new/choose)

---

## 📜 License

- **Code** (`scripts/`, `astro.config.mjs`, `.agent/skills/`, etc.): [MIT](LICENSE)
- **Content** (markdown under `src/content/docs/`): [CC BY-SA 4.0](LICENSE)

---

<div align="center">

**Group Reading Wiki** · Built for AI research labs · Powered by [Astro Starlight](https://starlight.astro.build/)

[Top ↑](#group-reading-wiki) · [Agent Guide](AGENT_GUIDE.md) · [简体中文](README.md)

</div>
