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

> "我们先把你的 PI 主页填好 —— 这是访客 / 新生最先看到的页面。我会问你 7 轮问题（某一轮可能拆为 a/b），可以一次答完，也可以分几次。某一问跳过就说跳过。"

### 7 轮问题（Agent 一次问 1-2 个，等 PI 回答再继续）

> 设计原则：**每个问题只对应一个具体产出字段**（yaml 某字段 或 pi.md 某段）。
> 不要把两个需求合进一题（例如"联系方式优先级"不能拿到具体 email）。

1. **你的全名（中英文）**？例：陈丽 / Li Chen。只有中文或只有拼音也可。
   → 写入 `pi.md` frontmatter `title:` + sidebar `label:`

2. **头衔**？助理教授 / 副教授 / 教授 / 研究员 / Lecturer。**如果多个 title 用 `/` 分隔**（例："教授 / 系主任"）。
   → 写入 `pi.md` frontmatter `title_label:`

3. **你个人的 GitHub 账号用户名**？用来在 wiki 里关联你的头像、以及 PR / issue 里 @ 你。
   - 如果你常用 GitHub：给我**你登录用的 username**（即 `https://github.com/<X>` 里的 X）
   - 如果不用或还没账号：说"没有"，我留空
   ⚠️ 这是**个人**账号，不是你仓库的 owner（那个接下来 init 已自动读取了）
   → 写入 `group.config.yaml: pi.github`

4a. **常用联系邮箱**？格式：`<your-email>@<your-domain>`。不想公开说"跳过"，wiki 上不显示邮件链接。
   → 写入 `group.config.yaml: pi.email`

4b. **这周怎么找你最有效**？一句话。例：
   - "邮件最快，office hours 周三下午在 SEIEE-300"
   - "先找博士大师兄过滤，过不了的再来找我"
   → 写入 `pi.md` 的 `## 找我` 段

5. **个人主页或 Google Scholar URL**？可跳过，agent 留 TODO。
   → 写入 `group.config.yaml: pi.homepage` + `pi.md` 的 `## 找我` 段

6. **3 篇最有代表性的论文**？格式：`*Title*. Venue Year.`。
   ⚠️ **不要给 default example**——PI 会偷懒把占位论文原样复粘。只说格式，PI 不会记就跳过。
   → 写入 `pi.md` 的 `## 代表论文` 段

7. **一段话研究宣言**？3–5 句话讲清楚：(a) 你做什么 (b) 为什么这件事重要 (c) 你的判断是什么。
   - 可以给 1–2 个范例（不同风格）让 PI 参考，但说明「这是例子，不要复粘」
   → 写入 `pi.md` 的 `## 关于` 段

### 从研究宣言提取 research-interests

问题 7 的宣言里挑出 1–3 个关键词写进 `pi.md` frontmatter `research-interests` 字段。

- **如果宣言具体**（提到了 1–2 个技术点）→ 以它们为关键词。
- **如果宣言过于抽象**（例如 "我做人工智能"）→ 主动追问："你能给我 1–3 个具体点的关键词吗？"
- **不能直接照抄默认值**：`pi.md` 模板里保留的 `research-interests` 占位词（如"长上下文效率"等）来自 demo，不能照抄。这个字段必须是"这位 PI 真正关心的"——只从问题 7 的答案里提。

### Agent 答完 7 题后做的事

```bash
# 1. 把答案写进 src/content/docs/members/pi.md
#    模板已经留好建议结构（"基本信息 / 研究方向 / 代表论文 / 找我"）
#    Agent 只填实际内容，不动结构
```

```yaml
# 2. 更新 group.config.yaml
pi:
  name: "<从问题 1>"
  github: "<从问题 3；可为空字符串>"
  email: "<从问题 4a；可为空字符串>"
  homepage: "<从问题 5；可为空字符串>"
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

### 开始前：一致性检查（重要）

读 `pi.md` 的 `## 关于` 段（循环 1 写的研究宣言）。记下 PI 在那里赌的是**哪条话**。

接下来 PI 告诉你“第一条主线”时，可能出现三种情况：

- ✅ **一致** —— 主线与宣言在同一个话题上 → 直接走
- ⚠️ **部分重叠** —— 比如宣言说 “高效推理”，主线说 “推理时反思”——两个在 reasoning 话题下可以共存 → 走
- 🔴 **完全不同** —— 宣言说 “高效推理”，主线说 “Alignment” —— **不要默默带过**。给 PI 三选一：
  - **(a)** 你有两条独立主线 → 现在先建 B，之后 PI 主页会加上 A
  - **(b)** 研究方向变了 → 同步改 `pi.md` 的《关于》段
  - **(c)** 刚才随口说的 → 重选主线，与宣言一致

这个检查是为了防止 `pi.md` 上说 X，但所有主线 / paper / session 都是 Y。

### 4 个问题

1. **这条主线的名字**？要短，能放 sidebar。推荐 4–8 个字，不太宽不太窄。例：「长上下文推理」「MoE 稀疏化」。
2. **一段话讲清楚**：这条主线想解决什么问题？为什么现在做？你押什么判断？2–4 句话。
3. **5 篇必读**：列 arXiv ID 或论文标题。**这是 PI 的判断，不替他选**。想不齐先给 2–3 篇也行，留 TODO。
4. **3 个开放问题**：这条线上你最想让组里思考的 3 个尚未解决的问题。同样可跳过。

### 当 PI 说 “agent 帮我写一段”（push-back 模板）

问题 2（一段话）是最常被 PI 要求 “你帮我写” 的。**不能直接写**（违反 BOOTSTRAP 红线）。
标准 push-back 模板：

```
PI: “你帮我写一段。”
Agent: “我不能直接写 —— 这是你的研究判断，我编出来对你是抽象的，
         对组员是骗人的。但我能让你容易。把 '写一段' 拆成 4 个
         一句话问答，你答完我组装。

         Q-A: 这条线要解决的核心问题是？
         Q-B: 现有方法哪里不够？
         Q-C: 你赌哪条路 2-3 年会出突破？
         Q-D: 为什么现在做？

         你只需答其中 2-3 个就够我组装一段。”
```

不要一次出 4 个子问，可以先倒两个。拆问后，Agent 拿 PI 的一句话回答组装成一段，主动说「这是我从你原话设装的，你 review」。

该模板同样适用于：循环 1 问题 7（宣言）、循环 4（论文 take 段）。

### Agent 执行

```bash
# 1. 创建主线骨架 + 自动更新 themes/index.mdx 列表
pnpm new:theme <slug> \
  --title="<主线名>" \
  --label="<sidebar 短名>" \
  --description="<一句话定位>" \
  [--owner=<member-slug>] \
  --json

# 2. 把 PI 问题 2 的答案（或 push-back 拆问后组装出的一段）填进
#    src/content/docs/themes/<slug>.md 的《一句话定位》段
# 3. 问题 3 的论文填《关键论文（外部）》段；PI 其他 TODO 留着
# 4. 问题 4 的问题填《我们关心的开放问题》段
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

Agent 一次问 1-2 个。**问题 5 不给 example**（PI 容易复粘）。

1. **这个人的角色**？大导师 / 小导师 (讲师 / postdoc) / 博士生 / 硕士生 / RA。
   → `--role=<...>`。如果是小导师，追问具体 title（讲师 / postdoc / 助理教授）→ `--title-label=<...>`。

2. **slug + display name**？slug 只能是 小写英文 + 连字符（不能中文）。例：`zhang-san` / display 「张三」。
   - 不想暴露真名：slug 用 `phd-1` / `ms-1` 占位，display 写「博士 1」。
   → `<slug>` + `--display-name="..."`

3. **几年级 或 几年入职**？问法随角色变化：
   - **博士生 / 硕士生**：几年级？→ `--year=N`
   - **讲师 / postdoc**：什么时候入职的？个月即可。→ `--joined=YYYY-MM`
   - **大导师（PI）**：在循环 1 已处理，循环 3 不重建

4. **主要在哪条主线上**？给 a/b/c：
   - **(a)** 是循环 2 建的主线的 owner / 核心推手 → `--theme=<那个 slug>`，同步去 themes/<slug>.md 的 owner 段加 cross-link
   - **(b)** 做别的 → 记下 PI 说的方向，**本次不建第二条主线**，member 的 `--theme` 不传
   - **(c)** 跨多条 → 跳 a（主推那条同步主线 owner）

5. **一句话研究兴趣**？不给 example。只说 “一句话，不超过 25 个字、包含 1-2 个技术点关键词”。→ `--interest="..."`（可多次传）

6. **GitHub username**？个人账号。没有说 “无”。→ 手动填联系段

### Agent 执行

```bash
pnpm new:member <slug> \
  --role="<角色>" \
  --display-name="<人话名字>" \
  [--title-label="<讲师 / postdoc / ...>"] \
  [--year=<N>  | --joined=<YYYY-MM>] \
  [--theme=<theme-slug>] \
  [--interest="<兴趣 1>"] [--interest="<兴趣 2>"] \
  --json
```

如果传了 `--theme`，Agent **还要**手动去改 `themes/<slug>.md` 的 `## 该方向的 owner` 段，加 `[<displayName>](/members/<slug>/)` 链接（本步是 new-member.mjs 的提示但不自动改 themes 文件）。

还要手动更新 `members/index.mdx` 把这个人加到对应的分组下（小导师 / 博士生 / ...）的 CardGrid 里。

```yaml
# 更新 group.config.yaml
content:
  members_count: <N>   # PI 已 = 1，每加一个 +1
```

### 检查点

- ✅ `/members/` 页面显示 PI + N 个成员
- ✅ 每个成员页 frontmatter 详全（role + status + year/joined + display name）
- ✅ 成员与他主推主线双向链接（theme.md owner 段 + member.md 主推主线段）
- ✅ `pnpm verify` 通过

---

## 循环 4: 第一篇真实 paper note（~45 min）

这是最重要的循环 —— **wiki 的灵魂是论文笔记的质量**，不是骨架。

### Agent 开场白

> "我们写第一篇真实 paper note 作为 wiki 的'示范'。内置的 DeepSeek-R1 是我留给你看的样板，但你需要自己组的一篇。
>
> 给我一篇你最近想让组里读的 paper 的 **arXiv ID**（例 `2401.02954`）。有 lead 中意的人带读么？没也可以，默认 PI 作者。"

### 这个循环完全委托给 add-paper-note skill

详细读论文 + 起草笔记的完整流程在 [`add-paper-note.md`](add-paper-note.md)。包括：

- Keshav 三遍阅读法（第一遍 5C · 第二遍 细读 · 第三遍 虚拟复现）
- 批判性阅读 5 个追问（problem clarity / novelty / evidence / limitation / generalization）
- Agent 起草范围：元信息 / 一句话总结 / 关键贡献 / 方法框架 / Counter-evidence / 复现性
- Agent 不写范围：我们组为什么读 / take 段
- 所有起草都加 `:::caution[🤖 Agent 起草 · 待 review]:::` banner
- review 契约：删 banner + status: draft → published

本循环只负责：

```bash
# 1. 调用 new:paper 带 --arxiv（自动抓元数据 + 起草多段 + 加 caution）
pnpm new:paper <slug> \
  --arxiv=<id> \
  --theme=<循环 2 的主线 slug> \
  --lead=<循环 3 加的某成员 slug>
```

抓到后：agent **走 add-paper-note 的 4 个前置检查**（slug 唯一 / 主线匹配 / 已有同主题 / 网络可达）+ Keshav 第一遍阅读填元信息 。

### 主线-paper 不匹配 surface（必走口话）

Agent 读完 abstract 后动手填主线之前，必须告诉 PI 匹配判断：

- 🟢 paper 核心问题 = 循环 2 主线核心问题 → 直接挂
- 🟡 paper 某一节触及主线（不是主菜） → 挂，但在元信息注 “以 X 节 为接点”
- 🔴 paper 与现有主线均偏 → **不默认挂主线**，问 PI 选：(a) 不挂 (b) 起一条新主线后挂 (c) 重选一篇攲合主线的 paper

这个与循环 2 的 "PI 宣言 vs 主线 一致性检查" 是姊妹设计。

### Take 段的处理（中间档）

红线：**Agent 不自动为 take 段生成最终内容**。但允许三种路径：

- **(首选)** PI / lead 当场口述起 PEEL 结构的立场（Point-Evidence-Explanation-Link） → agent 记载。
- **(中间档)** PI 二次坚决说"你写" → agent 起草 + 加 prominent caution + frontmatter status: draft 锁住，明说"本付变不算稿"。
- **(退路)** PI / lead 不现场写 → take 段保留为 5 个引导问题的 caution 块，等他们下周填。

### Agent 代写 中间档的标准格式

```markdown
## 我们组的 take

:::caution[🤖 Agent 起草 · 待 <lead> review]
下面这段是 agent 从 abstract + 主线背景**起草**的初稿，**未经 PI 修订前不算正式 take**。
请 PI / 带读人删改后把本 caution 块去掉 + `status: draft` 改为 `published`。
:::

[Agent 起草 PEEL 结构的 1-3 段，不动上面 caution。]

> ☝️ 上面是 agent 起草。PI / 带读人**必须**修订或重写后删 caution 块。
```

### 创建第一个 session

```bash
pnpm new:session 2026-W<xx> <paper-slug> --lead=<member-slug> --paper=<paper-slug>
```

### 质量 gate

不要让 take 段成为：

- ❌ "这是一篇关于 X 的论文" —— 这是 abstract，不是 take
- ❌ 5 个 bullet "优点 1-5" —— 这不是观点
- ✅ "这篇最有意思的是 X，但它绕开了 Y，我觉得我们组应该做 Z" —— 这才是 take

参考 `src/content/docs/papers/deepseek-r1.md` 的 take 段写法。

### 关联到主线（手动）

```bash
# 编辑循环 2 建的主线，把这篇加到"关键论文（外部）"段
```

### 更新 group.config.yaml

```yaml
content:
  papers_count: 2     # exemplar + 这篇
  last_session: "2026-W<xx>"
```

### 检查点

- ✅ `/papers/<slug>/` 显示真实笔记
- ✅ take 段是 PI / lead 写的，**或**带 caution 的 agent 起草（status: draft）
- ✅ 复现性 checklist 至少 3 项打勾
- ✅ 主线页引用了这篇论文（双向）
- ✅ `/sessions/` 显示第一个 session
- ✅ pnpm verify 通过

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
- 循环 1 的某些问题（5 个人主页、6 代表论文、7 研究宣言）容易被 PI 跳过 — 不要硬逼，留 TODO 注释让他后面补。
- `group.config.yaml` 的更新**必须实时写**。如果忘了写，后面 agent 进来会以为还没做。
- 写 paper note 时**尽量引导对话式语言**，不要 bullet list。读者从对话里学到的判断力比从清单多。

### 演练发现（循环 1，首轮开发阶段）

- **PI 不知道"GitHub username"指什么**。Skill 原版假设 PI 知道仓库 owner=组织级，问题 3 要 PI 给"个人 username"——这个对比对 PI 来说是空中楼阁。已修：问题 3 改为先解释"为什么要它"，再给找用户名的方法（`github.com/<X>` 里的 X）。
- **"联系方式优先级"无法拿到具体 email**。原版问题 4 把"邮箱地址"和"如何找你"合进一题，PI 答了 prose 但 yaml 字段拿不到结构化 email。已修：拆为 4a (yaml: email) + 4b (prose: 找我段)。
- **default example 太合理 PI 直接复粘**。问题 6 给的例子论文 PI 原样贴回。已修：明确**不给 default example**，只给格式，PI 不会就跳过。
- **research-interests 字段从哪来不明**。原版 skill 没说该字段如何填，agent 容易拍脑袋写或留默认。已修：明确"从问题 7 研究宣言里提取 1–3 个关键词；宣言抽象就主动追问"。
- 多 title 用 `/` 分隔的约定写进 skill（之前没写）。

### 演练发现（循环 2，首轮开发阶段）

- **PI 把 agent 的 examples 当备选项给回来**。问"主线名"时 PI 回了 4 个我例子里的备选 ——agent 必须 narrow 到 1 条（用 "你最近带学生最多的方向" 这种从产出反推的提问）。已修：循环 2 问题 1 加了"4–8 个字"粒度提示。
- **PI 让 agent 代写 manifesto**。最常见的红线触碰场景。已修：加 "push-back 模板" 一节，给标准化拆问 4 步骤（Q-A 核心问题 / Q-B 现状不足 / Q-C 押注 / Q-D 紧迫性），PI 答 2-3 个 agent 组装。该模板同样适用于循环 1 Q7 + 循环 4 take 段。
- **PI 主页宣言 vs 主线方向矛盾未被 agent 检测**。循环 1 写"高效推理"，循环 2 说"alignment"——agent 容易默默写 wiki 内容不一致。已修：循环 2 开头加 "一致性检查" 节，强制 agent 读 pi.md 关于段，发现矛盾时给 PI 三选一 (a 两条独立 / b 改宣言 / c 重选)。
- **`pnpm new:theme` 脚本不存在**。skill 引用了根本没实现的命令。已修：实现 `scripts/new-theme.mjs` + 注册 package.json，自动创建 themes/<slug>.md 骨架并更新 themes/index.mdx 列表。骨架里 6 个 TODO 段都附上参考样例。
- **PI 答"什么意思"时 agent 必须立刻短化**。我之前 push-back 时一段太长 PI 不懂。原则：如果 PI 反应是"什么意思"，下一轮回复必须 ≤ 50 字 + 1 个具体问题。

### 演练发现（循环 3，首轮开发阶段）

- **`init-group.mjs` 漏改 `members/index.mdx` 的 PI 卡片**。原来留 `<PI 姓名>` 占位，新仓库主页一直显示。已修：init 时改为 `title="PI"` + TODO 注释指向循环 1。
- **`new-member.mjs` 默认 `cluster: 学习成长者` 不分角色**。讲师 / postdoc 套不上。已修：cluster 默认空（per role-model.md 决策树），并新增 `--joined`、`--display-name`、`--title-label`、`--theme`、`--interest`（可多次）等 flag 让 agent 一次性写满。
- **循环 3 Q5 一样犯了"给 example PI 复粘"错**。已修：明确不给 example。
- **Q3 字段语义随角色变**：博士生用 `year`，讲师 / postdoc 用 `joined`。Skill 改成"问法随角色变化"+ 对应 flag。
- **PI 卡片 / 成员 index 仍需手工改**。skill 加注：传 `--theme` 后 agent 还得改 themes 文件 + members/index.mdx，new-member.mjs 不自动跨文件改（保护原则）。
