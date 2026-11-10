import AsyncStorage from '@react-native-async-storage/async-storage';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { type ColorScheme, ThemeContext, type ThemePreference } from './theme-context';
import { DarkColors, LightColors } from './tokens';

const STORAGE_KEY = 'pcos-theme';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Restore the saved choice (System / Light / Dark).
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') setPreferenceState(saved);
      })
      .catch(() => {});
  }, []);

  const scheme: ColorScheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setPreference]);

  const value = useMemo(
    () => ({
      preference,
      scheme,
      colors: scheme === 'dark' ? DarkColors : LightColors,
      setPreference,
      toggleTheme,
    }),
    [preference, scheme, setPreference, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
