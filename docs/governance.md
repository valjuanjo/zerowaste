# Governance draft (step 0.6)

**Status: draft for discussion with the university and the pilot district. Not agreed with anyone yet.**
**Revised 2026-11-11 for the live-scanner concept (D-008, D-009, D-012): scanner counts are collected automatically; dump-point reports are sent only when the user chooses.**
Resolves open decisions 2 and 3 once the parties accept it.

## Roles

| Role | Who (proposed) | Responsible for | Must not |
|---|---|---|---|
| **Sponsor / client** | Pilot municipality | Announcing the app, dispatching crews, acting on reports, naming a Data Protection Officer | Receive Home data below district level |
| **Operator** | University or NGO (pilot) → municipal license later | Running the app and servers, support, security, incident response | Sell or share data outside the agreement |
| **Data trustee** | University or NGO, independent of the municipality | Holding aggregated data, applying the minimum-count rule, publishing district statistics and methodology | Release anything that identifies a household |
| **Product owner** | Juan | Product decisions, research, plan, decision log | — |

Operator and trustee should be separate functions from Phase 1, since automatic counts exist from the first version.

## Who sees what

| Data | Citizen | Municipality | Operator | Trustee | Public |
|---|---|---|---|---|---|
| Scanner camera images | Stay on phone | Never | Never | Never | Never |
| Scanner counts (item type, plastic yes/no, time, district) — automatic | Own totals | Via trustee, aggregated | In transit only | Yes | Yes, above threshold |
| Dump-point photo (blurred on phone) | Own | Yes | Yes | No | No |
| Dump-point location + time + litter type | Own | Yes | Yes | Aggregated | Aggregated hotspot map |
| Report status | Own | Yes | Yes | — | — |
| Device ID (anonymous) | — | **No** | Yes (abuse control only) | No | No |

## Rules

1. **Minimum data**: no name, phone number, e-mail or account for citizens.
1a. **Automatic collection is consented and visible**: explained and accepted at first open, before the camera starts; a "counting" indicator is always on screen; a pause switch stops collection while the scanner keeps working. Counts carry district only, never an exact point (open decision 8).
1b. **Trustee from day one**: because counts are collected automatically from the first version, the trustee function is needed from Phase 1, not Phase 4.
2. **Blur before upload**: faces and plates are blurred on the phone; an unblurred Street photo never reaches a server.
3. **Retention**: Street photos are deleted after cleanup plus a retention period. *Proposed: 90 days — to agree with the district and the lawyer.*
4. **Minimum-count rule** (scanner counts, from Phase 1): no district statistic is published below a threshold. *Threshold to be set with the trustee.*
5. **Incidents**: 48-hour reporting procedure; the operator notifies the municipality's DPO and the trustee.
6. **Continuity**: agreements are signed by institutions, not individuals; data exportable in open formats; methodology published.
7. **No enforcement use**: reports are for cleanup, not for fining individuals. *Proposed — the district must accept this explicitly.*

## Agreements needed

| Agreement | Between | When |
|---|---|---|
| Letter of intent | Municipality ↔ project | Phase 0 exit |
| Collaboration agreement (operator, trustee) | University/NGO ↔ project | Phase 0 exit (in principle) |
| Pilot agreement incl. data processing terms | Municipality ↔ operator | Before Phase 2 |

## Questions to settle in the meetings

- Does the university accept both roles in the pilot, or only trustee?
- Who is the legal data controller for Street reports: municipality or operator?
- Does the municipality accept rule 7?
