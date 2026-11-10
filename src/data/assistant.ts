/*
 * Cora AI — offline answer engine (keyword-matched knowledge base).
 * Gives supportive, general, evidence-informed information, uses the user's latest result where useful,
 * never presents itself as a clinician, and points to professional care when appropriate.
 * Replace replyTo() with a call to the real AI/LLM backend later — the chat screen only reads its output.
 */
import type { Href } from 'expo-router';

import type { RiskResult } from './assessment';

export type ReplyAction = { label: string; to: Href; openResult?: boolean };
export type Reply = { text: string; actions?: ReplyAction[] };

export const SUGGESTIONS = [
  { id: 'explain', label: 'Explain my assessment', icon: 'assessment' },
  { id: 'chart', label: 'Help me understand this chart', icon: 'chart' },
  { id: 'lifestyle', label: 'Show me lifestyle recommendations', icon: 'lifestyle' },
  { id: 'gi', label: 'What does GI mean for PCOS?', icon: 'food' },
] as const;

const has = (q: string, words: string[]) => words.some((w) => q.includes(w));

const NOT_A_DOCTOR = 'I can share general information, but I’m not a doctor, so please check anything personal with a healthcare professional.';

function explainAssessment(r: RiskResult | null): Reply {
  if (!r) {
    return {
      text: 'You haven’t taken the assessment yet. It takes about 5 minutes and gives you a model-estimated risk score from 0–100%, plus the factors behind it.',
      actions: [{ label: 'Start assessment', to: '/assessment' }],
    };
  }
  const up = r.contributions.filter((c) => c.value > 0).slice(0, 2).map((c) => c.label.toLowerCase());
  const down = r.contributions.filter((c) => c.value < 0).slice(0, 2).map((c) => c.label.toLowerCase());
  let text = `Your latest model-estimated risk is ${r.score}% (${r.band.toLowerCase()}).`;
  if (up.length) text += ` The factors that raised it most were ${up.join(' and ')}.`;
  if (down.length) text += ` ${down.join(' and ')} helped lower it.`;
  text +=
    ' This is a screening estimate, not a diagnosis. PCOS can only be confirmed by a doctor, usually with blood tests and sometimes an ultrasound.';
  return { text, actions: [{ label: 'Open my results', to: '/results', openResult: true }] };
}

function lifestyle(r: RiskResult | null): Reply {
  const raised = new Set((r?.contributions ?? []).filter((c) => c.value > 0).map((c) => c.feature));
  const tips: string[] = [];
  if (!r || raised.has('activity')) tips.push('Move more: build up to 150 minutes of moderate activity a week, plus strength work on 2 days.');
  if (!r || raised.has('bmi')) tips.push('Choose low-GI carbs (oats, lentils, whole grains) and pair them with protein and fibre.');
  if (raised.has('sleep')) tips.push('Aim for 7–9 hours of sleep with a regular bedtime; poor sleep affects hormones and blood sugar.');
  if (raised.has('cycle')) tips.push('Log your periods so you can spot patterns and share them with your doctor.');
  if (raised.has('androgen')) tips.push('Persistent acne or extra hair growth is worth raising with a doctor; treatments can help.');
  if (tips.length < 2) tips.push('Limit sugary drinks and refined snacks, which spike blood sugar.');
  return {
    text: `${r ? 'Based on your latest assessment, here’s where to focus:' : 'Here are the first-line lifestyle steps for PCOS:'}\n\n• ${tips.join('\n• ')}\n\nSmall, steady changes work better than big ones.`,
    actions: [
      { label: 'Exercise plan', to: '/exercise' },
      { label: 'Food checker', to: '/nutrition' },
      ...(r ? [{ label: 'Try the What-If Simulator', to: '/simulator' as Href }] : []),
    ],
  };
}

export function replyTo(input: string, latest: RiskResult | null, firstName: string): Reply {
  const q = ` ${input.toLowerCase().trim()} `;

  // Safety first.
  if (has(q, ['suicid', 'kill myself', 'self harm', 'self-harm', 'end my life', 'hurt myself'])) {
    return {
      text: 'I’m really sorry you’re feeling this way. You deserve support right now. Please reach out to someone you trust, or call your local emergency number (1122 in Pakistan) if you might act on these thoughts.',
    };
  }
  if (has(q, ['severe pain', 'heavy bleeding', 'faint', 'fainted', 'chest pain', 'can’t breathe', "can't breathe"])) {
    return {
      text: 'That could need urgent attention. Please contact a doctor or go to the nearest emergency department now (1122 in Pakistan).',
    };
  }

  if (has(q, [' hi ', ' hello', ' hey', 'salam', 'assalam'])) {
    return { text: `Hi ${firstName}! I can explain your results, the SHAP chart, food GI and GL, exercise, or your cycle. What would you like to know?` };
  }
  if (has(q, ['chart', 'shap', 'bar', 'factor', 'influenc', 'contribut'])) {
    return {
      text: 'The SHAP chart shows how much each of your answers pushed your estimate up or down. Maroon bars with a + increased it; periwinkle bars with a − lowered it. Longer bars mean a bigger effect. It explains how the model reached your score; it doesn’t say what causes PCOS.',
      actions: [{ label: 'Open SHAP insights', to: '/shap', openResult: true }],
    };
  }
  if (has(q, ['explain', 'assessment', 'result', 'score', 'my risk', 'percent', '%'])) return explainAssessment(latest);
  if (has(q, ['lifestyle', 'recommend', 'improve', 'lower my', 'reduce', 'what should i do', 'tips'])) return lifestyle(latest);
  if (has(q, [' gi ', ' gl ', 'glycemic', 'glycaemic', 'blood sugar', 'insulin'])) {
    return {
      text: 'GI (glycemic index) shows how fast a food raises blood sugar: low is 55 or under, high is 70 or more. GL (glycemic load) also accounts for the portion size, so it shows the real effect of what you eat: low is 10 or under, high is 20 or more.\n\nMany people with PCOS have insulin resistance, and low-GI, low-GL meals can improve insulin sensitivity and cycle regularity.',
      actions: [{ label: 'Open food checker', to: '/nutrition' }],
    };
  }
  if (has(q, ['diet', ' eat', 'food', 'meal', 'breakfast', 'lunch', 'dinner', 'snack'])) {
    return {
      text: 'For PCOS, aim for meals built around vegetables, lean protein, healthy fats and low-GI carbs like oats, lentils and whole grains. Cut back on sugary drinks, sweets and white bread or rice. Eating protein and fibre with carbs slows the rise in blood sugar.',
      actions: [{ label: 'Open food checker', to: '/nutrition' }],
    };
  }
  if (has(q, ['exercise', 'workout', 'walk', 'gym', 'yoga', 'active', 'activity'])) {
    return {
      text: 'The PCOS guideline recommends at least 150 minutes of moderate activity a week (like brisk walking), plus muscle-strengthening on 2 non-consecutive days. If you’re starting out, even 10-minute walks after meals help.',
      actions: [{ label: 'Open exercise plan', to: '/exercise' }],
    };
  }
  if (has(q, ['period', 'cycle', 'irregular', 'late', 'missed', 'menstru'])) {
    return {
      text: 'Cycles are usually 21–35 days apart. Cycles that are often longer than 35 days, fewer than 8 periods a year, or very unpredictable are worth discussing with a doctor; irregular cycles are one of the main signs of PCOS. Logging your periods helps spot patterns.',
      actions: [{ label: 'Open cycle tracker', to: '/track' }],
    };
  }
  if (has(q, ['sleep', 'tired', 'fatigue', 'stress', 'anxious', 'mood'])) {
    return {
      text: 'Sleep and stress both affect hormones and blood sugar. A regular bedtime, 7–9 hours of sleep, less screen time before bed and gentle activity like yoga can help. If low mood or anxiety is affecting your day-to-day life, please talk to a doctor or counsellor.',
      actions: [{ label: 'Exercise plan', to: '/exercise' }],
    };
  }
  if (has(q, ['doctor', 'diagnos', 'test', 'ultrasound', 'treatment', 'medicine', 'medication', 'metformin', 'pill'])) {
    return {
      text: `${NOT_A_DOCTOR} PCOS is usually diagnosed by a gynaecologist or endocrinologist using the Rotterdam criteria: at least two of irregular ovulation, signs of high androgens, and polycystic ovaries on ultrasound. Treatment options are something to decide with them.`,
    };
  }
  if (has(q, ['pcos', 'polycystic', 'what is'])) {
    return {
      text: 'PCOS (polycystic ovary syndrome) is a common hormonal condition that affects around 1 in 10 women of reproductive age. Common signs include irregular periods, acne, extra facial or body hair, and weight changes, and it’s often linked to insulin resistance. Lifestyle changes in diet, activity and sleep are the first-line way to manage it.',
    };
  }
  return {
    text: 'I’m not sure I understood that. I can help with your assessment results, the SHAP chart, lifestyle tips, food GI and GL, exercise, sleep, or your cycle. Try one of the suggestions below.',
  };
}
