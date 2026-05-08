# Skill: add-member

## 何时调用

用户说类似：

- "新成员张三加入了，建主页"
- "招了个博士后 X，加进 wiki"
- "今年新生 5 个，帮我建占位"
- "李四毕业了，改成 alumni"

## 输入清单

| 必填 | 字段 | 推断 / 询问 |
|------|------|-------------|
| ✓ | slug | 优先用 GitHub username；备选英文名拼音、`<role>-<num>` |
| ✓ | role | 大导师 / 小导师 / 博士生 / 硕士生（见 `.agent/context/role-model.md` 决策树） |
| | 显示名 | 自由文本（中文 / 英文都可） |
| | year | 仅博/硕 |
| | cluster | 选填，见 role-model 决策树 |
| | research-interests | 列表 |
| | github username | 选填 |
| | email | 选填 |

## 前置检查

1. slug 唯一：`ls src/content/docs/members/<slug>.md` 应不存在
2. role 在 4 个合法值之内
3. 如果用户没给 role：根据用户描述推断（参见 `.agent/context/role-model.md` 决策树）

## 执行步骤

### 1. 跑脚手架

```bash
pnpm new:member <slug> --role=<role> [--year=<n>] [--cluster=<cluster>]
```

### 2. 编辑生成的 `<slug>.md`，替换占位

| 占位 | 替换 |
|------|------|
| `title:` | 显示名 |
| `description:` | 一句话（如"3 年级博士，长上下文方向"）|
| `research-interests:` | 用户提供的兴趣 list |
| `> 一段话自我介绍。` | 留占位 + 备注"等本人填" |
| `Email: …` `GitHub: …` | 替换或留占位 |

### 3. 加入 `members/index.mdx` 的对应分组

`members/index.mdx` 用 LinkCard 手动分组（见 `repo-map.md`）。在合适分组下加：

```mdx
<LinkCard title="<显示名>" description="<一句话>" href="/members/<slug>/" />
```

分组按 `role` + `year` 决定：

| role | year | 分组 |
|------|------|------|
| 大导师 | — | "🎓 大导师" |
| 小导师 | — | "👨‍🏫 小导师" |
| 博士生 | 4-5 | "高年级（4–5 年级）" |
| 博士生 | 2-3 | "中年级（2–3 年级）" |
| 博士生 | 1 | "新生（1 年级）" |
| 硕士生 | — 学硕 | "学硕（科研型）" |
| 硕士生 | — 专硕 | "专硕（工程方向）" |
| 硕士生 | — RA | "本科 RA" |

### 4. 更新 sidebar 排序（如有需要）

`sidebar.order` 是 1（PI）→ 2（小导师）→ 3+（博士） → 10+（硕士）。新成员分配下一个空 order。

### 5. 跑 verify

```bash
pnpm verify
```

## 状态变更（毕业 / 离开）

用户说 "X 毕业了" / "X 离开"：

1. 改 `<slug>.md` frontmatter `status: alumni` 或 `status: visitor`
2. 从 `members/index.mdx` 主分组移除
3. 加到 `members/index.mdx` 的"## 历届成员 / Alumni"小节

**不删主页文件** —— 保留为档案。

## 批量入组（新生季）

用户说 "新生 5 个一起建占位"：

1. 收集每人最少信息：slug + role + year（或 RA）
2. 循环跑 `pnpm new:member` × N
3. 一次性更新 `members/index.mdx` 的对应分组
4. 跑一次 verify

## 检查点

- ✅ `<slug>.md` 文件存在
- ✅ frontmatter `role` `status` 必填字段都有
- ✅ `members/index.mdx` 在对应分组里能找到 LinkCard
- ✅ verify 通过

## 示例对话

```
用户：新成员张三加入，他是博士后做长上下文。GitHub 是 zhangsan-research
agent：好。

  推断：
    slug: zhangsan-research（用 GitHub username）
    role: 小导师 (博士后)
    cluster: 研究主理人 (主导子项目)
    research-interests: [长上下文]

  执行 `pnpm new:member zhangsan-research --role=小导师 --cluster=研究主理人`...
  ✓ 文件已建

  编辑模板填：
    title: 张三
    description: 博士后 · 长上下文方向
    research-interests: [长上下文]

  加入 members/index.mdx → 👨‍🏫 小导师 分组

  跑 verify... ✓

  完成。要不要我接下来根据他研究兴趣，给他生成第一周阅读路径
  （personalized-onboarding skill）？
```

## 不要做的事

- ❌ 不替本人写 "关于我" 段（留占位）
- ❌ 不假定真实邮箱 / 联系方式
- ❌ 不删 alumni 文件（改 status 即可）
- ❌ 不自动 commit / push

## 与其他 skill 的衔接

- ✅ **add-member 完成后**主动询问是否进入 [`personalized-onboarding`](./personalized-onboarding.md) — 给新成员生成第一周阅读路径（按其 research-interests）
- ✅ **首次 init 后建核心成员**走 [`first-week-after-init`](./first-week-after-init.md) 循环 3，而非直接 add-member（前者多了 owner 关联到 themes 的步骤）

## frontmatter 字段约定（与 `new-member.mjs` 一致）

- `role`: **中文值** — `大导师` / `小导师` / `博士生` / `硕士生`（不要写英文 `pi` / `phd` 等，会过不了 schema）
- `research-interests`: 字段名带连字符（YAML 不需 quote）；值是字符串列表
- `status`: `active` / `alumni` / `visitor`
- `year`: 仅博/硕填，整数
- `cluster`: 选填字符串（按 `.agent/context/role-model.md` 决策树）

## Alumni / 离开协议（补充）

`status: alumni` 后**额外要做**（避免 alumni 仍出现在主分组 sidebar）：

```yaml
# frontmatter 加：
sidebar:
  hidden: true   # 不在 sidebar 显示，但 URL 仍可访问当档案
```

## 静态扫描发现总结（2026-05）

未做端到端 dogfood（add-member 已在 cycle-3 时随 first-week 走过一次），静态扫 4 处补强：

1. ✅ 加了与 `personalized-onboarding` 衔接的 next-step 协议
2. ✅ 加了 frontmatter 字段约定段（role 必须中文、research-interests 字段名）
3. ✅ alumni 状态加 `sidebar.hidden: true` 协议
4. ✅ 与 `first-week-after-init` 循环 3 的边界明确
