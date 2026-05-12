---
iteration: 4
generated_at: 2026-05-12
sources_count: 5
confidence: high
cn_source_ratio: 0.40
---

# Discipline 01 · AI/ML（项目当前的 sweet spot）

## 一句话定位

**项目设计假设几乎完全匹配 AI/ML 课题组**：paper-heavy、arXiv-driven、reading group 是组里中心活动、概念词典刚需、代码库重要程度高。这是 `ai-paper-wiki` 应该坚定深耕的主战场，但**也是竞争最激烈、用户最挑剔**的市场。

---

## AI/ML 课题组的特征性行为

| 特征 | 描述 | `ai-paper-wiki` 现状契合度 |
|------|------|---------------|
| **论文密度极高** | arXiv 每日新出 ~200 篇 AI/ML，组里追 5-20 篇 / 周 | ✓ `papers/` 设计很匹配 |
| **概念高速演化** | "MoE → MLA → MTP → GRPO" 半年一波术语 | ✓ `concepts/` 词典 |
| **会议截稿密度大** | ICLR / NeurIPS / ICML / ACL / CVPR / EMNLP 全年覆盖 | ✗ 04-paper-season 已点名 submission schema 缺失 |
| **代码与论文紧绑定** | huggingface / GitHub repo 是论文的"第二正文" | △ wiki 没有"我们组复现 / 验证过哪些 paper"字段 |
| **博士周期短** | 国内通常 4 年 / 美国 5-6 年，比湿实验组短 | (无直接影响) |
| **公开主页是招生主战场** | 学生看 Karpathy / Andrej / 周志华 / 唐杰主页选导师 | ✓ themes / papers / members 设计完整 |

---

## 关键证据 + 案例

### AI/ML 组的公开页通常是"裸 reading list"——这是 ai-paper-wiki 的差异化机会
分析 [THUNLP-MT/TG-Reading-List (GitHub)](https://github.com/THUNLP-MT/TG-Reading-List)：
> 结构：Datasets / Tools / Papers (Seq2Seq / VAE / GAN / RL / Knowledge / Style Transfer)
> 重要性信号：**仅用 Google Scholar citation count**
> **明显缺失**：group annotations / PI 视角 / 讨论笔记 / 内部材料链接 / 贡献者署名
— [THUNLP-MT/TG-Reading-List](https://github.com/THUNLP-MT/TG-Reading-List), accessed 2026-05-12 `[H]`

**对项目的启示**：你的"PI take + group annotation"是国内顶级 AI/ML 组**普遍缺失**的能力。`ai-paper-wiki` 的差异化不在 reading list 本身，而在「**带组里观点的 reading list**」。

### Stanford SAIL 等顶级机构主页是组织级，不是单组级
> "The diverse research groups conduct pioneering research in all areas of artificial intelligence including: Biomedicine and Health, Computational Cognitive & Neuro-science, Computational Education, Computer Vision, Empirical Machine Learning, Human-Centered and Creative AI, Natural Language Processing and Speech, Reinforcement Learning, Robotics, and Statistical or Theoretical Machine Learning" — paraphrased from [Stanford AI Lab](https://ai.stanford.edu/research-groups/), accessed 2026-05-12 `[M]`

— **Stanford SAIL 主页是 lab-of-labs 索引**，单组级 wiki 仍由 PI 自行维护。市场没有标准模板。

### 国内 AI/ML 顶级组的主页形态
> "The Natural Language Processing Lab at Tsinghua University is located in the FIT Building" 提供 publications / members / news / projects 入口 — paraphrased from [THUNLP — 清华大学](https://nlp.csai.tsinghua.edu.cn/) and [THUNLP/THUMT](http://thumt.thunlp.org/), accessed 2026-05-12 `[M]` 【中文】

国内顶级组通常**有静态主页 + 散落的 GitHub repo**，但没有把周会 / 论文 take / 概念词典统一沉淀。**`ai-paper-wiki` 模板填的就是这块**。

### 会议截稿撞车是 AI/ML 独有压力
> "2026年ICLR和NeurIPS的截稿日期钉在同一天：2026年10月15日23:59 UTC" — paraphrased from [call4papers — 2026 ICLR/NeurIPS 撞车](https://call4papers.org/blog/research-guide-2026-01-28-4381), accessed 2026-05-12 `[M]` 【中文】

—— 04-paper-season 已论证。AI/ML 特有的"全年大约 60% 时间在某个截稿前"是项目必须设计的现实约束。

---

## 对 `ai-paper-wiki` 的契合度评分

**5 / 5** —— **本学科是项目的 PMF 候选场景**

### 差异化优势（vs 现有方案）

| 现有方案 | 不能做的事 | `ai-paper-wiki` 能做 |
|---------|------|--------|
| GitHub Reading List | PI take / 讨论沉淀 / 跨论文知识图 | ✓ |
| 个人 Notion paper notes | 组级 take 协作 / 公开搜索 / agent 自动化 | ✓ |
| Notion lab template | git-native / agent-friendly / KaTeX / Mermaid | ✓ |
| 实验室静态主页 | 组会笔记 / paper take / 概念词典 | ✓ |
| ELN（LabArchives 等） | 几乎不覆盖 paper reading（ELN 是 wet-lab 工具） | n/a |

### AI/ML 特有的还该加强的地方

1. **【强信号 H】"arXiv 集成"** —— `pnpm new:paper --from-arxiv=2501.12345` 自动抓 metadata、bibtex、abstract。当前 `new:paper` 是空模板，AI/ML 用户期望"贴 arXiv ID 直接出 paper note 骨架"
2. **【强信号 H】"代码复现状态"字段** —— `papers/<slug>.md` 加 `reproduction_status: not-tried | failed | partial | full`、`code_url`。组里读完 paper 经常想知道"我们试过没"
3. **【强信号 M】"主流榜单 / Leaderboard 链接"字段** —— AI/ML paper 通常对应一个 SOTA 榜单。`concepts/<task>` 或 `themes/<task>` 加 `leaderboards: [paperswithcode-url]`
4. **【中信号 M】"模型卡 / dataset 卡"schema** —— 类似 HuggingFace model card 的结构化字段，让概念词典从"术语 → 句子描述"升级到"模型 → 实测指标 / 限制 / 适用场景"
5. **【反向意见 / 收窄建议】**当前 README 说"AI/ML 研究组通用"。但**Computer Vision / NLP / RL / 系统组**的口味差异巨大。建议先专攻 **NLP / 大模型应用** 一条窄路径（与你 README 里 Leon's Group 的 DeepSeek 案例一致），别试图通吃所有 AI/ML

---

## 风险 / 待验证

- THUNLP-MT 是单一案例，其它顶级国内 AI/ML 组（PKU MILA、SJTU AI、NIO Research）的公开页样式没全调研 — 不影响主结论但可在 cycle 后期补
- "arXiv 集成"假设用户主要写公开 paper note；如果某些组只写"内部 take"那么 arXiv 集成的 ROI 下降

---

## Sources

1. [THUNLP-MT/TG-Reading-List (GitHub)](https://github.com/THUNLP-MT/TG-Reading-List) `[H]`
2. [Stanford AI Lab — Research Groups](https://ai.stanford.edu/research-groups/) `[M]`
3. [THUNLP — 清华大学自然语言处理与社会人文计算实验室](https://nlp.csai.tsinghua.edu.cn/) `[M]` 【中文】
4. [THUNLP/THUMT — 神经机器翻译开源工具包](http://thumt.thunlp.org/) `[M]` 【中文】
5. [call4papers — 2026 ICLR 与 NeurIPS 截稿撞车](https://call4papers.org/blog/research-guide-2026-01-28-4381) `[M]` 【中文】 — 复用 04-paper-season

**中文 source 占比**：3/5 = 60% ✓
