import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Href, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Circle, Path, Rect } from 'react-native-svg';

import { FlowHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import Icon from '@/components/pcos/Icon';
import { bmi, initials, useProfile } from '@/data/profile';
import { type ThemePreference, useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/** 12. Profile & Settings — matches screen 12 of the reference (converted from the web version). */

const NOTIF_KEY = 'pcos-notifications';

const ICONS: Record<string, ReactNode> = {
  account: (
    <>
      <Rect x={5} y={10.5} width={14} height={10} rx={2.5} />
      <Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2" />
    </>
  ),
  notifications: (
    <>
      <Path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15Z" />
      <Path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  health: (
    <>
      <Path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      <Path d="M8.5 12h2l1-2 1.5 4 1-2h1.5" />
    </>
  ),
  privacy: (
    <>
      <Path d="M12 3.5 5 6.5v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9v-5Z" />
      <Circle cx={12} cy={11} r={2} />
      <Path d="M12 13v2.5" />
    </>
  ),
  appearance: (
    <>
      <Circle cx={12} cy={12} r={8} />
      <Path d="M12 4a8 8 0 0 1 0 16Z" />
    </>
  ),
  help: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.6M12 17h.01" />
    </>
  ),
  about: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 11v5M12 8h.01" />
    </>
  ),
};

export default function ProfileScreen() {
  const c = useAppColors();
  const { scheme, preference, setPreference } = useAppTheme();
  const profile = useProfile();
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY)
      .then((v) => setNotifications(v !== 'off'))
      .catch(() => {});
  }, []);

  const toggleNotif = (next: boolean) => {
    setNotifications(next);
    AsyncStorage.setItem(NOTIF_KEY, next ? 'on' : 'off').catch(() => {});
  };

  const row = (icon: string, label: string, to: Href, detail?: string) => (
    <Pressable
      key={label}
      onPress={() => router.push(to)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, { backgroundColor: c.card }, cardShadow(c), pressed && styles.pressed]}>
      <Icon color={c.text}>{ICONS[icon]}</Icon>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: c.text }]}>{label}</Text>
        {!!detail && <Text style={[styles.rowDetail, { color: c.text2 }]}>{detail}</Text>}
      </View>
      <Icon size={18} color={c.text2} strokeWidth={2}>
        <Path d="m9 6 6 6-6 6" />
      </Icon>
    </Pressable>
  );

  const b = bmi(profile);
  const healthDetail = [profile.age ? `${profile.age} yrs` : null, b ? `BMI ${b}` : null].filter(Boolean).join(', ') || 'Add age, height and weight';

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlowHeader title="Profile & Settings" />

      <ScrollView contentContainerStyle={styles.main} showsVerticalScrollIndicator={false}>
        <View style={styles.user}>
          <View style={[styles.avatar, { backgroundColor: scheme === 'dark' ? '#3C3A62' : '#CFD6EE', borderColor: c.card }]}>
            <Text style={[styles.avatarText, { color: scheme === 'dark' ? '#E2E4F6' : '#4F3F7A' }]}>{initials(profile)}</Text>
          </View>
          <View style={styles.flexShrink}>
            <Text style={[styles.name, { color: c.text }]} accessibilityRole="header">
              {profile.name}
            </Text>
            <Text style={[styles.email, { color: c.text2 }]} numberOfLines={1}>
              {profile.email}
            </Text>
            <Pressable onPress={() => router.push('/edit-profile')} accessibilityRole="button" hitSlop={8}>
              <Text style={[styles.edit, { color: c.text }]}>Edit Profile</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.list}>
          {row('account', 'Account & Security', '/edit-profile', 'Name and email')}

          <View style={[styles.row, { backgroundColor: c.card }, cardShadow(c)]}>
            <Icon color={c.text}>{ICONS.notifications}</Icon>
            <Text style={[styles.rowLabel, styles.rowText, { color: c.text }]}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={toggleNotif}
              trackColor={{ false: c.switchOff, true: c.tlMaroon }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={c.switchOff}
              accessibilityLabel="Notifications"
            />
          </View>

          {row('health', 'Health Preferences', '/edit-profile', healthDetail)}
          {row('privacy', 'Privacy & Data', '/privacy', 'See and delete what’s stored')}

          <View style={[styles.row, styles.rowStack, { backgroundColor: c.card }, cardShadow(c)]}>
            <View style={styles.rowHead}>
              <Icon color={c.text}>{ICONS.appearance}</Icon>
              <Text style={[styles.rowLabel, { color: c.text }]}>Appearance</Text>
            </View>
            <View style={[styles.segment, { backgroundColor: c.track }]} accessibilityRole="radiogroup">
              {(
                [
                  ['system', 'System'],
                  ['light', 'Light'],
                  ['dark', 'Dark'],
                ] as [ThemePreference, string][]
              ).map(([val, label]) => {
                const on = preference === val;
                return (
                  <Pressable
                    key={val}
                    onPress={() => setPreference(val)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    style={[styles.seg, on && [{ backgroundColor: c.card }, styles.segOn]]}>
                    <Text style={[styles.segText, { color: on ? c.text : c.text2 }]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {row('help', 'Help & Support', '/assistant', 'Ask Cora, the app assistant')}
          {row('about', 'About', '/about')}
        </View>

        <Pressable
          onPress={() => router.replace('/login')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.signout, { backgroundColor: c.signout }, pressed && styles.pressed]}>
          <Text style={styles.signoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  main: { paddingHorizontal: 24, paddingTop: 6, paddingBottom: 28 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  user: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 6, marginBottom: 22 },
  avatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: Font.semibold, fontSize: 26 },
  name: { fontFamily: Font.semibold, fontSize: 20 },
  email: { marginTop: 3, fontFamily: Font.regular, fontSize: 13.5 },
  edit: { marginTop: 6, fontFamily: Font.medium, fontSize: 14, textDecorationLine: 'underline' },

  list: { gap: 8 },
  row: { minHeight: 58, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16 },
  rowStack: { flexDirection: 'column', alignItems: 'stretch', gap: 12, paddingVertical: 14 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: Font.medium, fontSize: 15 },
  rowDetail: { marginTop: 1, fontFamily: Font.regular, fontSize: 12.5 },

  segment: { flexDirection: 'row', padding: 4, borderRadius: 999 },
  seg: { flex: 1, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  segOn: { shadowColor: '#441525', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  segText: { fontFamily: Font.medium, fontSize: 13.5 },

  signout: { height: 54, marginTop: 24, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  signoutText: { fontFamily: Font.medium, fontSize: 16, color: '#FFFFFF' },
});
