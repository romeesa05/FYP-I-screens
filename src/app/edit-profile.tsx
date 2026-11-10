import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlowHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import { type Profile, bmi, bmiCategory, loadProfile, saveProfile } from '@/data/profile';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/*
 * Edit Profile — account details plus the health details used by the assessment
 * (proposal FR: personal profile + input validation).
 */

type Form = { name: string; email: string; age: string; height: string; weight: string };
type Errors = Partial<Record<keyof Form, string>>;

const RANGES = {
  age: [12, 60, 'Enter an age between 12 and 60'],
  height: [120, 220, 'Enter a height between 120 and 220 cm'],
  weight: [30, 250, 'Enter a weight between 30 and 250 kg'],
} as const;

function validate(f: Form): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = 'Enter your name';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email address';
  (['age', 'height', 'weight'] as const).forEach((k) => {
    if (!f[k].trim()) return; // optional
    const v = Number(f[k]);
    const [min, max, msg] = RANGES[k];
    if (!Number.isFinite(v) || v < min || v > max) e[k] = msg;
  });
  return e;
}

export default function EditProfileScreen() {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<Form>({ name: '', email: '', age: '', height: '', weight: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile().then((p) =>
      setForm({
        name: p.name,
        email: p.email,
        age: p.age ? String(p.age) : '',
        height: p.heightCm ? String(p.heightCm) : '',
        weight: p.weightKg ? String(p.weightKg) : '',
      }),
    );
  }, []);

  const set = (k: keyof Form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const draft: Profile = {
    name: form.name.trim(),
    email: form.email.trim(),
    age: form.age ? Number(form.age) : undefined,
    heightCm: form.height ? Number(form.height) : undefined,
    weightKg: form.weight ? Number(form.weight) : undefined,
  };
  const liveErrors = validate(form);
  const b = !liveErrors.height && !liveErrors.weight ? bmi(draft) : null;

  const save = async () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    await saveProfile(draft);
    setSaved(true);
    setTimeout(() => router.back(), 500);
  };

  const field = (k: keyof Form, label: string, props: TextInputProps, suffix?: string) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: c.card, borderColor: errors[k] ? '#B3445A' : c.optionBorder },
        ]}>
        <TextInput
          value={form[k]}
          onChangeText={set(k)}
          accessibilityLabel={label}
          placeholderTextColor={c.muted}
          selectionColor={c.periwinkle}
          style={[styles.input, { color: c.text }]}
          {...props}
        />
        {!!suffix && <Text style={[styles.suffix, { color: c.text2 }]}>{suffix}</Text>}
      </View>
      {!!errors[k] && <Text style={styles.error}>{errors[k]}</Text>}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlowHeader title="Edit Profile" />
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.main, { paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
          <Text style={[styles.section, { color: c.text }]}>Account</Text>
          {field('name', 'Full name', { autoComplete: 'name', textContentType: 'name', placeholder: 'Your full name' })}
          {field('email', 'Email address', {
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            autoComplete: 'email',
            textContentType: 'emailAddress',
            placeholder: 'you@example.com',
          })}

          <Text style={[styles.section, { color: c.text }]}>Health details</Text>
          <Text style={[styles.sectionSub, { color: c.text2 }]}>Used to personalise your assessment and recommendations. All optional.</Text>
          {field('age', 'Age', { keyboardType: 'number-pad', placeholder: 'e.g. 24', maxLength: 2 }, 'years')}
          <View style={styles.pair}>
            <View style={styles.flex1}>{field('height', 'Height', { keyboardType: 'decimal-pad', placeholder: '160', maxLength: 5 }, 'cm')}</View>
            <View style={styles.flex1}>{field('weight', 'Weight', { keyboardType: 'decimal-pad', placeholder: '60', maxLength: 5 }, 'kg')}</View>
          </View>

          <View style={[styles.bmiCard, { backgroundColor: c.estSim }]}>
            <Text style={[styles.bmiLabel, { color: c.text2 }]}>Your BMI</Text>
            <Text style={[styles.bmiValue, { color: c.text }]}>{b ?? '—'}</Text>
            <Text style={[styles.bmiCat, { color: c.text2 }]}>{b ? bmiCategory(b) : 'Add your height and weight to calculate it'}</Text>
          </View>

          <Pressable
            onPress={save}
            accessibilityRole="button"
            style={({ pressed }) => [styles.primary, { backgroundColor: c.periwinkle }, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>{saved ? 'Saved' : 'Save changes'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1 },
  main: { paddingHorizontal: 24, paddingTop: 4 },
  section: { marginTop: 14, marginBottom: 10, fontFamily: Font.semibold, fontSize: 17 },
  sectionSub: { marginTop: -4, marginBottom: 12, fontFamily: Font.regular, fontSize: 13, lineHeight: 19 },
  field: { marginBottom: 16 },
  label: { marginBottom: 8, fontFamily: Font.semibold, fontSize: 14 },
  inputWrap: { height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5 },
  input: { flex: 1, height: '100%', padding: 0, fontFamily: Font.regular, fontSize: 15 },
  suffix: { marginLeft: 8, fontFamily: Font.regular, fontSize: 14 },
  error: { marginTop: 6, fontFamily: Font.regular, fontSize: 12.5, color: '#B3445A' },
  pair: { flexDirection: 'row', gap: 12 },
  bmiCard: { marginTop: 4, padding: 16, borderRadius: 20 },
  bmiLabel: { fontFamily: Font.medium, fontSize: 13 },
  bmiValue: { marginTop: 6, fontFamily: Font.semibold, fontSize: 28, fontVariant: ['tabular-nums'] },
  bmiCat: { marginTop: 2, fontFamily: Font.regular, fontSize: 13 },
  primary: { height: 52, marginTop: 24, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontFamily: Font.medium, fontSize: 16, color: '#FFFFFF' },
  pressed: { transform: [{ scale: 0.98 }] },
});
