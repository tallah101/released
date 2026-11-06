import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, FadeIn, type IconName } from '../components/ui';
import { useStore } from '../store';
import { colors, space, type } from '../theme';

const slides: { icon: IconName; title: string; body: string }[] = [
  { icon: 'bookmark', title: 'Save what you want to watch', body: 'Movies, series, anime and documentaries in one cinematic watchlist.' },
  { icon: 'calendar', title: 'Every release, one calendar', body: 'Cinema, digital, streaming and new episodes — with clear confirmed vs. estimated dates.' },
  { icon: 'notifications', title: 'Alerts only when you say so', body: 'Saving a title never sends anything. You switch on exactly the alerts you want, per title.' },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const insets = useSafeAreaInsets();
  const finish = useStore((s) => s.finishOnboarding);
  const last = i === slides.length - 1;
  const s = slides[i];

  const done = () => {
    finish();
    router.replace('/auth');
  };

  return (
    <LinearGradient colors={['#1A1430', colors.bg]} style={{ flex: 1, paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.xl, paddingHorizontal: space.xl }}>
      <Pressable onPress={done} style={{ alignSelf: 'flex-end' }} hitSlop={10}>
        <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Skip</Text>
      </Pressable>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <FadeIn key={i}>
          <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center', marginBottom: space.xxl }}>
            <Ionicons name={s.icon} size={40} color={colors.accent} />
          </View>
          <Text style={type.display}>{s.title}</Text>
          <Text style={[type.body, { color: colors.textSecondary, marginTop: space.md, fontSize: 17, lineHeight: 25 }]}>{s.body}</Text>
        </FadeIn>
      </View>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: space.xl }}>
        {slides.map((_, k) => (
          <View key={k} style={{ height: 4, flex: k === i ? 3 : 1, borderRadius: 2, backgroundColor: k === i ? colors.accent : colors.elevated }} />
        ))}
      </View>
      <Button label={last ? 'Get started' : 'Next'} onPress={() => (last ? done() : setI(i + 1))} />
    </LinearGradient>
  );
}
