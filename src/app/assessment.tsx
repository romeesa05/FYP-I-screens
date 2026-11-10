import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ComponentRef, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Path } from 'react-native-svg';

import { FlowHeader, cardShadow, useAppColors } from '@/components/pcos/AppParts';
import Icon from '@/components/pcos/Icon';
import { type Answers, STEPS, predictRisk, setLatestResult } from '@/data/assessment';
import { useAppTheme } from '@/theme/theme-context';
import { Font } from '@/theme/tokens';

/** 4. Assessment questionnaire — matches screen 4 of the reference. Questions live in src/data/assessment.ts. */
export default function AssessmentScreen() {
  const c = useAppColors();
  const { scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const step = STEPS[index];
  const total = STEPS.length;
  const selected = answers[step.id];
  const isLast = index === total - 1;

  const back = () => (index > 0 ? setIndex(index - 1) : router.back());

  const next = () => {
    if (!selected) return;
    if (!isLast) {
      setIndex(index + 1);
      scroll.current?.scrollTo({ y: 0, animated: false });
      return;
    }
    setLatestResult(predictRisk(answers));
    router.replace('/results');
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.page }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <FlowHeader onBack={back}>
        <View style={styles.progress}>
          <Text style={[styles.step, { color: c.text }]}>
            Step {index + 1} of {total}
          </Text>
          <View
            style={[styles.bar, { backgroundColor: c.track }]}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 1, max: total, now: index + 1 }}>
            <View style={[styles.barFill, { width: `${((index + 1) / total) * 100}%`, backgroundColor: c.flMaroon }]} />
          </View>
        </View>
      </FlowHeader>

      <ScrollView ref={scroll} contentContainerStyle={[styles.main, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={[styles.section, { color: c.text }]} accessibilityRole="header">
          {step.section}
        </Text>
        <Text style={[styles.intro, { color: c.text2 }]}>{step.intro}</Text>

        <Text style={[styles.question, { color: c.text }]}>{step.question}</Text>
        <View style={styles.options} accessibilityRole="radiogroup">
          {step.options.map((opt) => {
            const on = selected === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setAnswers((a) => ({ ...a, [step.id]: opt.id }))}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={[
                  styles.option,
                  cardShadow(c),
                  on
                    ? { backgroundColor: c.selected, borderColor: c.selectedBorder }
                    : { backgroundColor: c.option, borderColor: c.optionBorder },
                ]}>
                <View style={[styles.radio, { borderColor: on ? c.radioOn : c.radio }]}>
                  {on && <View style={[styles.radioDot, { backgroundColor: c.radioOn }]} />}
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionLabel, { color: c.text }]}>{opt.label}</Text>
                  {!!opt.detail && <Text style={[styles.optionDetail, { color: c.text2 }]}>{opt.detail}</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.why}>
          <View style={[styles.whyIcon, { backgroundColor: c.whyIcon }]}>
            <Icon size={14} color="#FFFFFF" strokeWidth={2.4}>
              <Path d="M12 7v6M12 17h.01" />
            </Icon>
          </View>
          <View style={styles.flexShrink}>
            <Text style={[styles.whyTitle, { color: c.text }]}>Why we ask this?</Text>
            <Text style={[styles.whyText, { color: c.text2 }]}>{step.why}</Text>
          </View>
        </View>

        <Pressable
          onPress={next}
          disabled={!selected}
          accessibilityRole="button"
          accessibilityState={{ disabled: !selected }}
          style={({ pressed }) => [
            styles.primary,
            { backgroundColor: c.periwinkle },
            !selected && styles.disabled,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.primaryText}>{isLast ? 'See my results' : 'Continue'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  progress: { alignItems: 'center', gap: 8 },
  step: { fontFamily: Font.medium, fontSize: 13 },
  bar: { alignSelf: 'stretch', height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  main: { paddingHorizontal: 24, paddingTop: 8 },
  section: { marginTop: 18, fontFamily: Font.semibold, fontSize: 22, letterSpacing: -0.2 },
  intro: { marginTop: 6, fontFamily: Font.regular, fontSize: 15 },
  question: { marginTop: 22, marginBottom: 14, fontFamily: Font.semibold, fontSize: 16, lineHeight: 22 },

  options: { gap: 12 },
  option: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  optionText: { flex: 1, gap: 3 },
  optionLabel: { fontFamily: Font.semibold, fontSize: 15 },
  optionDetail: { fontFamily: Font.regular, fontSize: 13 },

  why: { flexDirection: 'row', gap: 12, marginTop: 24, paddingHorizontal: 4 },
  whyIcon: { width: 22, height: 22, marginTop: 1, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  whyTitle: { fontFamily: Font.semibold, fontSize: 15 },
  whyText: { marginTop: 4, fontFamily: Font.regular, fontSize: 13.5, lineHeight: 20 },

  primary: {
    height: 52,
    marginTop: 24,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7E8CBB',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryText: { fontFamily: Font.medium, fontSize: 16, color: '#FFFFFF' },
  disabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  pressed: { transform: [{ scale: 0.98 }] },
});
