# Baseline results — how to read them (step 0.10, round 1)

Model: YOLOv8-nano, 35 epochs at 640 px on a 4-core CPU (about 1 h 35 min), trained on 1,050 TACO photos.
Measured on 224 TACO photos (666 labelled objects) that were never used in training. Full table:
[baseline-test.md](baseline-test.md).

## Result

| Measure | Result |
|---|---|
| Objects found | 36% |
| Found and given the right item type | 21% of all objects |
| Found and given the right plastic / not-plastic answer | 28% of all objects |
| False alarms | 155 boxes on nothing labelled, against 243 objects found |

**Verdict for round 1: not good enough to build the scanner on.** It misses about two of every three objects.

## What the numbers say

- **Plastic / not-plastic is barely better than guessing.** Among the found objects, 77% get the right answer,
  but 65% of them are plastic anyway, so "always say plastic" would score 65%.
- **Large, common items work best:** bottles (60% found, 72% right type), bags and film (47%, 70%).
- **Small items are almost invisible:** cigarette butts 5% found, straws 14%, caps and lids 33%. At 640 px
  they are only a few pixels wide.
- **Catch-all and rare classes fail:** "other plastic" 14% found; utensils, containers and cups have 4–13 test
  objects each, so their numbers mean little.
- **Training had not clearly finished.** The validation score was still rising at epoch 30 (0.10 → 0.23 mAP50
  over the run), so more training would help somewhat; it will not close the gap alone.

## Not measured yet

- Accuracy on local Peruvian photos (none exist; step 0.9).
- Speed on a phone, and whether it runs live in a custom Android build.
