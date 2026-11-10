import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { FlowHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import FeatureIcon from '@/components/pcos/FeatureIcon';
import Icon from '@/components/pcos/Icon';
import { type Contribution, type FeatureKey, getViewingResult, isResultSaved, saveResult } from '@/data/assessment';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/** 5. Risk prediction results — matches screen 5 of the reference. */

const EXPLAIN: Record<FeatureKey, string> = {
  cycle: 'Your answer about cycle regularity',
  bmi: 'Your BMI range',
  androgen: 'Signs of higher androgen levels (hair growth or acne)',
  activity: 'How active you are during the week',
  sleep: 'Your usual sleep quality',
};

function ScoreRing({ score }: { score: number }) {
  const c = useAppColors();
  const r = 84;
  const circ = 2 * Math.PI * r;
  return (
    <View style={styles.ring}>
      <Svg width="100%" height="100%" viewBox="0 0 200 200">
        <Circle cx={100} cy={100} r={r} fill="none" stroke={c.ringTrack} strokeWidth={12} />
        <Circle
          cx={100}
          cy={100}
          r={r}
          fill="none"
          stroke={c.periwinkle}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * circ} ${circ}`}
          transform="rotate(-90 100 100)"
        />
      </Svg>
      <View style={styles.ringText}>
        <Text style={[styles.score, { color: c.text }]}>{score}%</Text>
        <Text style={[styles.scoreLabel, { color: c.text2 }]}>Model-estimated risk score</Text>
      </View>
    </View>
  );
}

function InsightRow({ item, first }: { item: Contribution; first: boolean }) {
  const c = useAppColors();
  const [open, setOpen] = useState(false);
  const up = item.value >= 0;
  return (
    <View style={!first && { borderTopWidth: 1, borderTopColor: c.optionBorder }}>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${item.label}, ${up ? 'increases' : 'decreases'} risk`}
        style={styles.insightBtn}>
        <View style={[styles.insightIcon, { backgroundColor: c.track }]}>
          <FeatureIcon name={item.icon} color={c.flMaroon} />
        </View>
        <Text style={[styles.insightName, { color: c.text }]}>{item.label}</Text>
        <Text style={[styles.sign, { color: up ? c.flMaroon : c.down }]}>{up ? '+' : '−'}</Text>
      </Pressable>
      {open && (
        <Text style={[styles.insightMore, { color: c.text2 }]}>
          {EXPLAIN[item.feature]} ({item.answer}) {up ? 'raised' : 'lowered'} your estimate.
        </Text>
      )}
    </View>
  );
}

export default function ResultsScreen() {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [result] = useState(getViewingResult);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (result) isResultSaved(result).then(setSaved);
  }, [result]);

  if (!result) return <Redirect href="/assessment" />;

  const onSave = async () => {
    if (await saveResult(result)) setSaved(true);
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlowHeader title="Your Assessment Results" />

      <ScrollView contentContainerStyle={[styles.main, { paddingBottom: insets.bottom + 32 }]}>
        <ScoreRing score={result.score} />
        <View style={[styles.band, { backgroundColor: c.ringTrack }]}>
          <Text style={[styles.bandText, { color: c.text }]}>{result.band}</Text>
        </View>

        <Text style={[styles.disclaimer, { color: c.text2 }]}>
          This is a risk prediction, not a diagnosis. Use it to guide your next steps with a healthcare professional.
        </Text>

        <View style={[styles.card, { backgroundColor: c.card }, cardShadow(c)]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Key Insights</Text>
          {result.contributions.slice(0, 4).map((item, i) => (
            <InsightRow key={item.feature} item={item} first={i === 0} />
          ))}
        </View>

        <Pressable
          onPress={() => router.push('/shap')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.primary, { backgroundColor: c.periwinkle }, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>View SHAP insights</Text>
          <Icon size={18} color="#FFFFFF" strokeWidth={2}>
            <Path d="m9 6 6 6-6 6" />
          </Icon>
        </Pressable>

        {result.sample ? (
          <Text style={[styles.disclaimer, { color: c.text2 }]}>This is a sample result for demonstration.</Text>
        ) : (
          <Pressable
            onPress={onSave}
            disabled={saved}
            accessibilityRole="button"
            accessibilityState={{ disabled: saved }}
            style={[styles.outline, { backgroundColor: c.card, borderColor: c.optionBorder }]}>
            <Icon size={18} color={saved ? c.text2 : c.text} strokeWidth={1.8}>
              {saved ? (
                <Path d="m5 12 5 5 9-10" />
              ) : (
                <>
                  <Rect x={5} y={3.5} width={14} height={17} rx={2.5} />
                  <Path d="M9 3.5h6v3H9zM9 12h6M9 15.5h4" />
                </>
              )}
            </Icon>
            <Text style={[styles.outlineText, { color: saved ? c.text2 : c.text }]}>{saved ? 'Result saved' : 'Save Result'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  main: { paddingHorizontal: 24, paddingTop: 8 },

  ring: { width: 210, height: 210, marginTop: 12, alignSelf: 'center' },
  ringText: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44 },
  score: { fontFamily: Font.semibold, fontSize: 44, letterSpacing: -0.9 },
  scoreLabel: { marginTop: 4, textAlign: 'center', fontFamily: Font.regular, fontSize: 13, lineHeight: 17 },
  band: { alignSelf: 'center', marginTop: 14, paddingVertical: 5, paddingHorizontal: 14, borderRadius: 999 },
  bandText: { fontFamily: Font.semibold, fontSize: 13 },
  disclaimer: { marginTop: 14, textAlign: 'center', fontFamily: Font.regular, fontSize: 14, lineHeight: 21 },

  card: { marginTop: 22, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 8, borderRadius: 22 },
  cardTitle: { marginBottom: 6, fontFamily: Font.semibold, fontSize: 18 },
  insightBtn: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  insightName: { flex: 1, fontFamily: Font.regular, fontSize: 15 },
  sign: { width: 24, textAlign: 'center', fontFamily: Font.medium, fontSize: 22, lineHeight: 24 },
  insightMore: { marginLeft: 42, marginBottom: 12, fontFamily: Font.regular, fontSize: 13, lineHeight: 19 },

  primary: {
    height: 52,
    marginTop: 24,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#7E8CBB',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryText: { fontFamily: Font.medium, fontSize: 16, color: '#FFFFFF' },
  pressed: { transform: [{ scale: 0.98 }] },
  outline: {
    height: 52,
    marginTop: 14,
    borderRadius: 26,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineText: { fontFamily: Font.medium, fontSize: 15 },
});
