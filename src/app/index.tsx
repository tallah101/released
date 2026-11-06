import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Text } from '../components/Text';
import { useStore } from '../store';
import { colors } from '../theme';

/** Splash: brand reveal, then route based on persisted state. */
export default function Splash() {
  const hydrated = useStore((s) => s.hydrated);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [fade]);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      const { onboarded, user } = useStore.getState();
      router.replace(!onboarded ? '/onboarding' : !user ? '/auth' : '/home');
    }, 1100);
    return () => clearTimeout(t);
  }, [hydrated]);

  return (
    <LinearGradient colors={['#1A1430', colors.bg, colors.bg]} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ opacity: fade, alignItems: 'center', transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }}>
        <Text style={{ color: colors.text, fontSize: 40, fontFamily: 'Sora_800ExtraBold', letterSpacing: 2 }}>
          RELEASED<Text style={{ color: colors.accent, fontFamily: 'Sora_800ExtraBold' }}>.</Text>
        </Text>
        <Text style={{ color: colors.textSecondary, marginTop: 10, letterSpacing: 1 }}>Never miss a release.</Text>
      </Animated.View>
      <View style={{ position: 'absolute', bottom: 48 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Prototype · sample data</Text>
      </View>
    </LinearGradient>
  );
}
