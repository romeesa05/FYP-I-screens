import { createContext, useContext } from 'react';

import { type AppColors, LightColors } from './tokens';

/** preference = what the user chose; scheme = what is shown right now */
export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

export type ThemeContextValue = {
  preference: ThemePreference;
  scheme: ColorScheme;
  colors: AppColors;
  setPreference: (p: ThemePreference) => void;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  preference: 'system',
  scheme: 'light',
  colors: LightColors,
  setPreference: () => {},
  toggleTheme: () => {},
});

/** Light/dark state for every screen: const { colors, scheme, toggleTheme } = useAppTheme(); */
export function useAppTheme() {
  return useContext(ThemeContext);
}
