# Skill: review-pr

## 何时调用

- "帮我 review 这个 PR (URL / branch)"
- "看下这次改动有没有问题"
- "PR #N 能 merge 吗"

## 输入

- PR URL / 本地 branch / commit range（如 `main..feature-branch`）
- 用户的关注点（可选：完整审查 / 只看格式 / 只看链接）

## 检查项清单

### 1. Build & schema

```bash
git checkout <branch>
pnpm install --frozen-lockfile
pnpm verify
```

如失败 → **拦截**，列出失败位置。

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

- [ ] commit message prefix 合规（session: / paper: / concept: / member: / theme: / docs: / feat: / fix:）

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
