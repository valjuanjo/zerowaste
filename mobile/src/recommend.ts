// Recommendations after a 30-second scan (decision D-015). Chosen from what the scan found; at most 3.
// Texts are drafts, to be checked with the pilot district's recycling program before any public use.
import type { Category, Tally } from './demo';
import type { Lang } from './i18n';

export type Rec = { id: string; glyph: string; title: string; body: string };

type Text = { title: string; body: string };
const CATEGORY_TIP: Record<Lang, Partial<Record<Category, Text>>> = {
  en: {
    bottles: { title: 'Switch to a refillable bottle', body: 'One bottle you refill replaces many single-use ones.' },
    bags: { title: 'Carry a cloth bag', body: 'Keep one by the door or in your backpack.' },
    packaging: { title: 'Buy loose or in bulk', body: 'Markets sell rice, grains and snacks without wrapping.' },
    cups_containers: { title: 'Bring your own container', body: 'Use a táper for takeaway and market food.' },
    caps: { title: 'Save caps in a jar', body: 'Small caps get lost in sorting; give them to a collection campaign.' },
    tecnopor: { title: 'Avoid tecnopor', body: 'It is rarely recycled. Ask for paper or use your own container.' },
  },
  es: {
    bottles: { title: 'Cambia a una botella reutilizable', body: 'Una botella que rellenas reemplaza muchas descartables.' },
    bags: { title: 'Lleva una bolsa de tela', body: 'Ten una junto a la puerta o en tu mochila.' },
    packaging: { title: 'Compra a granel', body: 'En el mercado venden arroz, menestras y snacks sin envoltura.' },
    cups_containers: { title: 'Lleva tu propio táper', body: 'Úsalo para comida para llevar y del mercado.' },
    caps: { title: 'Junta las tapitas en un frasco', body: 'Las tapas pequeñas se pierden al separar; llévalas a una campaña.' },
    tecnopor: { title: 'Evita el tecnopor', body: 'Casi nunca se recicla. Pide papel o usa tu propio envase.' },
  },
};

const GENERAL: Record<Lang, Record<'separate' | 'low' | 'none', Text>> = {
  en: {
    separate: { title: 'Separate PET and HDPE', body: 'Clean and dry, they are the plastics recyclers take most often.' },
    low: { title: 'Little plastic here — keep it up', body: 'Scan another room to compare.' },
    none: { title: 'Nothing recognized', body: 'Try again with more light, moving the phone slowly.' },
  },
  es: {
    separate: { title: 'Separa el PET y el HDPE', body: 'Limpios y secos, son los plásticos que más reciben los recicladores.' },
    low: { title: 'Poco plástico aquí — sigue así', body: 'Escanea otro ambiente para comparar.' },
    none: { title: 'No se reconoció nada', body: 'Intenta de nuevo con más luz, moviendo el teléfono despacio.' },
  },
};

const GLYPH: Partial<Record<Category, string>> = { bottles: '◍', bags: '◫', packaging: '▤', cups_containers: '◰', caps: '◉', tecnopor: '◇' };

export function recommend(t: Tally, lang: Lang): Rec[] {
  if (t.total === 0) return [{ id: 'none', glyph: '○', ...GENERAL[lang].none }];
  const recs: Rec[] = [];
  const cats = (Object.keys(t.byCategory) as Category[])
    .filter((c) => t.byCategory[c].plastic > 0 && CATEGORY_TIP[lang][c])
    .sort((a, b) => t.byCategory[b].plastic - t.byCategory[a].plastic);
  for (const c of cats.slice(0, 2)) recs.push({ id: c, glyph: GLYPH[c] ?? '◌', ...CATEGORY_TIP[lang][c]! });
  if (t.byResin.PET + t.byResin.HDPE > 0) recs.push({ id: 'separate', glyph: '⟲', ...GENERAL[lang].separate });
  if (t.plastic / t.total < 0.25) recs.unshift({ id: 'low', glyph: '✓', ...GENERAL[lang].low });
  return recs.slice(0, 3);
}
