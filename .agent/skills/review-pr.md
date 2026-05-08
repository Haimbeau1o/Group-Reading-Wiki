# Skill: review-pr

## 何时调用

- "帮我 review 这个 PR (URL / branch)"
- "看下这次改动有没有问题"
- "PR #N 能 merge 吗"

## 输入

- PR URL / 本地 branch / commit range（如 `main..feature-branch`）
- 用户的关注点（可选：完整审查 / 只看格式 / 只看链接）

## 拉取 PR 的标准方式

| 来源 | 命令 |
|------|------|
| 远程 PR by number | `gh pr checkout <N>` |
| 远程 PR by URL | `gh pr checkout <URL>` |
| 本地 branch | `git checkout <branch>` |
| commit range（不切 branch，只看 diff） | `git diff main..feature-branch` |

如果用户没装 `gh`：`git fetch origin pull/<N>/head:pr-<N> && git checkout pr-<N>`

### 1. Build & schema

```bash
pnpm install --frozen-lockfile
pnpm verify             # frontmatter + schema + 链接（快）
pnpm verify:full        # 同上 + pnpm build（慢，但确认能上线）
```

如失败 → **拦截**，列出失败位置。**verify:full 是 merge 前必跑**（verify 不抓 build-time 错）。

### 2. Frontmatter 合规

每个新增 / 修改的 `.md` `.mdx` 检查：

- [ ] `title` `description` 必填齐全
- [ ] 没重复 key
- [ ] 不同模块的扩展字段：
  - sessions: `session_week` `lead` `status`
  - members: `role` `status`
  - papers: `themes`
- [ ] `slug` 在文件路径里小写连字符（不是中文 / 大写 / 空格 / 下划线）

### 3. 命名 / 路径

- [ ] 文件放在正确目录（session 不能放 `papers/` 等）
- [ ] slug 不与现有冲突
- [ ] 图片放在 `public/docs-assets/`，引用用 `/docs-assets/...`

### 4. 内容质量

- [ ] 第一次出现的术语链向 `/concepts/<x>/`（如该词条已存在）
- [ ] 引用 paper / 数据有出处链接
- [ ] 跨页链接用绝对路径（`/foo/bar/`）
- [ ] 没硬编码邮箱 / API key / 真实电话

### 5. 共读相关（如改了 sessions/）

- [ ] `lead` 对应的 member 主页存在
- [ ] `paper_refs` 对应的 paper 文件存在
- [ ] Pre-read / Live notes / Post-meeting 三段都有内容（不全是占位）

### 6. 成员相关（如改了 members/）

- [ ] `role` 在 4 个合法值之内
- [ ] 已加入 `members/index.mdx` 对应分组
- [ ] alumni / visitor 没还在主分组里

### 7. 提交信息

- [ ] commit message prefix 合规（[Conventional Commits](https://www.conventionalcommits.org)）：
  - 内容类：`session:` / `paper:` / `concept:` / `member:` / `theme:`
  - 通用类：`feat:` / `fix:` / `docs:` / `refactor:` / `test:` / `chore:` / `ci:` / `style:` / `perf:`
  - 格式：`<type>(<scope>): <subject>` — 如 `fix(skill): cycle-6 lessons`

### 8. i18n 漂移检查（如改了内容页）

- [ ] 如果改了 `src/content/docs/<page>.md`，检查 `src/content/docs/en/<same>.md` 是否同步更新
- 不同步 → **warn**（不阻塞 merge，但提醒 PR 作者补 i18n 或加 TODO 注释）

### 9. 二进制 / 大图

- [ ] `public/docs-assets/*` 新增文件 ≤ 500KB（大于则建议用外链 CDN 或 lossy 压缩）
- [ ] PR diff 里 `git diff --stat` 显示的二进制改动总和合理（防止误传 model checkpoint）

### 10. Conflict 检查

```bash
git fetch origin main
git log --oneline origin/main..HEAD     # PR 比 main 新多少 commit
git merge-tree $(git merge-base HEAD origin/main) HEAD origin/main | head
```

如有 conflict marker → 让 PR 作者 rebase / merge main 后重提，**别在 review 里替他解决**。

## 报告格式

```markdown
# PR Review · <branch>

## ✅ 通过的检查
- build / schema / 链接

## ⚠️ 警告（不阻塞 merge）
- ...

## ❌ 阻塞 merge 的问题
- file:line - 具体问题 - 建议修法

## 🤔 需人工判断
- ...（如内容质量、组内立场是否合适）

## 建议
- 整体上：approve / request changes / comment
```

## 不要做的事

- ❌ 不直接 merge（**只评估、不动手**）
- ❌ 不替 PR 作者改内容（只指出问题）
- ❌ 不自动 push fix commit（除非用户明确要）
- ❌ 不评判内容观点对错（"我们组的 take" 这类是观点，agent 不该 review）

## 静态扫描发现总结（2026-05）

未做端到端 dogfood（review-pr 触发条件需真实 PR），静态扫 5 处补强：

1. ✅ 加了 PR 拉取标准方式表（`gh pr checkout` / `git fetch pull/<N>`）
2. ✅ verify → verify + verify:full 区分（merge 前必跑 build）
3. ✅ commit prefix 列表补齐 + Conventional Commits 链接
4. ✅ 加 i18n 漂移检查（en/ 与 中文页同步）
5. ✅ 加二进制 / 大图检查（防误传 model checkpoint）
6. ✅ 加 conflict 检查段（不替作者解决）
