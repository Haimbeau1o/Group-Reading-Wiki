# Skills 索引

agent 按场景索引下面的 skill。每个 skill 是一份独立 markdown，包含：

- **何时调用**（natural language trigger）
- **输入清单**（要从用户那里收集的信息）
- **执行步骤**（具体跑哪些命令、改哪些文件）
- **检查点**（成功标志 / 错误恢复）
- **示例对话**

| Skill | 场景 |
|-------|------|
| [`bootstrap-new-group.md`](./bootstrap-new-group.md) | 把模板初始化为某课题组的 wiki（用 template 创建后第一次） |
| [`weekly-session.md`](./weekly-session.md) | 排下周共读、建 session 页 |
| [`post-meeting-recap.md`](./post-meeting-recap.md) | 会议结束后整理纪要到 session 页 |
| [`add-member.md`](./add-member.md) | 新成员入组、建主页、调整成员索引 |
| [`add-paper-note.md`](./add-paper-note.md) | 写一篇论文解读 |
| [`add-concept.md`](./add-concept.md) | 加 / 改概念词典词条 |
| [`refresh-theme.md`](./refresh-theme.md) | 更新研究主线页（论文清单、开放问题） |
| [`personalized-onboarding.md`](./personalized-onboarding.md) | 给新生定制第一周阅读路径 |
| [`weekly-digest.md`](./weekly-digest.md) | 周日生成本周 wiki digest |
| [`review-pr.md`](./review-pr.md) | 检查一个 PR 是否符合约定 |

每个 skill 是**自包含**的：agent 可以只读它 + `.agent/context/` 三份就能完成任务。
