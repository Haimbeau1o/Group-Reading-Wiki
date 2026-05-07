# Skill: first-week-after-init

> **新 PI 在 `init:group` 跑完后，让 wiki 从"空架子"长成"上线可用"的引导 skill**。
>
> 把第一周该做的工作拆成 **5 个独立可中断的对话循环**。每个循环都可以跨多次会话，PI 可以随时说"先停下，明天继续"。

---

## 何时调用

`group.config.yaml` 里 `stage: initialized`、且 `pi.name == ""`。

或用户说类似：
- "init 完了，下一步呢？"
- "帮我填好这个 wiki"
- "把 wiki 上线"

---

## 总览：5 个循环

| 循环 | 主题 | 时长 | 完成判据 |
|------|------|------|---------|
| 1 | PI 主页 | ~15 min | `members/pi.md` 内容真实，`group.config.yaml` 的 `pi.*` 填好 |
| 2 | 第一条研究主线 | ~20 min | `themes/<slug>.md` 一份真实主线，`content.themes_count: 1` |
| 3 | 核心成员（PI + 1-2 个直接学生） | ~30 min | `members/` 里 ≥ 2 个真实成员（含 PI） |
| 4 | 第一篇真实 paper note | ~45 min | `papers/<slug>.md` 一份带"我们组的 take"的笔记 |
| 5 | 部署 + Giscus | ~30 min | 站点上线、评论区可用、`stage: established` |

**重要原则**：每个循环之间 PI 可以"先停下，明天继续"。Agent 每次重新进入要先 `cat group.config.yaml` 看完成到哪。

---

## 循环 1: PI 主页（~15 min）

### Agent 开场白

> "我们先把你的 PI 主页填好 —— 这是访客 / 新生最先看到的页面。我会问你 7 个问题，可以一次答完，也可以分几次。"

### 7 个问题（Agent 一次问 1-2 个，等 PI 回答再继续）

1. **你的全名（中英文）**？例：陈丽 / Li Chen。
2. **头衔**？助理教授 / 副教授 / 教授 / 研究员 / Lecturer。
3. **GitHub username**？（你已经填好仓库 owner 了，但 PI 个人 username 可能不同）
4. **联系方式优先级排序**？office hours / email / 群聊？给一个"这周如何找到你"的句子。
5. **个人主页或 Google Scholar URL**？
6. **3 篇最有代表性的论文**？标题 + venue 即可（"GPT-4 Technical Report. NeurIPS 2024"）。
7. **一段话研究宣言**？"我做什么 / 为什么这件事重要 / 我的判断是什么"，3-5 句话。

### Agent 答完 7 题后做的事

```bash
# 1. 把答案写进 src/content/docs/members/pi.md
#    模板已经留好建议结构（"基本信息 / 研究方向 / 代表论文 / 找我"）
#    Agent 只填实际内容，不动结构
```

```yaml
# 2. 更新 group.config.yaml
pi:
  name: "Li Chen"
  github: "lichen-prof"
  email: "li.chen@example.edu"
  homepage: "https://lichen-lab.example.edu"
```

```bash
# 3. 跑 verify 确认 pi.md 没破坏
pnpm verify
```

### 检查点

- ✅ `cat group.config.yaml | grep -A4 "^pi:"` 不再为空
- ✅ `pnpm verify` 通过
- ✅ `pnpm dev` 后访问 `/members/pi/` 显示真实姓名

### Agent 循环 1 收尾话

> "PI 主页填好了。预览：http://localhost:4321/members/pi/。
>
> 下一步是建第一条研究主线 —— 大概 20 分钟。现在做？还是想先休息一下？"

---

## 循环 2: 第一条研究主线（~20 min）

### Agent 开场白

> "研究主线是你组的'地图' —— 新生 30 分钟读完就知道我们在干啥。我先问 4 个问题。**只建一条**就好，剩下的之后慢慢加。"

### 4 个问题

1. **这条主线的名字**？要短，能放 sidebar。例：「长上下文推理」「MoE 稀疏化」。
2. **一段话讲清楚**：这条主线想解决什么问题？为什么现在做？（PI 说一段，agent 整理）
3. **5 篇必读**：列 arXiv ID 或论文标题。**这是 PI 的判断，不替他选**。
4. **3 个开放问题**：这条线上你最想让组里思考的 3 个尚未解决的问题。

### Agent 执行

```bash
# Agent 跑：
pnpm new:theme <slug> --title="<主线名>" --json
# 这创建 src/content/docs/themes/<slug>.md

# 然后 Agent 把 PI 答案填进对应 4 个段落：
#   - 一段话定位（问题 2）
#   - 必读论文（问题 3，每篇带 arXiv 链接）
#   - 开放问题（问题 4，3 条 bullet）
#   - 占位"近期 sessions" 段（先留空）
```

```yaml
# 更新 group.config.yaml
content:
  themes_count: 1
```

### 把 example-theme 删掉

```bash
rm src/content/docs/themes/example-theme.md
pnpm verify
```

如果 `themes/index.mdx` 还引用 example-theme，agent 也要更新它。

### 检查点

- ✅ `/themes/<slug>/` 页面显示真实内容
- ✅ `/themes/` 列表只有这 1 条（没了 example-theme 占位）
- ✅ `pnpm verify` 通过

---

## 循环 3: 核心成员（~30 min）

### Agent 开场白

> "我们至少建 PI + 1-2 个核心学生 —— 这样 wiki 看起来不像废墟。其他人之后慢慢加。"

### 一轮交互逻辑（每个成员重复）

Agent 问：

1. 这个人的角色？（大导师 / 小导师 / 博士生 / 硕士生 / RA）
2. 名字（slug + display name）？例：`zhang-san` / 张三。
3. 几年级 / 几年入组？
4. 他主要在哪条主线上？（关联到循环 2 的主线 slug）
5. 一句话研究兴趣？
6. GitHub？（可选）

```bash
# Agent 跑：
pnpm new:member <slug> --role="<角色>" --json
# 然后填好 6 个字段
```

```yaml
# 更新 group.config.yaml（按实际加进来的人数）
content:
  members_count: <N>
```

### 检查点

- ✅ `/members/` 列表显示 PI + N 个成员
- ✅ `pnpm list:members --json` 输出符合预期
- ✅ `pnpm verify` 通过

---

## 循环 4: 第一篇真实 paper note（~45 min）

这是最重要的循环 —— **wiki 的灵魂是论文笔记的质量**，不是骨架。

### Agent 开场白

> "我们写第一篇真实 paper note 作为 wiki 的'示范'。内置的 DeepSeek-R1 是我留给你看的样板（来自模板的 exemplar），但你需要自己组的一篇。
>
> 给我一篇你最近想让组里读的 paper 的 **arXiv ID**（例 `2401.02954`）。"

### Agent 收到 arXiv ID 后

```bash
# 1. 创建笔记骨架
pnpm new:paper <slug> --arxiv=<id> --theme=<上一步建的主线 slug>
# 这会自动从 arXiv 抓 title / authors / abstract 填入
```

### Agent 接下来的动作

1. **读抓回来的 abstract**，问 PI："这篇核心 contribution 你觉得是什么？2-3 句话。"
2. **方法部分**：问 PI："这篇方法图最关键的一张是哪张？告诉我图号 + 一句解释，我去抓那张图。"
3. **"我们组的 take"**：这是模板的灵魂段。Agent 问 PI 4 个引导问题：
   - 这工作**最值得我们组学**的点是什么？
   - 它**有什么明显限制**或者你不同意的地方？
   - 如果让我们组**复现 / 扩展**，会先做什么？
   - 这工作**联到我们哪条主线**？
4. **批判性段落**：把 PI 的 4 个回答写成 3-4 段对话式文字，不是 bullet list

### 关键：质量 gate

不要让"我们组的 take"段成为：
- ❌ "这是一篇关于 X 的论文" — 这是 abstract，不是 take
- ❌ 5 个 bullet "优点 1-5" — 这不是观点
- ✅ "这篇最有意思的是 X，但它绕开了 Y，我觉得我们组应该做 Z" — 这才是 take

参考 `src/content/docs/papers/deepseek-r1.md` 的 take 段写法。

### 关联到主线

```bash
# 编辑循环 2 建的主线，把这篇加到"必读论文"或"近期讨论"段
```

### 创建第一个 session 页（顺手）

```bash
pnpm new:session 2026-W<xx> <paper-slug> --lead=<某成员>
```

### 更新 group.config.yaml

```yaml
content:
  papers_count: 2     # exemplar + 这篇
  last_session: "2026-W<xx>"
```

### 检查点

- ✅ `/papers/<slug>/` 显示真实笔记，"我们组的 take" 段非空
- ✅ 主线页引用了这篇论文
- ✅ `/sessions/` 显示第一个 session

---

## 循环 5: 部署 + Giscus（~30 min）

这个循环 agent **不能完全替用户做**（涉及 GitHub UI / Cloudflare 登录），但可以精准引导。

### Agent 开场白

> "我们把 wiki 上线 + 启用评论区。这步需要你在浏览器里点几下 —— 我会精准告诉你每一步点哪里。"

### 5.A 部署到 Cloudflare Pages

→ 调用 [`setup-deploy`](setup-deploy.md) skill。完成后：

```yaml
deploy:
  cloudflare_pages: true
```

### 5.B 启用 Giscus 评论区

→ 调用 [`setup-comments`](setup-comments.md) skill。完成后：

```yaml
deploy:
  giscus_enabled: true
```

### 5.C 标记为 established

```yaml
stage: established
```

### Agent 收尾

```bash
git add -A
git status   # 让用户看一遍
# 用户确认后：
git commit -m "feat: first week of <Group> wiki — PI + 主线 + 成员 + 首篇 paper + 上线"
```

> "🎉 wiki 已上线 + 第一篇真实内容到位。从现在起：
>
> - 周一告诉我下周共读什么 paper、谁带读 → `weekly-session` skill
> - 共读后整理纪要给我 → `post-meeting-recap` skill
> - 新人入组告诉我 → `add-member` + `personalized-onboarding` skill
>
> 完整日常工作流见 `.agent/MAINTAINER_PLAYBOOK.md`。"

---

## 检查点：5 个循环全部完成

```bash
cat group.config.yaml
# stage: established
# pi.name: 非空
# content.themes_count: ≥ 1
# content.members_count: ≥ 2
# content.papers_count: ≥ 2
# deploy.cloudflare_pages: true
# deploy.giscus_enabled: true

pnpm verify   # 必须 0 warning
```

---

## 错误恢复

| 情况 | 处理 |
|------|------|
| PI 中途说"我不想做这个循环了" | 把当前进度写 `group.config.yaml`（即便不完整），下次进来 agent 接着问 |
| `pnpm verify` 在某循环报错 | 看具体什么挂 —— frontmatter / 链接 / 命名。修完再回来继续 |
| PI 不知道 arXiv ID | 让他给标题 / 关键词，agent 用 search 找 |
| 想跳过某循环（比如先不部署） | 可以，但 `stage` 不能写 `established`。保持 `initialized` 直到所有循环过 |

---

## 不要做的事

- ❌ **不在没问 PI 的情况下臆造研究方向 / 主线 / 论文清单**
- ❌ **不一次性把 5 个循环跑完不停**。每个循环之间确认 PI 在线
- ❌ **不替 PI 写"我们组的 take"**。这必须是 PI / 学生的判断
- ❌ **不把 exemplar paper note (deepseek-r1.md) 删了**，作为后来者的样板保留

---

## Lessons learned（写给以后的 agent）

- 第一次跑这个 skill 时，PI 通常**最累的循环是 4**（写 paper note）。如果 PI 表现疲劳，建议把循环 4 拆成两次会话：第一次填骨架（Agent 抓 arXiv），第二次再写 take。
- 循环 1 的 7 个问题里，**问题 4（如何找你）和问题 7（研究宣言）** 容易被 PI 跳过 — 不要硬逼，留 TODO 注释让他后面补。
- `group.config.yaml` 的更新**必须实时写**。如果忘了写，后面 agent 进来会以为还没做。
- 写 paper note 时**尽量引导对话式语言**，不要 bullet list。读者从对话里学到的判断力比从清单多。
