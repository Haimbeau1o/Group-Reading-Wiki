# Ralph Loop

Minimal Ralph (Geoffrey Huntley) runner wired to this repo's
`analysis/cycle-N/` RFC-driven workflow.

> **CC's `/loop` is not Ralph.** CC's built-in `/loop` is a generic
> scheduler (`/loop 5m /foo` = "rerun /foo every 5 min"). Ralph is an
> outer `while` loop in a shell, feeding the same stable prompt to
> `claude -p` until a completion / gate signal fires.

## What it does

Each iteration:

1. Shell composes `CYCLE_MILESTONE_FILE=<path>` + `PROMPT.md` and pipes
   it into `claude -p` (fresh context every time — that's the point).
2. Claude reads the cycle's `MILESTONE.md`, applies its §2
   Next-Iteration-Rule, executes **exactly one** iteration, commits.
3. Claude prints a stop signal on its own line (or finishes cleanly).
4. Shell checks for stop conditions; loops or exits.

The cycle's `MILESTONE.md` is the durable state between iterations —
no `STATUS.md` or `SHARED_NOTES.md` files. Each `claude -p` invocation
gets a fresh context and rediscovers state from cycle files + git log.

## Usage

```bash
# Dry run — see the composed prompt without spending tokens
pnpm loop --dry-run

# Real run — auto-detects latest analysis/cycle-*/MILESTONE.md
pnpm loop --skip-perms --max-runs 3

# Pin to a specific cycle
pnpm loop --skip-perms --cycle analysis/cycle-11/MILESTONE.md --max-runs 10

# Long unattended run with cost cap (via time)
pnpm loop --skip-perms --max-runs 20 --max-duration 4h
```

## Flags

| Flag | Default | Notes |
|---|---|---|
| `--max-runs N` | 5 | Hard iteration cap |
| `--max-duration Xh\|Xm\|Xs` | 2h | Wall-clock cap |
| `--max-budget-usd N` | unset | Per-iteration $ cap (passes to `claude --max-budget-usd`) |
| `--cycle PATH` | auto | Path to `MILESTONE.md` |
| `--dry-run` | off | Print prompt, don't call claude |
| `--skip-perms` | off | Pass `--dangerously-skip-permissions`. **Required** for unattended. |
| `--completion-signal STR` | `RALPH_LOOP_COMPLETE` | Custom exit phrase |

## Stop conditions (graceful, end-of-iteration)

- Claude prints `RALPH_LOOP_COMPLETE` (phase 1 done criteria met)
- Claude prints `HUMAN_GATE` (审稿点 reached — user must create gate file)
- Claude prints `RALPH_LOOP_BLOCKED: <reason>` (verify failed / forbidden file / etc.)
- `touch .ralph-stop` in repo root
- `--max-runs` reached
- `--max-duration` reached

## Stop hard

`Ctrl-C` — kills current claude process, exits loop.

## Logs

`.ralph/runs/run-<timestamp>-iter<N>.log` per iteration. Gitignored.

## Cost discipline

- Default `--max-runs 5` + `--max-duration 2h` is intentionally
  conservative. Bump only when you've watched a few runs and trust the
  iteration pattern.
- Each iteration burns roughly the same as one focused Claude Code
  session (RFC drafting, single task implement, etc. — 45-60 min of
  work per the cycle conventions).
- Use `--dry-run` before any big-N run to catch prompt regressions.

## Cycle-file contract (what makes this Ralph work here)

The runner assumes the active cycle's `MILESTONE.md` has:

- A **§2 Next-Iteration-Rule** — a numbered list of pass/fail tests
  whose first failing test = next work.
- A **§3 conventions section** — file naming, branch naming, single
  commit per task, `pnpm verify` gate, forbidden-file list.
- A **§4 Done criteria** + completion phrase ("CYCLE-N PHASE M COMPLETE"
  or similar) that maps to `RALPH_LOOP_COMPLETE`.

If you start a new cycle, mirror this structure or the runner stalls
on ambiguity (and prints `RALPH_LOOP_AMBIGUOUS`).

## When NOT to use this

- Single-file changes → `claude -p` one-shot, no loop.
- Exploratory / design work → interactive session, not loop.
- Anything where you need to watch each tool call — use interactive mode.
- Cycles that don't have §2 Next-Iteration-Rule encoded.

## Relation to ECC skills

- `ecc:autonomous-loops` — pattern catalog (this is mode 6, Ralphinho).
- `ecc:ralphinho-rfc-pipeline` — methodology spec.
- `ecc:continuous-agent-loop` — sister pattern with quality gates baked in.
- `ecc:loop-start` — wraps any of these with safety defaults.

This script is the concrete runner; those skills are the methodology.
