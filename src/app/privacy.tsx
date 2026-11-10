import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Path } from 'react-native-svg';

import { FlowHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import Icon from '@/components/pcos/Icon';
import { forgetResults } from '@/data/assessment';
import { resetProfileCache } from '@/data/profile';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/** Privacy & Data — what the app keeps and a way to delete it (spec: privacy controls easy to find). */

const STORED = [
  ['Profile', 'Name, email, and optional age, height and weight'],
  ['Assessment results', 'Your answers, risk scores and saved history'],
  ['Cycle journal', 'Period days and symptoms you log'],
  ['Activity log', 'Exercise minutes you record'],
  ['Preferences', 'Theme and notification settings'],
];
const KEYS = ['pcos-profile', 'pcos-latest-result', 'pcos-saved-results', 'pcos-cycle-journal', 'pcos-activity-log'];

export default function PrivacyScreen() {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [deleted, setDeleted] = useState(false);

  const confirmDelete = () =>
    Alert.alert(
      'Delete your data?',
      'This removes your profile details, results, cycle journal and activity log from this phone. It can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(KEYS).catch(() => {});
            forgetResults();
            resetProfileCache();
            setDeleted(true);
          },
        },
      ],
    );

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlowHeader title="Privacy & Data" />
      <ScrollView contentContainerStyle={[styles.main, { paddingBottom: insets.bottom + 32 }]}>
        <View style={[styles.lead, { backgroundColor: c.estSim }]}>
          <Icon color={c.tileIcon}>
            <Path d="M12 3.5 5 6.5v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9v-5Z" />
            <Path d="m9 12 2 2 4-4" />
          </Icon>
          <Text style={[styles.leadText, { color: c.text }]}>
            Your health information stays on this phone. It isn’t shared with anyone without your permission.
          </Text>
        </View>

        <Text style={[styles.section, { color: c.text }]}>What’s stored</Text>
        <View style={[styles.card, { backgroundColor: c.card }, cardShadow(c)]}>
          {STORED.map(([title, detail], i) => (
            <View key={title} style={[styles.item, i > 0 && { borderTopWidth: 1, borderTopColor: c.optionBorder }]}>
              <Text style={[styles.itemTitle, { color: c.text }]}>{title}</Text>
              <Text style={[styles.itemDetail, { color: c.text2 }]}>{detail}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.note, { color: c.text2 }]}>
          Risk scores are model-generated estimates for awareness and screening. They are not a diagnosis.
        </Text>

        {deleted ? (
          <View style={[styles.done, { backgroundColor: c.goodBg }]}>
            <Text style={[styles.doneText, { color: c.good }]}>Your data has been deleted from this phone.</Text>
          </View>
        ) : (
          <Pressable
            onPress={confirmDelete}
            accessibilityRole="button"
            style={({ pressed }) => [styles.delete, { borderColor: c.limit }, pressed && styles.pressed]}>
            <Text style={[styles.deleteText, { color: c.limit }]}>Delete my data</Text>
          </Pressable>
        )}
        {deleted && (
          <Pressable onPress={() => router.replace('/home')} accessibilityRole="button" style={[styles.home, { borderColor: c.optionBorder }]}>
            <Text style={[styles.homeText, { color: c.text }]}>Back to Home</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  main: { paddingHorizontal: 24, paddingTop: 4 },
  lead: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 20, alignItems: 'center' },
  leadText: { flex: 1, fontFamily: Font.medium, fontSize: 14, lineHeight: 20 },
  section: { marginTop: 24, marginBottom: 10, fontFamily: Font.semibold, fontSize: 17 },
  card: { paddingHorizontal: 16, borderRadius: 20 },
  item: { paddingVertical: 14 },
  itemTitle: { fontFamily: Font.semibold, fontSize: 15 },
  itemDetail: { marginTop: 3, fontFamily: Font.regular, fontSize: 13, lineHeight: 18 },
  note: { marginTop: 16, fontFamily: Font.regular, fontSize: 13, lineHeight: 19 },
  delete: { height: 52, marginTop: 24, borderRadius: 26, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontFamily: Font.semibold, fontSize: 15 },
  done: { marginTop: 24, padding: 16, borderRadius: 18 },
  doneText: { textAlign: 'center', fontFamily: Font.medium, fontSize: 14 },
  home: { height: 50, marginTop: 12, borderRadius: 25, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  homeText: { fontFamily: Font.medium, fontSize: 15 },
  pressed: { opacity: 0.85 },
});
