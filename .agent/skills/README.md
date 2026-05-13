# Skills 索引

agent 按场景索引下面的 skill。每个 skill 是一份独立 markdown，包含：

- **何时调用**（natural language trigger）
- **输入清单**（要从用户那里收集的信息）
- **执行步骤**（具体跑哪些命令、改哪些文件）
- **检查点**（成功标志 / 错误恢复）
- **示例对话**

### 阶段化 skill（new PI 路径）

| Skill | 场景 |
|-------|------|
| [`bootstrap-new-group.md`](./bootstrap-new-group.md) | 把模板初始化为某课题组的 wiki（stage=template） |
| [`first-week-after-init.md`](./first-week-after-init.md) | 初始化后第一周 5 个对话循环（stage=initialized） |
| [`setup-deploy.md`](./setup-deploy.md) | 引导 PI 部署到 Cloudflare Pages |
| [`setup-comments.md`](./setup-comments.md) | 引导 PI 启用 Giscus 评论区 |
| [`upgrade-template.md`](./upgrade-template.md) | 同步模板骨架最新更新 |

### 日常维护 skill（established 后）

| Skill | 场景 |
|-------|------|
| [`weekly-session.md`](./weekly-session.md) | 排下周共读、建 session 页 |
| [`post-meeting-recap.md`](./post-meeting-recap.md) | 会议结束后整理纪要到 session 页 |
| [`add-member.md`](./add-member.md) | 新成员入组、建主页、调整成员索引 |
| [`add-paper-note.md`](./add-paper-note.md) | 写一篇论文解读 |
| [`add-concept.md`](./add-concept.md) | 加 / 改概念词典词条 |
| [`add-faq.md`](./add-faq.md) | 加 / 改 FAQ（"组里反复被问的实操问题"，cycle-10 R01） |
| [`refresh-theme.md`](./refresh-theme.md) | 更新研究主线页（论文清单、开放问题） |
| [`find-related-context.md`](./find-related-context.md) | 写新内容前先问知识图"组里关于 X 的现状是什么"（cycle-8+） |
| [`personalized-onboarding.md`](./personalized-onboarding.md) | 给新生定制第一周阅读路径 |
| [`weekly-digest.md`](./weekly-digest.md) | 周日生成本周 wiki digest |
| [`review-pr.md`](./review-pr.md) | 检查一个 PR 是否符合约定 |

每个 skill 是**自包含**的：agent 可以只读它 + `.agent/context/` 三份就能完成任务。

## 复核 / 防腐（cycle-10 R02）

所有内容类型 frontmatter 支持以下字段（全部 optional，向前兼容）：

- `last_reviewed_at: YYYY-MM-DD` — 上次复核日期
- `reviewer: <member-slug>` — 复核责任人
- `review_cadence: 6m | 12m | indefinite` — 复核周期（默认按类型推断：`concept` / `theme` = `6m`；`paper` / `session` / `member` / `faq` = `12m`）

跑 `pnpm staleness-report` 看 stale 候选。flags:
- `--type=papers|concepts|themes|members|sessions|faq|all`
- `--cadence=6m|12m|24m`（强制覆盖类型默认）
- `--reviewer=<member-slug>` / `--unowned-only` / `--json` / `--quiet`

Exit code：`0` = all fresh；`1` = 有 stale 或 unreviewed；`2` = 脚本错。

**Skill 行为提示**：
- 所有 `new:*` scaffold 自动填 `last_reviewed_at = today`，并支持 `--reviewer=<slug>` flag
- 修订已有内容时（Update 路径），**手动**把 `last_reviewed_at` 改成今天 + `reviewer` 改为当前修订者
- **不要 batch revisit**：每页复核应当带"实际是否仍有效"的判断，不只是改日期
