import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ComponentRef, type ReactNode, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import Icon from '@/components/pcos/Icon';
import Lotus from '@/components/pcos/Lotus';
import ThemeToggle from '@/components/pcos/ThemeToggle';
import { useLatestResult, viewResult } from '@/data/assessment';
import { type Reply, type ReplyAction, SUGGESTIONS, replyTo } from '@/data/assistant';
import { firstName, useProfile } from '@/data/profile';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/*
 * 11. AI Assistant ("Cora AI") — matches screen 11 of the reference: maroon backdrop, branded header,
 * greeting card, suggested questions and a rounded composer.
 * Answers come from src/data/assistant.ts (offline knowledge base) until the AI backend is connected.
 */

type Message = { id: number; from: 'user' | 'cora'; text: string; actions?: ReplyAction[] };

const SUGGESTION_ICONS: Record<string, { bg: string; icon: ReactNode }> = {
  assessment: {
    bg: '#6A3C52',
    icon: (
      <>
        <Rect x={5} y={3.5} width={14} height={17} rx={2.5} />
        <Path d="M8.5 11l2 2 4-4" />
      </>
    ),
  },
  chart: { bg: '#5F8F72', icon: <Path d="M5 19V11M10 19V6M15 19v-5M20 19V9" /> },
  lifestyle: {
    bg: '#C98A4E',
    icon: <Path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  },
  food: {
    bg: '#5B4F8F',
    icon: (
      <>
        <Path d="M4 11h16a8 8 0 0 1-16 0Z" />
        <Path d="M9 7.5c0-1.5 1-2 1-3.5M13 7.5c0-1.5 1-2 1-3.5" />
      </>
    ),
  },
};

export default function AssistantScreen() {
  const { scheme } = useAppTheme();
  const dark = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const latest = useLatestResult();
  const profile = useProfile();
  const name = firstName(profile);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const nextId = useRef(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const t = {
    bg: dark ? (['#1A1419', '#2A1A1E', '#3A1A28'] as const) : (['#5B1C33', '#6E3550', '#7E5470'] as const),
    glass: dark ? 'rgba(42, 31, 42, 0.92)' : 'rgba(255, 255, 255, 0.9)',
    glassText: dark ? '#F3E9F0' : '#2A1E26',
    glassSub: dark ? '#C3B8C5' : '#5E5160',
    user: dark ? '#6F7CB0' : '#7E8CBB',
    actionBorder: dark ? '#8A4F68' : '#B9A3B0',
    actionText: dark ? '#E8CFDB' : '#5A1F37',
  };

  useEffect(() => {
    const id = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(id);
  }, [messages, typing]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setInput('');
    setMessages((m) => [...m, { id: nextId.current++, from: 'user', text: q }]);
    setTyping(true);
    const reply: Reply = replyTo(q, latest, name);
    setTimeout(() => {
      setMessages((m) => [...m, { id: nextId.current++, from: 'cora', ...reply }]);
      setTyping(false);
    }, 650);
  };

  const runAction = (a: ReplyAction) => {
    if (a.openResult && latest) viewResult(latest);
    router.push(a.to);
  };

  const suggestionPills = (compact: boolean) =>
    SUGGESTIONS.map((s) => (
      <Pressable
        key={s.id}
        onPress={() => send(s.label)}
        accessibilityRole="button"
        style={({ pressed }) => [styles.suggestion, compact && styles.suggestionCompact, { backgroundColor: t.glass }, pressed && styles.pressed]}>
        <View style={[styles.suggestionIcon, { backgroundColor: SUGGESTION_ICONS[s.icon].bg }]}>
          <Icon size={13} color="#FFFFFF" strokeWidth={2.2}>
            {SUGGESTION_ICONS[s.icon].icon}
          </Icon>
        </View>
        <Text style={[styles.suggestionText, { color: t.glassText }]} numberOfLines={1}>
          {s.label}
        </Text>
      </Pressable>
    ));

  return (
    <LinearGradient colors={t.bg} locations={[0, 0.55, 1]} style={styles.screen}>
      <StatusBar style="light" />

      {/* soft wave, as in the reference */}
      <Svg style={styles.wave} viewBox="0 0 400 200" preserveAspectRatio="none" pointerEvents="none">
        <Path d="M0 90 C90 40 180 120 270 80 C330 55 370 70 400 60 L400 200 L0 200 Z" fill="#FFFFFF" opacity={0.05} />
        <Path d="M0 130 C100 100 190 160 280 125 C340 105 375 115 400 110 L400 200 L0 200 Z" fill="#FFFFFF" opacity={0.05} />
      </Svg>

      {/* ---------- Header ---------- */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={styles.back}>
          <Icon color="#FFFFFF" strokeWidth={2}>
            <Path d="m15 18-6-6 6-6" />
          </Icon>
        </Pressable>
        <Lotus size={34} color="#EAD7EC" />
        <Text style={styles.title} accessibilityRole="header">
          Cora AI
        </Text>
        <ThemeToggle variant="glass" />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={styles.chat} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Greeting card */}
          <View style={[styles.greeting, { backgroundColor: t.glass }]}>
            <View style={styles.avatar}>
              <Lotus size={30} color="#FFFFFF" />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.greetHi, { color: t.glassText }]}>Hi {name}</Text>
              <Text style={[styles.greetAsk, { color: t.glassText }]}>How can I help you today?</Text>
            </View>
          </View>
          <Text style={styles.disclaimer}>Cora shares general health information. It isn’t a doctor and can’t diagnose PCOS.</Text>

          {messages.length === 0 && <View style={styles.suggestions}>{suggestionPills(false)}</View>}

          {messages.map((m) =>
            m.from === 'user' ? (
              <View key={m.id} style={[styles.bubble, styles.userBubble, { backgroundColor: t.user }]}>
                <Text style={styles.userText}>{m.text}</Text>
              </View>
            ) : (
              <View key={m.id} style={styles.coraWrap}>
                <View style={[styles.bubble, styles.coraBubble, { backgroundColor: t.glass }]}>
                  <Text style={[styles.coraText, { color: t.glassText }]}>{m.text}</Text>
                </View>
                {!!m.actions?.length && (
                  <View style={styles.actions}>
                    {m.actions.map((a) => (
                      <Pressable
                        key={a.label}
                        onPress={() => runAction(a)}
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.action, { backgroundColor: t.glass, borderColor: t.actionBorder }, pressed && styles.pressed]}>
                        <Text style={[styles.actionText, { color: t.actionText }]}>{a.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ),
          )}

          {typing && (
            <View style={[styles.bubble, styles.coraBubble, styles.typing, { backgroundColor: t.glass }]} accessibilityLabel="Cora is typing">
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.typingDot, { backgroundColor: t.glassSub }]} />
              ))}
            </View>
          )}
        </ScrollView>

        {messages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quick} keyboardShouldPersistTaps="handled">
            {suggestionPills(true)}
          </ScrollView>
        )}

        {/* ---------- Composer ---------- */}
        <View style={[styles.composerWrap, { paddingBottom: insets.bottom + 12 }]}>
          <View style={[styles.composer, { backgroundColor: t.glass }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor={t.glassSub}
              accessibilityLabel="Message Cora"
              returnKeyType="send"
              onSubmitEditing={() => send(input)}
              selectionColor={t.user}
              style={[styles.input, { color: t.glassText }]}
            />
            <Pressable
              onPress={() => send(input)}
              disabled={!input.trim() || typing}
              accessibilityRole="button"
              accessibilityLabel="Send"
              hitSlop={6}
              style={[styles.send, { backgroundColor: input.trim() ? '#5A132F' : 'transparent' }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#FFFFFF' : t.glassSub} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M4 12 20 4l-6 16-2.5-6.5Z" />
              </Svg>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  wave: { position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 220 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingBottom: 10 },
  back: { width: 36, height: 40, marginLeft: -6, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: Font.semibold, fontSize: 19, color: '#FFFFFF' },

  chat: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12 },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 26 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: '#8F9AC8' },
  greetHi: { fontFamily: Font.semibold, fontSize: 16 },
  greetAsk: { marginTop: 2, fontFamily: Font.regular, fontSize: 16, lineHeight: 22 },
  disclaimer: { marginTop: -2, marginHorizontal: 6, fontFamily: Font.regular, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.75)' },

  suggestions: { gap: 10, marginTop: 4, alignItems: 'flex-start' },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 46,
    paddingLeft: 10,
    paddingRight: 18,
    borderRadius: 23,
    maxWidth: '100%',
  },
  suggestionCompact: { minHeight: 38, borderRadius: 19, paddingRight: 14 },
  suggestionIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  suggestionText: { flexShrink: 1, fontFamily: Font.medium, fontSize: 14 },

  bubble: { maxWidth: '86%', paddingVertical: 11, paddingHorizontal: 15, borderRadius: 20 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  userText: { fontFamily: Font.regular, fontSize: 15, lineHeight: 21, color: '#FFFFFF' },
  coraWrap: { alignSelf: 'flex-start', maxWidth: '92%', gap: 8 },
  coraBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 6, maxWidth: '100%' },
  coraText: { fontFamily: Font.regular, fontSize: 15, lineHeight: 22 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1, justifyContent: 'center' },
  actionText: { fontFamily: Font.semibold, fontSize: 13 },
  typing: { flexDirection: 'row', gap: 5, paddingVertical: 15 },
  typingDot: { width: 7, height: 7, borderRadius: 3.5 },

  quick: { gap: 8, paddingHorizontal: 20, paddingBottom: 10 },
  composerWrap: { paddingHorizontal: 20, paddingTop: 2 },
  composer: { flexDirection: 'row', alignItems: 'center', height: 56, paddingLeft: 20, paddingRight: 8, borderRadius: 28 },
  input: { flex: 1, height: '100%', padding: 0, fontFamily: Font.regular, fontSize: 15 },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
