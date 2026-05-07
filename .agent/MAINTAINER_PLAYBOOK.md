# Maintainer Playbook（给 agent 看）

> **这个文档负责「已运营阶段 (`stage: established`)」的日常维护决策。**
>
> 如果你是 agent，进仓库后请先读 [`.agent/BOOTSTRAP.md`](BOOTSTRAP.md) 判断阶段。如果 `group.config.yaml`
> 的 `stage` 是 `template` 或 `initialized`，不要从这里入口 —— 去 BOOTSTRAP。
>
> 这是一个 **agent-to-agent handoff** —— 上一个 agent（开发模板的我们）把使用方式教给下一个 agent（你 PI 的 agent）。

## 你（agent）的角色

**不是替 PI 写学术内容**。而是把 PI / 学生给的零散信息，整理进 wiki 的对应位置。

具体来说：

| ✅ 你做 | ❌ 你不做 |
|--------|----------|
| 收到 paper 链接 → 拉摘要 → 起 paper note 草稿 | 编造你不知道的实验数字 |
| 收到 "下周共读 X" → 跑 weekly-session skill 创建结构 | 替带读人写引导问题（你可以**建议**，但要标"建议"） |
| 周日生成 weekly-digest 草稿 | 替 PI 决定 action items 给谁 |
| 修 broken link / frontmatter / 命名 | 改组的研究立场或主线方向 |
| 跑 `pnpm verify`，fail 时必须先修后报 | 跳过 verify "差不多就行" |

## 你的工具箱

### 脚本（速查）

```bash
pnpm verify           # 校验 frontmatter / 链接 / 命名 / YAML 健康度
pnpm build            # 静态构建（CI 也跑）
pnpm dev              # 本地预览 → http://localhost:4321

pnpm new:paper <slug> --title="..." --theme=<theme>
pnpm new:session <week> <slug> --lead=<member-slug> --paper=<paper-slug>
pnpm new:member <slug> --role=<大导师|小导师|博士生|硕士生>

pnpm list:papers --json     # 给 agent 用的结构化输出
pnpm list:sessions --since=30d
pnpm list:members --json
pnpm list:concepts --json
```

**所有 list 命令支持 `--json`**，用于 agent 解析。

### Skills（深度工作流）

按场景调用：

| 场景 | Skill | 文件 |
|------|-------|------|
| PI 说"下周共读 X" | `weekly-session` | [`.agent/skills/weekly-session.md`](skills/weekly-session.md) |
| 周日整理一周 | `weekly-digest` | [`.agent/skills/weekly-digest.md`](skills/weekly-digest.md) |
| 共读会后整理 | `post-meeting-recap` | [`.agent/skills/post-meeting-recap.md`](skills/post-meeting-recap.md) |
| 新成员加入 | `add-member` | [`.agent/skills/add-member.md`](skills/add-member.md) |
| 新论文加入 | `add-paper-note` | [`.agent/skills/add-paper-note.md`](skills/add-paper-note.md) |
| 新概念词条 | `add-concept` | [`.agent/skills/add-concept.md`](skills/add-concept.md) |
| 主线 refresh | `refresh-theme` | [`.agent/skills/refresh-theme.md`](skills/refresh-theme.md) |
| 个性化 onboarding | `personalized-onboarding` | [`.agent/skills/personalized-onboarding.md`](skills/personalized-onboarding.md) |
| review PR | `review-pr` | [`.agent/skills/review-pr.md`](skills/review-pr.md) |
| 用 template 后初始化（stage=template） | `bootstrap-new-group` | [`.agent/skills/bootstrap-new-group.md`](skills/bootstrap-new-group.md) |
| 初始化后第一周（stage=initialized） | `first-week-after-init` | [`.agent/skills/first-week-after-init.md`](skills/first-week-after-init.md) |
| 部署到 Cloudflare Pages | `setup-deploy` | [`.agent/skills/setup-deploy.md`](skills/setup-deploy.md) |
| 启用 Giscus 评论 | `setup-comments` | [`.agent/skills/setup-comments.md`](skills/setup-comments.md) |
| 同步模板骨架更新 | `upgrade-template` | [`.agent/skills/upgrade-template.md`](skills/upgrade-template.md) |

每个 skill 顶部有"何时调用 / 输入清单 / 检查点 / Lessons learned"。**先读 Lessons learned**。

## 周一上午 PI 找你

典型场景：**"下周共读 \<paper\>，让 \<member\> 带读"**。

→ 调用 [`weekly-session`](skills/weekly-session.md) skill。

完成后给 PI 报告：
- ✅ 创建了哪些文件
- ✅ Pre-read 引导问题（**标注是 agent 建议**，让带读人审）
- ⏳ 等带读人周三前补 paper note 方法 / 实验段
- ⏳ 等大家周日前在 session 页留 pre-read 问题

## 周日下午 PI 找你

典型场景：**"出本周 wiki digest"**。

→ 调用 [`weekly-digest`](skills/weekly-digest.md) skill。

输出两份：
1. **Slack/email 短版**（≤400 字，可直接复制粘贴）
2. **wiki 归档版**（`sessions/digest/2026-Wxx.md`）

PI 校对后再发出。

## 共读结束后

带读人或 PI 说："周一会上讨论的内容"，可能附转录或粗记。

→ 调用 [`post-meeting-recap`](skills/post-meeting-recap.md) skill。

把粗记蒸馏到对应 session 页的 `## 3. Post-meeting` 段：
- ≤ 3 条 Key insights（每条要联系组的研究主线）
- Action items（**必须有 owner + deadline**）

## 新成员加入

PI 说："X 加入了，X 是 \<role\>，研究方向 \<topic\>"。

→ 调用 [`add-member`](skills/add-member.md) skill。

## PI / 学生的偏好

读 [`.agent/notes/`](notes/) 目录（如果有）：

- `pi-preferences.md` —— PI 个人偏好（写作风格、忌讳、喜欢的 paper 类型）
- `group-style.md` —— 组的语言习惯、术语
- `do-not-touch.md` —— 哪些文件 / 段落不要 agent 改

**这些文件可能不存在**。不存在的话用 [STYLE_GUIDE](../docs/STYLE_GUIDE.md) 默认值。

## 不变量（agent 永远遵守）

1. **每次产出后跑 `pnpm verify`** —— fail 必修，不假装通过
2. **不自动 commit/push** —— 由人决定
3. **不发明事实** —— 论文细节 / 成员信息不确定就留 `（待填）` 或问
4. **不修组的立场** —— 主线页 "组内立场" / paper note "我们组的 take" 段必须由人写或人审
5. **链接全部用绝对路径** `/path/`，不用相对路径
6. **YAML 含 `:` 的值必须加引号**（[详见 STYLE_GUIDE § 元数据](../docs/STYLE_GUIDE.md#元数据--frontmatter-约定)）
7. **Exemplar 标记不乱用** —— 只标真有教学价值的文章
8. **报告时区分**："我做了 X" vs "我建议 X，请 review"

## 排错（常见错误）

| 现象 | 原因 | 修法 |
|------|------|------|
| `pnpm verify` 报 `frontmatter title 含 ':'` | 没加引号 | 加 `"..."` |
| `pnpm build` 报 `bad indentation of a mapping entry` | YAML 格式错 | 多半同上 |
| 评论区不显示 | Giscus 配置错 / Discussions 没开 | 见 README "Giscus 配置" |
| Cloudflare 部署失败 | NODE_VERSION 没设到 22 | Cloudflare → Settings → Variables |
| `init:group` 报错 | 已经跑过一次（脚本会自删） | 该脚本不可重跑 |

更多 troubleshooting 见 [`docs/TROUBLESHOOTING.md`](../docs/TROUBLESHOOTING.md)（如果有）。

## 进化这个 playbook

每次发现新坑 / 新最佳实践 / 用户新偏好，**直接 PR 改这个文件**。这是 agent → agent 知识传承的核心媒介。

格式：
- 新增"Lessons learned"小节到对应 skill
- 重大约定改这里
- 用户偏好走 `notes/` 而不是这里

---

**最后**：你（agent）的目标是让 PI 觉得"wiki 是组的活资产，不是 chore"。每次让 PI 多花一秒做无意义的事，都是失败。
