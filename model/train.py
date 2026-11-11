"""Train the baseline plastic-item detector on the prepared TACO dataset.

    python model/train.py <work_dir> [epochs] [image_size]

Starts from a small pretrained detector (YOLOv8-nano) so it can later run on a phone.
Runs on CPU; pass fewer epochs or a smaller image size to shorten it.
"""
import sys
from pathlib import Path

from ultralytics import YOLO

work = Path(sys.argv[1]).resolve()
epochs = int(sys.argv[2]) if len(sys.argv) > 2 else 40
imgsz = int(sys.argv[3]) if len(sys.argv) > 3 else 640

model = YOLO("yolov8n.pt")
model.train(
    data=str(work / "data.yaml"),
    epochs=epochs,
    imgsz=imgsz,
    batch=16,
    workers=4,
    device="cpu",
    project=str(work / "runs"),
    name="baseline",
    exist_ok=True,
    seed=0,
    plots=False,
    patience=15,
)
