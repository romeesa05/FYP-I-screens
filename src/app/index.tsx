import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import Lotus from '@/components/pcos/Lotus';
import SilkBackground from '@/components/pcos/SilkBackground';
import { Font } from '@/theme/tokens';

/*
 * 1. Splash / landing — matches the splash reference picture.
 * Same in light and dark mode (by request), so it has no theme toggle.
 */
const SLIDES = [
  {
    title: 'Your PCOS\nJourney, Supported\nby AI',
    body: 'Personalized insights, smarter predictions, healthier you',
  },
  {
    title: 'Know Your Risk and Why',
    body: 'A short questionnaire, a model-generated estimate, and the factors behind it',
  },
  {
    title: 'See How Small Changes Add Up',
    body: 'Track your cycle and symptoms, and explore what-if lifestyle changes',
  },
  {
    title: 'Guidance Tailored to You',
    body: 'Personalized nutrition and lifestyle steps to support your wellbeing',
  },
];

function ArrowRight() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#3A2433" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export default function SplashLanding() {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [fade] = useState(() => new Animated.Value(0));
  const touchStartX = useRef<number | null>(null);

  // Fade + rise the headline block whenever the slide changes.
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [index, fade]);

  const goTo = (i: number) => setIndex(Math.min(SLIDES.length - 1, Math.max(0, i)));

  const onTouchStart = (e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
  };
  const onTouchEnd = (e: GestureResponderEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.nativeEvent.pageX - touchStartX.current;
    if (dx < -50) goTo(index + 1);
    if (dx > 50) goTo(index - 1);
    touchStartX.current = null;
  };

  const slide = SLIDES[index];
  const rise = fade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <View style={styles.screen} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <StatusBar style="light" />
      <SilkBackground />

      <Animated.View style={[styles.center, { paddingTop: insets.top + 80, opacity: fade, transform: [{ translateY: rise }] }]}>
        <Lotus size={104} />
        <Text style={styles.title} accessibilityRole="header">
          {slide.title}
        </Text>
        <Text style={styles.body}>{slide.body}</Text>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 36 }]}>
        <Pressable
          onPress={() => router.push('/signup')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Get Started</Text>
          <ArrowRight />
        </Pressable>

        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <Pressable
              key={s.title}
              onPress={() => goTo(i)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Step ${i + 1} of ${SLIDES.length}`}
              accessibilityState={{ selected: i === index }}>
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#62223D',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 40,
  },
  title: {
    marginTop: 22,
    maxWidth: 320,
    fontFamily: Font.medium,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.3,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  body: {
    marginTop: 14,
    maxWidth: 290,
    fontFamily: Font.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#ECDDE8',
  },
  footer: {
    alignItems: 'center',
    gap: 22,
    paddingHorizontal: 44,
  },
  button: {
    alignSelf: 'stretch',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DCDAEF',
    shadowColor: '#1E0614',
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  buttonText: {
    fontFamily: Font.medium,
    fontSize: 16,
    color: '#3A2433',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#A16D84',
  },
  dotActive: {
    backgroundColor: '#EAD7E2',
  },
});
