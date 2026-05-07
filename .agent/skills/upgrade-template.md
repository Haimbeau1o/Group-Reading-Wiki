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

### Step 5: verify + commit

```bash
pnpm install            # 如果 package.json 变了，重装
pnpm verify             # 0 warning
pnpm build              # 还能 build

# 拿 upstream 的 commit SHA
UPSTREAM_SHA=$(git rev-parse --short upstream/main)
git commit -am "chore: sync template skeleton to upstream@$UPSTREAM_SHA"
```

```yaml
# 更新 group.config.yaml
template:
  baseline_commit: "<full-sha>"
  last_synced: "2026-05-07"
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
2. 用户改动**只对自己有意义** → 移到 `src/components/custom/` 或 `.agent/notes/` 里（这两个目录是用户私域），然后 `git checkout HEAD -- scripts/verify.mjs` 还原骨架

## 不要做的事

- ❌ **不直接 `git merge upstream/main`** —— 会一锅端用户内容和骨架，灾难
- ❌ **不无脑覆盖 `package.json`** —— 用户自有的 description / version 会丢
- ❌ **不强制升级**。给用户选项

## Lessons learned

- 第一次升级前**永远先 commit 当前状态**（safety net）
- 跨大版本（如 0.x → 1.x）模板可能有 BREAKING change → 先读 upstream CHANGELOG
- 如果 upstream 改了 `astro.config.mjs` 的 integrations 数组结构（不只是版本号），用户必须手工合并 —— 这是混合文件的典型场景
- 如果用户长期不升级（半年 +），accumulated drift 会让升级很痛 → 建议每季度一次小升级
