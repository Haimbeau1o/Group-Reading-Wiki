# `.agent/` — agent 工作目录

这个目录里的所有内容**专为 LLM agent 设计**。

```
.agent/
├── README.md           ← 你正在读
├── context/            ← agent 进仓库后必读
│   ├── repo-map.md
│   ├── role-model.md
│   └── conventions.md
├── skills/             ← 按场景索引的 10 个 skill
└── templates/          ← 各种 markdown 模板（agent 拷贝填空）
```

如果你（agent）刚进仓库：先读项目根的 `AGENT_GUIDE.md`，然后回到这里读 `context/`。

人类用户**也可以读**这里的内容了解 agent 化工作流，但日常写作仍然按 `CONTRIBUTING.md` 即可。
