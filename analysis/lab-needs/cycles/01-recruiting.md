---
iteration: 3
generated_at: 2026-05-12
sources_count: 4
confidence: medium
cn_source_ratio: 0.50
---

# Cycle 01 · Recruiting Season（招生季 / PI 找学生 + 学生找导师）

## 时间窗

- **美国 STEM**：12 月初截稿 → 次年 1-3 月面试 / rotation → 4 月底"决定日"
- **中国 PhD 申请**：6-9 月夏令营（保研） → 9-12 月统考 / 申请 → 次年 3-6 月复试
- **海外博士外国学生**（中国学生申美 / 申欧）：8-10 月联系导师 → 12 月-1 月正式申请
- **总窗口**：3-6 个月连续高密度活动

---

## 高频动作（按角色）

| 角色 | 招生季的高频行为 | 当前 14 skill 覆盖 |
|------|------|------|
| **PI** | 改组主页 / 决定今年招几个 / 看推荐信 / 面试 / 写录取信 | 部分（README §使用建议 + 主页 themes） |
| **博后 / 高博** | 跟潜在新生面谈 / 介绍组里方向 / 评估 fit | **空白** |
| **学生（外部）** | 翻组主页 / 看 PI 最近论文 / 联系师兄打听 / 写 SOP | **公开页面被强消费** |
| **学生（内部）** | 帮 PI 筛简历 / 参加 visit day / 主持 rotation | **空白** |

---

## 关键证据

### 学生选导师看的是 fit 而不是 ranking
> "It is just as important to find a lab culture that is a good fit for you as it is to find a research topic that is interesting." — paraphrased from [Choosing the Right Ph.D. Advisor — All Together (SWE)](https://alltogether.swe.org/2025/04/choosing-phd-advisor/), accessed 2026-05-12 `[M]`
> "Evaluate potential advisors on what it'd be like to work with them every day for five years" — [All Together SWE](https://alltogether.swe.org/2025/04/choosing-phd-advisor/), accessed 2026-05-12 `[M]`

### PI 招生看 motivation / independence / creativity
> "PI在收到博士后申请时最看重的是：对PI所在研究领域的兴趣，申请人本人的独立性，经验，资质，申请博士后的动机，创造力" — paraphrased from [医咖会 — 如何写一份好的博士后申请？来看一位PI的建议](https://www.mediecogroup.com/news/880/), accessed 2026-05-12 `[M]` 【中文】

### 招生流程通常是 多教授联审
> "首先依据学术成绩进行筛选，然后经过几位教授的面试，主要包括学生简短的个人展示及随后的问答环节。最后根据学生的学术背景及不同小组的需求，将录取的学生分配至相应项目组。" — paraphrased from WebSearch summary citing [PI制 — 百度百科 / 知乎汇总](https://baike.baidu.com/item/PI%E5%88%B6/410273), accessed 2026-05-12 `[M]` 【中文】

### Wiki 的实际"展示窗"价值
> "Faculty profiles, research overview slides, and lab websites provide information about individual faculty members with various research interests." — paraphrased from [Finding an Advisor — CU Boulder Mech Eng](https://www.colorado.edu/mechanical/admissions/phd-admissions/finding-advisor), accessed 2026-05-12 `[M]`

---

## 对 `ai-paper-wiki` 的契合度评分

**4 / 5**

| 已覆盖（✓） | 未覆盖（✗ / △） |
|-----------|----------------|
| ✓ 公开 themes / paper notes / members 直接服务"外部学生研究 fit"的需求 | ✗ **「招生季公告 / 今年招几个 / 找什么方向」schema** — 当前 themes 是长期主线，没有"今年招生季新增 X 方向 / 招 Y 人"的临时区 |
| ✓ Concept 词典让外部学生提前学组里术语 | ✗ **「外部联系入口」明确化** — 没有 skill 引导 PI 写"how to contact me about a position"段（README 未提） |
| ✓ Mermaid / 主线图让学生快速理解组的研究脉络 | △ **"近期论文 / 近期组会"自动汇总** — 招生季外部学生最想看"这个组最近在干什么"，但当前 sessions 是私域，roadmap 偏 long-form |
| ✓ Pagefind 中英文搜索 → 外部学生能搜到组里关键术语 | ✗ **"组的录取率 / typical timeline / 学生去向"对外可见性** — 招生季学生关心的实际信息，多在 PI 邮件里反复回答 |

### 缺什么（建议）

1. **【强信号 M】「招生公告」schema** —— 新建 `recruiting/<year>.md` 或在 `welcome.md` 嵌入「今年招生」段，frontmatter 含 `season`、`openings`、`focus_areas`、`deadline`。生命周期：每年招生季前更新，结束后归档
2. **【中信号 M】「外部入口」segment** —— 一个明确的 `for-prospective-students.md`，回答 5 个最常被问的问题（招几个 / 看什么 / 怎么联系 / 学生去向 / 组里风格）。这是 README §使用建议没明确的细分
3. **【中信号 M】「PI welcome statement」字段** —— `members/pi.md` 加 `recruiting_statement` 字段，每年招生季 PI 改一段话（≤200 字），其他时间隐藏
4. **【弱信号 / 与 02-postdoc.md 共用】**让博后 / 高博的"我能带什么样的学生"可被外部学生搜到（呼应 02-postdoc JTBD-4 简历需求 + 招生 fit）
5. **【反向意见】**当前项目 README 把"招生 / 合作"列为 PI take 的副产品。但 source 显示**招生季是 wiki 一年最高流量时刻**——值得显式设计一个"招生季模式 / public push"标志，而不是与日常无差别

---

## 风险 / 待验证

- 不同学科招生节奏差异巨大（生物医学有 rotation / CS 直接选导师）— Iteration 4 disciplines 复盘
- 海外博士申请的"联系导师邮件"环节中文圈和欧美差异大 — 是 `cycles/02-onboarding` 的入口铺垫，与本文件部分重叠

---

## Sources

1. [Choosing the Right Ph.D. Advisor — All Together (SWE Magazine)](https://alltogether.swe.org/2025/04/choosing-phd-advisor/) `[M]`
2. [医咖会 — 如何写一份好的博士后申请？来看一位PI的建议](https://www.mediecogroup.com/news/880/) `[M]` 【中文】
3. [PI制 — 百度百科 / 知乎讨论汇总](https://baike.baidu.com/item/PI%E5%88%B6/410273) `[M]` 【中文】
4. [Finding an Advisor — CU Boulder Mechanical Engineering](https://www.colorado.edu/mechanical/admissions/phd-admissions/finding-advisor) `[M]`

**中文 source 占比**：2/4 = 50% ✓（≥30% 阈值）
