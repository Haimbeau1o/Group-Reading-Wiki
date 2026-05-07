# Skill: setup-comments（启用 Giscus 评论区）

> **把模板默认占位的 giscus 配置换成用户仓库的真实 4 个 ID**，让评论区可用。

---

## 何时调用

- `first-week-after-init` 循环 5 的 5.B 自动调用
- 用户说"启用评论" / "giscus" / "评论区不工作"

## 背景

`init:group` 已经把 `astro.config.mjs` 里的 giscus `repoId` / `categoryId` 替换为占位（原模板的 ID 在用户仓库不工作，必须重配）。这个 skill 把 4 个真实 ID 填回。

## 5 步引导

### Step 1: 在 GitHub 仓库启用 Discussions

> 1. 打开 `https://github.com/{group.github}/settings`
> 2. 滚到 **Features** 段
> 3. 勾选 **Discussions**

### Step 2: 创建一个分类（用于评论）

> 1. 仓库 → **Discussions** 标签
> 2. 左侧分类 → **New category**
> 3. 名字：`Wiki Comments`
> 4. Type：**Announcement**（让评论区只能 PI / maintainer 关闭话题）
> 5. Save

### Step 3: 用 giscus.app 生成 4 个 ID

> 1. 打开 [https://giscus.app/zh-CN](https://giscus.app/zh-CN)（中文版）
> 2. 第 2 段 "仓库" → 输入 `{group.github}`
>    （会显示绿色 ✓ 表示找到 + 启用了 Discussions）
> 3. 第 3 段 "页面与讨论的映射关系" → 选 **Discussion 标题包含页面 pathname**
> 4. 第 4 段 "Discussion 分类" → 选你刚建的 `Wiki Comments`
> 5. 第 5 段 "特性" → 都不勾（保持简洁）
> 6. 第 6 段 "主题" → 选 `preferred_color_scheme`（自动跟随用户系统）
> 7. 滚到底，复制下面这种 HTML 块里的 4 个值：
>
>    ```html
>    <script src="..."
>      data-repo="<owner/repo>"
>      data-repo-id="R_xxxxx"            ← 复制这个
>      data-category="Wiki Comments"
>      data-category-id="DIC_xxxxx"      ← 复制这个
>      ...>
>    </script>
>    ```
> 8. 把这两个 ID 粘给 agent

### Step 4: Agent 把 ID 写回 astro.config.mjs

Agent 跑（接收用户给的两个 ID）：

```bash
# 假设用户给：repoId=R_kgDOABC123, categoryId=DIC_kwDOABC456
```

Agent 用 sed 或编辑器把 `astro.config.mjs` 里：
- `repoId: 'REPLACE_ME_WITH_YOUR_REPO_ID'` → `repoId: 'R_kgDOABC123'`
- `categoryId: 'REPLACE_ME_WITH_YOUR_CATEGORY_ID'` → `categoryId: 'DIC_kwDOABC456'`

确认 `repo:` 字段已经是 `'{group.github}'`（init:group 已写好），category 字段是 `'Wiki Comments'`（确认匹配 Step 2 的命名）。

### Step 5: 验证

```bash
pnpm build              # 确认 build 不报错
pnpm preview            # 本地起预览
# 浏览器开 http://localhost:4321/welcome/ 滚到底
# 应该看到 giscus 评论框（要登录 GitHub 才能评论）
```

如果显示 "giscus 配置出错" 红色提示 → 检查 4 个值是否粘对、Discussions 是否真启用。

提 commit + push：

```bash
git commit -am "feat: enable giscus comments"
git push     # Cloudflare 会自动重部署
```

```yaml
# 更新 group.config.yaml
deploy:
  giscus_enabled: true
```

## 检查点

- ✅ `astro.config.mjs` 中无 `REPLACE_ME_WITH_YOUR_*`
- ✅ `pnpm build` 通过
- ✅ 部署后访问任意文档页底部出现 giscus 评论框
- ✅ `group.config.yaml: deploy.giscus_enabled: true`

## 错误恢复

| 错误 | 处理 |
|------|------|
| giscus 显示 "无法加载评论" | (a) Discussions 没启用 (b) repoId 错 (c) category 名字不匹配 |
| 评论框出现但无法发评 | 仓库是 private — giscus 只支持 public repo |
| `data-repo` 不出现绿色 ✓ | 仓库不存在 / 拼错 owner / repo |
| 特殊：组织仓库限制 | 组织 owner 需要授权 giscus app 访问 |

## 不要做的事

- ❌ 不存任何用户的 GitHub PAT
- ❌ 不在 commit message 里写真实的 repo-id（虽然这是公开数据但写在 message 里看着乱）
