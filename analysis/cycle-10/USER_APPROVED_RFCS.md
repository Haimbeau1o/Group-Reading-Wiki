# USER_APPROVED_RFCS — Gate Signal

User approved R01 and R02 RFCs on 2026-05-12.

This file is a gate signal for the loop. Its existence means:
- R01-faq-schema.md and R02-staleness-tracking.md are locked in
- Task files (tasks/T*.md) may now be drafted
- **Actual code changes still require `IMPLEMENTATION_STARTED.md` to exist**

Per `MILESTONE.md` §2 Next-Iteration-Rule, loop now proceeds to draft tasks.

## Approved RFCs

- `rfcs/R01-faq-schema.md` — FAQ schema + skill + scaffold（9 tasks）
- `rfcs/R02-staleness-tracking.md` — `last_reviewed_at` + reviewer + staleness-report（7 tasks）

## Decision Log（user 拍板的部分）

- 全部按 RFC 提议执行（无逐项 override）
- 两个 RFC 之间 R02 depends_on R01（保持原 RFC 默认设定）

## Next Gate

`IMPLEMENTATION_STARTED.md` —— 必须用户手工建（不能由 loop 自动建），表示"task 起草已审完，可以动代码"。
