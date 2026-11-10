import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Circle, Path, Rect } from 'react-native-svg';

import { AppHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import Icon from '@/components/pcos/Icon';
import { useLatestResult } from '@/data/assessment';
import { firstName, initials, useProfile } from '@/data/profile';
import { Font } from '@/theme/tokens';

/** 3. Home Dashboard — matches screen 3 of the reference. */

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const QUICK_ACTIONS: { key: string; label: string; to?: Href; icon: ReactNode }[] = [
  {
    key: 'journal',
    label: 'Cycle Journal',
    to: '/track',
    icon: (
      <>
        <Rect x={5} y={4} width={14} height={16} rx={2.5} />
        <Path d="M9 2.5v3M15 2.5v3M8.5 10h7M8.5 13.5h4.5" />
      </>
    ),
  },
  {
    key: 'food',
    label: 'Food Checker',
    to: '/nutrition',
    icon: (
      <>
        <Path d="M4 11h16a8 8 0 0 1-16 0Z" />
        <Path d="M9 7.5c0-1.5 1-2 1-3.5M13 7.5c0-1.5 1-2 1-3.5M8 20h8" />
      </>
    ),
  },
  {
    key: 'progress',
    label: 'Progress',
    to: '/progress',
    icon: <Path d="M5 19V11M10 19V6M15 19v-5M20 19V9M3.5 19h17" />,
  },
  {
    key: 'assistant',
    label: 'AI Assistant',
    to: '/assistant',
    icon: (
      <>
        <Path d="M5 17.5V7a2.5 2.5 0 0 1 2.5-2.5h9A2.5 2.5 0 0 1 19 7v6.5a2.5 2.5 0 0 1-2.5 2.5H9l-4 3.5Z" />
        <Path d="M9 9.5h6M9 12.5h3.5" />
      </>
    ),
  },
];

export default function HomeScreen() {
  const c = useAppColors();
  const last = useLatestResult();
  const profile = useProfile();

  return (
    <ScrollView style={{ backgroundColor: c.homePage }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <StatusBar style="light" />

      {/* ---------- Maroon header (theme toggle is built into AppHeader) ---------- */}
      <AppHeader
        subtitle="Small steps create big changes."
        actions={
          <Pressable
            onPress={() => router.navigate('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(profile)}</Text>
          </Pressable>
        }>
        <Text style={styles.hello}>{greeting()},</Text>
        <Text style={styles.name} accessibilityRole="header">
          {firstName(profile)}
        </Text>
      </AppHeader>

      <View style={styles.main}>
        {/* ---------- Risk assessment card ---------- */}
        <View style={[styles.risk, { backgroundColor: c.card }, cardShadow(c, 'lg')]}>
          <View style={styles.riskTop}>
            <View style={[styles.riskBadge, { backgroundColor: c.maroon }]}>
              <Icon color="#FFFFFF">
                <Rect x={5} y={3.5} width={14} height={17} rx={2.5} />
                <Path d="M9 3.5h6v2.5H9zM8.5 11l2 2 4-4M8.5 16.5h7" />
              </Icon>
            </View>
            <View style={styles.flexShrink}>
              <Text style={[styles.riskTitle, { color: c.text }]}>PCOS Risk Assessment</Text>
              <View style={[styles.status, { backgroundColor: c.statusBg }]}>
                <Text style={[styles.statusText, { color: c.statusText }]}>
                  {last ? `Last result: ${last.score}%` : 'No assessment yet'}
                </Text>
              </View>
            </View>
          </View>
          <Text style={[styles.riskText, { color: c.text2 }]}>
            Answer a few questions to get your personalized risk estimate, with the factors that shaped it.
          </Text>
          <Pressable
            onPress={() => router.push('/assessment')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.cta, { backgroundColor: c.cta }, pressed && styles.pressed]}>
            <Text style={styles.ctaText}>Start Assessment</Text>
            <Icon size={18} color="#FFFFFF" strokeWidth={2}>
              <Path d="M5 12h14M13 6l6 6-6 6" />
            </Icon>
          </Pressable>
          <Text style={[styles.note, { color: c.muted }]}>Takes about 5 minutes. Your answers stay private.</Text>
        </View>

        {/* ---------- What-If simulator entry ---------- */}
        <Pressable
          onPress={() => router.push('/simulator')}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.sim,
            { backgroundColor: c.simBg, borderColor: c.simBorder },
            pressed && styles.pressed,
          ]}>
          <View style={[styles.simIcon, { backgroundColor: c.simIconBg }]}>
            <Icon color="#FFFFFF">
              <Path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
              <Circle cx={15} cy={7} r={2} />
              <Circle cx={9} cy={17} r={2} />
            </Icon>
          </View>
          <View style={styles.simText}>
            <Text style={[styles.simTitle, { color: c.text }]}>What-If Simulator</Text>
            <Text style={[styles.simSub, { color: c.text2 }]}>See how activity, sleep and weight could change your estimate</Text>
          </View>
          <Icon size={18} color={c.text2} strokeWidth={2}>
            <Path d="m9 6 6 6-6 6" />
          </Icon>
        </Pressable>

        {/* ---------- Quick actions ---------- */}
        <View>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Actions</Text>
          <View style={styles.actions}>
            {QUICK_ACTIONS.map((a) => (
              <Pressable
                key={a.key}
                onPress={a.to ? () => router.navigate(a.to as Href) : undefined}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                style={({ pressed }) => [
                  styles.action,
                  { backgroundColor: c.card, borderColor: c.cardBorder },
                  cardShadow(c),
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.actionIcon, { backgroundColor: c.tileIconBg }]}>
                  <Icon color={c.tileIcon}>{a.icon}</Icon>
                </View>
                <Text style={[styles.actionLabel, { color: c.text }]} numberOfLines={2}>
                  {a.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ---------- Wellness tip ---------- */}
        <View style={[styles.tip, { backgroundColor: c.tipBg }]}>
          <View style={[styles.tipIcon, { backgroundColor: c.tipIconBg }]}>
            <Icon size={20} color={c.tipIcon}>
              <Path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z" />
            </Icon>
          </View>
          <View style={styles.flexShrink}>
            <Text style={[styles.tipTitle, { color: c.text }]}>Today’s Wellness Tip</Text>
            <Text style={[styles.tipText, { color: c.text2 }]}>
              A 10-minute walk after meals can help keep blood sugar steadier. Try one after lunch today.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28 },
  flexShrink: { flexShrink: 1 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },

  hello: { fontFamily: Font.regular, fontSize: 17, color: '#ECDDE6' },
  name: { marginTop: 2, fontFamily: Font.semibold, fontSize: 34, lineHeight: 40, letterSpacing: -0.6, color: '#FFFFFF' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1E2EA',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  avatarText: { fontFamily: Font.semibold, fontSize: 16, color: '#5B1C33' },

  main: { marginTop: -96, paddingHorizontal: 20, gap: 26 },

  risk: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 16, borderRadius: 26 },
  riskTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  riskBadge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  riskTitle: { marginBottom: 6, fontFamily: Font.semibold, fontSize: 18, lineHeight: 23 },
  status: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  statusText: { fontFamily: Font.medium, fontSize: 12 },
  riskText: { marginTop: 14, fontFamily: Font.regular, fontSize: 14, lineHeight: 21 },
  cta: {
    height: 50,
    marginTop: 18,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { fontFamily: Font.semibold, fontSize: 15, color: '#FFFFFF' },
  note: { marginTop: 12, textAlign: 'center', fontFamily: Font.regular, fontSize: 12 },

  sim: {
    marginTop: -12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  simIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  simText: { flex: 1, gap: 2 },
  simTitle: { fontFamily: Font.semibold, fontSize: 15.5 },
  simSub: { fontFamily: Font.regular, fontSize: 12.5, lineHeight: 17 },

  sectionTitle: { marginBottom: 12, fontFamily: Font.semibold, fontSize: 18 },
  actions: { flexDirection: 'row', gap: 10 },
  action: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  actionLabel: {
    marginTop: 10,
    minHeight: 32,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: Font.semibold,
    fontSize: 12.5,
    lineHeight: 16,
  },

  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 18, borderRadius: 22 },
  tipIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tipTitle: { marginTop: 2, fontFamily: Font.semibold, fontSize: 16 },
  tipText: { marginTop: 6, fontFamily: Font.regular, fontSize: 14, lineHeight: 21 },
});
