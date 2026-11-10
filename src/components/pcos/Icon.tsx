import type { ReactNode } from 'react';
import Svg from 'react-native-svg';

/** Line icon wrapper (Lucide-style, 24px grid). Children are react-native-svg shapes. */
export default function Icon({
  children,
  size = 22,
  color,
  strokeWidth = 1.7,
}: {
  children: ReactNode;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}
