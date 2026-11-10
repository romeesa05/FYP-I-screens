import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Circle, Path } from 'react-native-svg';

import { FlowHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import FoodArt from '@/components/pcos/FoodArt';
import Icon from '@/components/pcos/Icon';
import { CATEGORIES, FOODS, type Food, findFood } from '@/data/nutrition';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/** 8. Nutrition & Food Checker — matches screen 8 of the reference. Foods live in src/data/nutrition.ts. */

const VERDICT = { good: 'Good choice', moderate: 'In moderation', limit: 'Limit' } as const;

function VerdictBadge({ food }: { food: Food }) {
  const c = useAppColors();
  const tone =
    food.verdict === 'good'
      ? { bg: c.goodBg, fg: c.good }
      : food.verdict === 'limit'
        ? { bg: c.limitBg, fg: c.limit }
        : { bg: c.modBg, fg: c.mod };
  return (
    <View style={[styles.verdict, { backgroundColor: tone.bg }]}>
      <Text style={[styles.verdictText, { color: tone.fg }]}>{VERDICT[food.verdict]}</Text>
    </View>
  );
}

function FoodCard({ food }: { food: Food }) {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const [open, setOpen] = useState(false);
  const n = food.nutrients;
  const viewColor = scheme === 'dark' ? '#E8CFDB' : c.tlMaroon;
  const viewBorder = scheme === 'dark' ? '#8A4F68' : c.tlMaroon;
  const rows: [string, string][] = [
    ['Calories', `${n.kcal} kcal`],
    ['Carbs', `${n.carbs} g`],
    ['Fiber', `${n.fiber} g`],
    ['Sugar', `${n.sugar} g`],
    ['Protein', `${n.protein} g`],
    ['Fat', `${n.fat} g`],
  ];

  return (
    <View style={[styles.card, { backgroundColor: c.card }, cardShadow(c)]}>
      <View style={styles.cardMain}>
        <View style={[styles.art, { backgroundColor: c.artBg }]}>
          <FoodArt id={food.id} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: c.text }]}>{food.name}</Text>
            <VerdictBadge food={food} />
          </View>
          <View style={styles.servingRow}>
            <Text style={[styles.serving, { color: c.text2 }]}>{food.serving}</Text>
            <Text style={[styles.kcal, { color: c.text }]}>{n.kcal} kcal</Text>
          </View>
          <View style={styles.tags}>
            {food.tags.map((t) => (
              <View key={t} style={[styles.tag, { backgroundColor: c.tag }]}>
                <Text style={[styles.tagText, { color: c.tagText }]}>{t}</Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={() => setOpen(!open)}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            style={[styles.viewBtn, { borderColor: viewBorder }]}>
            <Icon size={16} color={viewColor} strokeWidth={2}>
              <Path d={open ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} />
            </Icon>
            <Text style={[styles.viewText, { color: viewColor }]}>{open ? 'Hide Nutrients' : 'View Nutrients'}</Text>
          </Pressable>
        </View>
      </View>

      {open && (
        <View style={[styles.nutrients, { borderTopColor: c.optionBorder }]}>
          <View style={styles.grid}>
            {rows.map(([k, v]) => (
              <View key={k} style={[styles.cell, { backgroundColor: c.artBg }]}>
                <Text style={[styles.cellKey, { color: c.text2 }]}>{k}</Text>
                <Text style={[styles.cellValue, { color: c.text }]}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={styles.giRow}>
            <View style={[styles.giBox, { backgroundColor: c.estSim }]}>
              <Text style={[styles.cellKey, { color: c.text2 }]}>Glycemic index</Text>
              <Text style={[styles.cellValue, { color: c.text }]}>{food.gi}</Text>
            </View>
            <View style={[styles.giBox, { backgroundColor: c.estSim }]}>
              <Text style={[styles.cellKey, { color: c.text2 }]}>Glycemic load</Text>
              <Text style={[styles.cellValue, { color: c.text }]}>
                {food.gl} <Text style={[styles.glBand, { color: c.text2 }]}>{food.gl <= 10 ? 'Low' : food.gl < 20 ? 'Medium' : 'High'}</Text>
              </Text>
            </View>
          </View>
          <Text style={[styles.foodNote, { color: c.text2 }]}>{food.note}</Text>
        </View>
      )}
    </View>
  );
}

function AlternativeCard({ food }: { food: Food }) {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  return (
    <View style={styles.altWrap}>
      <View style={[styles.altLink, { borderColor: c.optionBorder }]} />
      <View
        style={[styles.alt, { backgroundColor: c.card, borderColor: c.optionBorder }]}
        accessible
        accessibilityLabel={`Better alternative: ${food.name}`}>
        <View style={styles.altTitleRow}>
          <View style={[styles.altCheck, { backgroundColor: c.good }]}>
            <Icon size={12} color={scheme === 'dark' ? '#1F2D23' : '#FFFFFF'} strokeWidth={3}>
              <Path d="m5 12 5 5 9-10" />
            </Icon>
          </View>
          <Text style={[styles.altTitle, { color: c.text }]}>Better Alternative</Text>
        </View>
        <View style={styles.altRow}>
          <View style={[styles.art, styles.artSm, { backgroundColor: c.artBg }]}>
            <FoodArt id={food.id} size={58} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.altName, { color: c.text }]}>{food.name}</Text>
            <View style={styles.servingRow}>
              <Text style={[styles.serving, { color: c.text2 }]}>{food.serving}</Text>
              <Text style={[styles.kcal, { color: c.text }]}>{food.nutrients.protein} g protein</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function NutritionScreen() {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [goodOnly, setGoodOnly] = useState(false);

  const foods = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOODS.filter(
      (f) =>
        (category === 'All' || f.categories.includes(category)) &&
        (!goodOnly || f.verdict === 'good') &&
        (!q || f.name.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q))),
    );
  }, [query, category, goodOnly]);

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlowHeader title="Nutrition & Food Checker" />

      <ScrollView contentContainerStyle={styles.main} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.searchRow}>
          <View style={[styles.search, { backgroundColor: c.tlMaroon }]}>
            <Icon size={17} color="#F3E6EC" strokeWidth={2}>
              <Circle cx={11} cy={11} r={6.5} />
              <Path d="m16 16 4 4" />
            </Icon>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search a food"
              placeholderTextColor="#E2C9D4"
              accessibilityLabel="Search a food"
              returnKeyType="search"
              autoCorrect={false}
              style={styles.searchInput}
            />
          </View>
          <Pressable accessibilityRole="button" style={[styles.scan, { backgroundColor: c.chip }]}>
            <Icon size={17} color={c.text2} strokeWidth={1.8}>
              <Path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M8 12h8" />
            </Icon>
            <Text style={[styles.scanText, { color: c.text2 }]}>Scan a label</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
          {CATEGORIES.map((cat) => {
            const on = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[styles.chip, { backgroundColor: on ? c.periwinkle : c.chip }]}>
                <Text style={[styles.chipText, { color: on ? '#FFFFFF' : c.chipText }]}>{cat}</Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setGoodOnly(!goodOnly)}
            accessibilityRole="button"
            accessibilityLabel="Show good choices only"
            accessibilityState={{ selected: goodOnly }}
            style={[styles.filter, { backgroundColor: c.coral }, goodOnly && { borderWidth: 3, borderColor: c.page, outlineColor: c.coral }]}>
            <Icon size={18} color="#FFFFFF" strokeWidth={2}>
              <Path d="M4 6h16M7 12h10M10 18h4" />
            </Icon>
          </Pressable>
        </ScrollView>
        {goodOnly && <Text style={[styles.filterNote, { color: c.text2 }]}>Showing good choices only</Text>}

        <View style={styles.list}>
          {foods.length === 0 && (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: c.text }]}>No foods match “{query}”</Text>
              <Text style={[styles.emptyText, { color: c.text2 }]}>Try another name, or clear the filters to see everything.</Text>
            </View>
          )}
          {foods.map((f) => {
            const alt = f.alt ? findFood(f.alt) : undefined;
            return (
              <View key={f.id} style={styles.group}>
                <FoodCard food={f} />
                {alt && <AlternativeCard food={alt} />}
              </View>
            );
          })}
        </View>

        <Text style={[styles.footnote, { color: c.muted }]}>Values, GI and GL are approximate per serving. For a personal plan, talk to a dietitian.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  main: { paddingHorizontal: 24, paddingTop: 6, paddingBottom: 28 },

  searchRow: { flexDirection: 'row', gap: 10 },
  search: { flex: 1.35, height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 22 },
  searchInput: { flex: 1, height: '100%', padding: 0, fontFamily: Font.regular, fontSize: 14, color: '#FFFFFF' },
  scan: { flex: 1, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 22 },
  scanText: { fontFamily: Font.medium, fontSize: 13.5 },

  chipsScroll: { marginTop: 18, marginHorizontal: -24 },
  chips: { gap: 8, paddingHorizontal: 24, paddingVertical: 4, alignItems: 'center' },
  chip: { height: 38, paddingHorizontal: 16, borderRadius: 19, justifyContent: 'center' },
  chipText: { fontFamily: Font.medium, fontSize: 14 },
  filter: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  filterNote: { marginTop: 8, fontFamily: Font.regular, fontSize: 12.5 },

  list: { marginTop: 16, gap: 16 },
  group: { gap: 10 },
  card: { padding: 16, borderRadius: 22 },
  cardMain: { flexDirection: 'row', gap: 14 },
  art: { width: 84, height: 84, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  artSm: { width: 64, height: 64, borderRadius: 16 },
  cardBody: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  name: { flexShrink: 1, fontFamily: Font.semibold, fontSize: 17 },
  verdict: { paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999 },
  verdictText: { fontFamily: Font.semibold, fontSize: 11.5 },
  servingRow: { marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  serving: { flexShrink: 1, fontFamily: Font.regular, fontSize: 12.5 },
  kcal: { fontFamily: Font.semibold, fontSize: 12.5, fontVariant: ['tabular-nums'] },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  tagText: { fontFamily: Font.medium, fontSize: 12 },
  viewBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
    height: 36,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  viewText: { fontFamily: Font.semibold, fontSize: 13 },

  nutrients: { marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '31.5%', padding: 10, borderRadius: 12 },
  cellKey: { fontFamily: Font.regular, fontSize: 11.5 },
  cellValue: { marginTop: 2, fontFamily: Font.semibold, fontSize: 14, fontVariant: ['tabular-nums'] },
  giRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  giBox: { flex: 1, padding: 10, borderRadius: 12 },
  glBand: { fontFamily: Font.regular, fontSize: 12 },
  foodNote: { marginTop: 6, fontFamily: Font.regular, fontSize: 13, lineHeight: 19 },

  altWrap: { paddingLeft: 18 },
  altLink: {
    position: 'absolute',
    left: 6,
    top: -10,
    width: 10,
    height: 36,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderBottomLeftRadius: 10,
  },
  alt: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  altTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  altCheck: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  altTitle: { fontFamily: Font.semibold, fontSize: 15 },
  altRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  altName: { fontFamily: Font.semibold, fontSize: 15 },

  empty: { paddingVertical: 28, paddingHorizontal: 12, alignItems: 'center' },
  emptyTitle: { fontFamily: Font.semibold, fontSize: 15 },
  emptyText: { marginTop: 6, textAlign: 'center', fontFamily: Font.regular, fontSize: 13.5 },
  footnote: { marginTop: 20, textAlign: 'center', fontFamily: Font.regular, fontSize: 12 },
});
