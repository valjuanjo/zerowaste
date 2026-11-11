import AsyncStorage from '@react-native-async-storage/async-storage';

export const TYPES = {
  bottle: { es: 'Botella', icon: '🧴' },
  bag: { es: 'Bolsa', icon: '🛍️' },
  cup: { es: 'Vaso', icon: '🥤' },
  tecnopor: { es: 'Tecnopor', icon: '📦' },
  cigarette_butt: { es: 'Colilla', icon: '🚬' },
  mixed_pile: { es: 'Montículo mixto', icon: '🗑️' },
} as const;
export type ObjectType = keyof typeof TYPES;

export const STATUS_ORDER = ['received', 'scheduled', 'cleaned'] as const;
export type Status = (typeof STATUS_ORDER)[number];
export const STATUS_ES: Record<Status, string> = {
  received: 'Recibido',
  scheduled: 'Programado',
  cleaned: 'Limpiado',
};

// Same fields as the plan's data model (§4.3), minus what a prototype cannot know.
export type Report = {
  id: number;
  context: 'street';
  object_type: ObjectType;
  photoUri: string | null;
  geo: { lat: number; lon: number } | null;
  place: string;
  timestamp: string;
  status: Status;
};

const KEY = 'ep_reports_v1';

export async function loadReports(): Promise<Report[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Report[]) : [];
  } catch {
    return [];
  }
}

export async function saveReports(list: Report[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage full or unavailable: the prototype keeps working in memory.
  }
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
