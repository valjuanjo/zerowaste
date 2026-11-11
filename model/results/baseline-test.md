# Baseline plastic model — results on TACO `test` photos

666 labelled objects in photos the model never trained on. Image size 640px, confidence ≥ 0.25.

| Measure | Result |
|---|---|
| Objects found (a box was drawn on them) | 36% |
| Of those found: right item type | 58% |
| Of those found: right plastic / not-plastic answer | 77% |
| **All objects: found and right item type** | **21%** |
| **All objects: found and right plastic / not-plastic** | **28%** |
| False alarms (boxes on nothing labelled) | 155 |
| mAP50 / mAP50-95 (standard detection scores) | 0.228 / 0.172 |

| Item type | Plastic | Objects | Found | Right type (of found) | mAP50 |
|---|---|---|---|---|---|
| plastic_bottle | yes | 60 | 60% | 72% | 0.44 |
| plastic_bag_film | yes | 94 | 47% | 70% | 0.34 |
| plastic_wrapper | yes | 44 | 50% | 45% | 0.23 |
| plastic_cup | yes | 13 | 62% | 12% | 0.13 |
| plastic_cap_lid | yes | 52 | 33% | 76% | 0.33 |
| plastic_straw | yes | 21 | 14% | 100% | 0.21 |
| tecnopor | yes | 19 | 53% | 40% | 0.32 |
| plastic_container | yes | 9 | 67% | 17% | 0.18 |
| plastic_utensils | yes | 4 | 25% | 0% | 0.20 |
| other_plastic | yes | 36 | 14% | 20% | 0.04 |
| cigarette_butt | yes | 117 | 5% | 100% | 0.08 |
| metal | no | 98 | 43% | 69% | 0.35 |
| glass | no | 41 | 24% | 10% | 0.09 |
| paper_carton | no | 58 | 57% | 42% | 0.24 |
