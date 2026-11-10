import { Tabs } from 'expo-router/tabs';

import { useAppColors } from '@/components/pcos/AppParts';
import BottomNav from '@/components/pcos/BottomNav';

/** Bottom tab bar: Home, Exercise, Nutrition, Track, Profile. */
export default function TabLayout() {
  const c = useAppColors();
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.homePage } }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="exercise" />
      <Tabs.Screen name="nutrition" />
      <Tabs.Screen name="track" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
