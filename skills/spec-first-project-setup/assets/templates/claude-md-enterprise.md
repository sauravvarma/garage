# [Project Name]

## Project context
[One-line purpose. Tech stack. Service dependencies.]

## Repo conventions (critical — always applies)
[3-5 terse rules extracted from docs/REPO-CONVENTIONS.md — the most important patterns that should never be forgotten.]
- [Routing rule]
- [Data flow rule]
- [State management rule]
- Full reference: `docs/REPO-CONVENTIONS.md`

## Workflow
This project follows the PRD → RFC → Implementation pipeline.
- PRDs and RFCs live in Confluence.
- RFCs must have "Approved for Dev" in comments before implementation.
- Implementation creates branch, commits, pushes, and raises PR.

## Read before implementing
- docs/REPO-CONVENTIONS.md — routing, data flow, state management, analytics patterns
- docs/BRIEF-AND-DIRECTION.md — goals, audience, constraints
[Add feature-specific docs as they are created]

Locked decisions in these docs are hard constraints.

## Commands
- Dev server: [command]
- Build: [command]
- Test: [command]
