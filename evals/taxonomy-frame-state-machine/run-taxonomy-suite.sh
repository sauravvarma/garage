#!/usr/bin/env bash
# Prepare isolated workdirs for the taxonomy frame-state-machine suite.
#
# Does NOT call an LLM. For each case it composes a clean workdir:
#   base/  +  the case's snapshot overlay (design/streakly.pen + docs/DESIGN-TAXONOMY.md)
# and extracts the .pen frame inventory to design/streakly.frames.txt via the headless
# Pencil CLI — so the executor agent can grade invariants from text without the desktop app.
# Execution + grading is a separate step (see README.md).
#
# Usage:
#   ./run-taxonomy-suite.sh                       # all cases
#   ./run-taxonomy-suite.sh V1-code-agent-blocks  # subset by case id
set -euo pipefail
cd "$(dirname "$0")"
SUITE_DIR="$(pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_DIR="$SUITE_DIR/runs/$STAMP"

# Extract a snapshot's .pen frame inventory to a text file via the headless CLI.
# Non-fatal: if the CLI is unavailable, leaves a note so the run still composes.
extract_frames() {
  local pen="$1" out="$2"
  if ! command -v pencil >/dev/null 2>&1; then
    echo "# pencil CLI not found — frame inventory unavailable (index-only grading)" > "$out"; return
  fi
  printf 'batch_get()\n' | timeout 120 pencil interactive --in "$pen" --out "/tmp/tax-ro-$$.pen" 2>/dev/null \
    | grep -oE '"name": *"(\[[^"]*|component/[^"]*)"' | sed -E 's/.*"name": *"//; s/"$//' | sort -u > "$out" || true
  rm -f "/tmp/tax-ro-$$.pen"
  [ -s "$out" ] || echo "# frame extraction returned nothing — check pencil auth/login" > "$out"
}

python3 - "$RUN_DIR" "$@" <<'PY'
import json, os, sys
suite=os.getcwd(); run=sys.argv[1]; want=set(sys.argv[2:])
cases=json.load(open(os.path.join(suite,"cases.json")))["cases"]
if want:
    miss=want-{c["id"] for c in cases}
    if miss: sys.exit("unknown case id(s): "+", ".join(sorted(miss)))
    cases=[c for c in cases if c["id"] in want]
os.makedirs(run, exist_ok=True)
plan=[{"id":c["id"],"snapshot":c["snapshot"],"skill":c["skill"],"tier":c.get("tier",1),
       "prompt":c["prompt"].strip(),"case":c} for c in cases]
json.dump(plan, open(os.path.join(run,"_plan.json"),"w"))
print(f"{len(plan)} case(s) -> runs/{os.path.basename(run)}/")
PY

BASE="$SUITE_DIR/fixtures/base"
SNAPS="$SUITE_DIR/fixtures/snapshots"
PLAN="$RUN_DIR/_plan.json"
COUNT=$(python3 -c "import json;print(len(json.load(open('$PLAN'))))")

for i in $(seq 0 $((COUNT-1))); do
  read -r CID SNAP SKILL < <(python3 -c "import json;p=json.load(open('$PLAN'))[$i];print(p['id'],p['snapshot'],p['skill'])")
  SNAP_DIR="$SNAPS/$SNAP"
  if [ ! -d "$SNAP_DIR/design" ]; then
    echo "  SKIP $CID — snapshot '$SNAP' not built yet"; continue
  fi
  WORK="$RUN_DIR/$CID/workdir"
  mkdir -p "$WORK"
  cp -R "$BASE/." "$WORK/"
  mkdir -p "$WORK/design"
  cp "$SNAP_DIR/design/streakly.pen" "$WORK/design/streakly.pen"
  cp "$SNAP_DIR/docs/DESIGN-TAXONOMY.md" "$WORK/docs/DESIGN-TAXONOMY.md"
  extract_frames "$WORK/design/streakly.pen" "$WORK/design/streakly.frames.txt"
  python3 -c "import json;p=json.load(open('$PLAN'))[$i];open('$RUN_DIR/$CID/prompt.txt','w').write(p['prompt']+chr(10));json.dump(p['case'],open('$RUN_DIR/$CID/case.json','w'),indent=2)"
  echo "  $CID  ($SKILL on $SNAP)"
done

echo
echo "Prepared under runs/$STAMP/. Next: execute each case per README.md (run the named skill in its workdir/, grade into benchmark.json)."
