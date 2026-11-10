import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Circle, Path } from 'react-native-svg';

import { FlowHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import Icon from '@/components/pcos/Icon';
import { type RiskResult, loadLatestResult } from '@/data/assessment';
import { toKey } from '@/data/cycle';
import {
  ACTIVITY_TYPES,
  type ActivityLog,
  type ActivityType,
  MINUTE_OPTIONS,
  type Plan,
  WEEKLY_MINUTES_GOAL,
  WEEKLY_STRENGTH_GOAL,
  addActivity,
  loadActivity,
  recommendExercise,
  weekSummary,
} from '@/data/exercise';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/*
 * Exercise & Activity tab (no reference picture — designed from the FYP proposal and App UI spec):
 * weekly goal from the PCOS guideline, a quick activity log, and plans personalised from the latest assessment.
 */

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function TypeIcon({ type, color, size = 22 }: { type: ActivityType; color: string; size?: number }) {
  return (
    <Icon size={size} color={color}>
      {type === 'walk' && (
        <>
          <Circle cx={13} cy={4.5} r={1.8} />
          <Path d="m9 21 2.5-6.5L14 17v4M8.5 11.5 10.5 8l3 1 2 3 3 1M11.5 14.5 10.5 8" />
        </>
      )}
      {type === 'strength' && <Path d="M6.5 8v8M17.5 8v8M3.5 10v4M20.5 10v4M6.5 12h11" />}
      {type === 'yoga' && (
        <>
          <Circle cx={12} cy={4.5} r={1.8} />
          <Path d="M12 7.5V13M5 10.5l7 2 7-2M8 20l4-7 4 7" />
        </>
      )}
      {type === 'cardio' && <Path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10ZM7.5 12h2.5l1.5-2.5 2 4 1-1.5h2" />}
      {type === 'other' && (
        <>
          <Circle cx={12} cy={12} r={8} />
          <Path d="M12 8v4l2.5 2" />
        </>
      )}
    </Icon>
  );
}

export default function ExerciseScreen() {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const [latest, setLatest] = useState<RiskResult | null>(null);
  const [log, setLog] = useState<ActivityLog[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [type, setType] = useState<ActivityType>('walk');
  const [minutes, setMinutes] = useState(30);
  const [justLogged, setJustLogged] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadLatestResult().then(setLatest);
      loadActivity().then(setLog);
    }, []),
  );

  const week = weekSummary(log);
  const plans = recommendExercise(latest?.answers);
  const pct = Math.min(1, week.total / WEEKLY_MINUTES_GOAL);
  const maxDay = Math.max(30, ...week.perDay);

  const logActivity = async (t: ActivityType, m: number, label: string) => {
    setLog(await addActivity({ date: toKey(new Date()), type: t, minutes: m }));
    setJustLogged(`${label}, ${m} min added to today`);
    setFormOpen(false);
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlowHeader title="Exercise & Activity" />

      <ScrollView contentContainerStyle={styles.main} showsVerticalScrollIndicator={false}>
        {/* ---------- Weekly goal ---------- */}
        <View style={[styles.goal, { backgroundColor: c.card }, cardShadow(c, 'lg')]}>
          <Text style={[styles.goalLabel, { color: c.text2 }]}>This week</Text>
          <View style={styles.goalRow}>
            <Text style={[styles.goalValue, { color: c.text }]}>
              {week.total}
              <Text style={[styles.goalOf, { color: c.text2 }]}> / {WEEKLY_MINUTES_GOAL} min</Text>
            </Text>
            <View style={[styles.strengthPill, { backgroundColor: c.tileIconBg }]}>
              <Text style={[styles.strengthText, { color: c.tileIcon }]}>
                Strength {Math.min(week.strengthDays, WEEKLY_STRENGTH_GOAL)} of {WEEKLY_STRENGTH_GOAL} days
              </Text>
            </View>
          </View>
          <View
            style={[styles.progress, { backgroundColor: c.track }]}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: WEEKLY_MINUTES_GOAL, now: Math.min(week.total, WEEKLY_MINUTES_GOAL) }}>
            <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: c.periwinkle }]} />
          </View>

          <View style={styles.bars} accessible accessibilityLabel={`Minutes this week: ${week.perDay.join(', ')}`}>
            {week.perDay.map((m, i) => (
              <View key={week.keys[i]} style={styles.barCol}>
                <View style={[styles.barTrack, { backgroundColor: c.track }]}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${(m / maxDay) * 100}%`, backgroundColor: i === week.todayIndex ? c.flMaroon : c.periwinkle },
                    ]}
                  />
                </View>
                <Text style={[styles.barDay, { color: i === week.todayIndex ? c.text : c.text2 }]}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.guideline, { color: c.text2 }]}>
            The PCOS guideline recommends at least 150 minutes of moderate activity a week, plus muscle-strengthening on 2
            non-consecutive days.
          </Text>

          {!formOpen ? (
            <Pressable
              onPress={() => {
                setFormOpen(true);
                setJustLogged(null);
              }}
              accessibilityRole="button"
              style={({ pressed }) => [styles.primary, { backgroundColor: c.cta }, pressed && styles.pressed]}>
              <Icon size={18} color="#FFFFFF" strokeWidth={2}>
                <Path d="M12 5v14M5 12h14" />
              </Icon>
              <Text style={styles.primaryText}>Log activity</Text>
            </Pressable>
          ) : (
            <View style={[styles.form, { borderTopColor: c.optionBorder }]}>
              <Text style={[styles.formLabel, { color: c.text2 }]}>Activity</Text>
              <View style={styles.chips}>
                {ACTIVITY_TYPES.map((t) => {
                  const on = type === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setType(t.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      style={[styles.chip, { backgroundColor: on ? c.periwinkle : c.chip }]}>
                      <Text style={[styles.chipText, { color: on ? '#FFFFFF' : c.chipText }]}>{t.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[styles.formLabel, { color: c.text2 }]}>Minutes</Text>
              <View style={styles.chips}>
                {MINUTE_OPTIONS.map((m) => {
                  const on = minutes === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setMinutes(m)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      style={[styles.chip, styles.minChip, { backgroundColor: on ? c.periwinkle : c.chip }]}>
                      <Text style={[styles.chipText, { color: on ? '#FFFFFF' : c.chipText }]}>{m}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.formButtons}>
                <Pressable
                  onPress={() => setFormOpen(false)}
                  accessibilityRole="button"
                  style={[styles.secondary, { borderColor: c.optionBorder }]}>
                  <Text style={[styles.secondaryText, { color: c.text }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => logActivity(type, minutes, ACTIVITY_TYPES.find((t) => t.id === type)!.label)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.primary, styles.flex1, styles.noTop, { backgroundColor: c.cta }, pressed && styles.pressed]}>
                  <Text style={styles.primaryText}>Save</Text>
                </Pressable>
              </View>
            </View>
          )}
          {!!justLogged && <Text style={[styles.logged, { color: c.good }]}>{justLogged}</Text>}
        </View>

        {/* ---------- Recommendations ---------- */}
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: c.text }]} accessibilityRole="header">
            Recommended for you
          </Text>
          <Text style={[styles.sectionSub, { color: c.text2 }]}>
            {latest ? 'Based on your latest assessment' : 'A starter plan. Take the assessment for personalised picks.'}
          </Text>
        </View>

        {!latest && (
          <Pressable
            onPress={() => router.push('/assessment')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.banner, { backgroundColor: c.simBg, borderColor: c.simBorder }, pressed && styles.pressed]}>
            <Text style={[styles.bannerText, { color: c.text }]}>Take the assessment</Text>
            <Icon size={18} color={c.text2} strokeWidth={2}>
              <Path d="m9 6 6 6-6 6" />
            </Icon>
          </Pressable>
        )}

        <View style={styles.plans}>
          {plans.map((p: Plan, i) => (
            <View key={p.id} style={[styles.plan, { backgroundColor: c.card, borderColor: i === 0 ? c.selectedBorder : c.cardBorder }, cardShadow(c)]}>
              <View style={styles.planTop}>
                <View style={[styles.planIcon, { backgroundColor: c.tileIconBg }]}>
                  <TypeIcon type={p.type} color={c.tileIcon} />
                </View>
                <View style={styles.flex1}>
                  <Text style={[styles.planTitle, { color: c.text }]}>{p.title}</Text>
                  <View style={styles.planTags}>
                    {[`${p.minutes} min`, p.intensity, p.frequency].map((t) => (
                      <View key={t} style={[styles.tag, { backgroundColor: c.tag }]}>
                        <Text style={[styles.tagText, { color: c.tagText }]}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              {!!p.reason && <Text style={[styles.reason, { color: c.text }]}>{p.reason}</Text>}
              <Text style={[styles.why, { color: c.text2 }]}>{p.why}</Text>
              <Pressable
                onPress={() => logActivity(p.type, p.minutes, p.title)}
                accessibilityRole="button"
                accessibilityLabel={`Log ${p.title}, ${p.minutes} minutes`}
                style={[styles.logBtn, { borderColor: scheme === 'dark' ? '#8A4F68' : c.tlMaroon }]}>
                <Text style={[styles.logBtnText, { color: scheme === 'dark' ? '#E8CFDB' : c.tlMaroon }]}>Log {p.minutes} min</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Text style={[styles.footnote, { color: c.muted }]}>
          Start gently and build up. If you have a heart condition, joint pain or are pregnant, check with your doctor before
          starting a new routine.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1 },
  noTop: { marginTop: 0 },
  main: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 28 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },

  goal: { padding: 20, borderRadius: 26 },
  goalLabel: { fontFamily: Font.medium, fontSize: 13 },
  goalRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  goalValue: { fontFamily: Font.semibold, fontSize: 32, letterSpacing: -0.6, fontVariant: ['tabular-nums'] },
  goalOf: { fontFamily: Font.regular, fontSize: 15, letterSpacing: 0 },
  strengthPill: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999 },
  strengthText: { fontFamily: Font.semibold, fontSize: 12 },
  progress: { marginTop: 12, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  bars: { marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { width: '100%', maxWidth: 22, height: 64, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 6 },
  barDay: { fontFamily: Font.medium, fontSize: 11.5 },

  guideline: { marginTop: 14, fontFamily: Font.regular, fontSize: 12.5, lineHeight: 18 },

  primary: {
    height: 50,
    marginTop: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryText: { fontFamily: Font.semibold, fontSize: 15, color: '#FFFFFF' },
  form: { marginTop: 16, paddingTop: 14, borderTopWidth: 1 },
  formLabel: { marginBottom: 8, fontFamily: Font.medium, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 18, justifyContent: 'center' },
  minChip: { minWidth: 48, alignItems: 'center' },
  chipText: { fontFamily: Font.medium, fontSize: 13.5 },
  formButtons: { flexDirection: 'row', gap: 10 },
  secondary: { flex: 1, height: 50, borderRadius: 25, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: Font.medium, fontSize: 15 },
  logged: { marginTop: 10, textAlign: 'center', fontFamily: Font.medium, fontSize: 13 },

  sectionHead: { marginTop: 26, marginBottom: 12 },
  sectionTitle: { fontFamily: Font.semibold, fontSize: 18 },
  sectionSub: { marginTop: 3, fontFamily: Font.regular, fontSize: 13 },
  banner: {
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: { fontFamily: Font.semibold, fontSize: 15 },

  plans: { gap: 12 },
  plan: { padding: 16, borderRadius: 22, borderWidth: 1.5 },
  planTop: { flexDirection: 'row', gap: 14 },
  planIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  planTitle: { fontFamily: Font.semibold, fontSize: 16 },
  planTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  tagText: { fontFamily: Font.medium, fontSize: 12 },
  reason: { marginTop: 12, fontFamily: Font.medium, fontSize: 13.5, lineHeight: 19 },
  why: { marginTop: 6, fontFamily: Font.regular, fontSize: 13, lineHeight: 19 },
  logBtn: { alignSelf: 'flex-start', marginTop: 12, height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1.5, justifyContent: 'center' },
  logBtnText: { fontFamily: Font.semibold, fontSize: 13 },

  footnote: { marginTop: 20, textAlign: 'center', fontFamily: Font.regular, fontSize: 12, lineHeight: 18 },
});
