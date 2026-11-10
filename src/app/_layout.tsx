import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import ThemeProvider from '@/theme/ThemeProvider';
import { useAppTheme } from '@/theme/theme-context';

// Keep the native splash visible until Inter has loaded.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

/** Gives the navigators the app's own light/dark background, so no white shows behind screens or the tab bar. */
function AppNavigator() {
  const { scheme, colors } = useAppTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: colors.background, card: colors.surface, border: colors.border, text: colors.text },
  };
  return (
    <NavigationThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.background } }} />
    </NavigationThemeProvider>
  );
}
