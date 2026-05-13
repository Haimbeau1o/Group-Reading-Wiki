#!/usr/bin/env bash
# Ralph autonomous loop runner.
# Reads a cycle MILESTONE.md, feeds a stable PROMPT to `claude -p` in a
# bounded shell loop, and stops on completion signal, human gate, time
# budget, max iterations, or .ralph-stop file.

set -uo pipefail

# ───── defaults ─────────────────────────────────────────────────────────
MAX_RUNS=5
MAX_DURATION_SEC=$((2 * 3600))
MAX_BUDGET_USD=""
DRY_RUN=0
SKIP_PERMS=0
CYCLE_PATH=""
COMPLETION_SIGNAL="RALPH_LOOP_COMPLETE"
HUMAN_GATE_SIGNAL="HUMAN_GATE"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROMPT_FILE="$SCRIPT_DIR/PROMPT.md"
STOP_FILE="$REPO_ROOT/.ralph-stop"
RUNS_DIR="$REPO_ROOT/.ralph/runs"

usage() {
  cat <<'EOF'
Usage: pnpm loop [options]      (or: bash scripts/ralph/loop.sh [options])

Options:
  --max-runs N             Stop after N iterations (default: 5)
  --max-duration Xh|Xm|Xs  Wall-clock budget (default: 2h)
  --max-budget-usd N       Per-iteration $ cap passed to claude --max-budget-usd
                           (no default — set this for unattended runs)
  --cycle PATH             Path to cycle MILESTONE.md
                           (default: auto-detect latest analysis/cycle-*/MILESTONE.md)
  --dry-run                Print composed prompt, do not invoke claude
  --skip-perms             Pass --dangerously-skip-permissions to claude.
                           REQUIRED for real unattended runs. WARNING: claude
                           will execute any tool call without asking.
  --completion-signal STR  String in claude output that ends loop cleanly
                           (default: RALPH_LOOP_COMPLETE)
  -h, --help               This help

Stop signals (graceful, end-of-iteration):
  touch .ralph-stop            in repo root
  claude prints completion-signal or HUMAN_GATE on its own line

Stop hard:
  Ctrl-C (current iteration's claude process dies; loop exits)

Logs:
  .ralph/runs/run-<ts>-iter<N>.log  per iteration (gitignored)
EOF
}

# ───── arg parse ────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-runs)            MAX_RUNS="$2"; shift 2 ;;
    --max-duration)
      v="$2"
      case "$v" in
        *h) MAX_DURATION_SEC=$(( ${v%h} * 3600 )) ;;
        *m) MAX_DURATION_SEC=$(( ${v%m} * 60 )) ;;
        *s) MAX_DURATION_SEC=${v%s} ;;
        *)  MAX_DURATION_SEC=$v ;;
      esac
      shift 2 ;;
    --max-budget-usd)      MAX_BUDGET_USD="$2"; shift 2 ;;
    --cycle)               CYCLE_PATH="$2"; shift 2 ;;
    --dry-run)             DRY_RUN=1; shift ;;
    --skip-perms)          SKIP_PERMS=1; shift ;;
    --completion-signal)   COMPLETION_SIGNAL="$2"; shift 2 ;;
    -h|--help)             usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 2 ;;
  esac
done

# ───── resolve cycle ────────────────────────────────────────────────────
if [[ -z "$CYCLE_PATH" ]]; then
  CYCLE_PATH=$(ls -d "$REPO_ROOT"/analysis/cycle-*/MILESTONE.md 2>/dev/null | sort -V | tail -1)
fi
if [[ -z "$CYCLE_PATH" || ! -f "$CYCLE_PATH" ]]; then
  echo "ERROR: no cycle MILESTONE.md found. Pass --cycle PATH." >&2
  exit 2
fi
if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "ERROR: PROMPT.md not found at $PROMPT_FILE" >&2
  exit 2
fi
if ! command -v claude >/dev/null 2>&1; then
  echo "ERROR: claude CLI not on PATH." >&2
  exit 2
fi

mkdir -p "$RUNS_DIR"

# ───── compose prompt ───────────────────────────────────────────────────
COMPOSED_PROMPT=$(cat <<EOF
CYCLE_MILESTONE_FILE=$CYCLE_PATH
REPO_ROOT=$REPO_ROOT

$(cat "$PROMPT_FILE")
EOF
)

# ───── claude args ──────────────────────────────────────────────────────
CLAUDE_ARGS=(-p)
[[ $SKIP_PERMS -eq 1 ]] && CLAUDE_ARGS+=(--dangerously-skip-permissions)
[[ -n "$MAX_BUDGET_USD" ]] && CLAUDE_ARGS+=(--max-budget-usd "$MAX_BUDGET_USD")

# ───── banner ───────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════"
echo "  Ralph Loop"
echo "  Cycle:        $CYCLE_PATH"
echo "  Max runs:     $MAX_RUNS"
echo "  Max duration: ${MAX_DURATION_SEC}s ($((MAX_DURATION_SEC / 60))m)"
echo "  Budget/iter:  ${MAX_BUDGET_USD:-(unset — recommended for unattended)}"
echo "  Skip perms:   $SKIP_PERMS"
echo "  Stop file:    $STOP_FILE  (touch to halt gracefully)"
echo "  Logs:         $RUNS_DIR/"
echo "═══════════════════════════════════════════════════════════"

if [[ $DRY_RUN -eq 1 ]]; then
  echo
  echo "─── DRY RUN — composed prompt ─────────────────────────────"
  printf '%s\n' "$COMPOSED_PROMPT"
  echo "───────────────────────────────────────────────────────────"
  echo "Would invoke: claude ${CLAUDE_ARGS[*]}  <piping prompt above on stdin>"
  exit 0
fi

if [[ $SKIP_PERMS -ne 1 ]]; then
  echo
  echo "WARN: running WITHOUT --skip-perms. claude will halt on every tool"
  echo "      permission prompt. For real unattended Ralph, add --skip-perms."
  echo
fi

# clear stale stop file
rm -f "$STOP_FILE"

# ───── loop ─────────────────────────────────────────────────────────────
START_TS=$(date +%s)
iter=0
exit_reason="max-runs"

while [[ $iter -lt $MAX_RUNS ]]; do
  iter=$((iter + 1))
  now=$(date +%s)
  elapsed=$((now - START_TS))

  if [[ $elapsed -ge $MAX_DURATION_SEC ]]; then
    exit_reason="time-budget"; break
  fi
  if [[ -f "$STOP_FILE" ]]; then
    rm -f "$STOP_FILE"
    exit_reason="stop-file"; break
  fi

  ts=$(date +%Y%m%d-%H%M%S)
  log="$RUNS_DIR/run-$ts-iter$iter.log"
  echo
  echo "═══ iter $iter / $MAX_RUNS · elapsed ${elapsed}s · log: $(basename "$log") ═══"

  printf '%s\n' "$COMPOSED_PROMPT" | claude "${CLAUDE_ARGS[@]}" 2>&1 | tee "$log"
  rc=${PIPESTATUS[1]}

  if [[ $rc -ne 0 ]]; then
    exit_reason="claude-exit-$rc"; break
  fi
  if grep -qF "$COMPLETION_SIGNAL" "$log"; then
    exit_reason="completion-signal"; break
  fi
  if grep -qF "$HUMAN_GATE_SIGNAL" "$log"; then
    exit_reason="human-gate"; break
  fi
done

end=$(date +%s)
echo
echo "═══════════════════════════════════════════════════════════"
echo "  Ralph Loop done"
echo "  Iterations:    $iter"
echo "  Elapsed:       $((end - START_TS))s"
echo "  Exit reason:   $exit_reason"
echo "═══════════════════════════════════════════════════════════"
