# Data protection impact assessment — working draft (step 0.7)

**Status: started. Not legal advice. To be reviewed by a data protection lawyer (one consultation planned).**
Framework: Law 29733 and its regulation DS 016-2024-JUS. Article references are deliberately left out —
the lawyer fills them in.

## 0. Revision note — live scanner (2026-11-11)

The concept changed (decisions D-008, D-009): the main interaction is a live scanner whose counts are
**collected automatically**; the photo report below remains only as the separate "report a dump point" button.
Sections 1–5 describe the report button. The scanner adds the following, to be assessed with the lawyer:

| Topic | Scanner (automatic counts) |
|---|---|
| Data | Item type, plastic yes/no, confidence, timestamp, district, anonymous device ID in transit. **No image, no exact location.** |
| Main new risk | Collection without a deliberate act by the user. Consent must be informed, given before the camera starts, and withdrawable (pause switch). |
| Home use | The same scanner is used at home; counts at district level could still describe a household's consumption if linked to a device. Counts must be unlinkable to a device once aggregated. |
| Bystanders | Camera frames are processed on the phone and discarded; nothing about people is stored. |
| Children | Same question as R6. |
| Questions for lawyer | Is opt-in at first open sufficient for continuous automatic collection by a public body? Must the user be able to see and delete their own counts? |

## 1. Description of processing (dump-point report button)

| Item | Description |
|---|---|
| Purpose | Locate street litter so municipal crews can clean it; measure response time |
| Data subjects | Citizens who report; bystanders who may appear in photos |
| Data collected | Photo (faces/plates blurred on device), GPS location, timestamp, litter type, anonymous device ID |
| Not collected | Name, ID number, phone, e-mail, contacts, Home images |
| Recipients | Municipality (reports), operator (all), trustee (aggregates) |
| Storage | Cloud provider — *to decide (open decision 4); check cross-border transfer rules* |
| Retention | Photos deleted after cleanup + retention period (proposed 90 days) |

## 2. Is it personal data?

| Element | Assessment | Open question for lawyer |
|---|---|---|
| Device ID + repeated locations | Likely personal data: location patterns can identify a person | Is a rotating ID enough to reduce this? |
| Photo of a public place | Personal data if a person or plate is recognizable; blurring reduces, does not eliminate | Residual risk of failed blur |
| Location of a report near someone's home | Can reveal where the reporter lives | Should location be coarsened in exports? |

## 3. Legal basis

- Citizen: consent at first use, in plain Spanish, before the camera opens. *Lawyer: is consent the right
  basis when the app is offered by a public body, or does a public-function basis apply?*
- Bystanders: no consent possible → rely on blurring and minimisation.

## 4. Risks and measures

| # | Risk | Likelihood | Severity | Measure | Residual |
|---|---|---|---|---|---|
| R1 | Face or plate not blurred reaches the server | Medium | Medium | On-device blur; staff can delete photo; photos never shown publicly | Low–Med |
| R2 | Reporter re-identified from location pattern | Low | Medium | No account; municipality never sees device ID; rotate ID | Low |
| R3 | Reports used to fine or target individuals | Low | High | Governance rule 7; agreement clause | Low |
| R4 | Server breach | Low | Medium | Encryption in transit and at rest; minimal data; 48-hour incident procedure | Low |
| R5 | Photos kept indefinitely | Medium | Low | Automatic deletion job; audit | Low |
| R6 | Children use the app (school campaigns, Phase 2) | High | Medium | *Lawyer: consent requirements for minors* | ? |
| R7 | Photo of private property or inside a home | Low | Medium | In-app guidance; staff flag and delete | Low |

## 5. Obligations checklist (to confirm with lawyer)

- [ ] Who is the data controller; registration of the data bank with the authority
- [ ] Data Protection Officer at the municipality — is it mandatory here, and from when
- [ ] Incident notification: procedure and 48-hour deadline
- [ ] Privacy policy in plain Spanish (required before Phase 1 exit)
- [ ] Data processing clauses between municipality and operator
- [ ] Cross-border transfer, if the cloud region is outside Peru
- [ ] Rights requests (access, deletion) when there is no account — how does a citizen exercise them?

## 6. Home mode (Phases 3–4) — preliminary

Images never leave the phone; only anonymous counts per district are sent. A separate assessment is needed
before Phase 3, focused on whether counts can be linked to a device and on the minimum-count rule.

## 7. Questions for the lawyer consultation

1. Controller: municipality, operator, or joint?
2. Correct legal basis for a government-provided app.
3. Minors in school campaigns.
4. Is blurred street photography with residual failures acceptable; what must the policy say?
5. Retention period.
6. Anything in DS 016-2024-JUS specific to public bodies or to geolocation.
