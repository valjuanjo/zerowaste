// Shared prototype data. Everything lives in this browser's localStorage; nothing is uploaded.
const EP = (() => {
  const KEY = 'ep_reports_v1';
  const TYPES = {
    bottle: { es: 'Botella', icon: '🧴' },
    bag: { es: 'Bolsa', icon: '🛍️' },
    cup: { es: 'Vaso', icon: '🥤' },
    tecnopor: { es: 'Tecnopor', icon: '📦' },
    cigarette_butt: { es: 'Colilla', icon: '🚬' },
    mixed_pile: { es: 'Montículo mixto', icon: '🗑️' },
  };
  const STATUS = { received: 'Recibido', scheduled: 'Programado', cleaned: 'Limpiado' };
  const CREWS = ['Cuadrilla A', 'Cuadrilla B', 'Cuadrilla C'];
  const PLACES = [
    { name: 'Parque central', x: 46, y: 38 },
    { name: 'Av. Principal cdra. 12', x: 22, y: 30 },
    { name: 'Mercado', x: 66, y: 58 },
    { name: 'Malecón / playa', x: 30, y: 82 },
    { name: 'Colegio', x: 78, y: 24 },
  ];
  const hoursAgo = (h) => new Date(Date.now() - h * 3600e3).toISOString();

  function seed() {
    const mk = (id, type, p, h, status, crew, cleanedH) => ({
      id, context: 'street', object_type: type, confidence: 0.8, corrected: false,
      place: PLACES[p].name, x: PLACES[p].x + (id % 5) - 2, y: PLACES[p].y + (id % 3) - 1,
      timestamp: hoursAgo(h), status, crew: crew || '',
      cleaned_at: cleanedH != null ? hoursAgo(cleanedH) : '', mine: false,
    });
    return [
      mk(101, 'mixed_pile', 2, 70, 'cleaned', 'Cuadrilla A', 40),
      mk(102, 'bottle', 3, 50, 'cleaned', 'Cuadrilla B', 30),
      mk(103, 'mixed_pile', 2, 26, 'scheduled', 'Cuadrilla A'),
      mk(104, 'bag', 3, 20, 'received'),
      mk(105, 'tecnopor', 3, 9, 'received'),
      mk(106, 'cup', 0, 6, 'scheduled', 'Cuadrilla C'),
      mk(107, 'cigarette_butt', 4, 3, 'received'),
    ];
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* storage unavailable: fall through to seed */ }
    const s = seed();
    save(s);
    return s;
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }
  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    return load();
  }
  const fmt = (iso) => new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  return { TYPES, STATUS, CREWS, PLACES, load, save, reset, fmt };
})();
