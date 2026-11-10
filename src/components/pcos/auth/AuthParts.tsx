// Shared pieces for the Login and Sign Up screens (React Native version of the web AuthParts).
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import Lotus from '@/components/pcos/Lotus';
import ThemeToggle from '@/components/pcos/ThemeToggle';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

import { type AuthColors, authColors } from './authColors';

export function useAuthColors(): AuthColors {
  return authColors(useAppTheme().scheme);
}

/* ---------- Icons ---------- */
function EyeIcon({ open, color }: { open: boolean; color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <Circle cx={12} cy={12} r={3} />
      {!open && <Path d="m3 3 18 18" />}
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m5 12 5 5 9-10" />
    </Svg>
  );
}

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7Z" />
      <Path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <Path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <Path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </Svg>
  );
}

function AppleIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={color}>
      <Path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7a4.6 4.6 0 0 0-3.6-1.9c-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9a4.9 4.9 0 0 0-4.1 2.5c-1.8 3-.5 7.5 1.2 10 .9 1.2 1.9 2.6 3.2 2.5 1.3 0 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.2 3.1-2.5.6-.8 1.1-1.7 1.4-2.7a4.3 4.3 0 0 1-2.8-4.2ZM14 5.4c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z" />
    </Svg>
  );
}

/* ---------- Screen shell ---------- */
export function AuthLayout({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { scheme } = useAppTheme();
  const c = authColors(scheme);

  return (
    <LinearGradient colors={[c.bgTop, c.bgMid, c.bgBottom]} locations={[0, 0.4, 1]} style={styles.flex}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.logoRow}>
            <Lotus size={58} color={c.logo} />
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={[styles.toggle, { top: insets.top + 12 }]}>
        <ThemeToggle />
      </View>
    </LinearGradient>
  );
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const c = useAuthColors();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: c.text }]} accessibilityRole="header">
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: c.text2 }]}>{subtitle}</Text>
    </View>
  );
}

/* ---------- Login / Sign Up pills ---------- */
export function AuthTabs({
  active,
  onLogin,
  onSignUp,
}: {
  active: 'login' | 'signup';
  onLogin?: () => void;
  onSignUp?: () => void;
}) {
  const c = useAuthColors();
  const tab = (label: string, selected: boolean, onPress?: () => void) => (
    <Pressable
      onPress={selected ? undefined : onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.tab,
        shadow(c),
        { backgroundColor: selected ? c.periwinkle : c.pill },
        pressed && !selected && { opacity: 0.85 },
      ]}>
      <Text style={[styles.tabText, { color: selected ? '#FFFFFF' : c.pillText }]}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {tab('Login', active === 'login', onLogin)}
      {tab('Sign Up', active === 'signup', onSignUp)}
    </View>
  );
}

/* ---------- Form controls ---------- */
type FieldProps = {
  label: string;
  password?: boolean;
  error?: string;
} & Pick<
  TextInputProps,
  'value' | 'onChangeText' | 'placeholder' | 'keyboardType' | 'autoComplete' | 'textContentType' | 'returnKeyType' | 'onSubmitEditing'
>;

export function Field({ label, password = false, error, ...input }: FieldProps) {
  const c = useAuthColors();
  const [hidden, setHidden] = useState(password);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.label }]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          shadow(c),
          {
            backgroundColor: c.input,
            borderColor: error ? '#B3445A' : focused ? c.periwinkle : c.inputBorder,
          },
        ]}>
        <TextInput
          {...input}
          accessibilityLabel={label}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={c.muted}
          selectionColor={c.periwinkle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, { color: c.text }]}
        />
        {password && (
          <Pressable
            onPress={() => setHidden(!hidden)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <EyeIcon open={hidden} color={c.text2} />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  const c = useAuthColors();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={6}
      style={styles.checkRow}>
      <View
        style={[
          styles.checkBox,
          checked ? { backgroundColor: c.check, borderColor: c.check } : { backgroundColor: c.input, borderColor: c.muted },
        ]}>
        {checked && <CheckIcon />}
      </View>
      <View style={styles.flexShrink}>{children}</View>
    </Pressable>
  );
}

export function PrimaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  const c = useAuthColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.primary, { backgroundColor: c.periwinkle }, pressed && styles.pressed]}>
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

export function SocialButtons() {
  const c = useAuthColors();
  const button = (icon: ReactNode, label: string) => (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.social,
        shadow(c),
        { backgroundColor: c.social, borderColor: c.inputBorder },
        pressed && { opacity: 0.85 },
      ]}>
      {icon}
      <Text style={[styles.socialText, { color: c.socialText }]}>{label}</Text>
    </Pressable>
  );
  return (
    <View>
      <Text style={[styles.or, { color: c.text2 }]}>or</Text>
      <View style={styles.socialList}>
        {button(<GoogleIcon />, 'Continue with Google')}
        {button(<AppleIcon color={c.apple} />, 'Continue with Apple')}
      </View>
    </View>
  );
}

/** Small text styles shared by both screens */
export function useAuthText() {
  const c = useAuthColors();
  return {
    small: [styles.small, { color: c.text2 }],
    link: [styles.link, { color: c.label }],
    linkStrong: [styles.linkStrong, { color: c.label }],
  };
}

const shadow = (c: AuthColors) => ({
  shadowColor: c.shadow,
  shadowOpacity: c.shadowOpacity,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  content: { paddingHorizontal: 28 },
  toggle: { position: 'absolute', right: 20 },
  logoRow: { alignItems: 'center' },

  header: { marginTop: 18, marginBottom: 22 },
  title: { fontFamily: Font.semibold, fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  subtitle: { marginTop: 6, fontFamily: Font.regular, fontSize: 15 },

  tabs: { flexDirection: 'row', gap: 10 },
  tab: { flex: 1, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontFamily: Font.medium, fontSize: 15 },

  field: { marginBottom: 18 },
  label: { marginBottom: 8, fontFamily: Font.semibold, fontSize: 14 },
  inputWrap: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: { flex: 1, height: '100%', padding: 0, fontFamily: Font.regular, fontSize: 15 },
  error: { marginTop: 6, fontFamily: Font.regular, fontSize: 12.5, color: '#B3445A' },

  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkBox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },

  small: { fontFamily: Font.regular, fontSize: 13, lineHeight: 18 },
  link: { fontFamily: Font.medium, fontSize: 13 },
  linkStrong: { fontFamily: Font.semibold },

  primary: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#808DBC',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryText: { fontFamily: Font.medium, fontSize: 16, color: '#FFFFFF' },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },

  or: { marginVertical: 14, textAlign: 'center', fontFamily: Font.regular, fontSize: 14 },
  socialList: { gap: 12 },
  social: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  socialText: { fontFamily: Font.medium, fontSize: 14 },
});
