<div align="center">

# Group Reading Wiki

**A reusable, agent-native wiki template for AI / ML research labs.**

[![Astro](https://img.shields.io/badge/Astro-6.x-FF5D01?logo=astro&logoColor=white)](https://astro.build/)
[![Starlight](https://img.shields.io/badge/Starlight-0.38-blueviolet)](https://starlight.astro.build/)
[![License: MIT](https://img.shields.io/badge/Code-MIT-blue.svg)](LICENSE)
[![Content: CC BY-SA 4.0](https://img.shields.io/badge/Content-CC%20BY--SA%204.0-lightgrey.svg)](LICENSE)
[![Agent-native](https://img.shields.io/badge/Agent--native-✓-success)](AGENT_GUIDE.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**English** · [简体中文](README.md) · [Live Demo](#-live-demo) · [Quick Start](#-quick-start) · [Agent Guide](AGENT_GUIDE.md) · [Contributing](CONTRIBUTING.md)

</div>

---

## 🌟 What is this?

**Group Reading Wiki** is a reusable wiki template **purpose-built for AI / ML research labs**. It bundles weekly reading sessions, paper notes, research themes, onboarding, and group memory consolidation into a single Git-native product, with a unique twist:

- 🤖 **Agent-native** — long-term maintenance can be **handed entirely to AI agents** (Claude / Cursor / Cascade). Ships with 10 skills, 3 long-term context files, and machine-readable `verify` / `list` / scaffold CLIs.
- 🧬 **Use this template → one command to rebrand** — click the green **Use this template** button on GitHub, then `pnpm init:group "Your Group"` clears demo content and rebrands the entire site in 30 seconds.
- 📚 **Academic-writing friendly** — KaTeX math, Mermaid diagrams, cross-term hyperlinks, paper citation conventions, full-text search (with CJK support) — all out of the box.
- 🌐 **Public / Private layering** — themes and paper notes go public to attract collaborators; personal reading logs and internal playbooks stay behind Cloudflare Access.
- 🪶 **Static site, free hosting** — Astro + Cloudflare Pages, zero server cost, build artifact < 5MB.

> **This repo is itself a live demo** — it ships with a fictional lab **Leon's Group** to show what a real research-lab wiki looks like in production.

## 📖 Table of Contents

- [Core Features](#-core-features)
- [Live Demo](#-live-demo)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Agent-native Maintenance](#-agent-native-maintenance)
- [Product Modules](#-product-modules)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Design Philosophy](#-design-philosophy)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🗓️ **Three-stage Sessions** | Pre-read / Live notes / Post-meeting structure binds the weekly meeting cadence — the wiki is **not** a "post-meeting recap" but a full-cycle record |
| 🧭 **Research Themes** | A research map of your group; new members understand it in 30 minutes |
| 👥 **Two-layer Member Model** | Simplified roles (PI / co-advisor / PhD / MS) **+** behavioral clusters (5 types) for flexibility |
| 🎯 **Onboarding Timeline** | Day-1 / Week-1 / Month-1 / Month-3 staged paths, agent-customizable per-person |
| 📚 **Concept Dictionary + Paper Notes** | Cross-term auto-linking; paper notes have a built-in "our group's take" section |
| 🔧 **Scaffolding CLI** | `pnpm new:session/paper/member` to generate templates; supports `--json` for agents |
| 🤖 **10 Agent Skills** | From bootstrap, weekly session, post-meeting recap, to PR review — covers the full lifecycle |
| ✅ **Self-check Tooling** | `pnpm verify` checks frontmatter schema, links, and naming conventions in one go |
| 🌐 **i18n** | Chinese as primary language, English as equal citizen |

## 🎬 Live Demo

This repo currently ships **Leon's Group** (fictional) as a live example:

| Module | Entry | Content |
|--------|-------|---------|
| Themes | [`/themes/`](src/content/docs/themes/) | 4 (Long-context / MoE / Test-time Reasoning / Multimodal) |
| Members | [`/members/`](src/content/docs/members/) | 15 placeholders (PI + postdoc + lecturer + PhDs + MSes + RA) |
| Sessions | [`/sessions/`](src/content/docs/sessions/) | W18 full example |
| Paper notes | [`/deepseek/`](src/content/docs/deepseek/) | Full DeepSeek-V4 deep-dive series |
| Concept dictionary | [`/concepts/`](src/content/docs/concepts/) | 5 entries (MoE / MLA / MTP / FP8 / GRPO) |
| Onboarding | [`/onboarding/`](src/content/docs/onboarding.md) | Complete 4-stage timeline |

> 🔗 **[Visit live demo →](https://group-reading-wiki.pages.dev)**

Local preview:

```bash
git clone https://github.com/Haimbeau1o/Group-Reading-Wiki
cd Group-Reading-Wiki
pnpm install
pnpm dev          # → http://localhost:4321
```

## 🚀 Quick Start

### For lab leads adopting this template

```text
🌟 Click the green “Use this template” button at the top of this repo → Create a
   new repository. The created repo is your independent project — no upstream
   link to this template (by design; see docs/UPGRADING.md for syncing later).
```

```bash
# 1. Clone the new repo you just created
git clone https://github.com/<your-org>/<your-new-repo>
cd <your-new-repo>
pnpm install

# 2. One-shot rebrand (clears demo, rebrands, fills GitHub / site URL)
pnpm init:group "Your Group Name" \
  --github=<your-org>/<your-new-repo> \
  --site-url=https://your-site.pages.dev

# 3. Run it
pnpm dev          # → http://localhost:4321
pnpm verify       # must pass with 0 warnings

# 4. Commit your initial state
git commit -am "init: <Your Group> wiki"
```

Worried about missing template updates later? Read [docs/UPGRADING.md](docs/UPGRADING.md).

### For AI agents / maintainers

```bash
# Agent-friendly commands (all support --json)
pnpm verify                            # frontmatter / links / naming
pnpm list:members --json               # introspect repo state
pnpm list:sessions --since=7d --json
pnpm new:session 2026-W19 paper-slug --lead=phd-1 --json
```

See [**Agent Guide →**](AGENT_GUIDE.md).

## 🏗️ Architecture

```
Group-Reading-Wiki/
│
├── 📄 AGENT_GUIDE.md            ← Agent entry point (any AI reads this first)
├── 🤖 .agent/                   ← Agent long-term memory + skill library
│   ├── context/                 ← repo-map / role-model / conventions
│   ├── skills/                  ← 10 scenario-specific skills
│   └── templates/               ← raw templates (fallback)
│
├── 📚 src/content/docs/         ← Astro Starlight content (auto-becomes sidebar)
│   ├── index.mdx                ← Homepage + this-week banner
│   ├── themes/                  ← Research themes
│   ├── members/                 ← Member homepages
│   ├── sessions/                ← Three-stage weekly records
│   ├── papers/                  ← Paper deep-dives
│   ├── concepts/                ← Concept dictionary
│   ├── onboarding.md            ← Newcomer entry
│   └── how-to-contribute.md
│
├── 🔧 scripts/                  ← Agent-friendly toolchain
│   ├── new-session.mjs          ← scaffolding (supports --json)
│   ├── new-paper.mjs
│   ├── new-member.mjs
│   ├── init-group.mjs           ← one-shot rebrand (self-deletes after use)
│   ├── verify.mjs               ← schema + link + naming check
│   ├── list.mjs                 ← introspect tooling
│   └── lib/frontmatter.mjs      ← minimal YAML parser + schema validator
│
├── 🎨 src/styles/               ← Theming (Mermaid / KaTeX adaptation)
├── 🌍 src/i18n/                 ← Localized strings
├── ⚙️  astro.config.mjs         ← site / sidebar / comments / plugins
└── 📦 .github/                  ← CI workflow + Issue / PR templates
```

## 🤖 Agent-native Maintenance

> **Core idea**: 95% of long-term maintenance can be delegated to AI agents. **Humans** only need to set direction and make decisions.

### Entry points

```text
AGENT_GUIDE.md            ← Universal entry (every agent reads this first)
.agent/context/
  repo-map.md             ← Directory layout, naming, auto-sidebar rules
  role-model.md           ← Two-layer role model + frontmatter schema
  conventions.md          ← Writing style, link rules, commit messages
```

### 10 Skills covering the full lifecycle

| Skill | Trigger | File |
|-------|---------|------|
| `bootstrap-new-group` | "Initialize this template for our group X" | [`.agent/skills/bootstrap-new-group.md`](.agent/skills/bootstrap-new-group.md) |
| `weekly-session` | "Schedule next week's reading on paper X, lead by Y" | [skill →](.agent/skills/weekly-session.md) |
| `post-meeting-recap` | "Meeting just ended, organize the transcript" | [skill →](.agent/skills/post-meeting-recap.md) |
| `add-member` | "New member joining / graduating / leaving" | [skill →](.agent/skills/add-member.md) |
| `add-paper-note` | "I just read paper X, take notes" | [skill →](.agent/skills/add-paper-note.md) |
| `add-concept` | "Explain term X, add to dictionary" | [skill →](.agent/skills/add-concept.md) |
| `refresh-theme` | "Update theme X's paper list / open questions" | [skill →](.agent/skills/refresh-theme.md) |
| `personalized-onboarding` | "Customize reading path for new student" | [skill →](.agent/skills/personalized-onboarding.md) |
| `weekly-digest` | "Sunday wiki digest" | [skill →](.agent/skills/weekly-digest.md) |
| `review-pr` | "Review this PR" | [skill →](.agent/skills/review-pr.md) |

### Toolchain

```bash
# Self-check (CI must run)
pnpm verify                                    # schema + links + naming
pnpm verify:full                               # also runs build

# Introspect (agent calls before deciding)
pnpm list:members --json [--role=博士生]
pnpm list:themes --json
pnpm list:sessions --since=7d --json
pnpm list:papers --theme=long-context --json
pnpm list:concepts --json

# Scaffold (agent calls when creating)
pnpm new:session 2026-W19 paper-slug --lead=<member> --json
pnpm new:paper <slug> --title="..." --theme=<theme> --json
pnpm new:member <slug> --role=博士生 --year=3 --json
```

Each skill is self-contained and includes an explicit "**don't do**" list to prevent agent overreach (no auto-commit, no fabricating member opinions, no exposing internal content).

## 📦 Product Modules

<details>
<summary><b>🗓️ Sessions (Weekly Reading)</b></summary>

One reading session per week → one three-stage markdown:

- **Pre-read** (3 days before): required / optional readings, related concepts, guiding questions
- **Live notes** (during meeting): time-structured discussion record
- **Post-meeting** (within 24h): Key insights (most important!) + Action items + connections to group work

Template: [`.agent/templates/`](.agent/templates/) · Command: `pnpm new:session`
</details>

<details>
<summary><b>🧭 Themes (Research Lines)</b></summary>

Each theme is a node in your group's research map: owner, key external papers, our work, open questions, recommended reading path, our group's stance.

Template: [`.agent/templates/theme.md`](.agent/templates/theme.md)
</details>

<details>
<summary><b>👥 Members (Two-layer Model)</b></summary>

**Simplified model** (4 roles): PI / co-advisor / PhD / MS — aligned with formal positions
**Behavioral clusters** (5 types): Direction Setter / Project Lead / Learner / Task-Driven / Floating-Visitor — aligned with how people actually work

Each member has their own homepage + reading log + personalized onboarding path.
</details>

<details>
<summary><b>🎯 Onboarding</b></summary>

Universal timeline: [`onboarding.md`](src/content/docs/onboarding.md)
Personalized paths: written into each member's own homepage (use `personalized-onboarding` skill).
</details>

<details>
<summary><b>📚 Papers + Concepts</b></summary>

Paper notes: every paper must include an "our group's take" section (written by PI / lead).
Concept dictionary: abbreviation as slug, first occurrence of a term auto-links to the dictionary.
</details>

## 🚢 Deployment

### Recommended: Cloudflare Pages (free + auto-CI)

1. Cloudflare Dashboard → **Workers & Pages → Create → Connect to Git**
2. Choose your repo, build config:
   - Build command: `pnpm build`
   - Build output: `dist`
   - Env: `NODE_VERSION=20`
3. Auto-deploy on every push, preview URLs for every PR

> Free tier: 500 builds/month, unlimited bandwidth. More than enough for a wiki.

### Private content (Cloudflare Access)

Lock paths like `/internal/` `/members/<x>/` behind SSO via Cloudflare Access.

See [full deployment doc](src/content/docs/how-to-contribute.md).

### Alternatives: Vercel / Netlify / GitHub Pages

All compatible. GitHub Pages requires `base: '/<repo>/'` in `astro.config.mjs`.

## 🗺️ Roadmap

- [x] Foundation (Astro + Starlight + KaTeX + Mermaid + Pagefind)
- [x] 5 product modules (sessions / themes / members / onboarding / papers)
- [x] Agent-native layer (AGENT_GUIDE + 10 skills + verify/list)
- [x] Scaffolding CLI (new:* + init:group + --json mode)
- [ ] **Live demo deployment** to Cloudflare Pages
- [ ] **End-to-end agent validation** (W19 reading DeepSeek-R1)
- [ ] **CI workflow** runs `pnpm verify` to block bad PRs
- [ ] **Internal / Private layer** templates (playbook / admissions / reviews)
- [ ] **Reading log** structured aggregation (per-author feeds)
- [ ] **English content** full translation
- [ ] **More agent skills** (fix-broken-link / migrate-old-session / quarterly-review)

## 🎯 Design Philosophy

1. **Bind to the meeting cadence, not personal willpower** — Three-stage sessions are the central artifact
2. **Diverse contribution sizes** — 100-word reading log = one-line take = one comment = one dictionary entry → **all count**
3. **PI writing cost must be near-zero** — "Leon's takes" allows a single paragraph
4. **Personal pages are portfolios** — Reading logs naturally accrue into a graduation-ready record
5. **Onboarding maintained by learners** — PIs have forgotten the entry-point pain
6. **First draft, ugly, OK** — imperfect-and-shipped beats perfect-and-private
7. **Agent-friendly by design** — not bolt-on adapters; designed for human + agent co-maintenance from day one

## 🛠️ Tech Stack

- **[Astro 6](https://astro.build/)** + **[Starlight 0.38](https://starlight.astro.build/)** — static docs site
- **[KaTeX](https://katex.org/)** — math (build-time render)
- **[Mermaid](https://mermaid.js.org/)** — diagrams (lazy client-render)
- **[Pagefind](https://pagefind.app/)** — full-text search (CJK-friendly)
- **[Giscus](https://giscus.app/)** — GitHub Discussions comments
- **[Cloudflare Pages](https://pages.cloudflare.com/)** + **[Access](https://www.cloudflare.com/zero-trust/products/access/)** — hosting + auth

## 🤝 Contributing

Whether you're a research lab using the template, a developer improving it, or an AI agent — contributions welcome.

- Bug reports / usage questions: [New Issue](https://github.com/Haimbeau1o/Group-Reading-Wiki/issues/new/choose)
- Improving the template: please use a **traditional fork** (not "Use this template") and open a PR — see [CONTRIBUTING.md](CONTRIBUTING.md)
- Using it for your group: add "Based on [Group-Reading-Wiki](https://github.com/Haimbeau1o/Group-Reading-Wiki)" to your README so other groups can find it

## 📜 License

- **Code** (`scripts/`, `astro.config.mjs`, etc.): [MIT](LICENSE)
- **Content** (markdown under `src/content/docs/`): [CC BY-SA 4.0](LICENSE)

## 🌟 Star History

If this template helped you, please ⭐ to help more research labs discover it.

---

<div align="center">

**Group Reading Wiki** · Built with ❤️ for AI research labs · Powered by [Astro Starlight](https://starlight.astro.build/)

[Top ↑](#group-reading-wiki) · [Agent Guide](AGENT_GUIDE.md) · [简体中文](README.md)

</div>
