/**
 * PCOS app design tokens — same colours as the web version (App UI spec + reference image).
 * Screens read colours through useAppTheme().colors so light/dark mode switches everywhere.
 */

export const Brand = {
  maroon: '#441525',
  burgundy: '#642830',
  headerMaroon: '#5B1C33',
  cta: '#5A132F',
  periwinkle: '#808DBC',
  richPeriwinkle: '#685EE6',
  softLavender: '#BFA1C4',
  midnight: '#141218',
  deepWine: '#2A1A1E',
  white: '#FFFFFF',
} as const;

export const LightColors = {
  background: '#F5F3F8',
  page: '#F7F3F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FBF9FD',
  input: '#F8F6FA',
  border: '#E5DFEA',
  text: '#241923',
  textSecondary: '#706775',
  muted: '#938A98',
  link: Brand.burgundy,
  accent: Brand.periwinkle,
  focus: Brand.richPeriwinkle,
} as const;

export const DarkColors = {
  background: '#141218',
  page: '#141218',
  surface: '#21191F',
  surfaceElevated: '#2A1A1E',
  input: '#30232F',
  border: '#44313F',
  text: '#F8F3F8',
  textSecondary: '#C3B8C5',
  muted: '#9B8E9D',
  link: Brand.softLavender, // no burgundy text on dark surfaces
  accent: '#8F9AD0',
  focus: Brand.softLavender,
} as const;

export type AppColors = { [K in keyof typeof LightColors]: string };

/** Inter weights loaded in src/app/_layout.tsx — use fontFamily, not fontWeight, on Android. */
export const Font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const Radius = { input: 16, card: 22, hero: 26, pill: 999 } as const;
