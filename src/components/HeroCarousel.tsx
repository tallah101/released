import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { eventsFor } from '../data/catalog';
import { countdownLabel, kindLabel, localISO, typeLabel } from '../lib/format';
import { useStore } from '../store';
import { colors, font, radius, space, type } from '../theme';
import type { Title } from '../types';
import { Text } from './Text';
import { Poster, PressableScale } from './ui';

export function HeroCarousel({ titles }: { titles: Title[] }) {
  const { width } = useWindowDimensions();
  const cardW = Math.min(width, 700) - space.lg * 2;
  const cardH = 280;
  const [page, setPage] = useState(0);
  const watchlist = useStore((s) => s.watchlist);
  const addTitle = useStore((s) => s.addTitle);
  const country = useStore((s) => s.country);
  const today = localISO();

  return (
    <View style={{ marginTop: space.xl }}>
      <ScrollView
        horizontal
        pagingEnabled
        snapToInterval={cardW + space.md}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: space.md, paddingRight: space.lg }}
        onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / (cardW + space.md)))}
        scrollEventThrottle={32}
      >
        {titles.map((t, i) => {
          const next = eventsFor(t.id, country).find((e) => e.date >= today && e.status !== 'cancelled');
          const saved = !!watchlist[t.id];
          return (
            <PressableScale key={t.id} onPress={() => router.push(`/title/${t.id}`)} scaleTo={0.985} asButton={false} style={{ width: cardW, height: cardH, borderRadius: radius.xl, overflow: 'hidden' }} accessibilityLabel={t.name}>
              <View style={{ position: 'absolute', top: 0, left: 0 }}>
                <Poster title={t} width={cardW} height={cardH} showName={false} />
              </View>
              <LinearGradient colors={['rgba(9,10,15,0)', 'rgba(9,10,15,0.55)', 'rgba(9,10,15,0.92)']} locations={[0.25, 0.6, 1]} style={{ flex: 1, padding: space.xl, justifyContent: 'flex-end' }}>
                <Text style={[type.overline, { color: 'rgba(245,245,247,0.8)' }]}>#{i + 1} Trending · {typeLabel[t.type]}</Text>
                <Text style={[type.display, { marginTop: 6 }]} numberOfLines={2}>{t.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                    {next ? (
                      <>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }} />
                        <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
                          {kindLabel[next.kind]} · {countdownLabel(next.date)}
                        </Text>
                      </>
                    ) : (
                      <Text style={{ color: 'rgba(245,245,247,0.7)', fontSize: 13 }} numberOfLines={1}>{t.genres.slice(0, 2).join(' · ')}</Text>
                    )}
                  </View>
                  <PressableScale
                    onPress={() => (saved ? router.push(`/title/${t.id}`) : addTitle(t.id))}
                    accessibilityLabel={saved ? 'Saved' : 'Save to watchlist'}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: saved ? 'rgba(255,255,255,0.14)' : colors.accent }}
                  >
                    <Ionicons name={saved ? 'checkmark' : 'add'} size={16} color={saved ? colors.text : '#140F24'} />
                    <Text style={{ fontFamily: font.bold, fontSize: 13, color: saved ? colors.text : '#140F24' }}>{saved ? 'Saved' : 'Save'}</Text>
                  </PressableScale>
                </View>
              </LinearGradient>
            </PressableScale>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: space.md }}>
        {titles.map((t, i) => (
          <View key={t.id} style={{ width: i === page ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === page ? colors.accent : colors.elevated }} />
        ))}
      </View>
    </View>
  );
}
