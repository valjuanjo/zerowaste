"""Plastic item classes for the scanner, and how TACO's 60 categories map onto them.

The model recognizes *item types*; `plastic` is a property of the type, not something read from appearance.
TACO categories that are not listed are ignored (too vague or too rare to learn from).
"""

# name: (plastic?, [TACO category names])
CLASSES = {
    "plastic_bottle": (True, ["Clear plastic bottle", "Other plastic bottle"]),
    "plastic_bag_film": (True, ["Plastic film", "Single-use carrier bag", "Garbage bag", "Polypropylene bag"]),
    "plastic_wrapper": (True, ["Other plastic wrapper", "Crisp packet", "Six pack rings"]),
    "plastic_cup": (True, ["Disposable plastic cup", "Other plastic cup"]),
    "plastic_cap_lid": (True, ["Plastic bottle cap", "Plastic lid"]),
    "plastic_straw": (True, ["Plastic straw"]),
    "tecnopor": (True, ["Styrofoam piece", "Foam cup", "Foam food container"]),
    "plastic_container": (True, ["Disposable food container", "Spread tub", "Tupperware",
                                 "Other plastic container", "Squeezable tube"]),
    "plastic_utensils": (True, ["Plastic utensils"]),
    "other_plastic": (True, ["Other plastic", "Plastic glooves"]),
    # Cigarette filters are cellulose acetate, a plastic; kept as its own type.
    "cigarette_butt": (True, ["Cigarette"]),
    "metal": (False, ["Drink can", "Food Can", "Aerosol", "Pop tab", "Metal bottle cap", "Metal lid",
                      "Scrap metal", "Aluminium foil"]),
    "glass": (False, ["Glass bottle", "Broken glass", "Glass cup", "Glass jar"]),
    "paper_carton": (False, ["Other carton", "Corrugated carton", "Drink carton", "Meal carton", "Egg carton",
                             "Toilet tube", "Pizza box", "Normal paper", "Tissues", "Magazine paper",
                             "Wrapping paper", "Paper cup", "Paper bag", "Paper straw"]),
}

NAMES = list(CLASSES)
IS_PLASTIC = [CLASSES[n][0] for n in NAMES]
TACO_TO_CLASS = {taco: i for i, n in enumerate(NAMES) for taco in CLASSES[n][1]}
