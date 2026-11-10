import { Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useAppTheme } from '@/theme/theme-context';

/**
 * Sun / moon button that switches light and dark mode.
 * Every screen except the splash must include it (see build conventions).
 * variant "surface" — on app pages; "glass" — on maroon headers.
 */
export default function ThemeToggle({ variant = 'surface' }: { variant?: 'surface' | 'glass' }) {
  const { scheme, colors, toggleTheme } = useAppTheme();
  const isDark = scheme === 'dark';
  const glass = variant === 'glass';
  const iconColor = glass ? '#EAD9EE' : colors.text;

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        glass
          ? { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.16)' }
          : { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { transform: [{ scale: 0.94 }] },
      ]}>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {isDark ? (
          <>
            <Circle cx={12} cy={12} r={4} />
            <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <Path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
        )}
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
