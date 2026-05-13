---
debt_id: D02
status: pending
estimated_minutes: 45
depends_on: []
branch: phase-1-debt/D02-add-audit-touchpoints
files_touched:
  - scripts/audit-touchpoints.mjs
  - package.json
verification_commands:
  - pnpm verify
  - "pnpm audit:touchpoints"
  - "pnpm audit:touchpoints --json"
---

# D02 · 加 `scripts/audit-touchpoints.mjs` helper

## Context

cycle-10 phase 1 `00-current-state-audit.md` §2 列出"添加新 content 类型"的 15 个 touch point，但漏了：
1. `scripts/context-for.mjs`（prefixMap / 正则 / TYPE_LABEL）—— T01-8 临时补救
2. `scripts/init-group.mjs` `sanitizeKeptExemplarRefs()` + `existingSlugs` map —— PR #3 smoke test failure 后 T01-7b 补救

`cycle-10-phase1-report.md` §🔮 第 9 条已记 "**Phase 2 audit 必须 grep 全部 `scripts/*.mjs` 看 type 硬编码**"。本 task 把这一手工 grep **自动化**。

## Exact Diff Intent

### 改 1：新建 `scripts/audit-touchpoints.mjs`（~120 行）

**用途**：扫描 `scripts/**/*.mjs`，找硬编码 type 列表的位置，给"添加新 content 类型时该改哪些行"提供 audit 报告。

**命令签名**：

```
pnpm audit:touchpoints
  [--type=<type>]    # 检查某个特定类型是否注册到位（如 --type=faq 检查 cycle-10 的 faq）
  [--json]
  [--quiet]
```

**输出**（人类可读）：

```
📋 touchpoints audit · 2026-05-13

Found 11 hardcoded type-list locations:

scripts/build-index.mjs:
  L34  URL_PREFIX = { paper, concept, theme, member, session, faq }
  L48  TYPES = ['papers', 'concepts', 'themes', 'members', 'sessions', 'faq']
  L360 stats = { papers, concepts, themes, members, sessions, faq }

scripts/verify.mjs:
  L52  slugsByType = { paper, concept, theme, member, session, faq }
  L118 replace(/^(papers|concepts|themes|members|sessions|faq)\//, ...)

scripts/list.mjs:
  L36  whitelist = ['members', 'themes', 'sessions', 'papers', 'concepts', 'faq']

scripts/context-for.mjs:
  L113 prefixMap = { papers, concepts, themes, members, sessions, faq }
  L125 /^(paper|concept|theme|member|session|faq)\//
  L131 candidates = ['paper', 'concept', 'theme', 'member', 'session', 'faq']
  L174 buckets = { papers, concepts, themes, members, sessions, faq }
  L223 TYPE_LABEL = { papers, concepts, themes, members, sessions, faq }

scripts/init-group.mjs:
  L953 existingSlugs = { theme, member, concept, paper, session, faq }

scripts/lib/frontmatter.mjs:
  L100 SCHEMAS = { member, session, paper, theme, concept, faq, generic }
  L175 detectSchema(): if (relpath.includes('/members/')) ...

Coverage summary:
  paper:   11 locations  ✓
  concept: 11 locations  ✓
  theme:   11 locations  ✓
  member:  11 locations  ✓
  session: 11 locations  ✓
  faq:     11 locations  ✓ (cycle-10 R01 added)

✅ All known types registered consistently.
```

**`--type=<type>` 模式**：检查某类型 occurrence count，与 baseline 类型（如 paper）一致才 pass：

```
$ pnpm audit:touchpoints --type=faq
faq registered in 11 / 11 expected locations.
✅ faq is fully registered.
```

如果 baseline（取最大值）= 11，但某类型只在 8 个地方出现 → ❌ + 列出缺失位置。

**JSON 输出**（`--json`）：

```json
{
  "ok": true,
  "generated_at": "...",
  "locations": [
    {
      "file": "scripts/build-index.mjs",
      "line": 34,
      "pattern": "URL_PREFIX object",
      "types_found": ["paper","concept","theme","member","session","faq"]
    },
    ...
  ],
  "type_counts": {
    "paper": 11,
    "concept": 11,
    ...
    "faq": 11
  },
  "consistent": true
}
```

### 检测模式（regex 启发，**非完美**）

扫每个 `.mjs` 文件，每行匹配：

1. **数组 / 列表**：`['paper', 'concept', 'theme', 'member', 'session', ...]`（任意顺序、复数单数都识别）
2. **对象 keys**：`{ paper: ..., concept: ..., theme: ... }`（同上）
3. **正则**：`/^(paper|concept|theme|...)` 或 `/(papers|concepts|...)/`
4. **类型判断 if 链**：`if (schema === 'paper') ... else if (schema === 'concept')`

任何一行含 ≥3 个 type 关键词命中即报。**误报可接受**（用户能扫眼判断），**漏报致命**——所以模式宁宽勿严。

### 改 2：`package.json`

紧跟 `staleness-report` 之后插入：

```json
"audit:touchpoints": "node scripts/audit-touchpoints.mjs",
```

## Verification

```bash
# 1. 基础跑通
pnpm audit:touchpoints              # 不挂、输出报告
pnpm audit:touchpoints --json | jq .ok    # 必须 true
pnpm audit:touchpoints --quiet; echo $?   # 全一致时 exit 0

# 2. 验证检测覆盖
pnpm audit:touchpoints --type=faq
# 必须显示 faq 注册到 ≥10 locations（cycle-10 R01 全注册）

# 3. 验证 paper / concept / theme / member / session / faq 全 consistent
pnpm audit:touchpoints --json | jq '.consistent'   # 必须 true

# 4. 现有 verify 不受影响
pnpm verify     # 必须 0 warning（新脚本未被 verify 调用）
```

## Rollback

单 commit revert。删 `scripts/audit-touchpoints.mjs` + revert `package.json`。

## Out of Scope

- ❌ 把 audit 加进 `pnpm verify` 必跑 —— 让 CI 红色阻塞 PR 风险太大，phase 2 决策
- ❌ 自动修复（"我看到 faq 缺这里，自动加一行"）—— 太激进
- ❌ 检测 `.agent/skills/` / `astro.config.mjs` —— 那些不是脚本，规则不同；本 task 只扫 `scripts/`
- ❌ 完美 AST parse —— regex 启发已够 90% 场景

## Risk

| Risk | Likelihood | Impact | 缓解 |
|------|-----------|--------|------|
| 漏报（某 type 真的少注册一处） | 中 | 高 | 报告含每 location 的 type list，人工再扫一遍 |
| 误报（无关代码命中 type 关键词） | 高 | 低 | 输出含 `pattern` 说明，用户判断 |
| 写 audit 时漏认 init-group.mjs 那种间接 reference | 中 | 中 | 扫所有 `scripts/**/*.mjs`，靠 line 含 ≥3 type 关键词的启发 |
| 脚本性能慢 | 低 | 低 | scripts/ 目录文件 <20 个，<1s |
