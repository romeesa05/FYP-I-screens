import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Path } from 'react-native-svg';

import { FlowHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import Icon from '@/components/pcos/Icon';
import { type Entries, type Entry, SYMPTOMS, analyse, loadJournal, saveJournal, sampleEntries, toKey, today } from '@/data/cycle';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/** 9. Cycle & Symptom Journal — matches screen 9 of the reference. Logic lives in src/data/cycle.ts. */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EMPTY: Entry = { period: false, symptoms: [] };

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: first.getDay() }, () => null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

const fmtMonth = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const fmtDay = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export default function CycleScreen() {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const [now] = useState(today);
  const [journal, setJournal] = useState<{ sample: boolean; entries: Entries }>(() => ({ sample: true, entries: sampleEntries() }));
  const [view, setView] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(now);
  const [draft, setDraft] = useState<Entry>(EMPTY);
  const [saved, setSaved] = useState(false);

  const selKey = toKey(selected);

  // Load saved entries from the phone (sample data shows until the first real log).
  useEffect(() => {
    loadJournal().then((j) => {
      setJournal(j);
      setDraft(j.entries[toKey(now)] ?? EMPTY);
    });
  }, [now]);

  const info = useMemo(() => analyse(journal.entries), [journal]);
  const cells = monthGrid(view.getFullYear(), view.getMonth());
  const isFuture = selected > now;
  const isToday = selKey === toKey(now);
  const cycleDay = info.cycleDay(selected);

  const pick = (d: Date) => {
    setSelected(d);
    setDraft(journal.entries[toKey(d)] ?? EMPTY);
    setSaved(false);
  };

  const toggleSymptom = (s: string) => {
    setSaved(false);
    setDraft((d) => ({ ...d, symptoms: d.symptoms.includes(s) ? d.symptoms.filter((x) => x !== s) : [...d.symptoms, s] }));
  };

  const save = () => {
    // The first real entry replaces the sample data.
    const entries: Entries = journal.sample ? {} : { ...journal.entries };
    if (draft.period || draft.symptoms.length) entries[selKey] = draft;
    else delete entries[selKey];
    saveJournal(entries);
    setJournal({ sample: false, entries });
    setSaved(true);
  };

  const chip = (label: string, on: boolean, onPress: () => void, onColor: string) => (
    <Pressable
      key={label}
      onPress={onPress}
      disabled={isFuture}
      accessibilityRole="button"
      accessibilityState={{ selected: on, disabled: isFuture }}
      style={[styles.chip, { backgroundColor: on ? onColor : c.cyChip }, isFuture && styles.disabled]}>
      <Text style={[styles.chipText, { color: on ? '#FFFFFF' : c.cyChipText }]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlowHeader title="Cycle Tracker" />

      <ScrollView contentContainerStyle={styles.main} showsVerticalScrollIndicator={false}>
        {journal.sample && (
          <Text style={[styles.sample, { color: c.text2, backgroundColor: c.cyChip }]}>
            Showing sample entries. Your first saved log replaces them.
          </Text>
        )}

        {/* ---------- Calendar ---------- */}
        <View style={[styles.cal, { backgroundColor: c.card }, cardShadow(c)]}>
          <View style={styles.calHead}>
            <Text style={[styles.month, { color: c.text }]} accessibilityRole="header">
              {fmtMonth(view)}
            </Text>
            <View style={styles.navBtns}>
              {[
                ['Previous month', -1, 'm15 18-6-6 6-6'],
                ['Next month', 1, 'm9 6 6 6-6 6'],
              ].map(([label, n, d]) => (
                <Pressable
                  key={label as string}
                  onPress={() => setView(new Date(view.getFullYear(), view.getMonth() + (n as number), 1))}
                  accessibilityRole="button"
                  accessibilityLabel={label as string}
                  hitSlop={6}
                  style={styles.navBtn}>
                  <Icon size={18} color={c.text} strokeWidth={2.2}>
                    <Path d={d as string} />
                  </Icon>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.grid}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={[styles.wd, { color: c.text2 }]}>
                {w}
              </Text>
            ))}
            {cells.map((d, i) => {
              if (!d) return <View key={`e${i}`} style={styles.cell} />;
              const k = toKey(d);
              const flags = {
                period: info.periodSet.has(k),
                predicted: info.predicted.has(k),
                fertile: info.fertile.has(k),
                ovulation: info.ovulation.has(k),
                logged: !!journal.entries[k]?.symptoms?.length,
              };
              const isSel = k === selKey;
              const isNow = k === toKey(now);
              const label = [
                fmtDay(d),
                flags.period && 'period',
                flags.predicted && 'predicted period',
                flags.ovulation && 'estimated ovulation',
                flags.fertile && 'fertile window',
                flags.logged && 'symptoms logged',
              ]
                .filter(Boolean)
                .join(', ');
              return (
                <Pressable
                  key={k}
                  onPress={() => pick(d)}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: isSel }}
                  style={styles.cell}>
                  <View
                    style={[
                      styles.num,
                      flags.period && { backgroundColor: c.cyPeriodBg },
                      flags.predicted && { borderColor: c.cyPeriod, borderStyle: 'dashed' },
                      isNow && !flags.predicted && { borderColor: c.cySelected },
                      isSel && { backgroundColor: c.cySelected, borderColor: c.cySelected },
                    ]}>
                    <Text
                      style={[
                        styles.numText,
                        { color: c.text },
                        (flags.period || flags.predicted) && { color: c.cyPeriodText },
                        isSel && { color: '#FFFFFF' },
                      ]}>
                      {d.getDate()}
                    </Text>
                  </View>
                  <View style={styles.dots}>
                    {flags.ovulation && <View style={[styles.dot, { backgroundColor: c.cyOvulation }]} />}
                    {flags.fertile && <View style={[styles.dot, { backgroundColor: c.cyFertile }]} />}
                    {flags.logged && <View style={[styles.dot, { backgroundColor: c.cyLogged }]} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.legend, { borderTopColor: c.optionBorder }]}>
            {[
              ['Period', c.cyPeriod],
              ['Fertile window', c.cyFertile],
              ['Ovulation', c.cyOvulation],
              ['Logged', c.cyLogged],
            ].map(([label, color]) => (
              <View key={label} style={styles.legendItem}>
                <View style={[styles.key, { backgroundColor: color }]} />
                <Text style={[styles.legendText, { color: c.text2 }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ---------- Day entry ---------- */}
        <View style={[styles.entry, { backgroundColor: c.card }, cardShadow(c)]}>
          <Text style={[styles.entryTitle, { color: c.text }]}>
            {isToday ? 'Today' : fmtDay(selected)} – Day {cycleDay ?? '—'}
          </Text>
          {info.predictedStart && (
            <Text style={[styles.entrySub, { color: c.text2 }]}>
              Next period expected around {info.predictedStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},
              based on a {info.cycleLength}-day cycle.
            </Text>
          )}

          <Text style={[styles.entryLabel, { color: c.text2 }]}>Symptoms</Text>
          <View style={styles.chips}>
            {chip(
              'Period day',
              draft.period,
              () => {
                setSaved(false);
                setDraft((d) => ({ ...d, period: !d.period }));
              },
              c.cyPeriod,
            )}
            {SYMPTOMS.map((s) => chip(s, draft.symptoms.includes(s), () => toggleSymptom(s), c.periwinkle))}
          </View>

          {isFuture && <Text style={[styles.entrySub, { color: c.text2 }]}>You can log entries up to today.</Text>}

          <Pressable
            onPress={save}
            disabled={isFuture}
            accessibilityRole="button"
            style={({ pressed }) => [styles.save, { backgroundColor: c.cySelected }, isFuture && styles.disabled, pressed && styles.pressed]}>
            <Text style={styles.saveText}>{saved ? 'Entry saved' : isToday ? 'Log Today' : 'Save Entry'}</Text>
          </Pressable>
        </View>

        <Text style={[styles.footnote, { color: c.muted }]}>
          Predictions are estimates from your logged periods and may be less accurate with irregular cycles.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  main: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 28, gap: 18 },
  sample: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, overflow: 'hidden', fontFamily: Font.regular, fontSize: 13 },

  cal: { paddingTop: 16, paddingHorizontal: 12, paddingBottom: 14, borderRadius: 24 },
  calHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, paddingBottom: 10 },
  month: { fontFamily: Font.semibold, fontSize: 17 },
  navBtns: { flexDirection: 'row', gap: 4 },
  navBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  wd: { width: `${100 / 7}%`, paddingBottom: 6, textAlign: 'center', fontFamily: Font.regular, fontSize: 12 },
  cell: { width: `${100 / 7}%`, height: 50, alignItems: 'center', paddingTop: 4 },
  num: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontFamily: Font.medium, fontSize: 14, fontVariant: ['tabular-nums'] },
  dots: { flexDirection: 'row', gap: 3, height: 6, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 2.5 },

  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    columnGap: 10,
    marginTop: 10,
    marginHorizontal: 6,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  key: { width: 9, height: 9, borderRadius: 4.5 },
  legendText: { fontFamily: Font.regular, fontSize: 12 },

  entry: { paddingTop: 18, paddingHorizontal: 18, paddingBottom: 18, borderRadius: 22 },
  entryTitle: { fontFamily: Font.semibold, fontSize: 19 },
  entrySub: { marginTop: 6, fontFamily: Font.regular, fontSize: 13, lineHeight: 19 },
  entryLabel: { marginTop: 16, marginBottom: 10, fontFamily: Font.medium, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: 18, justifyContent: 'center' },
  chipText: { fontFamily: Font.medium, fontSize: 13.5 },
  disabled: { opacity: 0.5 },
  save: { height: 52, marginTop: 20, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontFamily: Font.medium, fontSize: 16, color: '#FFFFFF' },
  pressed: { transform: [{ scale: 0.98 }] },

  footnote: { textAlign: 'center', fontFamily: Font.regular, fontSize: 12, lineHeight: 18 },
});
