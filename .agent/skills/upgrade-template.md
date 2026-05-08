# Skill: upgrade-template（同步模板骨架更新）

> **把模板仓库（[Group-Reading-Wiki](https://github.com/Haimbeau1o/Group-Reading-Wiki)）里的骨架改进**（脚本 / skills / verify 增强）**拉到用户仓库**，保持用户的自有内容（papers / sessions / themes / members）不动。

---

## 何时调用

- 用户说"同步模板更新" / "upgrade template" / "拉最新"
- 用户在模板仓库 release notes 里看到感兴趣的功能
- 长期：周期性提醒（比如每 3 个月）

## 哲学：骨架 vs 内容

| 类别 | 路径 | 升级时 |
|------|------|--------|
| 🏗️ **骨架** | `scripts/`、`.agent/skills/`、`.agent/context/`、`.github/workflows/`、`src/components/`、`docs/STYLE_GUIDE.md`、`docs/UPGRADING.md`、`.agent/MAINTAINER_PLAYBOOK.md`、`.agent/BOOTSTRAP.md` | **覆盖**为 upstream |
| 📝 **内容** | `src/content/docs/` 全部、`public/` 静态资源、`README.md`、`group.config.yaml` | **不动** |
| 🔀 **混合** | `package.json`、`astro.config.mjs` 部分字段 | **手工 merge** |

## 前置：一次性配置 upstream remote

如果用户没配过：

```bash
git remote add upstream https://github.com/Haimbeau1o/Group-Reading-Wiki.git
git remote -v   # 应该看到 origin + upstream 两个
```

## 升级 5 步

### Step 1: 拉最新 upstream

```bash
git fetch upstream
```

### Step 2: 给用户看 diff 概览

Agent 跑：

```bash
git log --oneline upstream/main ^HEAD | head -20
echo "---"
git diff --stat upstream/main HEAD -- \
  scripts/ .agent/skills/ .agent/context/ .agent/BOOTSTRAP.md \
  .agent/MAINTAINER_PLAYBOOK.md docs/UPGRADING.md docs/STYLE_GUIDE.md \
  .github/workflows/ src/components/
```

把这两个输出给用户看，问："要全部接受、选择性接受、还是不升级？"

### Step 3: 选择性接受（推荐）

Agent 让用户选范围。然后：

```bash
# 例如：只升级 scripts + .agent/skills
git checkout upstream/main -- scripts/ .agent/skills/

git status
git diff --stat HEAD
```

### Step 4: 手工 merge 混合文件

如果 diff 显示 `package.json` / `astro.config.mjs` 也有改动 → agent 帮用户做 3-way merge：

```bash
# package.json
git show upstream/main:package.json > /tmp/upstream-pkg.json
diff package.json /tmp/upstream-pkg.json
```

Agent 看 diff 后给用户精准建议："upstream 升级了 astro 6.x → 6.y，建议接受。upstream 改了 description，建议保留你的。"

### Step 5: verify + commit + 写回 baseline

```bash
pnpm install                 # 如果 package.json 变了，重装
pnpm verify                  # 0 warning
pnpm verify:full             # 跑 build 确认能上线（强烈推荐）

# 拿 upstream 的 full + short SHA
UPSTREAM_SHA=$(git rev-parse upstream/main)
UPSTREAM_SHORT=$(git rev-parse --short upstream/main)

# 用 update-group-config 原子写回 baseline_commit + last_synced（不要手 vim yaml）
pnpm update:group-config \
  --baseline-commit="$UPSTREAM_SHA" \
  --last-synced="$(date -u +%F)"

git commit -am "chore: sync template skeleton to upstream@$UPSTREAM_SHORT"
```

## 检查点

- ✅ `git status` 干净
- ✅ `pnpm verify` 通过
- ✅ `pnpm build` 通过
- ✅ `group.config.yaml` 的 `template.last_synced` 更新

## 冲突处理

```text
error: your local changes to the following files would be overwritten by checkout:
       scripts/verify.mjs
```

意味着用户改了骨架文件 —— 违反了"骨架归模板"原则。Agent 选择：

1. 用户改动**值得回馈给模板** → 让用户把改动单独保存（`git stash`），先升级，stash pop 后**用传统 fork 模式提 PR 给模板仓库**，等合入后下次升级就有了
2. 用户改动**只对自己有意义** → 移到 `.agent/notes/` 里（agent 私域，不会被 upgrade-template 覆盖），然后 `git checkout HEAD -- scripts/verify.mjs` 还原骨架。如果是 UI 组件类自定义，建议建 `src/content/docs/_custom/` 或在 README 注释清楚（**不要**改模板自带的 `scripts/` / `.agent/skills/`）

## 不要做的事

- ❌ **不直接 `git merge upstream/main`** —— 会一锅端用户内容和骨架，灾难
- ❌ **不无脑覆盖 `package.json`** —— 用户自有的 description / version 会丢
- ❌ **不强制升级**。给用户选项

## 首次升级（baseline_commit 为空时）

如果 `group.config.yaml` 的 `template.baseline_commit` 还是空：

1. 先 commit 当前状态作 safety net（`git commit -am "chore: pre-upgrade snapshot"`）
2. 跑 Step 1-2，把 upstream/main 当成 baseline
3. **不需要** Step 3 选择性接受（首次直接全骨架同步）：
   ```bash
   git checkout upstream/main -- scripts/ .agent/ docs/STYLE_GUIDE.md docs/UPGRADING.md .github/
   ```
4. 跑 Step 5，把当前 `upstream/main` SHA 写进 baseline_commit
5. 后续升级就有 diff 起点了

## Dry-run 模式

升级前预演（不真改文件）：

```bash
git fetch upstream
git diff --stat upstream/main HEAD -- scripts/ .agent/ docs/ .github/
git log --oneline upstream/main ^HEAD
```

只看不动 → agent 总结"如果接受会改 N 个文件、新增 M 行、删 K 行"，用户再决定。

## 升级失败回滚

Step 5 build 挂了 / verify 报错 → 立即回滚：

```bash
# 如果还没 commit
git restore --staged --worktree .
git clean -fd

# 如果已 commit 但还没 push
git reset --hard HEAD~1

# 如果已 push（极不推荐升级前不做 dry-run）
git revert HEAD
```

回滚后用 `git stash` / `git diff` 隔离出真正出问题的子集，再次升级时跳过它。

## Fork-of-fork 注意

如果用户的 wiki 是从**别人的 wiki**（不是模板原仓库）fork 来的：

- `upstream` 应指向 **template 原仓库**（`Haimbeau1o/Group-Reading-Wiki`），不是中间 fork
- 这样能拿到模板真正的骨架更新
- 中间 fork 自己改的骨架（如果有），用户不应该自动接受 — 那不是模板权威

## Lessons learned

- 第一次升级前**永远先 commit 当前状态**（safety net）
- 跨大版本（如 0.x → 1.x）模板可能有 BREAKING change → 先读 upstream CHANGELOG
- 如果 upstream 改了 `astro.config.mjs` 的 integrations 数组结构（不只是版本号），用户必须手工合并 —— 这是混合文件的典型场景
- 如果用户长期不升级（半年 +），accumulated drift 会让升级很痛 → 建议每季度一次小升级
- **静态扫描发现总结（2026-05）补强 6 处**：
  1. ✅ Step 5 改用 `pnpm update:group-config` 原子写回 baseline，不再手 vim yaml
  2. ✅ verify → verify + verify:full
  3. ✅ 修了 `src/components/custom/` 不存在的引用
  4. ✅ 加首次升级（baseline 为空）的 bootstrap 流程
  5. ✅ 加 dry-run 流程（不动文件先预演）
  6. ✅ 加升级失败回滚步骤 + fork-of-fork chain 注意
