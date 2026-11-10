import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Lotus from '@/components/pcos/Lotus';
import ThemeToggle from '@/components/pcos/ThemeToggle';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/** Temporary page for screens that haven't been converted to React Native yet. */
export default function ComingSoon({ title, note }: { title: string; note: string }) {
  const insets = useSafeAreaInsets();
  const { colors, scheme } = useAppTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.toggle}>
        <ThemeToggle />
      </View>
      <View style={styles.body}>
        <Lotus size={64} color={scheme === 'dark' ? '#A9AED0' : '#868BA1'} />
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>{note}</Text>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          style={[styles.back, { borderColor: colors.border }]}>
          <Text style={[styles.backText, { color: colors.text }]}>Go back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 24 },
  toggle: { alignItems: 'flex-end' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  title: { marginTop: 8, fontFamily: Font.semibold, fontSize: 22 },
  text: { fontFamily: Font.regular, fontSize: 15, textAlign: 'center' },
  back: { marginTop: 14, height: 48, paddingHorizontal: 22, borderRadius: 24, borderWidth: 1.5, justifyContent: 'center' },
  backText: { fontFamily: Font.medium, fontSize: 15 },
});
