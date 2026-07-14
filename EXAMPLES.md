# Example use cases

Four worked scenarios. Each is chosen to make one of the pod's three defining properties concrete:

- **Full lifecycle** — one pod owns every stage from empty repo to verified UI. No tool-switching, no gaps between "designed" and "built" and "checked."
- **Shared spine** — every skill reads from and writes to the same project artifacts (`docs/[FEATURE]-IDEAS.md`, `DESIGN-HEURISTICS.md`, `DESIGN-TAXONOMY.md`, `CLAUDE.md`). Decisions made in one stage are *in the spine* by the time the next stage reads them — nothing is re-derived, re-guessed, or lost in a handoff.
- **Predefined handoffs** — the seams between skills are hard preflight gates, not vibes. A skill that's missing an input doesn't best-effort guess; it names the sibling skill that owns the gap and routes you there. Invalid intermediate states are unrepresentable.

A generic "AI that designs and codes" gives you the first property on a good day. The spine and the handoffs are what keep it honest across a real project's lifetime.

---

## 1. Greenfield feature, end to end — *the full lifecycle on one spine*

*Build a Settings page from an empty repo through all six stages; the page-states and aesthetic you lock early flow down the spine, so nothing gets re-guessed.*

**Scenario.** New repo. You want a Settings page: profile section, notification toggles, a danger-zone delete.

**What happens.**

```
/spec-first-project-setup
  → interviews you (name, project type, design tool, features)
  → scaffolds docs/, CLAUDE.md, design/, .claude/rules/, SETTINGS-IDEAS.md skeleton

/spec-research SETTINGS
  → reads the settings API contract + role gates
  → drafts a ## Page states table (loading / empty / populated / save-error /
    delete-confirm / unauthorized) behind <!-- DRAFT --> markers
  → you review, lock the rows, delete the markers

/design-explore "what should settings feel like?"
  → aesthetic interview → 3 concepts → you pick one
  → writes DESIGN-HEURISTICS.md, appends "Direction chosen" to SETTINGS-IDEAS.md

/design-agent "design the settings page"
  → preflight passes (heuristics + locked decisions present in the spine)
  → 2 Pencil variants → you pick → frame promoted to [final]

/code-agent "implement settings"
  → preflight passes (reads CLAUDE.md, locked decisions, Page states, [final] frame)
  → implements all six states, marks DESIGN-TAXONOMY sync state Synced

/visual-qa
  → captures the six states × breakpoints × engines, reports per cell
```

**Why the pod helps.** Notice what nobody had to say twice. The six page-states you locked in `/spec-research` are the *same* six `/code-agent` implements and the *same* six `/visual-qa` captures — because they live in the spine, not in a chat transcript that scrolls away. The aesthetic you picked in `/design-explore` is what `/design-agent` designs against and what `/visual-qa` checks the rendered code against. One coherent thread, six specialized hands.

---

## 2. "Just code it" — *the handoff that refuses to guess*

*Ask code-agent to build a thin-spec contact page and it refuses, routing you to spec-research instead of silently inventing the empty, error, and rate-limit branches.*

**Scenario.** You skip ahead: `/code-agent "build the contact page"`. But `CONTACT-IDEAS.md` only describes the happy path — no empty state, no submit-error branch, no rate-limit case.

**What happens.**

```
/code-agent "build the contact page"
  → preflight: Page states table has 1 row; the API contract has a 429 branch
    and the form has a validation-error path with no spec coverage
  → REFUSES to implement
  → "The spec is thin. I'd be inventing the empty, error, and rate-limited
     branches. Routing you to /spec-research, or say 'proceed without' and
     I'll flag every assumption."
```

**Why the pod helps.** This is the property a generic coding agent doesn't have. Asked to build a thin spec, most agents *cheerfully* ship the happy path plus whatever branches they happened to imagine — and you find the gap three months later when a coworker hits a 429 and sees a blank screen. Garage's handoff makes that failure mode **unrepresentable**: the seam between "spec" and "code" is a hard gate that measures spec-depth (does the spec cover the branches the code will actually consume?) and routes to the skill that owns filling it. The refusal *is* the feature.

---

## 3. Mirroring a shipped feature into design — *the spine as source of truth for reality*

*Mirror mode captures the live dashboard into Pencil with real tokens, images, and icon geometry, landing it in the taxonomy as a dated `[anchor]` baseline your redesign diffs against.*

**Scenario.** You're redesigning an existing Health Insights dashboard. Before proposing anything new, you want a faithful, editable reference of what ships *today* — real tokens, real images, real icon geometry, not an approximation.

**What happens.**

```
/design-agent --mode=mirror sources.json
  → reads the component file, mock JSON, tokens, and icon module
  → runs design-agent/scripts/extract-mock-assets.py   (downloads real images)
  → runs design-agent/scripts/extract-icon-paths.js     (dumps real SVG geometry)
  → builds a [mirror] group of [anchor] frames in Pencil using real tokens/assets
  → records each as a mirror-baseline in DESIGN-TAXONOMY.md

/design-explore "what if settings felt calmer?"
  → now critiques concepts against a truthful baseline, not a guess

/design-agent "redesign the dashboard"
  → variants diff cleanly against the [anchor] frames
```

**Why the pod helps.** The mirror lands in the *same* taxonomy the forward-design skills read, tagged with its lifecycle role (`[anchor]`, born read-only) and captured-on date. So "what ships today" and "what we're proposing" are rows in one index with an explicit relationship — the redesign is anchored to reality instead of a hazy memory of it. (This scenario is also why `design-agent` bundles its own `scripts/` — the extraction helpers travel with the skill, so mirror mode works in any installed copy, not just the author's machine.)

---

## 4. Mid-project adoption — *the spine catches drift nobody logged*

*Inherit a spec-less codebase and visual-qa catches an error-card padding drift that a "Synced" flag was hiding, turning "looks off" into a routed fix.*

**Scenario.** You inherit a codebase with no specs. Someone quietly changed the error-state card's padding last quarter; the design comp still shows the old spacing. Nobody recorded it.

**What happens.**

```
/spec-first-project-setup        (code-only/mid-project mode)
  → scaffolds docs around the existing code, no green-field assumptions

/spec-research CHECKOUT
  → derives a decision tree from the existing source's render branches

/visual-qa
  → captures the rendered checkout error state
  → compares against the spec + the error card's OTHER call-sites
  → FLAGS: "error card padding here (24px) disagrees with its three other
     call-sites (16px) and DESIGN-TAXONOMY marks this frame Synced — the
     sync state is lying. Routing to /spec-research to reconcile."
```

**Why the pod helps.** Drift that lives only in someone's head is invisible until it burns you. Because the spine records *sync state* as a first-class, checkable fact — and `/visual-qa` verifies the rendered pixels against both the spec and sibling call-sites — the pod surfaces the discrepancy as a routed action item instead of a surprise. The handoff turns "huh, that looks off" into "this frame's Synced flag is false; here's who fixes it."

---

## The through-line

Each scenario leans on a different property, but they compound. The **lifecycle** means there's a stage for every step. The **spine** means each stage inherits the last one's decisions as fact, not folklore. The **handoffs** mean when an input is missing or a fact is stale, you get routed — not guessed at. Take away any one and you're back to an agent that's confident and occasionally, invisibly, wrong.

See [PHILOSOPHY.md](./PHILOSOPHY.md) for the contracts behind these behaviors, and [README.md](./README.md) for install + the skill-by-skill map.
