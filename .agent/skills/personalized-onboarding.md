# Skill: personalized-onboarding

## 何时调用

- "新生 X 来了，研究兴趣是 Y，给他做第一周阅读路径"
- "给新博士定制 onboarding"
- "X 是工程方向，他不需要走全套，给个简化版"

## 输入清单

| 必填 | 字段 |
|------|------|
| ✓ | 新人 slug（已建主页）|
| ✓ | 研究兴趣 / 主线偏好 |
| ✓ | role（决定路径长短：博士生走完整 3 月路径；专硕走简化路径；RA 走 1 周路径）|
| | 已有的 background（可省略某些前置）|

## 执行步骤

### 1. 读资源

**首选 cycle-8 知识图**（一次返回 papers / sessions / concepts / owner，避免多 list:* 拼装）：

```bash
pnpm -s context:for themes/<theme-slug> --json --depth=2
```

返回该主线下的 papers / sessions / concepts / owner / co_owners。Agent 据此组装：
- 必读 paper：用 papers 段前 2 篇（优先 `exemplar: true`）
- 选读 concepts：用 concepts 段前 2-3 个（先父概念后子）
- 历史 sessions：用 sessions 段最近 3 个

补充查询（仍可用）：

- `pnpm list:themes --json` 找匹配的主线（基于研究兴趣关键词）
- 读对应 theme 文件的"推荐阅读路径"段

### 2. 在新人主页 `<slug>.md` 加一节

在 frontmatter 后、"## 关于"前插入：

```markdown
## 🎯 我的 onboarding 路径

> 由 [@<引导人>](/members/<slug>/) 或 agent 定制 · {date}

### 第一周（建立坐标系）

- [ ] [V4 概览](/deepseek/overview/) — 1h
- [ ] [<theme> 主线](/themes/<theme>/) — 30min
- [ ] [Session W18](/sessions/2026-w18-deepseek-v4/) — 看一遍历史会议
- [ ] 加 GitHub collaborator + 加群

**周末写**：在下面 Reading log 写第一条 100 字短评。

### 第一月（选定方向、上手实操）

按主线推荐路径走完第二、第三周内容；找小师兄定 mini-project。

…

### 三个月（第一个 mini-project）

- [ ] mini-project 题目（与 owner 定）
- [ ] 4 周做完 + 周会 share
- [ ] 写一篇 wiki 文章

---
```

### 3. 通用建议（保留默认 onboarding 页）

不动 `src/content/docs/onboarding.md` —— 那是通用版。**个性化版**写在新人自己主页里。

### 4. 角色化路径差异

| role | year/cluster | 路径调整 |
|------|--------------|---------|
| 博士生（新生） | year 1 | 完整 3 月路径 |
| 博士生（中后期） | year ≥ 2 | 缩到 2 周（自己已经熟）|
| 硕士生（科研） | — | 完整路径但 mini-project 更小 |
| 硕士生（专硕 / 工程） | cluster: 任务驱动者 | 第一周跑通 baseline；第一月写 internal/playbook；不必每周共读 |
| 硕士生（RA / 实习生） | — | 1 周路径 + 离开前留 1 篇 wiki |

### 5. 在新人 `members/<slug>.md` frontmatter 加 `theme_refs`

让"主理 / 关心的主线"成为结构化数据，构建期会在 `/themes/<slug>/` 反向显示"关心的成员"：

```yaml
theme_refs: [<theme-slug-1>, <theme-slug-2>]  # ✨ 与 research-interests 并存
tags: [<lowercase-hyphen>, ...]               # ✨
```

> `research-interests`（自由文本）和 `theme_refs`（slug 列表）暂时**并存**。Phase 2 会迁移到只用 `theme_refs`。

### 6. 跑 verify

## 不要做的事

- ❌ 不改全局 onboarding.md
- ❌ 不假定有 internal 路径文档（如果不存在留占位 "(内部 playbook 待补)"）
- ❌ 不自动 commit

## 演练发现（cycle 8 · 知识图集成）

- **#F10 context:for themes/<slug> 是主力**：过去要跑 3-4 条 list:* 命令拼出主线下的 papers / concepts / sessions，cycle-8 `pnpm -s context:for themes/<slug> --depth=2` 一条搞定，还带 owner / co_owners（可直接写进"引导人"字段）。
- **#F11 `theme_refs` 必须写进 members/<new>.md frontmatter**：否则构建期 `/themes/<theme>/` 页看不到这位新生。`research-interests` 自由文本对 agent 友好但对构建期无用。两者并存。
- **#F12 未做完整 dogfood**：本 cycle 只静态更新。下次真给新生定 onboarding 时记得记踩坑回到这里。
