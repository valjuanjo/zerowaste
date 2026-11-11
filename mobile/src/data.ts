import AsyncStorage from '@react-native-async-storage/async-storage';

// Display names live in i18n.ts.
export const TYPES = {
  bottle: { icon: '🧴' },
  bag: { icon: '🛍️' },
  cup: { icon: '🥤' },
  tecnopor: { icon: '📦' },
  cigarette_butt: { icon: '🚬' },
  mixed_pile: { icon: '🗑️' },
} as const;
export type ObjectType = keyof typeof TYPES;

export const STATUS_ORDER = ['received', 'scheduled', 'cleaned'] as const;
export type Status = (typeof STATUS_ORDER)[number];

// Same fields as the plan's data model (§4.3), minus what a prototype cannot know.
export type Report = {
  id: number;
  context: 'street';
  object_type: ObjectType;
  photoUri: string | null;
  geo: { lat: number; lon: number } | null;
  place: string | null; // null when location was refused or unavailable
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
