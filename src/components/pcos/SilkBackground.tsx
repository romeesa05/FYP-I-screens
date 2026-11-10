import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/** Maroon-to-mauve silk backdrop from the splash reference. Folds drift slowly side to side. */
export default function SilkBackground() {
  const [drift] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-10, 10] });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* static base + shadow fold */}
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="base" x1="0" y1="0" x2="0.35" y2="1">
            <Stop offset="0" stopColor="#46122F" />
            <Stop offset="0.45" stopColor="#62223D" />
            <Stop offset="0.75" stopColor="#6E3550" />
            <Stop offset="1" stopColor="#7E5470" />
          </LinearGradient>
          <LinearGradient id="shadowA" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#3E0F28" stopOpacity="0.85" />
            <Stop offset="1" stopColor="#3E0F28" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="400" height="860" fill="url(#base)" />
        <Path d="M-20 0 L110 0 C70 120 120 220 40 330 C10 370 -10 380 -20 390 Z" fill="url(#shadowA)" />
      </Svg>

      {/* drifting folds and sheen */}
      <Animated.View style={[styles.driftLayer, { transform: [{ translateX }] }]}>
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 860" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="fold" x1="0" y1="0" x2="1" y2="0.4">
              <Stop offset="0" stopColor="#A3677D" stopOpacity="0" />
              <Stop offset="0.55" stopColor="#A3677D" stopOpacity="0.75" />
              <Stop offset="1" stopColor="#8A4F63" stopOpacity="0.2" />
            </LinearGradient>
            <LinearGradient id="shadowB" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#3E0F28" stopOpacity="0.85" />
              <Stop offset="1" stopColor="#3E0F28" stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="low" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#9F8297" stopOpacity="0.85" />
              <Stop offset="0.6" stopColor="#B38096" stopOpacity="0.45" />
              <Stop offset="1" stopColor="#651F38" stopOpacity="0.6" />
            </LinearGradient>
            <LinearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#F1DCE8" stopOpacity="0" />
              <Stop offset="0.5" stopColor="#F1DCE8" stopOpacity="0.35" />
              <Stop offset="1" stopColor="#F1DCE8" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Path d="M120 0 C220 60 200 180 300 230 C360 260 400 240 420 220 L420 0 Z" fill="url(#fold)" />
          <Path
            d="M-20 300 C90 230 190 250 260 180 C320 120 380 140 420 110 L420 260 C340 300 300 380 200 380 C110 380 50 420 -20 470 Z"
            fill="url(#fold)"
            opacity={0.75}
          />
          <Path d="M-20 560 C60 480 160 520 230 470 C300 420 360 450 420 400 L420 860 L-20 860 Z" fill="url(#low)" opacity={0.55} />
          <Path d="M-20 700 C80 640 200 700 290 620 C340 580 380 600 420 570 L420 860 L-20 860 Z" fill="url(#shadowB)" opacity={0.45} />
          <G fill="none" strokeLinecap="round">
            <Path d="M-20 310 C90 240 190 260 260 190 C320 130 380 150 420 120" stroke="url(#sheen)" strokeWidth={2} />
            <Path d="M-20 575 C60 495 160 535 230 485 C300 435 360 465 420 415" stroke="url(#sheen)" strokeWidth={1.6} />
            <Path d="M140 0 C230 70 210 180 310 235" stroke="url(#sheen)" strokeWidth={1.4} />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // a little wider than the screen so the drift never shows an edge
  driftLayer: { position: 'absolute', top: 0, bottom: 0, left: -14, right: -14 },
});
