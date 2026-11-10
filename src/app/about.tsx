import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlowHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import { BrandLogo } from '@/components/pcos/Lotus';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/** About — app purpose and project credits (from the FYP proposal). */

const FEATURES = [
  'Risk score from 0–100% using non-invasive questions',
  'SHAP explanations of what shaped your score',
  'Personalised nutrition and exercise guidance',
  'GI/GL food checker with healthier swaps',
  'What-If lifestyle simulator',
  'Cycle journal and prediction history',
];

export default function AboutScreen() {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlowHeader title="About" />
      <ScrollView contentContainerStyle={[styles.main, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.logo}>
          <BrandLogo width={190} color={scheme === 'dark' ? '#E7D3E0' : '#5B1C33'} />
          <Text style={[styles.version, { color: c.muted }]}>Version {version}</Text>
        </View>

        <Text style={[styles.body, { color: c.text }]}>
          PCOS Care is a private, accessible way to check your PCOS risk at home and get practical support for managing your
          lifestyle afterwards.
        </Text>

        <View style={[styles.card, { backgroundColor: c.card }, cardShadow(c)]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>What the app does</Text>
          {FEATURES.map((f) => (
            <View key={f} style={styles.feature}>
              <View style={[styles.bullet, { backgroundColor: c.periwinkle }]} />
              <Text style={[styles.featureText, { color: c.text2 }]}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.notice, { backgroundColor: c.estCurrent }]}>
          <Text style={[styles.noticeTitle, { color: c.text }]}>Not a diagnosis</Text>
          <Text style={[styles.noticeText, { color: c.text2 }]}>
            PCOS Care is a preliminary screening and awareness tool. It does not replace a doctor. Please see a qualified
            healthcare professional about any symptoms or results.
          </Text>
        </View>

        <Text style={[styles.credits, { color: c.text2 }]}>
          Final Year Project, BS Computer Science, FAST-NUCES Karachi (2026){'\n'}Romeesa Amir, Gul-e-Zehra and Rameen Jamal
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  main: { paddingHorizontal: 24, paddingTop: 4 },
  logo: { alignItems: 'center', marginTop: 8, marginBottom: 18 },
  version: { marginTop: 8, fontFamily: Font.regular, fontSize: 12.5 },
  body: { fontFamily: Font.regular, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  card: { marginTop: 20, padding: 18, borderRadius: 22 },
  cardTitle: { marginBottom: 10, fontFamily: Font.semibold, fontSize: 16 },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  featureText: { flex: 1, fontFamily: Font.regular, fontSize: 14, lineHeight: 20 },
  notice: { marginTop: 16, padding: 16, borderRadius: 20 },
  noticeTitle: { fontFamily: Font.semibold, fontSize: 15 },
  noticeText: { marginTop: 4, fontFamily: Font.regular, fontSize: 13.5, lineHeight: 20 },
  credits: { marginTop: 22, textAlign: 'center', fontFamily: Font.regular, fontSize: 12.5, lineHeight: 19 },
});
