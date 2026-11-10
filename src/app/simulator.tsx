import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Circle, Path } from 'react-native-svg';

import { FlowHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import Icon from '@/components/pcos/Icon';
import { type Answers, type FeatureKey, type RiskResult, loadLatestResult, predictRisk, readSavedResults } from '@/data/assessment';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/*
 * 7. What-If Lifestyle Simulator — matches screen 7 of the reference.
 * Sliders map back onto the assessment answers and re-run predictRisk(), so when the real model
 * replaces predictRisk the simulator uses it automatically.
 */
type SliderDef = {
  key: FeatureKey;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  fromAnswer: Record<string, number>;
  toAnswer: (v: number) => string;
};

const SLIDERS: SliderDef[] = [
  {
    key: 'activity',
    label: 'Physical Activity',
    min: 0,
    max: 7,
    step: 1,
    format: (v) => `${v} day${v === 1 ? '' : 's'}/week`,
    fromAnswer: { low: 1, some: 3, high: 5 },
    toAnswer: (v) => (v <= 1 ? 'low' : v <= 3 ? 'some' : 'high'),
  },
  {
    key: 'sleep',
    label: 'Sleep',
    min: 4,
    max: 10,
    step: 0.5,
    format: (v) => `${v} hrs/night`,
    fromAnswer: { poor: 5, fair: 6.5, good: 8 },
    toAnswer: (v) => (v < 6 ? 'poor' : v < 7 ? 'fair' : 'good'),
  },
  {
    key: 'bmi',
    label: 'BMI',
    min: 16,
    max: 40,
    step: 0.5,
    format: (v) => v.toFixed(1),
    fromAnswer: { under: 17.5, healthy: 22, over: 27, obese: 32, unsure: 25 },
    toAnswer: (v) => (v < 18.5 ? 'under' : v < 25 ? 'healthy' : v < 30 ? 'over' : 'obese'),
  },
];

const startValues = (answers: Answers) =>
  Object.fromEntries(SLIDERS.map((s) => [s.key, s.fromAnswer[answers[s.key] ?? ''] ?? s.min])) as Record<string, number>;

export default function SimulatorScreen() {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [base, setBase] = useState<RiskResult | null | undefined>(undefined); // undefined = still loading
  const [values, setValues] = useState<Record<string, number>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [simulated, setSimulated] = useState<number | null>(null);

  useEffect(() => {
    loadLatestResult().then(async (r) => {
      const result = r ?? (await readSavedResults())[0] ?? null;
      setBase(result);
      if (result?.answers) setValues(startValues(result.answers));
    });
  }, []);

  const statusBar = <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;

  if (base === undefined) return <View style={[styles.screen, { backgroundColor: c.page }]}>{statusBar}</View>;

  if (!base?.answers) {
    return (
      <View style={[styles.screen, { backgroundColor: c.page }]}>
        {statusBar}
        <FlowHeader title="What-If Simulator" />
        <View style={styles.main}>
          <View style={[styles.card, { backgroundColor: c.card }, cardShadow(c)]}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Take the assessment first</Text>
            <Text style={[styles.emptyText, { color: c.text2 }]}>
              The simulator starts from your latest risk estimate, so it needs one assessment before you can try changes.
            </Text>
            <Pressable
              onPress={() => router.replace('/assessment')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.primary, { backgroundColor: c.periwinkle }, pressed && styles.pressed]}>
              <Text style={styles.primaryText}>Start Assessment</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  const answers = base.answers;

  const change = (key: string, v: number) => {
    setValues((s) => ({ ...s, [key]: v }));
    setTouched((t) => ({ ...t, [key]: true }));
  };

  const simulate = () => {
    const next: Answers = { ...answers };
    SLIDERS.forEach((s) => {
      if (touched[s.key]) next[s.key] = s.toAnswer(values[s.key]);
    });
    setSimulated(predictRisk(next).score);
  };

  const reset = () => {
    setValues(startValues(answers));
    setTouched({});
    setSimulated(null);
  };

  const diff = simulated == null ? null : simulated - base.score;

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      {statusBar}
      <FlowHeader title="What-If Simulator">
        <Text style={[styles.subtitle, { color: c.text2 }]}>See how lifestyle changes may affect your risk score.</Text>
      </FlowHeader>

      <ScrollView contentContainerStyle={[styles.main, { paddingBottom: insets.bottom + 32 }]}>
        <View style={[styles.divider, { backgroundColor: c.optionBorder }]} />
        <Text style={[styles.heading, { color: c.text }]} accessibilityRole="header">
          Adjust Your Lifestyle
        </Text>

        <View style={styles.sliders}>
          {SLIDERS.map((def) => (
            <View key={def.key}>
              <View style={styles.sliderTop}>
                <Text style={[styles.sliderLabel, { color: c.text }]}>{def.label}</Text>
                <Text style={[styles.sliderValue, { color: c.text2 }]}>{def.format(values[def.key])}</Text>
              </View>
              <Slider
                value={values[def.key]}
                minimumValue={def.min}
                maximumValue={def.max}
                step={def.step}
                onValueChange={(v) => change(def.key, v)}
                minimumTrackTintColor={def.key === 'activity' ? c.flMaroon : c.tlPlum}
                maximumTrackTintColor={c.track}
                thumbTintColor={c.periwinkle}
                accessibilityLabel={def.label}
                style={styles.slider}
              />
            </View>
          ))}
        </View>

        <Pressable
          onPress={simulate}
          accessibilityRole="button"
          style={({ pressed }) => [styles.primary, { backgroundColor: c.periwinkle }, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>Simulate Changes</Text>
        </Pressable>
        <Pressable
          onPress={reset}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.outline,
            { borderColor: scheme === 'dark' ? c.optionBorder : c.tlMaroon, backgroundColor: c.card },
            pressed && styles.pressed,
          ]}>
          <Text style={[styles.outlineText, { color: scheme === 'dark' ? c.text : c.tlMaroon }]}>Reset</Text>
        </Pressable>

        <View style={styles.estimates} accessibilityLiveRegion="polite">
          <View style={[styles.estimate, { backgroundColor: c.estCurrent }]}>
            <Text style={[styles.estimateLabel, { color: c.text2 }]}>Current Estimate</Text>
            <Text style={[styles.estimateValue, { color: c.text }]}>{base.score}%</Text>
          </View>
          <View style={[styles.estimate, { backgroundColor: c.estSim }]}>
            <Text style={[styles.estimateLabel, { color: c.text2 }]}>Simulated Estimate</Text>
            <Text style={[styles.estimateValue, { color: c.text }]}>{simulated == null ? '—' : `${simulated}%`}</Text>
            {diff != null && (
              <Text style={[styles.estimateDiff, { color: c.tlPlum }]}>
                {diff === 0 ? 'No change' : `${diff < 0 ? '−' : '+'}${Math.abs(diff)} points`}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.note}>
          <Icon size={16} color={c.text2} strokeWidth={1.8}>
            <Circle cx={12} cy={12} r={9} />
            <Path d="M12 11v5M12 8h.01" />
          </Icon>
          <Text style={[styles.noteText, { color: c.text2 }]}>
            This is a simulated estimate, not a guarantee of prevention or treatment. The model may not capture every relationship
            between lifestyle and PCOS.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  main: { paddingHorizontal: 24, paddingTop: 4 },
  subtitle: { marginTop: 4, marginLeft: 40, maxWidth: 300, fontFamily: Font.regular, fontSize: 14, lineHeight: 20 },
  divider: { height: 1, marginTop: 6, marginBottom: 20 },
  heading: { fontFamily: Font.semibold, fontSize: 19 },

  sliders: { marginTop: 18, gap: 18 },
  sliderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 4 },
  sliderLabel: { fontFamily: Font.regular, fontSize: 15 },
  sliderValue: { fontFamily: Font.medium, fontSize: 13, fontVariant: ['tabular-nums'] },
  slider: { width: '100%', height: 36 },

  card: { padding: 20, borderRadius: 22 },
  cardTitle: { fontFamily: Font.semibold, fontSize: 18 },
  emptyText: { marginTop: 6, fontFamily: Font.regular, fontSize: 14, lineHeight: 21 },

  primary: {
    height: 52,
    marginTop: 26,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7E8CBB',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryText: { fontFamily: Font.medium, fontSize: 16, color: '#FFFFFF' },
  pressed: { transform: [{ scale: 0.98 }] },
  outline: { height: 52, marginTop: 14, borderRadius: 26, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  outlineText: { fontFamily: Font.medium, fontSize: 15 },

  estimates: { flexDirection: 'row', gap: 12, marginTop: 24 },
  estimate: { flex: 1, minHeight: 108, padding: 16, borderRadius: 20 },
  estimateLabel: { fontFamily: Font.medium, fontSize: 13 },
  estimateValue: { marginTop: 10, fontFamily: Font.semibold, fontSize: 32, letterSpacing: -0.6, fontVariant: ['tabular-nums'] },
  estimateDiff: { marginTop: 2, fontFamily: Font.medium, fontSize: 12.5 },

  note: { flexDirection: 'row', gap: 8, marginTop: 16 },
  noteText: { flex: 1, fontFamily: Font.regular, fontSize: 12.5, lineHeight: 19 },
});
