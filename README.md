# Escanea Perú (working name)

Free, government-provided app with one camera button and two contexts (Street / Home).
The plan and its progress live in [`PLAN.md`](PLAN.md). Phases advance on exit criteria, not dates.

## Layout

| Path | What | Plan step |
|---|---|---|
| `PLAN.md` | Implementation plan + progress tracker | — |
| `docs/decision-log.md` | Every decision, with date and reason | 0.1 |
| `docs/concept-sheet-es.md` | One-page concept for municipalities (Spanish) | 0.1 |
| `docs/candidate-districts.md` | Candidate pilot districts + scoring | 0.1 |
| `docs/interviews/` | Interview guides, synthesis template | 0.1, 0.3, 0.4 |
| `docs/partners/` | Outreach drafts and contact tracker | 0.2 |
| `mobile/` | Phone prototype of the citizen Street flow (Expo — run with Expo Go, see `mobile/README.md`) | 0.5 |
| `prototype/` | HTML prototype: municipal dashboard, plus a browser version of the citizen flow | 0.5 |
| `docs/governance.md` | Operator / trustee / what government sees | 0.6 |
| `docs/legal/` | Data protection impact assessment draft, AI-risk note | 0.7 |
| `docs/funding.md` | Seed funding shortlist | 0.8 |
| `dataset/` | Photo dataset protocol, label set, consent text | 0.9 |

## Run the prototype

Open `prototype/index.html` (citizen) and `prototype/dashboard.html` (municipality) in the same browser.
They share data through the browser's local storage: a report sent in the citizen view appears in the
dashboard, and status changes made in the dashboard show up in the citizen's "Mis reportes".
Nothing is uploaded anywhere; photos are simulated.

Smoke test: `node prototype/smoke-test.js` (needs Playwright).
