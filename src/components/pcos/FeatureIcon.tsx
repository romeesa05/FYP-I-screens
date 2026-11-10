import { Circle, Path, Rect } from 'react-native-svg';

import type { FeatureIconName } from '@/data/assessment';

import Icon from './Icon';

/** Small line icons for the assessment factors (Results + SHAP). */
export default function FeatureIcon({ name, size = 18, color }: { name: FeatureIconName; size?: number; color: string }) {
  return (
    <Icon size={size} color={color} strokeWidth={1.8}>
      {name === 'cycle' && (
        <>
          <Path d="M12 4.5a7.5 7.5 0 1 1-7.1 5.1" />
          <Path d="M4.5 4.5v5h5" />
        </>
      )}
      {name === 'scale' && (
        <>
          <Rect x={4} y={4} width={16} height={16} rx={4} />
          <Path d="M9 10a4 4 0 0 1 6 0M12 10l1.5-1.8" />
        </>
      )}
      {name === 'hormone' && (
        <>
          <Circle cx={7} cy={12} r={2.5} />
          <Circle cx={17} cy={7} r={2.5} />
          <Circle cx={17} cy={17} r={2.5} />
          <Path d="M9.3 11 14.8 8M9.3 13l5.5 3" />
        </>
      )}
      {name === 'activity' && <Path d="M3 12h4l2.5-6 5 12 2.5-6h4" />}
      {name === 'sleep' && <Path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10Z" />}
    </Icon>
  );
}
