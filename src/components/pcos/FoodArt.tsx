import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

/* Flat food illustrations for the Food Checker (no photos needed). Same artwork as the web version. */
const ART: Record<string, ReactNode> = {
  avocado: (
    <>
      <Ellipse cx="34" cy="38" rx="17" ry="21" fill="#5f8a4b" transform="rotate(-18 34 38)" />
      <Ellipse cx="34" cy="38" rx="13.5" ry="17.5" fill="#d9e6a0" transform="rotate(-18 34 38)" />
      <Circle cx="35" cy="42" r="7.5" fill="#8a5a3c" />
      <Circle cx="33" cy="40" r="2.2" fill="#b07a55" />
      <Ellipse cx="52" cy="28" rx="11" ry="14" fill="#4c7139" transform="rotate(20 52 28)" />
    </>
  ),
  'fruit-yogurt': (
    <>
      <Path d="M18 26h36l-4 30a4 4 0 0 1-4 3.5H26a4 4 0 0 1-4-3.5Z" fill="#f4e6ef" />
      <Path d="M19.5 34h33l-1 8h-31Z" fill="#e7a3bd" />
      <Rect x="15" y="21" width="42" height="7" rx="3.5" fill="#d26f95" />
      <Circle cx="30" cy="48" r="3" fill="#e7a3bd" />
      <Circle cx="41" cy="51" r="2.5" fill="#e7a3bd" />
    </>
  ),
  'greek-yogurt': (
    <>
      <Path d="M14 34h44a22 18 0 0 1-44 0Z" fill="#e9e6f2" />
      <Ellipse cx="36" cy="34" rx="22" ry="6" fill="#fbfaf7" />
      <Circle cx="30" cy="32" r="3.2" fill="#7a5ea8" />
      <Circle cx="38" cy="31" r="3" fill="#b2394f" />
      <Circle cx="44" cy="34" r="2.8" fill="#7a5ea8" />
      <Path d="M20 22c4-6 10-2 14-7" stroke="#c8a96a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  'white-bread': (
    <>
      <Path d="M17 32c0-9 8-14 19-14s19 5 19 14c0 3-2 4-4 4v20a3 3 0 0 1-3 3H24a3 3 0 0 1-3-3V36c-2 0-4-1-4-4Z" fill="#d9a35f" />
      <Path d="M21 33c0-6 7-10 15-10s15 4 15 10c0 2-2 3-3 3v18H24V36c-1 0-3-1-3-3Z" fill="#f7ead3" />
    </>
  ),
  oats: (
    <>
      <Path d="M14 34h44a22 18 0 0 1-44 0Z" fill="#c9b48f" />
      <Ellipse cx="36" cy="34" rx="22" ry="6" fill="#eadcbf" />
      {[[26, 32], [32, 35], [40, 32], [46, 35], [36, 30], [30, 29]].map(([x, y], i) => (
        <Ellipse key={i} cx={x} cy={y} rx="2.6" ry="1.5" fill="#d1bd92" />
      ))}
      <Circle cx="44" cy="30" r="2.6" fill="#7a5ea8" />
    </>
  ),
  lentils: (
    <>
      <Path d="M14 34h44a22 18 0 0 1-44 0Z" fill="#e2d3c6" />
      <Ellipse cx="36" cy="34" rx="22" ry="6" fill="#c9773f" />
      {[[26, 33], [32, 35], [40, 33], [46, 35], [36, 31], [30, 31], [42, 30]].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r="1.8" fill="#e09a5f" />
      ))}
    </>
  ),
  salmon: (
    <>
      <Ellipse cx="36" cy="44" rx="24" ry="9" fill="#e7e3ec" />
      <Path d="M18 38c6-10 30-12 38-2-4 9-30 11-38 2Z" fill="#ec8c6f" />
      <Path d="M26 33c3 3 3 7 0 10M34 31c3 3 3 9 0 12M42 32c3 3 3 7 0 10" stroke="#f8c6b2" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Path d="M50 36h4" stroke="#8fb06a" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  berries: (
    <>
      <Circle cx="28" cy="40" r="9" fill="#b2394f" />
      <Circle cx="44" cy="38" r="8" fill="#5b4a9b" />
      <Circle cx="36" cy="28" r="7" fill="#7a5ea8" />
      <Circle cx="42" cy="50" r="6" fill="#b2394f" />
      <Path d="M26 31l2 3 2-3" stroke="#6c9a5a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  ),
};

export default function FoodArt({ id, size = 72 }: { id: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      {ART[id]}
    </Svg>
  );
}
