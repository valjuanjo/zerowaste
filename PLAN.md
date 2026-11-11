# Zero-Waste App — Implementation Plan

**Owner:** Juan José Valverde Ayte
**Based on:** `zero-waste-app-research.md` and `zero-waste-app-value-proposition.md`
**Working name:** *Escanea Perú* (placeholder — final name chosen with the pilot municipality)

**How this plan works:** there are no dates. Each phase has **exit criteria**. When all of them are met, the phase is complete and the next one starts. If a phase's criteria can't be met, go back, adjust, or stop.

**Status marks:** ✅ done · ◐ desk work done, needs Juan / real people to finish · ☐ not started. A box is checked only when the thing actually happened — a draft does not count.

---

## 1. What we are building

One free app, provided by government, built around a **live scanner**. The user points the camera; the phone
recognizes plastic items in real time. **The user only looks — nothing is sent by hand.** Each recognized item is
counted automatically. A separate button remains for asking the municipality to clean a specific spot.
*(Concept changed on 2026-11-11 — decisions D-008, D-009.)*

| Part | User does | User gets | Collected | Privacy rule |
|---|---|---|---|---|
| **Live scanner** (street and home) | Points the camera | Sees which plastic item it is; how to extend its life and sort it | **Automatically:** one anonymous count per item — item type, plastic yes/no, time, district. No image. | Camera images never leave the phone. Location at district level only. Collection is explained and accepted at first open; visible indicator and pause switch. |
| **Report a dump point** (separate button) | Taps the button, takes a photo | Cleanup status: received → scheduled → cleaned | Only when the user chooses: photo + exact location | Faces and plates blurred on the phone before upload |

**What "recognizes plastic" means:** the research says material cannot be read reliably from an image. The model
therefore recognizes **plastic item types** (bottle, bag / film, wrapper, cup, tecnopor, straw, cap, container,
utensils) and separates them from non-plastic items (glass, cans, paper, carton). Whether this works well enough
is the main technical risk and is measured in step 0.10 before anything else is built on it.

**Guiding principle from the research:** most users will stop within weeks, so the app must produce useful data for the municipality even with a small active group. *The data is the product.*

---

## 2. Roadmap at a glance

| Phase | Goal | Exit criteria (to advance) |
|---|---|---|
| **0. Foundations & validation** | Confirm demand, find pilot district, set up governance, **prove plastic recognition is feasible** | ≥1 district signs a letter of intent; interviews show willingness to scan; baseline model measured |
| **1. Scanner MVP** | Build and test the live scanner with automatic counts, the dump-point report button, and the municipal dashboard | Closed beta with ≥50 users; model ≥80% on plastic item types; ≥80% of reports usable |
| **2. District pilot** | Run in one district with real cleanup crews | Cleanup response time measurably improves; district wants to continue |
| **3. Home (waste) mode** | Sort-and-dispose guidance linked to district separation program and formal waste pickers | Separation program participation up vs. baseline |
| **4. Home (inventory + forecast)** | Estimate future plastic waste from items in use | Data trustee in place; forecast validated against tonnage |
| **5. Scale** | More districts via license; producer funding under EPR | ≥3 paying districts or EPR agreement |

> Tip: street scanning and dump-point reports are easiest to prove in places and seasons with lots of visible litter (beaches and parks in summer). Use that whenever Phase 1 or 2 has the chance.

---

## 3. Phase 0 — Foundations & validation

### 3.1 Steps (in order)

| Step | Tasks | Status |
|---|---|---|
| **0.1 Set up** | Create project folder, decision log and repository. Write a one-page concept sheet (Spanish) for municipalities. List candidate districts already in the MEF municipal incentive program. Draft interview guides (households + municipal officers). | ◐ Folder, repository, [decision log](docs/decision-log.md), [concept sheet](docs/concept-sheet-es.md) and interview guides ([households](docs/interviews/household-guide-es.md), [municipal](docs/interviews/municipal-guide-es.md)) done. [District shortlist](docs/candidate-districts.md) written but **not verified** against MEF / MINAM. |
| **0.2 Partners** | Contact UNMSM / UTP about acting as **independent data trustee** and source of student developers/researchers. Request meetings with 3–5 district environmental managers (gerencias de medio ambiente / gestión de residuos). | ◐ [Messages drafted + contact tracker](docs/partners/outreach-es.md). Nothing sent. |
| **0.3 Household interviews** | ~10 interviews. Test the key questions: *Would you scan at home with a government app? What would make you trust it? Would you report street litter?* | ☐ 0 of 10. Guide and [synthesis sheet](docs/interviews/synthesis-template.md) ready. |
| **0.4 Municipal interviews** | Meet 1–2 officers. Ask: what data they report for the incentive program, how cleanup crews are dispatched, what they would pay or co-fund. Synthesize findings; update the value proposition canvas. | ☐ 0 of 2. Guide ready. |
| **0.5 Prototype** | Working prototype instead of Figma (D-003, D-005), English or Spanish (D-007). Two parts: **(a) live scanner** — needs the model from step 0.10 and a custom Android build, because Expo Go cannot run an on-device model on live camera frames; **(b) dump-point report flow** as an Expo app in `mobile/` plus **municipal dashboard** as HTML in `prototype/`. Test with 5 users and 1 officer. | ◐ (b) [phone app](mobile/) and [dashboard](prototype/) built, automated checks pass in a browser, not yet run on a phone. **(a) not built — waits for 0.10.** 0 of 5 users, 0 of 1 officer. |
| **0.6 Governance** | Draft who operates the app, who holds data, what the government sees (see §7). | ◐ [Drafted](docs/governance.md). Not agreed with any institution. |
| **0.7 Legal** | Start a data protection impact assessment (Law 29733 / DS 016-2024-JUS) and an AI-risk note (DS 115-2025-PCM). Consult a data protection lawyer once. | ◐ [Impact assessment](docs/legal/dpia-draft.md) and [AI-risk note](docs/legal/ai-risk-note.md) started, with the questions for the lawyer. Lawyer not consulted; legal content unverified. |
| **0.8 Funding** | Identify a seed source (Startup Perú / ProInnóvate, university research funds, cooperation agencies, NGO partners). | ◐ [Shortlist](docs/funding.md). No call or eligibility verified. |
| **0.9 Data** | Begin building a local photo dataset of Peruvian litter and packaging (with consent; no people in frame). **Now on the critical path:** the first 50 photos per class are the local test set for step 0.10. | ◐ [Protocol, label set, consent text, metadata file](dataset/README.md). 0 photos. |
| **0.10 Plastic model baseline** | Train a small object-detection model on the public TACO litter set, grouped into plastic item types vs. non-plastic. Measure it on held-out TACO photos, then on the local test set from 0.9. Record the numbers and decide: good enough to continue, needs more data, or change approach. Then export it for phones and prove it runs live in a custom Android build. | ☐ Not started. |

### 3.2 Exit criteria
- [ ] 10 household + 2 municipal interviews done and synthesized — *0 of 12*
- [ ] Letter of intent from a pilot district — *no district contacted yet*
- [ ] Operator and data trustee agreed (at least in principle) — *proposal drafted, no university contacted yet*
- [ ] Prototype tested — *built; not yet tested with users or an officer*
- [ ] Seed funding source identified — *shortlist only; none verified*
- [ ] Baseline plastic model trained; accuracy measured on held-out TACO photos **and** on local photos; go / no-go recorded in the decision log

---

## 4. Phase 1 — Scanner MVP

### 4.1 Scope (MVP only)
**In:**
- **Live scanner:** camera preview with on-device, real-time detection of plastic item types; labels drawn over the items. No shutter button and no send button.
- **Automatic collection:** one anonymous count per recognized item (`object_type`, `plastic`, `confidence`, `district`, `timestamp`). The same object is counted once, not once per frame. Offline queue. First-open consent screen, always-visible "counting" indicator, pause switch.
- **Guidance on screen:** for the item in view, how to extend its life and how to sort it (short text; full Home guidance is Phase 3).
- **Report a dump point** (separate button): photo → GPS + timestamp → on-device blurring of faces and plates → upload → status *received → scheduled → cleaned* (optional "after" photo from crew).
- **Municipal web dashboard:** plastic counts by item type, district and week; dump-point map and list, assign to crew, mark cleaned; export CSV.
- Spanish UI with icons; voice prompts for key steps. (The prototype also has English.)

**Out (later):** full Home guidance and collection calendar, rewards, Quechua, barcode lookup, forecasting.

### 4.2 Technical architecture

| Layer | Recommendation | Why |
|---|---|---|
| Mobile app | React Native + Expo **development build** (Android first) — not Expo Go; Flutter remains the fallback (D-006) | Live camera frames and an on-device model need native modules that Expo Go does not include |
| On-device AI | Small object-detection model (e.g., YOLO-family) exported to TFLite / Core ML | Works offline; images can stay on the phone |
| Training data | TACO public set + own Peruvian photo set; classify **object type**, then map to material | Research shows material-from-image is unreliable |
| Backend | REST API + PostgreSQL/PostGIS on a cloud provider | Geospatial queries for hotspot maps |
| Dashboard | Web app (map + table) | Officers work on desktop |
| Auth | Anonymous device ID for citizens; staff accounts for municipality | Minimal personal data |

### 4.3 Data model (design now for the future)
Each record: `source (scan/report)`, `object_type`, `plastic (yes/no)`, `material (estimated)`, `confidence`, `district`, `geo (reports only)`, `timestamp`, `status (reports only)`.
Reserve optional fields for **`gtin` / barcode** and **`product_passport_id`** so that QR codes / digital product passports can be read later without redesign.

### 4.4 Abuse controls
Reports: photo + GPS + timestamp must agree; duplicate detection within a radius; rate limit per device; staff can flag false reports.
Scanner counts: one count per object, not per frame; cap on counts per device per day; outlier devices excluded from statistics.

### 4.5 Exit criteria
- [ ] Model ≥80% correct plastic item type on top classes (local test photos)
- [ ] Scanner runs live on a mid-range Android phone (at least 5 frames per second)
- [ ] Closed beta with ≥50 users (students, municipal staff, volunteers)
- [ ] ≥80% of beta reports usable by the municipality
- [ ] Impact assessment completed; privacy policy published
- [ ] Impact measurement method (before/after) agreed with the district

---

## 5. Phase 2 — District pilot

- Launch in **one district**, announced by the municipality (gives legitimacy and access to crews).
- Structured campaigns to fix data bias: schools, neighborhood brigades, environmental volunteers in lower-income zones, not only voluntary users.
- Regular review with the district: response times, hotspots, crew routing.
- Compare app data with municipal tonnage and existing complaint channels.
- **Impact metrics:** average time report → cleanup; % reports resolved; recurring hotspots reduced; active reporters per month.

### Exit criteria
- [ ] Report → cleanup time lower than baseline
- [ ] Minimum active users for a reliable district map defined and reached
- [ ] Pilot report co-signed by the district
- [ ] District commits to continue (license or co-funding)

---

## 6. Phases 3–5

**Phase 3 — Home (waste) mode**
- Scan item → what it is, how to reuse/extend life, which bin, district collection calendar.
- Route recyclables to **formalized waste pickers** (Law 29419) and the district separation program.
- Only anonymous counts per district leave the phone.
- **Exit:** separation program participation up vs. baseline; method for informing waste pickers working.

**Phase 4 — Home inventory + forecast**
- User optionally scans plastic items in use; app estimates when they become waste.
- Requires: data trustee operating, minimum-count rule (no district stat published below a threshold), published methodology.
- Add Quechua and accessibility improvements.
- **Exit:** forecasts validated against actual collected tonnage; no privacy incidents.

**Phase 5 — Scale**
- White-label municipal license, district by district.
- Producer funding once packaging EPR (REP) is in force: brand-level aggregated data on where packaging ends up.
- Explore national program with MINAM linked to the 2040 plastics roadmap targets.
- **Exit (sustainability):** ≥3 paying districts or 1 EPR agreement.

---

## 7. Governance, privacy and trust

| Topic | Decision |
|---|---|
| **Operator** | Pilot: university/NGO operates with the municipality as client. Later: municipal license. |
| **Data trustee** | Independent (university or NGO) holds aggregated data; publishes district-level statistics only. |
| **What the government sees** | Scanner: only aggregated counts per district, never per person or household. Dump-point reports: individual reports with location (photo blurred). |
| **Images** | Scanner: never leave the phone. Dump-point reports: blurred on device before upload; deleted after cleanup + retention period. |
| **Legal** | Impact assessment before pilot; 48-hour incident reporting procedure; Data Protection Officer at the municipality; privacy policy in plain Spanish. |
| **Continuity** | Agreements signed with institutions, not individuals; data exportable in open formats; open methodology. |

---

## 8. Team

| Role | Phase 0 | Phases 1–2 | Possible source |
|---|---|---|---|
| Product owner / research lead | Juan | Juan | — |
| UX designer | Part-time | Part-time | University students |
| Mobile developer | — | 1 | Freelance / student team |
| ML engineer | Advisor | 1 part-time | UNMSM / UTP |
| Backend + dashboard developer | — | 1 | Freelance / student team |
| Legal advisor (data protection) | Consult | Consult | Law firm / university clinic |
| Municipal liaison | Juan | District staff | Pilot municipality |

---

## 9. Budget categories (to estimate in Phase 0)

- Development (mobile, backend, dashboard)
- Model training and labeling of local photos
- Cloud hosting and maps
- Legal (impact assessment, privacy policy, agreements)
- Pilot campaigns (schools, brigades, communication)
- Evaluation (before/after measurement)

**Funding path (hybrid, from research):** seed grant → pilot co-funded by district → municipal license → EPR producer funding.

---

## 10. Risks and responses

| Risk | Response |
|---|---|
| Users stop using the app | Value comes from aggregate data; structured campaigns; visible cleanup feedback |
| Citizens distrust a government app at home | Start with Street; Home data anonymous even to government; independent trustee |
| Plastic cannot be recognized well enough from the camera | Measure first (step 0.10); recognize item types, not material; local photo dataset; user can correct a label; barcode later |
| Automatic collection feels like surveillance | Consent at first open; visible indicator and pause switch; no images leave the phone; district level only; independent trustee |
| Data biased toward wealthier districts | Campaigns in under-represented areas; weighting; compare with tonnage |
| Administration changes | Institutional agreements; open data; multi-district model |
| Owning collection logistics | Don't — route to municipal crews and formal waste pickers |
| Rewards become expensive | No monetary rewards in MVP; use feedback and recognition |

---

## 11. Open decisions (by phase)

| # | Decision | Resolve before leaving |
|---|---|---|
| 1 | Pilot district | Phase 0 |
| 2 | Operator (municipality / university / NGO) | Phase 0 |
| 3 | Data trustee and what government sees | Phase 0 |
| 4 | Mobile framework and cloud provider — *framework leaning React Native + Expo (D-005); cloud provider open* | Start of Phase 1 |
| 5 | Impact measurement method (before/after) | Phase 1 |
| 6 | Minimum active users for a reliable district map | Phase 2 |
| 7 | How formal waste pickers receive information | Phase 3 |
| 8 | Location precision of automatic counts (district only, or finer for street hotspots) | Phase 0 (with lawyer and trustee) |
| 9 | Final list of plastic item classes | Phase 0 (after step 0.10 results) |

---

## 12. Progress tracker

| Phase | Status |
|---|---|
| 0. Foundations & validation | ▶ In progress |
| 1. Scanner MVP | ☐ Not started |
| 2. District pilot | ☐ Not started |
| 3. Home (waste) mode | ☐ Not started |
| 4. Home (inventory + forecast) | ☐ Not started |
| 5. Scale | ☐ Not started |

**Current step:** 0.10 — train and measure the baseline plastic model (can start now, on public data). In parallel, Juan: 0.1 verify districts, 0.2 send outreach, 0.9 take the first local photos.

**Phase 1 has not been started:** none of the six Phase 0 exit criteria is met yet (decision D-004).
