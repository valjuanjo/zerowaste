# Plastic recognition model (plan step 0.10)

Goal: find out whether a phone-sized model can recognize plastic items well enough to build the live scanner on.

## Approach

- **Data:** the public [TACO](http://tacodataset.org) litter set — 1,500 photos, 4,784 labelled objects, 60 categories.
- **Classes:** TACO's categories grouped into 14 item types (`classes.py`): 11 plastic (bottle, bag / film,
  wrapper, cup, cap / lid, straw, tecnopor, container, utensils, other plastic, cigarette butt) and 3 non-plastic
  (metal, glass, paper / carton). "Plastic" is a property of the item type, not read from appearance.
- **Model:** YOLOv8-nano, a small detector that can run on a phone.
- **Split:** 70% train, 15% validation, 15% test. The test photos are never used in training.

## Run

```bash
pip install ultralytics pillow
```

```bash
python model/prepare_taco.py work
```

```bash
python model/train.py work 35 640
```

```bash
python model/evaluate.py work work/runs/baseline/weights/best.pt model/results
```

`prepare_taco.py` downloads about 5 GB of photos and keeps resized copies (about 300 MB). Photos and weights
are not committed.

## Results

See [`results/README.md`](results/README.md) for the round 1 verdict (not good enough yet). Each report lists how many objects were found, how many got the right item type, and how many
got the right plastic / not-plastic answer.

## Limits to keep in mind

- TACO is litter photographed mostly in Europe. Peruvian packaging and streets are not in it. The numbers that
  count for the plan are the ones on **local photos** (step 0.9), which do not exist yet.
- Some item types have very few examples (utensils, containers), so their numbers are unstable.
- **Licence:** the training library used here (Ultralytics) is AGPL-3.0. Using it in a distributed app has
  licence consequences (open-sourcing the app, or a paid licence). Decide before Phase 1; alternatives with
  permissive licences exist.
