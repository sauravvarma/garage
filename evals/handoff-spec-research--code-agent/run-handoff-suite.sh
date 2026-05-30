#!/usr/bin/env bash
# Prepare isolated workdirs for the spec-research <-> code-agent handoff suite.
#
# This script does NOT call an LLM. It composes a clean fixture workdir per case
# (base/ + one state overlay) so an executor agent can run each case in isolation
# with no cross-case contamination. Execution + grading is a separate step — see README.md.
#
# Usage:
#   ./run-handoff-suite.sh            # prepare all cases into runs/<timestamp>/
#   ./run-handoff-suite.sh C4-locked-proceeds P1-thin-draft-shape   # subset by id
set -euo pipefail

cd "$(dirname "$0")"
SUITE_DIR="$(pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_DIR="$SUITE_DIR/runs/$STAMP"

python3 - "$RUN_DIR" "$@" <<'PY'
import json, os, shutil, sys

suite_dir = os.getcwd()
run_dir = sys.argv[1]
wanted = set(sys.argv[2:])

cases = json.load(open(os.path.join(suite_dir, "cases.json")))["cases"]
if wanted:
    cases = [c for c in cases if c["id"] in wanted]
    missing = wanted - {c["id"] for c in cases}
    if missing:
        sys.exit(f"unknown case id(s): {', '.join(sorted(missing))}")

base = os.path.join(suite_dir, "fixtures", "base")
states = os.path.join(suite_dir, "fixtures", "states")
ports = os.path.join(suite_dir, "fixtures", "ports")

os.makedirs(run_dir, exist_ok=True)
manifest = []

for c in cases:
    work = os.path.join(run_dir, c["id"], "workdir")
    shutil.copytree(base, work)
    # Overlay exactly one state file as the feature IDEAS doc — the only variable.
    shutil.copyfile(os.path.join(states, c["state"] + ".md"),
                    os.path.join(work, "docs", "HABIT-TRACKER-IDEAS.md"))
    # Port cases get the legacy source dropped where the prompt references it.
    if "port" in c["state"]:
        os.makedirs(os.path.join(work, "_port_source"), exist_ok=True)
        shutil.copyfile(os.path.join(ports, "HabitTrackerLegacy.jsx"),
                        os.path.join(work, "_port_source", "HabitTrackerLegacy.jsx"))
    case_root = os.path.join(run_dir, c["id"])
    with open(os.path.join(case_root, "prompt.txt"), "w") as f:
        f.write(c["prompt"].strip() + "\n")  # paths in the prompt are relative to workdir/ (CWD at execution)
    with open(os.path.join(case_root, "case.json"), "w") as f:
        json.dump(c, f, indent=2)
    manifest.append({"id": c["id"], "skill": c["skill"], "state": c["state"],
                     "workdir": os.path.relpath(work, suite_dir)})

with open(os.path.join(run_dir, "manifest.json"), "w") as f:
    json.dump({"run": os.path.basename(run_dir), "cases": manifest}, f, indent=2)

print(f"Prepared {len(manifest)} case workdir(s) under runs/{os.path.basename(run_dir)}/\n")
for m in manifest:
    print(f"  {m['id']:32s} {m['skill']:14s} state={m['state']}")
print("\nNext: run each case per README.md (execute the skill in its workdir, grade into benchmark.json).")
PY
