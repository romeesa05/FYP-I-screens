import { Image } from 'react-native';

/*
 * PCOS CARE logo mark (from pcos-logo.png). The image is a transparent mask, so it can be
 * recoloured with `color` — lavender on the maroon splash, soft grey-blue on Login, etc.
 * (File kept as Lotus.tsx so existing imports keep working.)
 */
const MARK = require('@/assets/images/pcos/mark.png');
const FULL = require('@/assets/images/pcos/logo-full.png');

const MARK_RATIO = 117 / 120; // height / width
const FULL_RATIO = 215 / 220;

export default function Lotus({ size = 84, color = '#EAD7EC' }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Image
      source={MARK}
      style={{ width: size, height: size * MARK_RATIO, tintColor: color }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      accessible={false}
    />
  );
}

/** Full logo with the "PCOS CARE / Risk Prediction & Management" wordmark. */
export function BrandLogo({ width = 180, color = '#5B1C33' }: { width?: number; color?: string }) {
  return (
    <Image
      source={FULL}
      style={{ width, height: width * FULL_RATIO, tintColor: color }}
      resizeMode="contain"
      accessibilityLabel="PCOS Care — Risk Prediction and Management"
    />
  );
}
