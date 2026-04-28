# [Project Name]

## Project context
[One-line purpose. Tech stack. Design tool.]

## Repo conventions (critical — always applies)
[3-5 terse rules extracted from docs/REPO-CONVENTIONS.md — the most important patterns that should never be forgotten. Examples:]
- [Routing rule — e.g. how navigation wrapper works, what flags control it]
- [Parser rule — e.g. reshape data explicitly, don't bulk-transform]
- [SSR/code-splitting rule — e.g. what's client-only vs SSR]
- Full reference: `docs/REPO-CONVENTIONS.md`

## Pencil design file
- **Path**: design/[project-name].pen
- All Pencil MCP `filePath` parameters MUST use the absolute path to this file. Never use `/new`.

## Read before implementing
Before any feature or change, read the relevant docs:
- docs/REPO-CONVENTIONS.md — routing, data flow, state management, analytics patterns
- docs/BRIEF-AND-DIRECTION.md — goals, audience, constraints
- docs/DESIGN-LANGUAGE.md — typography, color, layout philosophy
- docs/DESIGN-TOKENS.md — token table, CSS variables
- docs/DESIGN-TAXONOMY.md — artifact index, sync states
[Add feature-specific docs as they are created]

Locked decisions in these docs are hard constraints.

## Token reference
All visual values trace to CSS variables in [path to variables file].

## Commands
- Dev server: [command]
- Build: [command]
- Test: [command]
