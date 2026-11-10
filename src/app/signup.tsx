import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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

/** 2b. Sign Up — same layout and colours as Login. */
export default function SignUpScreen() {
  const t = useAuthText();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== password ? 'Passwords don’t match' : undefined;

  const createAccount = () => {
    // Hook up real account creation here before navigating.
    router.replace('/home');
  };

  return (
    <AuthLayout>
      <AuthHeader title="Create Account" subtitle="Start your personalized PCOS journey" />

      <AuthTabs active="signup" onLogin={() => router.replace('/login')} />

      <View style={styles.form}>
        <Field
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
        />
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
          placeholder="Create a password"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          password
        />
        <Field
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          error={mismatch}
          password
        />

        <CheckRow checked={agreed} onChange={setAgreed}>
          <Text style={t.small}>
            I agree to the <Text style={t.linkStrong}>Terms of Service</Text> and{' '}
            <Text style={t.linkStrong}>Privacy Policy</Text>
          </Text>
        </CheckRow>

        <View style={styles.actions}>
          <PrimaryButton title="Create Account" onPress={createAccount} />
        </View>
      </View>

      <SocialButtons />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 26 },
  actions: { marginTop: 26 },
});
