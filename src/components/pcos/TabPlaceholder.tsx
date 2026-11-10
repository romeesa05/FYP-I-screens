import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Font } from '@/theme/tokens';

import { AppHeader, cardShadow, useAppColors } from './AppParts';

/** Temporary page for tabs that haven't been converted yet — keeps the bottom bar working. */
export default function TabPlaceholder({ title, description }: { title: string; description: string }) {
  const c = useAppColors();
  return (
    <ScrollView style={{ backgroundColor: c.homePage }} contentContainerStyle={styles.content}>
      <StatusBar style="light" />
      <AppHeader title={title} subtitle={description} compact />
      <View style={styles.main}>
        <View style={[styles.card, { backgroundColor: c.card }, cardShadow(c, 'lg')]}>
          <Text style={[styles.title, { color: c.text }]}>This screen is on its way</Text>
          <Text style={[styles.text, { color: c.text2 }]}>Use Home to start your assessment in the meantime.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  main: { marginTop: -40, paddingHorizontal: 20 },
  card: { padding: 28, borderRadius: 26, alignItems: 'center' },
  title: { fontFamily: Font.semibold, fontSize: 18 },
  text: { marginTop: 6, fontFamily: Font.regular, fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
