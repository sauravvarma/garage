#!/usr/bin/env bash
# Build (or update) a .pen fixture HEADLESSLY via the Pencil CLI — fixtures-as-code.
#
# Why this exists: the Pencil desktop MCP writes into the active editor in-memory
# (pollution-prone, GUI-bound). The CLI operates on an explicit path, fully headless.
# Three CLI gotchas this wraps (see memory pencil-cli-headless-authoring-recipe):
#   - batch_design's param is `input:` (not the --help example's `operations:`)
#   - save() is async → must keep stdin open (settle) before EOF; exit() alone doesn't save
#   - globals don't persist across batch_design calls → each build is ONE snippet (local vars)
#
# Usage:
#   pen-build.sh <commands-file> <target.pen>            # create fresh
#   pen-build.sh <commands-file> <target.pen> --update   # open existing target as --in
#
# <commands-file>: one REPL command per line (e.g. set_variables({...}) then
# batch_design({ input: '...' })). save() is appended automatically.
set -euo pipefail

CMDS="${1:?commands file}"; TARGET="${2:?target .pen path}"; MODE="${3:-}"
[ -f "$CMDS" ] || { echo "no commands file: $CMDS" >&2; exit 2; }
mkdir -p "$(dirname "$TARGET")"

IN_ARG=()
[ "$MODE" = "--update" ] && IN_ARG=(--in "$TARGET")
SETTLE="${PEN_SETTLE:-12}"   # seconds to let the async save() flush before EOF

{ cat "$CMDS"; printf '\nsave()\n'; sleep "$SETTLE"; } \
  | timeout 240 pencil interactive ${IN_ARG[@]+"${IN_ARG[@]}"} --out "$TARGET" 2>&1 \
  | grep -iE 'created nodes|saved|error|warn|fail' || true

sz=$(stat -f '%z' "$TARGET" 2>/dev/null || stat -c '%s' "$TARGET" 2>/dev/null || echo 0)
[ "$sz" -gt 100 ] || { echo "BUILD FAILED: $TARGET is $sz bytes" >&2; exit 1; }
echo "Built $TARGET ($sz bytes)"
