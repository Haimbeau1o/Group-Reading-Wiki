# 角色模型（Role Model）— agent 必读

成员页 frontmatter 用**双层兼容**设计：简化角色（必填，给所有组用）+ 完整聚类（选填，高级模式）。

## 简化版（默认 4 类）

| `role` 值 | 中文叫法 | 通常对应学术身份 |
|----------|---------|----------------|
| `大导师` | PI | 教授 / 副教授 / 研究员 / 独立 PI |
| `小导师` | 副导 | 博士后、讲师、助理研究员、合作 PI |
| `博士生` | — | 博士、直博生（任何年级） |
| `硕士生` | — | 学硕、专硕、本科 RA、实习生 |

`role` 是**必填字段**，所有成员页都得有。

## 完整版（5 类聚类，选填 `cluster`）

| `cluster` 值 | 行为模式 | 对应简化 role |
|------------|---------|--------------|
| `方向掌舵者` | 决定方向、低频高权重输出 | 大导师 / 部分小导师 |
| `研究主理人` | 主导子项目、带读最多 | 部分小导师 / 中后期博士 |
| `学习成长者` | 高频消费 + 适度产出 | 新博士 / 学硕 / 直博 |
| `任务驱动者` | 工程为主、写工具笔记 | 专硕 / 实习生 / 工程方向 |
| `流动接触者` | 短期 / 弱连接 | 访客 / 校友 / 跨组合作 |

`cluster` 是**选填字段**，组成熟后可以填来启用更细粒度视图。

## 完整 frontmatter schema

```yaml
---
title: <显示名>             # 必填
description: <一句话>        # 必填，给搜索引擎
sidebar:
  order: <number>           # 在成员索引中的排序
  label: <短名>             # 选填，sidebar 显示文本

# ─── 角色字段 ───
role: <大导师|小导师|博士生|硕士生>   # 必填
year: <number>              # 选填，入学年级（仅博/硕有意义）
title_label: <自由文本>      # 选填，自定义身份显示，如"3 年级博士"
cluster: <方向掌舵者|研究主理人|学习成长者|任务驱动者|流动接触者>  # 选填
status: <active|alumni|visitor>  # 必填
joined: <YYYY-MM>           # 选填
research-interests:         # 选填，列表
  - <主题 1>
  - <主题 2>
github: <github-username>   # 选填
---
```

## agent 给新成员选 role 的决策树

```
用户说 → agent 该填什么 role
─────────────────────────────────────
"PI / 教授 / 老师"            → role: 大导师
"博后 / postdoc"              → role: 小导师
"讲师 / 助理研究员"            → role: 小导师
"合作老师 / 副导师"            → role: 小导师
"博士生 / phd"                 → role: 博士生  + 询问 year
"直博 / 硕博连读"              → role: 博士生  + year: 1
"研究生 / 硕士 / 学硕"         → role: 硕士生  + year
"专硕 / 工程硕士"              → role: 硕士生  + cluster: 任务驱动者
"实习生 / 本科 / RA"           → role: 硕士生  + cluster: 学习成长者
"访问学者 / 来短期的"          → role: 小导师 或 硕士生（看资历）+ cluster: 流动接触者
                              + status: visitor
```

## agent 给新成员选 cluster 的决策树

只有当用户明确 hint 时才填 `cluster`。否则**留空**，让简化角色生效。

```
hint: "工程方向 / 主要做 infra / 跑实验" → cluster: 任务驱动者
hint: "刚来 / 在选方向 / 学习中"          → cluster: 学习成长者
hint: "带 PhD / 推子项目"                 → cluster: 研究主理人
hint: "短期 / 几个月就走"                  → cluster: 流动接触者
hint: "决定方向 / 出钱"                   → cluster: 方向掌舵者
否则                                      → 留空
```

## 角色字段如何影响 UI

| 字段 | 当前影响 | 计划影响 |
|------|---------|---------|
| `role` | 用于 `members/index.mdx` 手动分组（按 role 排版） | 未来：`pnpm list:members --by=role` 自动聚合 |
| `cluster` | 暂未直接驱动 UI | 未来：可选高级视图按 cluster 重组 |
| `status` | `alumni` / `visitor` 在索引页应分开显示（手动） | 未来：自动分组 |

agent 在写成员页时**必须**设置 `role` 和 `status`，否则 `pnpm verify` 会报错（schema 校验）。

## 文件 slug 命名约定

```
<角色前缀>-<标识>.md

postdoc-1.md          # postdoc 1 号位
lecturer-1.md         # 讲师 1 号位
phd-senior-1.md       # 高年级博士 1 号位 (4-5 年级)
phd-mid-1.md          # 中年级博士 1 号位 (2-3 年级)
phd-new-1.md          # 新博士 1 号位 (1 年级)
ms-research-1.md      # 学硕 1 号位
ms-eng-1.md           # 专硕 / 工程方向 1 号位
ug-ra-1.md            # 本科 RA 1 号位
```

**对真实成员**：建议用真实英文名 / GitHub 名作 slug（如 `zhangsan.md`），避免占位编号。**占位时**才用上面这种角色编号 slug。

agent 在 `pnpm new:member` 时优先用真实名作 slug。
