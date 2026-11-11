# AI-risk note — working draft (step 0.7)

**Status: started. Not legal advice.** Framework named in the plan: DS 115-2025-PCM. The classification
below is our own reasoning and has **not** been checked against the decree's text — the lawyer confirms it.

## What the AI does

| Use | Phase | Runs where | Decides anything about a person? |
|---|---|---|---|
| Detect litter object type in a photo | 1 | On the phone | No — user confirms or corrects every result |
| Detect faces and plates in order to blur them | 1 | On the phone | No — detection is used only to remove them |
| Duplicate-report detection | 1 | Server | No — affects reports, staff can override |
| Identify household item and suggest disposal | 3 | On the phone | No |
| Forecast future waste per district | 4 | Trustee | No — aggregate only |

## Our assessment (to confirm)

- No use identifies, scores or profiles individuals; no biometric identification (faces are detected to be blurred, never recognized).
- No automated decision with effects on a person: a human dispatches crews.
- We therefore expect the uses to fall in a low-risk category. **Lawyer: confirm the category under the decree
  and whether a public-sector deployment adds obligations (transparency, registration, human oversight).**

## Risks and measures

| Risk | Measure |
|---|---|
| Wrong object type misleads the municipality | User confirmation; store confidence; ≥80% accuracy gate (Phase 1 exit) |
| Blur model misses a face or plate | Staff delete; photos never public; measure miss rate on test set |
| Model works worse on packaging and streets of lower-income districts | Local dataset sampled across districts (see `dataset/README.md`); report accuracy per district |
| Forecast treated as fact | Published methodology; validation against tonnage (Phase 4 exit) |
| Users not told AI is involved | Plain-language notice in app: "El teléfono sugiere el tipo de residuo; usted confirma" |
