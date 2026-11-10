import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { FlowHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import Icon from '@/components/pcos/Icon';
import { type Answers, type RiskResult, predictRisk, readSavedResults, viewResult } from '@/data/assessment';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/** 10. Progress & Assessment History — matches screen 10 of the reference. */

const RANGES = [
  { id: '1M', days: 31 },
  { id: '3M', days: 92 },
  { id: '6M', days: 183 },
  { id: '1Y', days: 366 },
];
const DAY = 86400000;

/* Sample history shown until the user saves their own results (Results → Save Result). */
function sampleHistory(now: number): RiskResult[] {
  const sets: [number, Answers][] = [
    [150, { bmi: 'over', androgen: 'none', cycle: 'somewhat', activity: 'some', sleep: 'fair' }],
    [118, { bmi: 'over', androgen: 'mild', cycle: 'somewhat', activity: 'low', sleep: 'good' }],
    [84, { bmi: 'obese', androgen: 'none', cycle: 'highly', activity: 'some', sleep: 'fair' }],
    [47, { bmi: 'over', androgen: 'mild', cycle: 'somewhat', activity: 'some', sleep: 'fair' }],
    [12, { bmi: 'over', androgen: 'mild', cycle: 'somewhat', activity: 'some', sleep: 'poor' }],
  ];
  return sets.map(([daysAgo, answers]) => ({
    ...predictRisk(answers),
    date: new Date(now - daysAgo * DAY).toISOString(),
    sample: true,
  }));
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function TrendChart({ points }: { points: RiskResult[] }) {
  const c = useAppColors();
  const W = 320;
  const H = 190;
  const pad = { l: 40, r: 14, t: 12, b: 28 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;

  if (points.length < 2) {
    return (
      <View style={styles.chartEmpty}>
        <Text style={[styles.chartEmptyText, { color: c.text2 }]}>Save at least two assessments in this period to see a trend.</Text>
      </View>
    );
  }

  const t0 = new Date(points[0].date).getTime();
  const t1 = new Date(points[points.length - 1].date).getTime();
  const x = (p: RiskResult) => pad.l + ((new Date(p.date).getTime() - t0) / Math.max(1, t1 - t0)) * iw;
  const y = (v: number) => pad.t + ih - (v / 100) * ih;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p).toFixed(1)} ${y(p.score).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points[points.length - 1]).toFixed(1)} ${pad.t + ih} L${pad.l} ${pad.t + ih} Z`;

  const labels: { m: string; x: number }[] = [];
  const seen = new Set<string>();
  points.forEach((p) => {
    const m = new Date(p.date).toLocaleDateString('en-US', { month: 'short' });
    if (!seen.has(m)) {
      seen.add(m);
      labels.push({ m, x: x(p) });
    }
  });
  const last = points[points.length - 1];

  return (
    <View
      accessible
      accessibilityLabel={`Risk score trend from ${points[0].score}% to ${last.score}%`}
      style={{ width: '100%', aspectRatio: W / H }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.pgLine} stopOpacity={0.35} />
            <Stop offset="1" stopColor={c.pgLine} stopOpacity={0.03} />
          </LinearGradient>
        </Defs>
        {[0, 30, 60, 90].map((v) => (
          <Line key={`g${v}`} x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke={c.pgGrid} strokeWidth={1} />
        ))}
        {[0, 30, 60, 90].map((v) => (
          <SvgText key={`t${v}`} x={pad.l - 8} y={y(v) + 4} fontSize={11} fill={c.text2} textAnchor="end" fontFamily={Font.regular}>
            {`${v}%`}
          </SvgText>
        ))}
        <Path d={area} fill="url(#area)" />
        <Path d={line} fill="none" stroke={c.pgLine} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p) => (
          <Circle key={p.date} cx={x(p)} cy={y(p.score)} r={3.5} fill={c.card} stroke={c.pgLine} strokeWidth={2} />
        ))}
        <Circle cx={x(last)} cy={y(last.score)} r={9} fill={c.pgLine} opacity={0.22} />
        <Circle cx={x(last)} cy={y(last.score)} r={5} fill={c.pgLine} />
        {labels.map((l) => (
          <SvgText key={l.m} x={l.x} y={H - 8} fontSize={11} fill={c.text2} textAnchor="middle" fontFamily={Font.regular}>
            {l.m}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

export default function ProgressScreen() {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState('6M');
  const [data, setData] = useState<{ history: RiskResult[]; isSample: boolean; now: number } | null>(null);

  useEffect(() => {
    readSavedResults().then((saved) => {
      const now = Date.now();
      setData(saved.length ? { history: saved, isSample: false, now } : { history: sampleHistory(now), isSample: true, now });
    });
  }, []);

  const days = RANGES.find((r) => r.id === range)!.days;
  const history = data?.history ?? [];
  const cutoff = (data?.now ?? 0) - days * DAY;
  const inRange = history
    .filter((r) => new Date(r.date).getTime() >= cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const list = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const open = (r: RiskResult) => {
    viewResult(r);
    router.push('/results');
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlowHeader title="Progress & History" />

      <ScrollView contentContainerStyle={[styles.main, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.range, { backgroundColor: c.pgTabs }]} accessibilityRole="radiogroup">
          {RANGES.map((r) => {
            const on = range === r.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => setRange(r.id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={[styles.rangeBtn, { backgroundColor: on ? c.cySelected : c.card }]}>
                <Text style={[styles.rangeText, { color: on ? '#FFFFFF' : c.text }]}>{r.id}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: c.card }, cardShadow(c)]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Risk Score Trend</Text>
          {data && <TrendChart points={inRange} />}
        </View>

        <Text style={[styles.caution, { color: c.text2 }]}>
          Changes in a model-estimated score don’t confirm a change in PCOS status. Discuss trends with your doctor.
        </Text>

        <View style={styles.pastHead}>
          <Text style={[styles.pastTitle, { color: c.text }]} accessibilityRole="header">
            Past Assessments
          </Text>
          {data?.isSample && (
            <View style={[styles.sample, { backgroundColor: c.pgTabs }]}>
              <Text style={[styles.sampleText, { color: c.text2 }]}>Sample data</Text>
            </View>
          )}
        </View>

        <View style={styles.list}>
          {list.map((r, i) => (
            <Pressable
              key={r.date}
              onPress={() => open(r)}
              accessibilityRole="button"
              accessibilityLabel={`${fmtDate(r.date)}, ${r.score} percent`}
              style={({ pressed }) => [
                styles.item,
                cardShadow(c),
                i === 0
                  ? { backgroundColor: c.selected, borderColor: c.selectedBorder }
                  : { backgroundColor: c.card, borderColor: 'transparent' },
                pressed && styles.pressed,
              ]}>
              <Icon size={18} color={c.flMaroon} strokeWidth={1.8}>
                <Rect x={5} y={3.5} width={14} height={17} rx={2.5} />
                <Path d="M9 3.5h6v2.5H9zM8.5 11l2 2 4-4M8.5 16.5h7" />
              </Icon>
              <Text style={[styles.itemDate, { color: c.text }]}>{fmtDate(r.date)}</Text>
              <Text style={[styles.itemScore, { color: c.text }]}>{r.score}%</Text>
            </Pressable>
          ))}
        </View>

        {data?.isSample && (
          <Text style={[styles.sampleNote, { color: c.text2 }]}>Take an assessment and tap Save Result to start your own history.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  main: { paddingHorizontal: 24, paddingTop: 4 },

  range: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16 },
  rangeBtn: { flex: 1, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rangeText: { fontFamily: Font.semibold, fontSize: 14 },

  card: { marginTop: 18, paddingTop: 18, paddingHorizontal: 18, paddingBottom: 12, borderRadius: 22 },
  cardTitle: { marginBottom: 6, fontFamily: Font.semibold, fontSize: 18 },
  chartEmpty: { minHeight: 160, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  chartEmptyText: { textAlign: 'center', fontFamily: Font.regular, fontSize: 14, lineHeight: 21 },

  caution: { marginTop: 12, marginHorizontal: 4, fontFamily: Font.regular, fontSize: 12.5, lineHeight: 19 },

  pastHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 },
  pastTitle: { fontFamily: Font.semibold, fontSize: 18 },
  sample: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999 },
  sampleText: { fontFamily: Font.medium, fontSize: 12 },

  list: { gap: 10 },
  item: {
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  itemDate: { flex: 1, fontFamily: Font.regular, fontSize: 15 },
  itemScore: { fontFamily: Font.semibold, fontSize: 15, fontVariant: ['tabular-nums'] },
  pressed: { transform: [{ scale: 0.99 }] },
  sampleNote: { marginTop: 12, marginHorizontal: 4, fontFamily: Font.regular, fontSize: 12.5 },
});
