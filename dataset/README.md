# Local photo dataset — protocol (step 0.9)

**Status: protocol and structure ready. No photos collected yet.**
Purpose: train and test the on-device model on Peruvian litter and packaging, alongside the public TACO set.

## Rules

1. **No people in frame.** No faces, no plates, no house numbers. If one slips in, delete the photo.
2. **Consent**: every contributor accepts the text below before contributing.
3. Public places only for Street photos. Packaging photos: your own items, on a neutral surface.
4. Strip metadata before a photo enters `images/`, keep only what is in `metadata.csv`.
   Location is recorded at **district level**, never exact GPS.
5. Photos are not committed to git (see `.gitignore`); store them in the shared drive agreed with the university.

## Label set — classify object type, then map to material

| `object_type` | Spanish (UI) | `material` (estimated) |
|---|---|---|
| `bottle` | Botella | PET / glass — ask user |
| `bag` | Bolsa | Plastic film |
| `cup` | Vaso | Plastic / paper |
| `tecnopor` | Tecnopor | Expanded polystyrene |
| `cigarette_butt` | Colilla | Cellulose acetate |
| `mixed_pile` | Montículo mixto | Mixed |
| `other` | Otro | Unknown |

## How to shoot

- Phone camera, default settings, as a citizen would: 1–3 m away, daylight and dusk, some bad photos on purpose.
- Vary: district, surface (pavement, sand, grass, soil), weather, clean vs. dirty items, crushed vs. intact.
- Spread across income levels — at least a third from lower-income districts.

## Targets

| Milestone | Photos | Use |
|---|---|---|
| First test set | 50 per class (350) | Measure a TACO-trained baseline on local photos |
| Phase 1 training | 300+ per class | Fine-tuning |
| Held-out test set | 100 per class, never trained on | Phase 1 exit criterion (≥80% correct object type) |

## Files

- `metadata.csv` — one row per photo (header provided).
- `images/` — not in git.

## Consent text (Spanish)

> Autorizo que las fotos que entrego se usen para entrenar y evaluar un modelo de reconocimiento de residuos
> y que formen parte de un conjunto de datos que podrá publicarse con fines de investigación. Confirmo que
> yo tomé las fotos, que no aparecen personas, placas ni interiores de viviendas ajenas, y que no recibo
> pago por ellas. Puedo pedir que se retiren mis fotos escribiendo a [contacto].
>
> Nombre: ________  Fecha: ________  Firma: ________
