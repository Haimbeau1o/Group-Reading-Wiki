# Skill: bootstrap-new-group

## 何时调用

用户说类似：

- "把这个模板初始化为我们 X 组用"
- "用 template 创建了仓库，帮我重塑成 Y 组的 wiki"
- "我们组叫 Z，开始建 wiki"
- "remove the Leon's Group demo content"

## 前置检查

1. 确认仓库为用户独立仓库：`git remote -v` 应该指向用户自己（不是 Haimbeau1o/Group-Reading-Wiki）
2. 确认仓库当前是 demo 状态（包含 "Leon's Group"）：`grep -l "Leon's Group" README.md`
3. 确认依赖已装：`ls node_modules` 存在；不存在则跑 `pnpm install`

如果以上任何一项不满足 → 先告诉用户问题，不强行执行。

## 输入清单

向用户收集：

| 必填 | 字段 | 示例 |
|------|------|------|
| ✓ | 课题组显示名 | 中文 / 英文都可：例 `"<你的课题组名>"` |
| ✓ | PI 名（英文 / GitHub username 优先） | `<pi-handle>` 或姓氏拼音，例：`lab-pi` |
| ✓ | GitHub 仓库（owner/repo） | `<your-org>/<your-wiki>`。可从 `git remote -v` 自动读 |
|    | 站点 URL（Cloudflare Pages 地址） | `https://<your-wiki>.pages.dev`。不知道就先用占位，后面填 |
|    | PI 邮箱 | `<pi-email>@<institution>` |
|    | 是否保留 demo 内容 | 默认清空，可选 `--keep-demo` |
|    | 是否保留 15 个成员占位框架 | 默认清空到 1 个 PI 模板，可选 `--keep-members` |

## 执行步骤

1. **summary 给用户** + 问 "开始？"
   - 列出会改 / 删的范围
   - 列出 init:group 的 flags 选择

2. **跑 dry-run 给用户预览**：

```bash
pnpm init:group "<group display name>" \
  --github=<owner/repo> \
  --site-url=<https://...pages.dev> \
  --dry-run
```

3. 用户确认后跑真实执行（省略 `--dry-run`）：

```bash
pnpm init:group "<group display name>" \
  --github=<owner/repo> \
  --site-url=<https://...pages.dev> \
  [--keep-demo] [--keep-members]
```

4. **跑 verify**：

```bash
pnpm verify
```

5. **下一步引导**：跟用户对话收集
   - PI 信息 → 编辑 `src/content/docs/members/pi.md`
   - 第一条研究主线 → 编辑 `src/content/docs/themes/example-theme.md`（可重命名）
   - 第一篇 paper 想读什么 → 跑 `pnpm new:session` 建第一个 session

## 检查点

- ✅ `pnpm verify` 通过 = bootstrap 成功
- ✅ `git status` 应显示一系列删除 + 部分文件修改
- ✅ `package.json scripts` 中 `init:group` 已被自动移除（防止重复执行）
- ✅ `scripts/init-group.mjs` 已被自删除

## 错误恢复

| 错误 | 处理 |
|------|------|
| `pnpm: command not found` | 提示用户先 `npm install -g pnpm@10` |
| `init:group` 报 "Leon's Group" 已不存在 | 仓库已被 bootstrap 过；告诉用户不要重复执行 |
| verify 失败 | 看具体错；通常是某个引用了被删 demo 文件的链接 → 让用户决定保留或修复 |

## 示例对话

```
用户：把这个模板初始化为我们课题组用。
agent：好。能告诉我课题组名吗？我先检查仓库状态…

  ✓ 已是用户独立仓库（从 template 创建）
  ✓ 当前是 demo 状态（含 Leon's Group）
  ✓ 依赖已装

  我会跑 `pnpm init:group "<你的课题组名>"`。这会：
    - 替换所有 "Leon's Group" → "<你的课题组名>"
    - 删 14 个 demo 成员占位（保留 1 个 PI 模板）
    - 删 4 条 demo themes（保留 1 个 example-theme 模板）
    - 删 demo session
    - 默认删 deepseek/ 论文解读（可选保留作参考）
    - 自删除 init:group 脚本

  问题：要保留 DeepSeek demo 内容（4 篇深度解读 + 5 概念词典）作为参考吗？
  - 推荐保留 if 你们组也是 AI / 大模型方向
  - 推荐删 if 你们方向不同

用户：保留概念词典就好，DeepSeek 解读删了

agent：好。先跑 dry-run 给你看一下：

  [pnpm init:group "<你的课题组名>" --dry-run 输出]

  确认开始？
用户：开始

agent：（跑真实命令）
       ✓ 替换文本：14 个文件
       ✓ 删除：14 成员 + 4 themes + 1 session + deepseek/
       ✓ 重置：README / index.mdx / themes/ / sessions/ / members/index
       ✓ 自删除 init-group.mjs

       跑 verify…
       ✓ build 通过（45 页）
       ✓ frontmatter schema 通过
       ✓ 链接自检：1 个 broken link → /deepseek/overview/（在 index.mdx）

       要我帮你修这个 broken link 吗？
用户：修

agent：（编辑 src/content/docs/index.mdx 移除该链接）✓

       下一步：跑 first-week-after-init skill（5 个对话循环，30-150 分钟）。
       要现在开始吗？还是想先休息？
```

## 衔接 first-week-after-init

这个 skill 完成时，**必须**确认：

- ✅ `group.config.yaml` 存在（init-group.mjs 已自动写）
- ✅ `stage: initialized`
- ✅ `group.name` / `group.github` / `group.site_url` 已填

然后立刻读 [`first-week-after-init.md`](first-week-after-init.md) 衔接，**不要让用户独自摸索"下一步该填什么"**。

如果用户说"先停下"，记得告诉他：以后任何时间跟 agent 说"读 BOOTSTRAP 帮我接着填 wiki"，agent 会自动从中断处继续。

## 不要做的事

- ❌ **不自动 git commit / push** —— 这是大改动，用户应该看一遍 git diff
- ❌ 不修改 `LICENSE`
- ❌ 不动用户仓库的远程地址（`git remote`）
