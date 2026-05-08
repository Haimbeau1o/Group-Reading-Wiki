# Skill: setup-deploy（部署到 Cloudflare Pages）

> **把已经初始化好的 wiki 部署上线**。Agent 引导，PI 在浏览器里实操。

---

## 何时调用

- `first-week-after-init` 循环 5 的 5.A 自动调用
- 用户说"部署 wiki" / "上线" / "Cloudflare Pages 怎么搞"

## 前置检查

Agent 先跑：

```bash
pnpm verify   # 必须 0 warning
pnpm build    # 必须成功，dist/ 生成
```

任何一步失败 → 先修内容问题，不要进入部署。

## 5 步引导（PI 实操，agent 做精准 walkthrough）

### Step 1: push 你的仓库到 GitHub

Agent 提示：

```bash
# 给用户准确命令，让他复制
git status              # 看有没有未提交
git add -A && git commit -m "ready for first deploy"
git push origin main
```

确认 GitHub web 上能看到最新 commit。

### Step 2: 在 Cloudflare 创建 Pages 项目

Agent 给精准 walkthrough（用户在浏览器做）：

> 1. 打开 [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
> 2. 左侧 **Workers & Pages** → 点 **Create**
> 3. 选 **Pages** 标签 → **Connect to Git**
> 4. **Authorize Cloudflare** 访问你的 GitHub（首次需授权）
> 5. 选你的仓库（`{读 group.config.yaml.group.github}`）
> 6. **Begin setup**

### Step 3: 填 build 配置

**精准 4 个字段**（agent 让用户复制粘贴）：

| 字段 | 值 |
|------|---|
| **Project name** | `{group.slug}` 或自定义（决定 default URL）|
| **Production branch** | `main` |
| **Framework preset** | `Astro` |
| **Build command** | `pnpm build` |
| **Build output directory** | `dist` |

**Environment variables**（点 Add variable）：

| Variable name | Value | 备注 |
|---------------|-------|------|
| `NODE_VERSION` | `22` | |
| `PNPM_VERSION` | `10` | 若 Cloudflare 报 `pnpm: command not found` 试 `9` |

⚠️ **重要**：选 `Astro` preset 后 Cloudflare 会自动填 Build command 为 `npm run build` —— 你必须**手动覆盖**为 `pnpm build`，否则部署用 npm 走，依赖锁失效。

⚠️ **GitHub Org 仓库注意**：若你的仓库属于 GitHub Organization（如 `wang-lab/nlp-wiki`），Authorize Cloudflare 时要给 **org-level** 权限（不是 personal-level），否则 repo 列表为空。在 GitHub Settings → Applications → Authorized OAuth Apps → Cloudflare → Configure 里加 org。

点 **Save and Deploy**。

### Step 4: 等首次部署（~2-3 分钟）

Agent 告诉用户："Cloudflare 会跑 `pnpm install` + `pnpm build`，构建日志在那个页面实时滚。如果失败把日志贴给我。"

成功后会显示部署 URL，类似 `https://your-project.pages.dev`。

### Step 5: 把真实 URL 写回 astro.config.mjs + group.config.yaml

如果初始化时 PI 用了占位 URL，现在拿到真实 URL 后：

#### 5.1 改 astro.config.mjs

Agent 用 edit tool 替换 `site:` 字段（不要用 sed —— astro.config.mjs 有变量插值，sed 容易破语法）：

```diff
- site: 'https://placeholder.pages.dev',
+ site: 'https://<your-project>.pages.dev',
```

#### 5.2 改 group.config.yaml

一行权威：

```bash
pnpm update:group-config \
  --site-url=https://<your-project>.pages.dev \
  --deploy-on=cloudflare
```

脚本会原子修改 `group.site_url` + `deploy.cloudflare_pages`，保留所有注释。**不要手改、不要 sed**。

#### 5.3 Commit + push

```bash
git commit -am "chore: pin production site URL"
git push     # 触发 Cloudflare 重新部署，这次 OG / sitemap 用真实 URL
```

## 检查点

- ✅ Cloudflare 控制台显示部署 status: Success
- ✅ 访问 site_url 看到首页
- ✅ `group.config.yaml` 的 `deploy.cloudflare_pages: true`

## 错误恢复

| 错误 | 处理 |
|------|------|
| Cloudflare build 报 `pnpm: command not found` | 设 `PNPM_VERSION=10` 环境变量 |
| Build 报 `Cannot find module` | 通常是依赖问题。本地能 `pnpm build` 通过吗？通过 → 检查 `pnpm-lock.yaml` 提交了 |
| Build 报 `astro:content` 错 | 内容 frontmatter 不一致。本地跑 `pnpm verify` 找问题 |
| 部署成功但 404 | 检查 `Build output directory: dist`（不是 `build`） |
| OG / 搜索引擎拿到的还是 `pages.dev` 子域 | Cloudflare 设 custom domain 后回到 Step 5 改 `site:` 字段 |

## 不要做的事

- ❌ 不替用户登录 Cloudflare
- ❌ 不改用户的 git remote
- ❌ 不在 Cloudflare 设置任何鉴权（除非用户明确说要部分页面 access-only）—— 那是另一个 skill

## 进阶：自定义域名 + Cloudflare Access

如果用户要：
- 自定义域 → Cloudflare Pages 项目 → Custom domains → 加域 → 按提示配 DNS
- 私域页面 lock → Zero Trust → Access → Application → 选 Pages 项目下特定路径

这些超出本 skill。详见 [Cloudflare Pages docs](https://developers.cloudflare.com/pages/)。

---

## Lessons learned

### 演练发现（cycle 5.A 演练空跑）

- **#18 修复**：选 `Astro` preset 后 Cloudflare 自动填 `npm run build`，必须**手动**覆盖为 `pnpm build`。已加 ⚠️。
- **#19 修复**：GitHub Org 仓库需 org-level 授权 Cloudflare（不是 personal）。已加 ⚠️。
- **#20 修复**：Step 5 的 yaml 修改现在用 `pnpm update:group-config --site-url=... --deploy-on=cloudflare` 原子调用（脚本已补齐）。
- **astro.config.mjs 修改不用 sed**：JS 含变量插值、引号容易破语法。一律 edit tool。
