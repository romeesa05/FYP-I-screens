/*
 * Exercise & activity — personalised recommendations (proposal: "personalized nutrition and physical
 * activity recommendations based on the user's risk profile and lifestyle information") and a simple
 * activity log for the weekly goal.
 *
 * Weekly goal follows the 2023 International Evidence-based Guideline for PCOS (adults): at least
 * 150 min of moderate activity a week, plus muscle-strengthening on 2 non-consecutive days.
 * EDIT THE PLANS HERE — when the recommendation knowledge base is ready, replace recommendExercise().
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Answers } from './assessment';

export const WEEKLY_MINUTES_GOAL = 150;
export const WEEKLY_STRENGTH_GOAL = 2;

export type ActivityType = 'walk' | 'strength' | 'yoga' | 'cardio' | 'other';
export const ACTIVITY_TYPES: { id: ActivityType; label: string }[] = [
  { id: 'walk', label: 'Walking' },
  { id: 'strength', label: 'Strength' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'other', label: 'Other' },
];
export const MINUTE_OPTIONS = [10, 20, 30, 45, 60];

export type Plan = {
  id: string;
  type: ActivityType;
  title: string;
  minutes: number;
  intensity: 'Light' | 'Moderate' | 'Vigorous';
  frequency: string;
  why: string;
  reason?: string; // personal reason, from the user's answers
};

const PLANS: Record<string, Plan> = {
  walk: {
    id: 'walk',
    type: 'walk',
    title: 'Brisk walking',
    minutes: 30,
    intensity: 'Moderate',
    frequency: '5 days a week',
    why: 'Regular moderate activity improves insulin sensitivity, one of the main drivers of PCOS symptoms.',
  },
  mealWalk: {
    id: 'mealWalk',
    type: 'walk',
    title: '10-minute walk after meals',
    minutes: 10,
    intensity: 'Light',
    frequency: 'After main meals',
    why: 'Short walks after eating help your muscles use glucose and keep blood sugar steadier.',
  },
  strength: {
    id: 'strength',
    type: 'strength',
    title: 'Strength training',
    minutes: 30,
    intensity: 'Moderate',
    frequency: '2 non-consecutive days',
    why: 'Building muscle increases how much glucose your body uses, even at rest.',
  },
  yoga: {
    id: 'yoga',
    type: 'yoga',
    title: 'Yoga & stretching',
    minutes: 20,
    intensity: 'Light',
    frequency: '2–3 days a week',
    why: 'Gentle movement and breathing can lower stress and help you sleep better.',
  },
  lowImpact: {
    id: 'lowImpact',
    type: 'cardio',
    title: 'Low-impact cardio',
    minutes: 30,
    intensity: 'Moderate',
    frequency: '2–3 days a week',
    why: 'Cycling, swimming or an elliptical raise your heart rate while staying easy on the joints.',
  },
  intervals: {
    id: 'intervals',
    type: 'cardio',
    title: 'Interval cardio',
    minutes: 20,
    intensity: 'Vigorous',
    frequency: '1–2 days a week',
    why: 'Short bursts of harder effort count double toward your weekly goal and boost fitness quickly.',
  },
};

/** Picks and orders plans from the latest assessment answers (no answers = general starter plan). */
export function recommendExercise(answers?: Answers): Plan[] {
  if (!answers) return [PLANS.walk, PLANS.strength, PLANS.yoga];
  const out: Plan[] = [];
  const add = (p: Plan, reason?: string) => out.push({ ...p, reason });

  const heavier = answers.bmi === 'over' || answers.bmi === 'obese';
  if (answers.activity === 'low') {
    add(PLANS.mealWalk, 'You’re active 0–1 days a week, so start small and build the habit.');
    add(PLANS.walk, 'Build up to this once short walks feel easy.');
  } else {
    add(PLANS.walk);
  }
  add(PLANS.strength, heavier ? 'Strength work supports healthy weight management.' : undefined);
  if (answers.sleep === 'poor' || answers.sleep === 'fair') add(PLANS.yoga, 'Your sleep answer suggests rest could improve.');
  if (heavier) add(PLANS.lowImpact, 'Easier on the joints while you build fitness.');
  else if (answers.activity !== 'low') add(PLANS.intervals, 'You’re already active, so you can add some harder sessions.');
  if (!out.some((p) => p.id === 'yoga')) add(PLANS.yoga);
  return out;
}

/* ---------- Activity log (stored on the phone) ---------- */
export type ActivityLog = { date: string; type: ActivityType; minutes: number }; // date = YYYY-MM-DD
const LOG_KEY = 'pcos-activity-log';

export async function loadActivity(): Promise<ActivityLog[]> {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as ActivityLog[]) : [];
  } catch {
    return [];
  }
}

export async function addActivity(entry: ActivityLog): Promise<ActivityLog[]> {
  const list = [...(await loadActivity()), entry];
  await AsyncStorage.setItem(LOG_KEY, JSON.stringify(list.slice(-500))).catch(() => {});
  return list;
}

/** Monday-based current week: minutes per day and strength days. */
export function weekSummary(log: ActivityLog[], now = new Date()) {
  const day = (now.getDay() + 6) % 7; // Mon = 0
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  const keys = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const perDay = keys.map((k) => log.filter((l) => l.date === k).reduce((s, l) => s + l.minutes, 0));
  const strengthDays = keys.filter((k) => log.some((l) => l.date === k && l.type === 'strength')).length;
  return { keys, perDay, total: perDay.reduce((a, b) => a + b, 0), strengthDays, todayIndex: day };
}
