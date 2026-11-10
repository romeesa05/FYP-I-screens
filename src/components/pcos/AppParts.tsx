/*
 * Shared frame for in-app screens.
 *  - AppHeader: maroon header (Home, tab screens). ALWAYS includes the light/dark toggle.
 *  - FlowHeader: light header with back chevron + title (Assessment, Results, SHAP …). ALWAYS includes the toggle.
 * Build every new screen with one of these so it gets the toggle automatically.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Path } from 'react-native-svg';

import { appColors } from '@/theme/appColors';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

import Icon from './Icon';
import ThemeToggle from './ThemeToggle';

export function useAppColors() {
  return appColors(useAppTheme().scheme);
}

export function AppHeader({
  title,
  subtitle,
  children,
  actions,
  compact = false,
}: {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const c = useAppColors();
  return (
    <LinearGradient
      colors={[c.maroon, c.maroon, c.maroonFade, c.homePage]}
      locations={[0, 0.45, 0.72, 1]}
      style={[styles.header, { paddingTop: insets.top + 24, paddingBottom: compact ? 64 : 120 }]}>
      <View style={styles.headerRow}>
        <View style={styles.flexShrink}>{children ?? <Text style={styles.headerTitle}>{title}</Text>}</View>
        <View style={styles.headerActions}>
          <ThemeToggle variant="glass" />
          {actions}
        </View>
      </View>
      {!!subtitle && <Text style={styles.motto}>{subtitle}</Text>}
    </LinearGradient>
  );
}

export function FlowHeader({
  title,
  onBack,
  children,
}: {
  title?: string;
  onBack?: () => void;
  children?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const c = useAppColors();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/home')));
  return (
    <View style={[styles.flow, { paddingTop: insets.top + 12 }]}>
      <View style={styles.flowRow}>
        <Pressable onPress={back} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back" style={styles.backBtn}>
          <Icon color={c.text} strokeWidth={2}>
            <Path d="m15 18-6-6 6-6" />
          </Icon>
        </Pressable>
        {title ? (
          <Text style={[styles.flowTitle, { color: c.text }]} accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={styles.flex}>{children}</View>
        )}
        <ThemeToggle />
      </View>
      {!!title && children}
    </View>
  );
}

/** Shadow helper matching the web cards. size "lg" for hero cards, "sm" for tiles. */
export function cardShadow(c: ReturnType<typeof appColors>, size: 'lg' | 'sm' = 'sm') {
  const lg = size === 'lg';
  return {
    shadowColor: c.shadow,
    shadowOpacity: lg ? c.shadowLg : c.shadowSm,
    shadowRadius: lg ? 17 : 5,
    shadowOffset: { width: 0, height: lg ? 14 : 2 },
    elevation: lg ? 6 : c.shadowSm ? 1 : 0,
  };
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  header: { paddingHorizontal: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontFamily: Font.semibold, fontSize: 34, lineHeight: 38, letterSpacing: -0.6, color: '#FFFFFF' },
  motto: { marginTop: 14, fontFamily: Font.regular, fontSize: 15, color: '#DCC7D3' },

  flow: { paddingHorizontal: 20, paddingBottom: 8 },
  flowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  backBtn: { width: 40, height: 40, marginLeft: -8, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  flowTitle: { flex: 1, fontFamily: Font.semibold, fontSize: 18 },
});
