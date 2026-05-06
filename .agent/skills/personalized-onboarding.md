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

- `pnpm list:themes --json` 找匹配的主线（基于研究兴趣关键词）
- 读对应 theme 文件的"推荐阅读路径"段
- `pnpm list:concepts --json` 看哪些概念词条与主线相关
- `pnpm list:sessions --since=180d --theme=<theme-slug>` 看最近的 sessions

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

### 5. 跑 verify

## 不要做的事

- ❌ 不改全局 onboarding.md
- ❌ 不假定有 internal 路径文档（如果不存在留占位 "(内部 playbook 待补)"）
- ❌ 不自动 commit
