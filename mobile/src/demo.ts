// Simulated detections for the scanner interface test (decision D-014).
// Nothing here looks at the camera: items appear at random places on the screen. The real model (plan step 0.10)
// will replace `nextFrame` with its own detections; the rest of the interface stays the same.

export type Category = 'bottles' | 'bags' | 'packaging' | 'cups_containers' | 'caps' | 'tecnopor' | 'metal' | 'glass' | 'paper';
export type Resin = 'PET' | 'HDPE' | 'LDPE' | 'PP' | 'PS' | 'OTHER';

export type Item = { key: string; category: Category; resin: Resin | null };

// resin = null means not plastic. Resin is the usual one for that item type, not read from the image (D-011).
export const ITEMS: Item[] = [
  { key: 'water_bottle', category: 'bottles', resin: 'PET' },
  { key: 'soda_bottle', category: 'bottles', resin: 'PET' },
  { key: 'shampoo_bottle', category: 'bottles', resin: 'HDPE' },
  { key: 'carrier_bag', category: 'bags', resin: 'LDPE' },
  { key: 'bread_bag', category: 'bags', resin: 'LDPE' },
  { key: 'snack_wrapper', category: 'packaging', resin: 'OTHER' },
  { key: 'food_tray', category: 'packaging', resin: 'PS' },
  { key: 'yogurt_cup', category: 'cups_containers', resin: 'PP' },
  { key: 'takeaway_box', category: 'cups_containers', resin: 'PP' },
  { key: 'bottle_cap', category: 'caps', resin: 'PP' },
  { key: 'foam_cup', category: 'tecnopor', resin: 'PS' },
  { key: 'foam_box', category: 'tecnopor', resin: 'PS' },
  { key: 'can', category: 'metal', resin: null },
  { key: 'glass_jar', category: 'glass', resin: null },
  { key: 'carton', category: 'paper', resin: null },
  { key: 'newspaper', category: 'paper', resin: null },
];

export const CATEGORY_ICON: Record<Category, string> = {
  bottles: '🍶', bags: '🛍️', packaging: '🍬', cups_containers: '🥡', caps: '🔘', tecnopor: '🥤',
  metal: '🥫', glass: '🫙', paper: '📦',
};

export const RESIN_ORDER: Resin[] = ['PET', 'HDPE', 'LDPE', 'PP', 'PS', 'OTHER'];
export const RESIN_CODE: Record<Resin, string> = { PET: '1', HDPE: '2', LDPE: '4', PP: '5', PS: '6', OTHER: '7' };
export const RESIN_COLOR: Record<Resin, string> = {
  PET: '#5ef2ff', HDPE: '#b39cff', LDPE: '#ffd166', PP: '#4dffb8', PS: '#ff6b9a', OTHER: '#c7d2d9',
};

export type Detection = {
  uid: number; item: Item; conf: number;
  x: number; y: number; w: number; h: number; // fractions of the camera view
  counted: boolean; // added to the room totals (false while counting is paused)
};

export type Tally = { total: number; plastic: number; byResin: Record<Resin, number>; byCategory: Record<Category, { n: number; plastic: number }> };

export function emptyTally(): Tally {
  return {
    total: 0, plastic: 0,
    byResin: Object.fromEntries(RESIN_ORDER.map((r) => [r, 0])) as Record<Resin, number>,
    byCategory: Object.fromEntries(Object.keys(CATEGORY_ICON).map((c) => [c, { n: 0, plastic: 0 }])) as Tally['byCategory'],
  };
}

export function addToTally(t: Tally, item: Item): Tally {
  const c = t.byCategory[item.category];
  return {
    total: t.total + 1,
    plastic: t.plastic + (item.resin ? 1 : 0),
    byResin: item.resin ? { ...t.byResin, [item.resin]: t.byResin[item.resin] + 1 } : t.byResin,
    byCategory: { ...t.byCategory, [item.category]: { n: c.n + 1, plastic: c.plastic + (item.resin ? 1 : 0) } },
  };
}

// Small seeded random generator, so a test session is repeatable.
export function rng(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const MAX_VISIBLE = 4;
const overlaps = (a: Detection, b: Omit<Detection, 'uid' | 'item' | 'conf' | 'counted'>) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** One simulated frame: boxes drift slightly; now and then an item leaves or a new one is "recognized". */
export function nextFrame(prev: Detection[], rand: () => number, nextUid: () => number): { dets: Detection[]; added: Detection[] } {
  let dets = prev.map((d) => ({
    ...d,
    x: Math.min(Math.max(d.x + (rand() - 0.5) * 0.012, 0.02), 0.98 - d.w),
    y: Math.min(Math.max(d.y + (rand() - 0.5) * 0.012, 0.30), 0.82 - d.h),
    conf: Math.min(0.97, Math.max(0.55, d.conf + (rand() - 0.5) * 0.04)),
  }));
  if (dets.length > 0 && (dets.length >= MAX_VISIBLE || rand() < 0.22)) dets.splice(Math.floor(rand() * dets.length), 1);
  const added: Detection[] = [];
  if (dets.length < MAX_VISIBLE && rand() < 0.6) {
    const w = 0.22 + rand() * 0.16, h = 0.12 + rand() * 0.12;
    const box = { x: 0.03 + rand() * (0.94 - w), y: 0.31 + rand() * (0.50 - h), w, h };
    if (!dets.some((d) => overlaps(d, box))) {
      // Plastic is more common than not, as in a typical kitchen bin.
      const pool = rand() < 0.75 ? ITEMS.filter((i) => i.resin) : ITEMS.filter((i) => !i.resin);
      const d: Detection = { uid: nextUid(), item: pool[Math.floor(rand() * pool.length)], conf: 0.7 + rand() * 0.25, counted: false, ...box };
      dets = [...dets, d];
      added.push(d);
    }
  }
  return { dets, added };
}
