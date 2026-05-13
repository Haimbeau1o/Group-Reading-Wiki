---
rfc: R01
task_id: T01-3
status: pending
depends_on: [T01-1]
estimated_minutes: 30
branch: cycle-10/R01/T01-3-build-index-faq
files_touched:
  - scripts/build-index.mjs
verification_commands:
  - pnpm build:index
---

# T01-3 · build-index.mjs 收集 faq 节点

## Context
RFC: `analysis/cycle-10/rfcs/R01-faq-schema.md` §D1.6
Audit: `analysis/cycle-10/00-current-state-audit.md` §5 + §2 row 5-7

## Exact Diff Intent

**改 1：** `scripts/build-index.mjs` L34-40 `URL_PREFIX` 加 faq：
```js
const URL_PREFIX = {
  paper: '/papers/',
  concept: '/concepts/',
  theme: '/themes/',
  member: '/members/',
  session: '/sessions/',
  faq: '/faq/',
};
```

**改 2：** L48 `TYPES` 数组加 `'faq'`：
```js
const TYPES = ['papers', 'concepts', 'themes', 'members', 'sessions', 'faq'];
```

**改 3：** L79-108 投影 if-else 链，在 `session` 分支**之后**加：
```js
} else if (schema === 'faq') {
  node.question = fm.question || '';
  node.asked_by = fm.asked_by || null;
  node.answered_by = fm.answered_by || null;
  node.related_papers = arrayOf(fm.related_papers);
  node.related_concepts = arrayOf(fm.related_concepts);
  node.themes = arrayOf(fm.themes);
  node.exemplar = fm.exemplar === true;
  node.last_reviewed_at = fm.last_reviewed_at || null;
  node.reviewer = fm.reviewer || null;
}
```

**改 4：** L360-369 `stats` 对象加 `faq: 0`，并在循环 L362-368 加：
```js
else if (n.type === 'faq') stats.faq++;
```

**改 5：** L393 console.log 输出加 faq 计数：
```js
console.log(`   nodes: papers=${stats.papers} concepts=${stats.concepts} themes=${stats.themes} members=${stats.members} sessions=${stats.sessions} faq=${stats.faq}`);
```

## Verification
- `pnpm build:index` —— 成功输出 `src/generated/knowledge-graph.json`
- `cat src/generated/knowledge-graph.json | jq '.stats'` —— 必须含 `faq: 0`（暂无文件）
- `cat src/generated/knowledge-graph.json | jq '.nodes | to_entries | .[] | select(.value.type=="faq")'` —— 空数组（暂无文件）

## Rollback
单 commit revert 即可。

## Out of Scope
- 不建 `by_faq` 聚合视图（RFC §D1.6 明确：信号弱，phase 2）
- 不动现有 by_theme / by_member / by_concept / by_tag 投影

## Risk
- 投影分支顺序错（faq 加在 generic 之前但 detectSchema 已排除 generic）—— 应不会出错，但若 T01-1 detectSchema 改错可能 faq 文件被当 generic 跳过。**T01-3 完成后跑一遍 T01-1 风险检查**
