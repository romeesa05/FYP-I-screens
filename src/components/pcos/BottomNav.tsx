import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Circle, Path, Rect } from 'react-native-svg';

import { Font } from '@/theme/tokens';

import { useAppColors } from './AppParts';
import Icon from './Icon';

const TABS: Record<string, { label: string; icon: React.ReactNode }> = {
  home: { label: 'Home', icon: <Path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z" /> },
  exercise: { label: 'Exercise', icon: <Path d="M6.5 8v8M17.5 8v8M3.5 10v4M20.5 10v4M6.5 12h11" /> },
  nutrition: {
    label: 'Nutrition',
    icon: (
      <>
        <Path d="M12 8c-1.2-1.4-3-1.9-4.6-1.4C5 7.3 4 9.6 4.5 12.4 5.1 16 7.4 20 9.6 20c1 0 1.5-.6 2.4-.6s1.4.6 2.4.6c2.2 0 4.5-4 5.1-7.6.5-2.8-.5-5.1-2.9-5.8-1.6-.5-3.4 0-4.6 1.4Z" />
        <Path d="M12 8c0-2 .8-3.6 2.6-4.4" />
      </>
    ),
  },
  track: {
    label: 'Track',
    icon: (
      <>
        <Rect x={4} y={5} width={16} height={15} rx={2.5} />
        <Path d="M8 3v4M16 3v4M4 10h16" />
        <Circle cx={12} cy={15} r={1.6} />
      </>
    ),
  },
  profile: {
    label: 'Profile',
    icon: (
      <>
        <Circle cx={12} cy={8.5} r={3.8} />
        <Path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </>
    ),
  },
};

/** Bottom bar for the tab screens: Home, Exercise, Nutrition, Track, Profile. */
export default function BottomNav({ state, navigateToTab, insets }: BottomTabBarProps) {
  const c = useAppColors();
  return (
    // Page-coloured backing so the bar's rounded top corners never show a white edge.
    <View style={{ backgroundColor: c.homePage }}>
    <View
      style={[
        styles.bar,
        { backgroundColor: c.navBg, borderColor: c.navBorder, paddingBottom: Math.max(insets.bottom, 10) },
      ]}>
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const active = state.index === i;
        const color = active ? c.navActive : c.navIdle;
        return (
          <Pressable
            key={route.key}
            onPress={() => !active && navigateToTab(route.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            style={styles.item}>
            <View style={[styles.iconPill, active && { backgroundColor: c.navActiveBg }]}>
              <Icon color={color}>{tab.icon}</Icon>
            </View>
            <Text style={[styles.label, { color, fontFamily: active ? Font.semibold : Font.medium }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: '#441525',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  item: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4, minHeight: 48 },
  iconPill: { width: 48, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, letterSpacing: 0.1 },
});
