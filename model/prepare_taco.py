"""Download the public TACO litter photos and write a YOLO-format dataset with our plastic item classes.

    python model/prepare_taco.py <work_dir>

Creates <work_dir>/images/{train,val,test}, <work_dir>/labels/{...} and <work_dir>/data.yaml.
Photos are resized to at most 1024 px on the long side. The split is fixed (seeded) so results are comparable:
70% train, 15% val (used during training), 15% test (never seen in training; used only for the final numbers).
"""
import io
import json
import random
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageOps

sys.path.insert(0, str(Path(__file__).parent))
from classes import NAMES, TACO_TO_CLASS  # noqa: E402

ANN_URL = "https://raw.githubusercontent.com/pedropro/TACO/master/data/annotations.json"
MAX_SIDE = 1024


def fetch(url: str) -> bytes:
    """Download with curl, identifying as curl. (The photo host rejects Python's default client.)"""
    r = subprocess.run(["curl", "-sfL", "--retry", "3", "--max-time", "180", url], capture_output=True)
    if r.returncode != 0 or not r.stdout:
        raise RuntimeError(f"curl exit {r.returncode}")
    return r.stdout


def main(work: Path) -> None:
    work.mkdir(parents=True, exist_ok=True)
    ann_path = work / "annotations.json"
    if not ann_path.exists():
        ann_path.write_bytes(fetch(ANN_URL))
    data = json.loads(ann_path.read_text())
    cat_name = {c["id"]: c["name"] for c in data["categories"]}

    boxes: dict[int, list[tuple[int, list[float]]]] = {}
    for a in data["annotations"]:
        cls = TACO_TO_CLASS.get(cat_name[a["category_id"]])
        if cls is not None:
            boxes.setdefault(a["image_id"], []).append((cls, a["bbox"]))

    images = sorted(data["images"], key=lambda im: im["id"])
    random.Random(0).shuffle(images)
    n = len(images)
    split_of = {}
    for i, im in enumerate(images):
        split_of[im["id"]] = "train" if i < 0.70 * n else "val" if i < 0.85 * n else "test"
    for sp in ("train", "val", "test"):
        (work / "images" / sp).mkdir(parents=True, exist_ok=True)
        (work / "labels" / sp).mkdir(parents=True, exist_ok=True)

    def one(im) -> str:
        sp = split_of[im["id"]]
        stem = f"{im['id']:05d}"
        out = work / "images" / sp / f"{stem}.jpg"
        try:
            if not out.exists():
                img = Image.open(io.BytesIO(fetch(im["flickr_url"])))
                img = ImageOps.exif_transpose(img).convert("RGB")
                # Annotations are in the upright frame; a mismatch means the boxes would land in the wrong place.
                if (img.width > img.height) != (im["width"] > im["height"]) and im["width"] != im["height"]:
                    return "orientation"
                img.thumbnail((MAX_SIDE, MAX_SIDE))
                img.save(out, "JPEG", quality=88)
            lines = []
            for cls, (x, y, w, h) in boxes.get(im["id"], []):
                cx, cy = (x + w / 2) / im["width"], (y + h / 2) / im["height"]
                bw, bh = w / im["width"], h / im["height"]
                if bw > 0 and bh > 0:
                    lines.append(f"{cls} {min(max(cx, 0), 1):.6f} {min(max(cy, 0), 1):.6f} {min(bw, 1):.6f} {min(bh, 1):.6f}")
            (work / "labels" / sp / f"{stem}.txt").write_text("\n".join(lines))
            return "ok"
        except Exception as e:  # one bad photo must not stop the run
            return f"error: {type(e).__name__}"

    with ThreadPoolExecutor(6) as pool:
        results = list(pool.map(one, images))

    summary: dict[str, int] = {}
    for r in results:
        summary[r] = summary.get(r, 0) + 1
    print("download summary:", summary)

    (work / "data.yaml").write_text(
        f"path: {work.resolve()}\ntrain: images/train\nval: images/val\ntest: images/test\nnames:\n"
        + "".join(f"  {i}: {n}\n" for i, n in enumerate(NAMES))
    )
    for sp in ("train", "val", "test"):
        counts = [0] * len(NAMES)
        files = list((work / "labels" / sp).glob("*.txt"))
        for f in files:
            for line in f.read_text().splitlines():
                counts[int(line.split()[0])] += 1
        print(sp, len(files), "photos;", dict(zip(NAMES, counts)))


if __name__ == "__main__":
    main(Path(sys.argv[1]))
