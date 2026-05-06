# Skill: bootstrap-new-group

## 何时调用

用户说类似：

- "把这个模板初始化为我们 X 组用"
- "fork 完了，帮我重塑成 Y 组的 wiki"
- "我们组叫 Z，开始建 wiki"
- "remove the Leon's Group demo content"

## 前置检查

1. 确认仓库是 fork 状态：`git remote -v` 应该指向用户自己的 GitHub 仓库
2. 确认仓库当前是 demo 状态（包含 "Leon's Group"）：`grep -l "Leon's Group" README.md`
3. 确认依赖已装：`ls node_modules` 存在；不存在则跑 `pnpm install`

如果以上任何一项不满足 → 先告诉用户问题，不强行执行。

## 输入清单

向用户收集：

| 必填 | 字段 | 示例 |
|------|------|------|
| ✓ | 课题组显示名 | `"Wang's NLP Group"` `"清华大模型小组"` |
| ✓ | PI 名（英文 / GitHub username 优先） | `wang-prof` `rchen` |
| | PI 邮箱 | `wang@example.edu` |
| | 是否保留 demo 内容 | 默认清空，可选 `--keep-demo` 保留 DeepSeek 解读和概念词典作参考 |
| | 是否保留 15 个成员占位框架 | 默认清空到 1 个 PI 模板，可选 `--keep-members` |

## 执行步骤

1. **summary 给用户** + 问 "开始？"
   - 列出会改 / 删的范围
   - 列出 init:group 的 flags 选择

2. **跑 dry-run 给用户预览**：

```bash
pnpm init:group "<group display name>" --dry-run
```

3. 用户确认后跑真实执行：

```bash
pnpm init:group "<group display name>" [--keep-demo] [--keep-members]
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
用户：把这个模板初始化为我们 Wang's NLP Group 用。
agent：好。我先检查一下…

  ✓ 是 fork 状态
  ✓ 当前是 demo 状态（含 Leon's Group）
  ✓ 依赖已装

  我会跑 `pnpm init:group "Wang's NLP Group"`。这会：
    - 替换所有 "Leon's Group" → "Wang's NLP Group"
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

  [pnpm init:group "Wang's NLP Group" --dry-run 输出]

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

       下一步建议：
       1. 编辑 src/content/docs/members/pi.md 填 PI 信息
       2. 跟我说你们组关心的研究方向，我帮你建第一条主线
       3. 跟我说想读的第一篇 paper，我帮你建第一个 session

       哪个先开始？
```

## 不要做的事

- ❌ **不自动 git commit / push** —— 这是大改动，用户应该看一遍 git diff
- ❌ 不修改 `LICENSE`
- ❌ 不动用户 fork 的远程地址（`git remote`）
