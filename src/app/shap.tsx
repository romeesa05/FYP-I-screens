import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { FlowHeader, useAppColors } from '@/components/pcos/AppParts';
import FeatureIcon from '@/components/pcos/FeatureIcon';
import { getViewingResult } from '@/data/assessment';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/** 6. SHAP explainability — matches screen 6. Maroon = increases risk, periwinkle = decreases (always with +/−). */

const formatValue = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}`;

export default function ShapScreen() {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [result] = useState(getViewingResult);

  if (!result) return <Redirect href="/assessment" />;

  const rows = result.contributions;
  // leave headroom so the largest bar fills ~75% of the track, as in the reference
  const max = Math.max(...rows.map((r) => Math.abs(r.value)), 0.01) / 0.75;

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlowHeader title="SHAP Explainability" />

      <ScrollView contentContainerStyle={[styles.main, { paddingBottom: insets.bottom + 110 }]}>
        <Text style={[styles.heading, { color: c.text }]} accessibilityRole="header">
          What influenced your result?
        </Text>
        <Text style={[styles.intro, { color: c.text2 }]}>These factors contributed most to your model’s prediction.</Text>

        <View style={[styles.list, { borderTopColor: c.optionBorder }]}>
          {rows.map((r) => {
            const up = r.value >= 0;
            const tone = up ? c.flMaroon : c.down;
            return (
              <View
                key={r.feature}
                accessible
                accessibilityLabel={`${r.label}: ${up ? 'increases' : 'decreases'} risk by ${Math.abs(r.value).toFixed(2)}`}>
                <View style={styles.rowTop}>
                  <FeatureIcon name={r.icon} size={16} color={tone} />
                  <Text style={[styles.name, { color: c.text }]}>{r.label}</Text>
                  <Text style={[styles.value, { color: c.text }]}>{formatValue(r.value)}</Text>
                </View>
                <View style={[styles.track, { backgroundColor: c.track }]}>
                  <View style={[styles.fill, { width: `${(Math.abs(r.value) / max) * 100}%`, backgroundColor: tone }]} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.legend, { borderTopColor: c.optionBorder }]}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: c.flMaroon }]} />
            <Text style={[styles.legendText, { color: c.text2 }]}>Increases risk (+)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: c.down }]} />
            <Text style={[styles.legendText, { color: c.text2 }]}>Decreases risk (−)</Text>
          </View>
        </View>

        <Text style={[styles.note, { color: c.text2, borderLeftColor: c.optionBorder }]}>
          SHAP shows how much each factor pushed your estimate up or down. It explains the model’s prediction, not the cause of
          PCOS.
        </Text>
      </ScrollView>

      <Svg style={styles.wave} viewBox="0 0 400 90" preserveAspectRatio="none" pointerEvents="none">
        <Path d="M0 50 C80 20 150 70 230 45 C300 22 350 40 400 30 L400 90 L0 90 Z" fill={c.wave1} />
        <Path d="M0 68 C90 45 170 85 250 62 C320 44 360 60 400 52 L400 90 L0 90 Z" fill={c.wave2} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  main: { paddingHorizontal: 24, paddingTop: 8 },
  heading: { marginTop: 14, fontFamily: Font.semibold, fontSize: 20 },
  intro: { marginTop: 6, fontFamily: Font.regular, fontSize: 15, lineHeight: 22 },

  list: { marginTop: 20, paddingTop: 18, borderTopWidth: 1, gap: 20 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { flex: 1, fontFamily: Font.regular, fontSize: 15 },
  value: { fontFamily: Font.semibold, fontSize: 15, fontVariant: ['tabular-nums'] },
  track: { marginTop: 10, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },

  legend: {
    marginTop: 26,
    paddingTop: 18,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontFamily: Font.regular, fontSize: 13 },

  note: { marginTop: 22, paddingLeft: 14, borderLeftWidth: 2, fontFamily: Font.regular, fontSize: 14, lineHeight: 21 },

  wave: { position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 90 },
});
