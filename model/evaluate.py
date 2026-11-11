"""Measure a trained detector on photos it never saw in training, and write a plain-language report.

    python model/evaluate.py <work_dir> <weights.pt> <out_dir> [split=test] [image_size=640]

Numbers reported, for objects in the test photos:
  found          share of real objects the model put a box on (at confidence >= 0.25)
  type correct   of the found ones, share given the right item type
  plastic correct of the found ones, share given the right plastic / not-plastic answer
  false alarms   boxes drawn where there was no labelled object
"""
import json
import sys
from pathlib import Path

import numpy as np
from ultralytics import YOLO

sys.path.insert(0, str(Path(__file__).parent))
from classes import IS_PLASTIC, NAMES  # noqa: E402

work, weights, out = Path(sys.argv[1]).resolve(), sys.argv[2], Path(sys.argv[3])
split = sys.argv[4] if len(sys.argv) > 4 else "test"
imgsz = int(sys.argv[5]) if len(sys.argv) > 5 else 640
out.mkdir(parents=True, exist_ok=True)

m = YOLO(weights).val(data=str(work / "data.yaml"), split=split, imgsz=imgsz, device="cpu",
                      plots=False, project=str(work / "runs"), name=f"eval-{split}", exist_ok=True)

nc = len(NAMES)
cm = np.asarray(m.confusion_matrix.matrix)  # rows = predicted, cols = true; last index = background
assert cm.shape == (nc + 1, nc + 1), cm.shape
plastic = np.array(IS_PLASTIC)

true_total = cm[:, :nc].sum()
found = cm[:nc, :nc].sum()
type_ok = np.trace(cm[:nc, :nc])
plastic_ok = sum(cm[p, t] for p in range(nc) for t in range(nc) if plastic[p] == plastic[t])
false_alarms = cm[:nc, nc].sum()

per_class = []
ap_index = list(m.box.ap_class_index)
for i, name in enumerate(NAMES):
    n_true = cm[:, i].sum()
    n_found = cm[:nc, i].sum()
    per_class.append({
        "class": name, "plastic": bool(plastic[i]), "objects": int(n_true),
        "found": float(n_found / n_true) if n_true else None,
        "type_correct_of_found": float(cm[i, i] / n_found) if n_found else None,
        "mAP50": float(m.box.ap50[ap_index.index(i)]) if i in ap_index else None,
    })

summary = {
    "split": split, "image_size": imgsz, "weights": str(weights),
    "objects": int(true_total),
    "found": float(found / true_total),
    "type_correct_of_found": float(type_ok / found),
    "plastic_correct_of_found": float(plastic_ok / found),
    "end_to_end_type_correct": float(type_ok / true_total),
    "end_to_end_plastic_correct": float(plastic_ok / true_total),
    "false_alarms": int(false_alarms),
    "mAP50": float(m.box.map50), "mAP50_95": float(m.box.map),
    "per_class": per_class,
}
(out / f"baseline-{split}.json").write_text(json.dumps(summary, indent=2))

pct = lambda v: "–" if v is None else f"{100 * v:.0f}%"
lines = [
    f"# Baseline plastic model — results on TACO `{split}` photos",
    "",
    f"{summary['objects']} labelled objects in photos the model never trained on. Image size {imgsz}px, confidence ≥ 0.25.",
    "",
    "| Measure | Result |", "|---|---|",
    f"| Objects found (a box was drawn on them) | {pct(summary['found'])} |",
    f"| Of those found: right item type | {pct(summary['type_correct_of_found'])} |",
    f"| Of those found: right plastic / not-plastic answer | {pct(summary['plastic_correct_of_found'])} |",
    f"| **All objects: found and right item type** | **{pct(summary['end_to_end_type_correct'])}** |",
    f"| **All objects: found and right plastic / not-plastic** | **{pct(summary['end_to_end_plastic_correct'])}** |",
    f"| False alarms (boxes on nothing labelled) | {summary['false_alarms']} |",
    f"| mAP50 / mAP50-95 (standard detection scores) | {summary['mAP50']:.3f} / {summary['mAP50_95']:.3f} |",
    "",
    "| Item type | Plastic | Objects | Found | Right type (of found) | mAP50 |", "|---|---|---|---|---|---|",
]
for c in per_class:
    lines.append(f"| {c['class']} | {'yes' if c['plastic'] else 'no'} | {c['objects']} | {pct(c['found'])} | "
                 f"{pct(c['type_correct_of_found'])} | {'–' if c['mAP50'] is None else format(c['mAP50'], '.2f')} |")
(out / f"baseline-{split}.md").write_text("\n".join(lines) + "\n")
print("\n".join(lines))
