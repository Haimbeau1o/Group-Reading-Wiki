# 从模板升级骨架 · Upgrading from the Template

> 你的仓库是用 [group-wiki-template](https://github.com/Haimbeau1o/Group-Reading-Wiki) 的 GitHub Template 功能创建的。
> 这意味着你的仓库和模板**没有 upstream 关联** —— 我们模板以后的改进不会自动到你这里。
> 这篇文档讲怎么**选择性地**拉取模板骨架的更新，保留你自己的内容不动。

---

## 哲学：骨架 vs 内容

两类文件，边界清晰：

| 类别 | 目录 / 文件 | 谁拥有 | 升级时怎么办 |
|------|-----------|--------|-------------|
| 🏗️ **模板骨架** | `scripts/`<br>`.agent/skills/`<br>`.agent/context/`<br>`docs/STYLE_GUIDE.md` `docs/UPGRADING.md`<br>`.agent/MAINTAINER_PLAYBOOK.md`<br>`.github/workflows/`<br>`src/components/` | 模板仓库 | **覆盖**为 upstream 最新 |
| 📝 **你的内容** | `src/content/docs/` 全部<br>`public/` 静态资源<br>`README.md` `CONTRIBUTING.md`<br>`astro.config.mjs` 的 `site` / `title` / `giscus` 等配置 | 你的组 | **保留不动** |
| 🔀 **混合** | `package.json`<br>`astro.config.mjs` 的 `integrations` / `plugins` 数组 | 双方 | **手工 merge** |

**原则**：不要改骨架文件（除非你 PR 回模板仓库）。如果你觉得某个 skill / 脚本该改，先在你本地改，跑通，然后 fork 模板仓库提 PR。

---

## 初次配置（一次性）

在你用 template 创建的仓库里运行一次：

```bash
# 把模板仓库加为 upstream remote
git remote add upstream https://github.com/Haimbeau1o/Group-Reading-Wiki.git

# 确认两个 remote 都在
git remote -v
# → origin    https://github.com/<your>/<your-repo>  (fetch/push)
# → upstream  https://github.com/Haimbeau1o/Group-Reading-Wiki  (fetch/push)
```

---

## 升级骨架（想更新时就跑）

### 手工方式（推荐初学者）

```bash
# 1. 拉最新模板代码到本地（不 merge）
git fetch upstream

# 2. 只 checkout 骨架目录，覆盖你的
git checkout upstream/main -- \
  scripts/ \
  .agent/skills/ \
  .agent/context/ \
  docs/STYLE_GUIDE.md \
  docs/UPGRADING.md \
  .agent/MAINTAINER_PLAYBOOK.md \
  .github/workflows/ \
  src/components/

# 3. 核对改了哪些
git status
git diff --stat HEAD

# 4. 跑 verify 确认没破坏
pnpm verify

# 5. 如果还 OK，commit
git commit -am "chore: upgrade template skeleton to upstream@$(git rev-parse --short upstream/main)"
```

### 脚本方式（已封装，推荐日常）

TODO(下一版本)：`pnpm upgrade:template` 一条命令完成上面所有步骤 + 冲突检测。

---

## 混合文件的手工 merge

### `package.json`

模板可能升级 Astro / Starlight 等依赖。对比两方的 `dependencies` / `devDependencies`：

```bash
git show upstream/main:package.json > /tmp/upstream-pkg.json
diff package.json /tmp/upstream-pkg.json
```

**策略**：
- 依赖版本号：基本采纳模板的（保持被官方测试过的组合）
- `scripts` 字段：新增的采纳；修改的对比意图
- `description` / `name` / `version`：保留你的
- 新增了必要的依赖：采纳

### `astro.config.mjs`

这个文件 70% 是模板骨架（integrations 组合），30% 是你的配置（site / title / giscus 等）。

手工 merge 策略：
1. 打开模板的最新版 `git show upstream/main:astro.config.mjs`
2. 对比三处关键点：
   - `site:` → **保留你的**
   - `title:` / `description:` / `social:` → **保留你的**
   - `giscus({ repo, repoId, categoryId })` → **保留你的**
   - `integrations: [starlight({...})]` 结构和新增的功能 → **采纳模板的**
3. 如果模板加了新的 plugin（如 Mermaid 新选项），把它移植到你的配置里

---

## 评论区（Giscus）配置

初始化后 `astro.config.mjs` 里 giscus 块被清为占位：

```js
giscus({
  repo: 'YOUR_GITHUB_OWNER/YOUR_REPO',
  repoId: 'REPLACE_ME_WITH_YOUR_REPO_ID',
  category: 'Wiki Comments',
  categoryId: 'REPLACE_ME_WITH_YOUR_CATEGORY_ID',
  ...
})
```

启用步骤：

1. 去你的 GitHub 仓库 **Settings → General → Features** 打开 **Discussions**
2. 进 [giscus.app](https://giscus.app/)，把你的 `owner/repo` 粘进去
3. giscus 会告诉你四个值：`data-repo` / `data-repo-id` / `data-category` / `data-category-id`
4. 把它们填回 `astro.config.mjs` 的对应字段
5. 重跑 `pnpm build`，评论框应该出现在所有文档页底部

---

## 部署（Cloudflare Pages）

模板骨架不管部署 —— 你的仓库你的账号。快速步骤：

1. 推到 GitHub：`git push origin main`
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选中你的仓库，框架选 **Astro**
4. 构建设置：
   - Build command: `pnpm build`
   - Build output: `dist`
   - 环境变量：`NODE_VERSION=22`
5. Deploy。第一次 ~2 分钟
6. 拿到部署后的 URL（如 `your-wiki.pages.dev`），回头更新 `astro.config.mjs` 的 `site:` 字段并重新部署

---

## 冲突处理

大多数升级不会冲突，因为骨架文件你不该改。如果冲突了：

```text
error: your local changes to the following files would be overwritten by checkout:
        scripts/verify.mjs
Please commit your changes or stash them before you switch branches.
```

意味着**你改了骨架文件** —— 这违反了"骨架归模板"的约定。选择：

1. **你的改动应该回馈给模板**（值得所有用户）→ fork 模板仓库提 PR，你这边暂停升级等我们合入
2. **你的改动只对你有意义** → 搬去你自己的 `src/components/custom/` 或加 `.agent/notes/` 记录，然后 `git checkout .` 丢弃覆盖

---

## 版本追踪（推荐）

想知道你上次从模板哪个 commit 升级的？

```bash
# 每次升级后记录一下
git log -1 upstream/main --format='%H %s' > .template-version
git commit -am "chore: upgrade template to $(cat .template-version | cut -c1-8)"
```

下次升级前看一眼 `cat .template-version`，知道 baseline。

---

## 反向：给模板贡献改进

如果你发现骨架里有 bug，或者有好主意：

```bash
# 1. 传统 fork 模板仓库（不是 Use this template！）
# 2. clone 你的 fork
git clone https://github.com/<your-handle>/Group-Reading-Wiki
cd Group-Reading-Wiki

# 3. 开 feature 分支
git checkout -b feat/your-improvement

# 4. 改动 + commit + push + 开 PR
```

**不要**尝试从你用 template 创建的仓库开 PR 回模板 —— 因为没有 upstream 关联，GitHub 不会识别为有效 PR。必须用传统 fork。

---

## 常见问答

**Q: 升级会不会动我的 `src/content/docs/`？**
A: 不会。`git checkout upstream/main -- <paths>` 只覆盖显式列出的路径。

**Q: 我改了 `.agent/skills/weekly-session.md` 加了自己的 hook，升级会丢吗？**
A: 会。那是骨架文件。你的自定义 hook 应该放在 `.agent/notes/my-hooks.md` 或 `.agent/custom/` 之类的私域目录，并在 MAINTAINER_PLAYBOOK 开头引用。

**Q: 有必要每次模板更新都升级吗？**
A: 不必。模板 release notes 里会标 `breaking` / `recommended` / `optional`。只在你真的需要新功能时才拉。

**Q: 不小心在 `scripts/` 里改了东西怎么办？**
A: `git checkout upstream/main -- scripts/` 强制还原为 upstream 版本。你的改动会丢，做好心理准备。
