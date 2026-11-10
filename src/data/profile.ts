/*
 * User profile (proposal FR: "create and manage a personal profile containing the information
 * required for risk assessment"). Stored on the phone until the back-end / Firebase is connected.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { USER } from './user';

export type Profile = {
  name: string;
  email: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
};

const KEY = 'pcos-profile';

export const DEFAULT_PROFILE: Profile = { name: `${USER.firstName} ${USER.lastName}`, email: USER.email };

let cached: Profile | null = null;

export async function loadProfile(): Promise<Profile> {
  if (cached) return cached;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cached = raw ? { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Profile) } : DEFAULT_PROFILE;
  } catch {
    cached = DEFAULT_PROFILE;
  }
  return cached;
}

export async function saveProfile(p: Profile) {
  cached = p;
  await AsyncStorage.setItem(KEY, JSON.stringify(p)).catch(() => {});
}

export function resetProfileCache() {
  cached = null;
}

export const firstName = (p: Profile) => p.name.trim().split(/\s+/)[0] || 'there';
export const initials = (p: Profile) =>
  p.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?';

export function bmi(p: Profile): number | null {
  if (!p.heightCm || !p.weightKg) return null;
  const m = p.heightCm / 100;
  return Math.round((p.weightKg / (m * m)) * 10) / 10;
}

export function bmiCategory(v: number) {
  if (v < 18.5) return 'Underweight';
  if (v < 25) return 'Healthy range';
  if (v < 30) return 'Overweight';
  return 'Obese range';
}

/** Profile for screens; refreshes whenever the screen comes into focus (e.g. after editing). */
export function useProfile() {
  const [profile, setProfile] = useState<Profile>(cached ?? DEFAULT_PROFILE);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadProfile().then((p) => alive && setProfile(p));
      return () => {
        alive = false;
      };
    }, []),
  );
  return profile;
}
