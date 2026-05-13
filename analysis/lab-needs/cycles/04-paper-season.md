---
iteration: 3
generated_at: 2026-05-12
sources_count: 4
confidence: high
cn_source_ratio: 1.00
---

# Cycle 04 · Paper Season（论文季 / 会议截稿前 4-8 周）

## 时间窗

- **AI/ML 主截稿**：ICLR 9 月底 / NeurIPS 5 月中 / ICML 1 月底 / CVPR 11 月初 / EMNLP 6 月中
- **2026 年特例**：ICLR 与 NeurIPS 截稿撞日（2026-10-15 UTC，同一秒）
- **截稿前模式**：T-8 周开始紧张 → T-4 周通宵密度上升 → T-1 周全员高强度
- **截稿后**：1-2 周休整 → rebuttal 期（如果中了 R1 / poster decision）→ camera-ready

---

## 高频动作

| 角色 | 论文季高频行为 | 当前 14 skill 覆盖 |
|------|------|------|
| **第一作者**（博 / 硕 / 博后） | 写正文 / 跑实验 / 改图 / 跟 reviewer 想象对话 | △ wiki **不是论文起草工具**，但应支持 figure / concept 复用 |
| **共同作者**（PI / 博后 / 高博） | 紧密 review draft / 提建议 / 救火 | **空白** — 没有 skill 协助 draft review |
| **PI** | 最后一周做 reviewer 仿真 / 拍板 / 写 cover letter | **空白** — 但 README 提到 PI take 风格 |
| **新生 / 旁观者** | 旁观 / 跑临时实验 / 排版引用 | **空白** |

---

## 关键证据

### 顶会截稿是工业级压力源
> "NeurIPS ’24 截稿不足 2 天！hyper.ai 汇总 58 个顶会，提供精确到秒的 DDL 倒计时" — paraphrased from WebSearch summary citing [知乎专栏 — NeurIPS 24 截稿 DDL 倒计时](https://zhuanlan.zhihu.com/p/699058037), accessed 2026-05-12 `[M]` 【中文】
> "2026年ICLR和NeurIPS的截稿日期钉在同一天：2026年10月15日23:59 UTC" — paraphrased from WebSearch summary citing [call4papers — 2026 ICLR/NeurIPS 撞车](https://call4papers.org/blog/research-guide-2026-01-28-4381), accessed 2026-05-12 `[M]` 【中文】

### 投稿系统在截稿日常崩溃
> "在截稿日期前可以反复在官网提交论文，一定要及时更新新版本，不要等到最后时刻才一次性提交，因为DDL日的投稿量相对较大，投稿系统在最后时刻常常会出现崩溃的状况。" — paraphrased from WebSearch summary citing [知乎 — NeurIPS 23+24 投稿经验](https://zhuanlan.zhihu.com/p/630467049), accessed 2026-05-12 `[M]` 【中文】

### 论文季的"挂名"问题与组内信任
> "未来导师团队里论文全是导师一作，是不是个坑？" — paraphrased from WebSearch summary citing [知乎 question 492301183](https://www.zhihu.com/question/492301183), accessed 2026-05-12 `[L]` 【中文】 — 反映了论文季前组内对"署名"的隐性焦虑

### 一作 / 通讯 / 致谢的署名结构在论文季前敲定
> 多个学术写作指南建议在投稿前 4-8 周确定作者顺序，避免最后时刻冲突 — generic academic convention noted across multiple search results `[L]`

---

## 对 `ai-paper-wiki` 的契合度评分

**3 / 5** — 论文季是项目**最薄弱**的 cycle

| 已覆盖（✓） | 未覆盖（✗ / △） |
|-----------|----------------|
| ✓ Concept 词典 + Mermaid → figure / 术语可以从 wiki 抓回论文 draft | ✗ **截稿前"勿扰模式"** — 论文季 wiki 全员脱产，但没有显式 freeze 信号 |
| ✓ Backlinks 让作者写 related work 时能查"组里之前讨论过的相关 paper" | ✗ **「论文项目」schema** — `papers/` 是论文解读（reading），不是"我们组写的论文"。缺一个 `submissions/<year>-<venue>-<slug>` |
| △ PI 一段 take 模式 → 截稿前作者最需要 PI take，但 review 流程不在 wiki 上 | ✗ **作者贡献 / 署名约定可见性** — 一作 / 通讯 / 致谢的组内约定（中文 source `[L]` 暗示），缺 wiki 入口 |
| ✓ Pagefind → 截稿前作者可以搜 wiki 找数据 / 引用 | ✗ **截稿后复盘 skill** — 中 / 拒后没有 skill 触发"复盘 reviewer 反馈 → 沉淀进 wiki" |

### 缺什么（建议）

1. **【强信号 M】「Submission」 schema**：`submissions/<year>-<venue>-<paper-slug>.md` 记录组里产出的论文（vs `papers/` 是外部论文解读）。frontmatter 含 `status: in-prep|submitted|under-review|accepted|rejected|withdrawn`、`authors_order`、`venue`、`deadline`、`postmortem_url`。这是当前项目的明显空白
2. **【强信号 M】Paper-season 全局 freeze 标志**：在 `group.config.yaml` 加 `freeze_until: 2026-10-15` 让 verify / digest / scaffold 知道当前是截稿期，**降低非必要 wiki 提交期望**
3. **【中信号 M】"投稿复盘" skill**：截稿后或决定下来后引导作者写 1 页 postmortem（reviewer 反馈核心问题、应对、下次改进），沉到 `submissions/<slug>.postmortem.md`。直接对应"组内知识不被截稿带走"
4. **【弱信号 L】"署名 / 贡献" 模板**：组的署名约定 / authorship 政策（如 contribution-based）可以在 `internal/` 区有一份明文档案，避免组内反复讨论
5. **【反向意见】**当前 14 skill **完全不提论文季**——但论文季可能是研究组最痛苦的时期。`weekly-session` / `weekly-digest` 在截稿前都无法运转。Skill 应当显式声明"截稿前 4 周内 weekly-digest 自动暂停"

---

## 风险 / 待验证

- "Submission" schema 与项目当前定位（共读 wiki，不是论文管理）有张力 — Iteration 7 需要权衡
- 中文 source 较多偏 AI/ML 截稿场景；湿实验组 / 工程组的"论文季"节奏不同 — Iteration 4 disciplines 验证

---

## Sources

1. [知乎专栏 — NeurIPS ’24 截稿不足 2 天，DDL 倒计时](https://zhuanlan.zhihu.com/p/699058037) `[M]` 【中文】
2. [知乎专栏 — NeurIPS 23+24 投稿经验](https://zhuanlan.zhihu.com/p/630467049) `[M]` 【中文】
3. [call4papers — 2026 ICLR 与 NeurIPS 截稿撞车](https://call4papers.org/blog/research-guide-2026-01-28-4381) `[M]` 【中文】
4. [知乎 — 未来导师团队里论文全是导师一作，是不是个坑？](https://www.zhihu.com/question/492301183) `[L]` 【中文】

**中文 source 占比**：4/4 = 100% ✓
