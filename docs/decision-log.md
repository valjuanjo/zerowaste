# Decision log

One row per decision. Never edit an old row; add a new one that supersedes it.

| # | Date | Decision | Why | Decided by | Status |
|---|---|---|---|---|---|
| D-001 | 2026-11-11 | Plan advances on exit criteria, not dates. | From the plan ("How this plan works"). | Juan | Active |
| D-002 | 2026-11-11 | Start with Street mode; Home mode only from Phase 3. | Trust: citizens are more willing to report street litter than to scan at home. | Juan (plan §10) | Active |
| D-003 | 2026-11-11 | Step 0.5 prototype is built as clickable HTML in the repository instead of Figma. | Figma was not available in the working environment; HTML is testable on any phone and versioned with the project. Plan step 0.5 amended. | Proposed by Claude — **Juan to confirm** | Proposed |
| D-004 | 2026-11-11 | Phase 1 is not started until the Phase 0 exit criteria are met. | The plan's own rule. The criteria need real people (interviews, letter of intent, partner agreement, user tests). | Plan rule | Active |
| D-005 | 2026-11-11 | The citizen prototype (step 0.5) is an Expo / React Native app in `mobile/`, tested on phones with Expo Go. The dashboard stays HTML. Supersedes D-003 for the citizen side. | Juan has Expo Go; user tests need the real camera and GPS. | Juan | Active |
| D-006 | 2026-11-11 | Open decision 4 leans to React Native + Expo for Phase 1. Not final. | Prototype code carries over. **Caveat:** an on-device model (TFLite) cannot run inside Expo Go; Phase 1 will need an Expo development build, and that must be proven before the framework is fixed. | Proposed by Claude — **Juan to confirm at start of Phase 1** | Proposed |
| D-007 | 2026-11-11 | The phone prototype has a language button: English (default) and Spanish. The Phase 1 scope ("Spanish UI") is unchanged. | Juan needs English to try and show the prototype; household tests in Peru need Spanish. | Juan | Active |
| D-008 | 2026-11-11 | **Concept change:** the app is a live scanner that recognizes plastic in real time. The user only looks; counts are collected automatically, with no send step. Supersedes the photo → confirm → send flow as the main interaction. | Juan's product intent. | Juan | Active |
| D-009 | 2026-11-11 | A separate "report a dump point" button stays, for asking the municipality to clean a specific spot. | Keeps the cleanup value for municipalities without mixing it into automatic collection. | Juan | Active |
| D-010 | 2026-11-11 | No stand-in scanner with a generic model. The real plastic model comes first: new step 0.10 in Phase 0. | Juan's choice. A generic model knows bottles and cups but not bags, wrappers or tecnopor. | Juan | Active |
| D-011 | 2026-11-11 | "Recognizes plastic" is implemented as recognizing plastic item types vs. non-plastic items, not material from appearance. | The project's research found material-from-image unreliable. | Proposed by Claude — **Juan to confirm** | Proposed |
| D-012 | 2026-11-11 | Automatic counts carry district-level location only, until open decision 8 is settled. Governance draft and impact assessment must be revised for automatic collection before any pilot. | Automatic collection is more sensitive than a report the user chooses to send. | Proposed by Claude — **Juan to confirm** | Proposed |
| D-013 | 2026-11-11 | Step 0.10 round 1: the first baseline (YOLOv8-nano, 35 epochs, 640 px, CPU, TACO only) is **not good enough** to build the scanner on. No go / no-go on the approach yet; a second round comes first, and the local-photo measurement is still owed. | Held-out TACO photos: 36% of objects found, 21% with the right item type, 28% with the right plastic / not-plastic answer, 155 false alarms. Small items (cigarette butts, straws) are almost never found. See `model/results/`. | Measured result; next round proposed by Claude — **Juan to confirm** | Active |

## Open decisions (mirror of PLAN.md §11)

| # | Decision | Resolve before leaving | Notes so far |
|---|---|---|---|
| 1 | Pilot district | Phase 0 | Shortlist in `candidate-districts.md` |
| 2 | Operator | Phase 0 | Proposal in `governance.md` |
| 3 | Data trustee and what government sees | Phase 0 | Proposal in `governance.md` |
| 4 | Mobile framework and cloud provider | Start of Phase 1 | Framework: see D-006. Cloud: — |
| 5 | Impact measurement method | Phase 1 | — |
| 6 | Minimum active users for a reliable map | Phase 2 | — |
| 7 | How formal waste pickers receive information | Phase 3 | — |
| 8 | Location precision of automatic counts | Phase 0 | District only for now (D-012) |
| 9 | Final list of plastic item classes | Phase 0 | Round 1 (D-013): bottle, bag / film, metal work best; cigarette butt, straw, other plastic, glass fail. Proposal for round 2 pending. |
