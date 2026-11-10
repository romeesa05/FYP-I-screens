/*
 * Cycle & symptom journal — storage and cycle maths (same rules as the web version).
 * Entries are kept on the phone (AsyncStorage) until a back-end is connected.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Entry = { period: boolean; symptoms: string[] };
export type Entries = Record<string, Entry>;

export const SYMPTOMS = ['Cramps', 'Bloating', 'Fatigue', 'Acne', 'Headache', 'Mood swings', 'Cravings', 'Spotting'];

const KEY = 'pcos-cycle-journal';
const DAY = 86400000;
const DEFAULT_CYCLE = 28;

/* ---------- dates ---------- */
export const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fromKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const today = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY);

/* ---------- sample data (shown until the first real entry) ---------- */
export function sampleEntries(): Entries {
  const t = today();
  const e: Entries = {};
  for (const start of [-43, -15]) {
    for (let i = 0; i < 5; i++) e[toKey(addDays(t, start + i))] = { period: true, symptoms: [] };
  }
  e[toKey(addDays(t, -14))] = { period: true, symptoms: ['Cramps', 'Fatigue'] };
  e[toKey(addDays(t, -6))] = { period: false, symptoms: ['Acne'] };
  e[toKey(addDays(t, -2))] = { period: false, symptoms: ['Bloating'] };
  return e;
}

export async function loadJournal(): Promise<{ sample: boolean; entries: Entries }> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return { sample: false, entries: JSON.parse(raw) as Entries };
  } catch {
    /* fall through to sample */
  }
  return { sample: true, entries: sampleEntries() };
}

export function saveJournal(entries: Entries) {
  AsyncStorage.setItem(KEY, JSON.stringify(entries)).catch(() => {});
}

/* ---------- cycle maths ---------- */
export function analyse(entries: Entries) {
  const periodDays = Object.keys(entries)
    .filter((k) => entries[k]?.period)
    .sort();
  const periodSet = new Set(periodDays);
  const starts = periodDays.filter((k) => !periodSet.has(toKey(addDays(fromKey(k), -1)))).map(fromKey);

  const gaps = starts
    .slice(1)
    .map((s, i) => daysBetween(starts[i], s))
    .filter((g) => g >= 21 && g <= 45);
  const cycleLength = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : DEFAULT_CYCLE;

  const predictedStart = starts.length ? addDays(starts[starts.length - 1], cycleLength) : null;

  const predicted = new Set<string>();
  const fertile = new Set<string>();
  const ovulation = new Set<string>();
  const cycleStarts = predictedStart ? [...starts, predictedStart] : starts;

  if (predictedStart) {
    for (let i = 0; i < 5; i++) {
      const k = toKey(addDays(predictedStart, i));
      if (!periodSet.has(k)) predicted.add(k);
    }
  }
  cycleStarts.forEach((s) => {
    const ov = addDays(s, cycleLength - 14);
    ovulation.add(toKey(ov));
    for (let i = -5; i <= 1; i++) if (i !== 0) fertile.add(toKey(addDays(ov, i)));
  });

  const cycleDay = (date: Date) => {
    const last = [...starts].reverse().find((s) => s <= date);
    return last ? daysBetween(last, date) + 1 : null;
  };

  return { starts, cycleLength, predictedStart, predicted, fertile, ovulation, periodSet, cycleDay };
}
