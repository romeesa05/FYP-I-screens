/*
 * PCOS assessment — questions, options and (placeholder) scoring. Same content as the web version.
 *
 * EDIT THE QUESTIONS HERE. `weight` is a TEMPORARY stand-in for the trained model: how much that
 * answer pushes the estimate up (+) or down (−). When the real model is connected, replace
 * `predictRisk()` with the model's output (score + SHAP values) — the screens only read its result.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export type FeatureKey = 'bmi' | 'cycle' | 'androgen' | 'activity' | 'sleep';
export type FeatureIconName = 'scale' | 'cycle' | 'hormone' | 'activity' | 'sleep';

export const FEATURES: Record<FeatureKey, { label: string; icon: FeatureIconName }> = {
  bmi: { label: 'BMI / Weight', icon: 'scale' },
  cycle: { label: 'Cycle irregularity', icon: 'cycle' },
  androgen: { label: 'Hormone imbalance', icon: 'hormone' },
  activity: { label: 'Physical activity', icon: 'activity' },
  sleep: { label: 'Sleep quality', icon: 'sleep' },
};

export type Option = { id: string; label: string; detail?: string; weight: number };
export type Step = {
  id: FeatureKey;
  feature: FeatureKey;
  section: string;
  intro: string;
  question: string;
  why: string;
  options: Option[];
};

export const STEPS: Step[] = [
  {
    id: 'bmi',
    feature: 'bmi',
    section: 'Body & Weight',
    intro: 'A quick check on your current body measurements.',
    question: 'Which range does your BMI fall into?',
    why: 'Weight can affect insulin and hormone levels, which are linked to PCOS.',
    options: [
      { id: 'under', label: 'Below 18.5', detail: 'Underweight', weight: 0.02 },
      { id: 'healthy', label: '18.5 – 24.9', detail: 'Healthy range', weight: -0.06 },
      { id: 'over', label: '25 – 29.9', detail: 'Overweight', weight: 0.12 },
      { id: 'obese', label: '30 or above', detail: 'Obese range', weight: 0.21 },
      { id: 'unsure', label: 'Not sure', weight: 0.03 },
    ],
  },
  {
    id: 'androgen',
    feature: 'androgen',
    section: 'Hair & Skin',
    intro: 'Some changes can point to higher androgen levels.',
    question: 'Do you notice extra facial or body hair, or persistent acne?',
    why: 'Higher androgen (male hormone) levels often show up as excess hair growth or acne.',
    options: [
      { id: 'none', label: 'No', detail: 'Not that I’ve noticed', weight: -0.04 },
      { id: 'mild', label: 'Mild', detail: 'Occasionally, in a few areas', weight: 0.08 },
      { id: 'noticeable', label: 'Noticeable', detail: 'Ongoing, or in several areas', weight: 0.16 },
      { id: 'unsure', label: 'Not sure', weight: 0.03 },
    ],
  },
  {
    id: 'cycle',
    feature: 'cycle',
    section: 'Menstrual History',
    intro: 'Tell us about your cycle patterns.',
    question: 'How regular are your cycles?',
    why: 'Cycle length and regularity are one of the strongest early signs used in PCOS risk prediction.',
    options: [
      { id: 'regular', label: 'Very regular', detail: 'Every 21–35 days', weight: -0.08 },
      { id: 'somewhat', label: 'Somewhat irregular', detail: 'Varies by more than 7 days', weight: 0.14 },
      { id: 'highly', label: 'Highly irregular', detail: 'Often more than 35 days apart, or skipped', weight: 0.28 },
      { id: 'unsure', label: 'Not sure', weight: 0.05 },
    ],
  },
  {
    id: 'activity',
    feature: 'activity',
    section: 'Lifestyle',
    intro: 'How much you move during a typical week.',
    question: 'How many days a week are you active for 30 minutes or more?',
    why: 'Regular activity improves insulin sensitivity, which can lower PCOS-related risk.',
    options: [
      { id: 'low', label: '0 – 1 days', detail: 'Mostly inactive', weight: 0.1 },
      { id: 'some', label: '2 – 3 days', detail: 'Somewhat active', weight: -0.04 },
      { id: 'high', label: '4 or more days', detail: 'Active most days', weight: -0.12 },
    ],
  },
  {
    id: 'sleep',
    feature: 'sleep',
    section: 'Sleep',
    intro: 'Rest plays a part in hormone balance.',
    question: 'How would you rate your sleep most nights?',
    why: 'Poor or short sleep can disrupt hormones and blood sugar control.',
    options: [
      { id: 'good', label: 'Good', detail: '7–9 hours, usually restful', weight: -0.08 },
      { id: 'fair', label: 'Fair', detail: 'Sometimes short or broken', weight: 0.03 },
      { id: 'poor', label: 'Poor', detail: 'Often under 6 hours or restless', weight: 0.09 },
    ],
  },
];

export type Answers = Partial<Record<FeatureKey, string>>;
export type Contribution = { feature: FeatureKey; label: string; icon: FeatureIconName; value: number; answer: string };
export type RiskResult = {
  score: number;
  band: string;
  contributions: Contribution[];
  answers: Answers;
  date: string;
  sample?: boolean;
};

const BASE_RISK = 0.3;

/** PLACEHOLDER MODEL — replace with the real prediction pipeline. */
export function predictRisk(answers: Answers): RiskResult {
  const contributions = STEPS.map((step) => {
    const opt = step.options.find((o) => o.id === answers[step.id]);
    const f = FEATURES[step.feature];
    return { feature: step.feature, label: f.label, icon: f.icon, value: opt ? opt.weight : 0, answer: opt?.label ?? '—' };
  }).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const raw = BASE_RISK + contributions.reduce((sum, c) => sum + c.value, 0);
  const score = Math.round(Math.min(0.97, Math.max(0.03, raw)) * 100);
  const band = score >= 60 ? 'Higher risk' : score >= 35 ? 'Moderate risk' : 'Lower risk';
  return { score, band, contributions, answers: { ...answers }, date: new Date().toISOString() };
}

/* ---------- Result storage (on this phone until a back-end is connected) ---------- */
const LATEST_KEY = 'pcos-latest-result';
const SAVED_KEY = 'pcos-saved-results';

let latest: RiskResult | null = null; // most recent assessment
let viewing: RiskResult | null = null; // result open on Results / SHAP (latest or one from history)

export function setLatestResult(result: RiskResult) {
  latest = result;
  viewing = result;
  AsyncStorage.setItem(LATEST_KEY, JSON.stringify(result)).catch(() => {});
}

/** Open a specific result (e.g. from Progress history) on the Results screen. */
export function viewResult(result: RiskResult) {
  viewing = result;
}

export function getViewingResult() {
  return viewing ?? latest;
}

export async function loadLatestResult(): Promise<RiskResult | null> {
  if (latest) return latest;
  try {
    const raw = await AsyncStorage.getItem(LATEST_KEY);
    latest = raw ? (JSON.parse(raw) as RiskResult) : null;
  } catch {
    latest = null;
  }
  return latest;
}

export async function readSavedResults(): Promise<RiskResult[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as RiskResult[]) : [];
  } catch {
    return [];
  }
}

export async function saveResult(result: RiskResult): Promise<boolean> {
  try {
    const list = await readSavedResults();
    if (!list.some((r) => r.date === result.date)) list.unshift(result);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 50)));
    return true;
  } catch {
    return false;
  }
}

export async function isResultSaved(result: RiskResult): Promise<boolean> {
  return (await readSavedResults()).some((r) => r.date === result.date);
}

/** Latest result for screens like Home (null until an assessment is taken). */
export function useLatestResult() {
  const [result, setResult] = useState<RiskResult | null>(latest);
  // Re-check every time the screen comes into focus (e.g. back on Home after an assessment).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadLatestResult().then(async (r) => {
        const fallback = r ?? (await readSavedResults())[0] ?? null;
        if (alive) setResult(fallback);
      });
      return () => {
        alive = false;
      };
    }, []),
  );
  return result;
}

/** Privacy & Data → "Delete my data": forget results in memory (storage is cleared by the caller). */
export function forgetResults() {
  latest = null;
  viewing = null;
}
