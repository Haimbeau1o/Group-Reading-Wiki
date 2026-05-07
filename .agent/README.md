# `.agent/` — agent 工作目录

这个目录里的所有内容**专为 LLM agent 设计**。

```
.agent/
├── README.md                ← 你正在读（目录索引）
├── BOOTSTRAP.md             ← 🔥 agent 进仓库第一篇必读（路由到具体 skill）
├── MAINTAINER_PLAYBOOK.md   ← 日常维护决策（stage=established 后）
├── context/                 ← agent 进仓库后的额外背景
│   ├── repo-map.md
│   ├── role-model.md
│   └── conventions.md
├── skills/                  ← 14 个按场景调用的 skill
├── notes/                   ← (可选) PI / 组的偏好文件
└── templates/               ← 各种 markdown 模板
```

仓库根还有 `group.config.yaml`——agent 真相源，判断 stage / 读 PI 信息 / 内容统计。

## Agent 上手顺序

1. **[BOOTSTRAP.md](BOOTSTRAP.md)** —— 第一篇必读。读 `group.config.yaml` 判断 stage，路由到对应 skill
2. **[MAINTAINER_PLAYBOOK.md](MAINTAINER_PLAYBOOK.md)** —— stage=established 后的日常工作角色 + 工具箱
3. **[../docs/STYLE_GUIDE.md](../docs/STYLE_GUIDE.md)** —— 各类文章长什么样
4. **[skills/](skills/)** 里对应你当前任务的 skill 文件 —— 按场景调用
5. **[notes/](notes/)**（如果存在）—— 这个组 PI 的特定偏好

## 人类读者

可以读所有这些文件了解 agent-native 的工作流。日常写作仍按 [`../CONTRIBUTING.md`](../CONTRIBUTING.md) 即可。
