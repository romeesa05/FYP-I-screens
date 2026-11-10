import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AuthHeader,
  AuthLayout,
  AuthTabs,
  CheckRow,
  Field,
  PrimaryButton,
  SocialButtons,
  useAuthText,
} from '@/components/pcos/auth/AuthParts';

/** 2a. Login — matches the Login reference picture. */
export default function LoginScreen() {
  const t = useAuthText();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const signIn = () => {
    // Hook up real authentication here before navigating.
    router.replace('/home');
  };

  return (
    <AuthLayout>
      <AuthHeader title="Welcome Back" subtitle="Sign in to continue your journey" />

      <AuthTabs active="login" onSignUp={() => router.replace('/signup')} />

      <View style={styles.form}>
        <Field
          label="Email address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={signIn}
          password
        />

        <View style={styles.row}>
          <CheckRow checked={remember} onChange={setRemember}>
            <Text style={t.small}>Remember me</Text>
          </CheckRow>
          <Pressable accessibilityRole="button" hitSlop={8}>
            <Text style={t.link}>Forgot password?</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Sign In" onPress={signIn} />
        </View>
      </View>

      <SocialButtons />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 26 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 2 },
  actions: { marginTop: 26 },
});
