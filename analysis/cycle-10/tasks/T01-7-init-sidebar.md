---
rfc: R01
task_id: T01-7
status: pending
depends_on: [T01-1]
estimated_minutes: 30
branch: cycle-10/R01/T01-7-init-sidebar
files_touched:
  - scripts/init-group.mjs
  - astro.config.mjs
verification_commands:
  - pnpm verify
  - pnpm build
---

# T01-7 · init-group.mjs 清洗逻辑 + sidebar 加 FAQ entry

## Context
RFC: `analysis/cycle-10/rfcs/R01-faq-schema.md` §D4 + §D7
Audit: `analysis/cycle-10/00-current-state-audit.md` §4 (sidebar) + §9 (demo 清洗) + §11 (已知 bug #30 不能继承)

## Exact Diff Intent

### 改 1：`astro.config.mjs` sidebar 加 FAQ entry

在 L84-86「概念词典」entry **之后**插入：
```js
{
  label: '❓ FAQ',
  translations: { en: 'FAQ' },
  autogenerate: { directory: 'faq' },
  collapsed: true,
},
```

### 改 2：`scripts/init-group.mjs` 加 faq 清洗

先用 `grep -n "concepts\|papers\|sessions\|themes\|members" scripts/init-group.mjs` 找现有清洗逻辑。

清洗规则：
- 保留 `src/content/docs/faq/index.md`（如有）
- 保留 frontmatter 含 `exemplar: true` 的文件
- 删除其他所有 `.md` 文件

参考 papers 的清洗逻辑（应该已经按 exemplar 处理 paper note）。**如果发现 papers 清洗逻辑是 hardcode 一个 slug 白名单而非 exemplar 字段**，task 暂停报告。

## Verification
- `pnpm verify` —— 0 warning
- `pnpm build` —— 必须 ok；产出的 `dist/` 含 `dist/faq/` 目录（即使空）
- `pnpm dev` —— sidebar 显示「❓ FAQ」entry 在「概念词典」之后
- **DRY RUN smoke test**：
  - 用 `pnpm init:group "Test Group" --github=test/test --site-url=https://test.test --dry-run` 看清洗行为（如果 init-group.mjs 支持 --dry-run）
  - 如果不支持 dry-run：在临时 branch 跑 `pnpm init:group ... --reset` 看效果，然后 `git restore`

## Rollback
- 撤 `astro.config.mjs` 修改
- 撤 `scripts/init-group.mjs` 修改

## Out of Scope
- 不建 faq exemplar 文件（T01-8 处理）
- 不动其他清洗逻辑（papers / concepts / themes / members / sessions）

## Risk
- init-group.mjs 的清洗逻辑如果是 hardcode（不读 `exemplar:` 字段）→ 加 faq 时也用同样的方式（保持一致），不引入新模式
- sidebar 位置错（放在 sessions / themes 中间）→ 用户搜索 FAQ 位置乱。**严格放在概念词典之后**
- i18n `en` translations 漏 → 跑 `pnpm build` 时 starlight 可能 warn。**必须含 `translations: { en: 'FAQ' }`**
