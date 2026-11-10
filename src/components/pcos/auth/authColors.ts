import type { ColorScheme } from '@/theme/theme-context';

/** Login / Sign Up colours sampled from the Login reference picture (same values as the web version). */
const light = {
  bgTop: '#F8F4F5',
  bgMid: '#F1EEF5',
  bgBottom: '#E6E4F2',
  text: '#1B1216',
  text2: '#6F6670',
  label: '#241923',
  muted: '#A49CA6',
  logo: '#868BA1',
  periwinkle: '#808DBC',
  pill: '#E7E4E3',
  pillText: '#2B2328',
  input: '#FFFFFF',
  inputBorder: 'rgba(68, 21, 37, 0.06)',
  check: '#653F50',
  social: '#FFFFFF',
  socialText: '#241923',
  apple: '#000000',
  shadow: '#503C5A',
  shadowOpacity: 0.08,
};

const dark: typeof light = {
  bgTop: '#1A1419',
  bgMid: '#171319',
  bgBottom: '#141218',
  text: '#F8F3F8',
  text2: '#C3B8C5',
  label: '#E2D9E5',
  muted: '#9B8E9D',
  logo: '#A9AED0',
  periwinkle: '#808DBC',
  pill: '#30232F',
  pillText: '#E2D9E5',
  input: '#30232F',
  inputBorder: '#44313F',
  check: '#8A5A70',
  social: '#21191F',
  socialText: '#F8F3F8',
  apple: '#F8F3F8',
  shadow: '#000000',
  shadowOpacity: 0.25,
};

export type AuthColors = typeof light;
export const authColors = (scheme: ColorScheme): AuthColors => (scheme === 'dark' ? dark : light);
