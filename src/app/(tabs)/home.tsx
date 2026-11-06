import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { HeroCarousel } from '../../components/HeroCarousel';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../components/Text';
import {
  Button,
  EmptyState,
  FadeIn,
  IconButton,
  Poster,
  PosterRail,
  ProgressBar,
  ReleaseRow,
  Screen,
  SectionHeader,
} from '../../components/ui';
import { catalog, eventsInCountry, getTitle } from '../../data/catalog';
import { localISO } from '../../lib/format';
import { nextUnwatched, seriesProgress } from '../../lib/progress';
import { useStore } from '../../store';
import { colors, radius, space, type } from '../../theme';

export default function Home() {
  const user = useStore((s) => s.user);
  const watchlist = useStore((s) => s.watchlist);
  const watched = useStore((s) => s.watched);
  const unread = useStore((s) => s.inbox.filter((n) => !n.read).length);
  const savedIds = Object.keys(watchlist);
  const country = useStore((s) => s.country);

  const upcoming = useMemo(() => {
    const today = localISO();
    return eventsInCountry(country)
      .filter((e) => savedIds.includes(e.titleId) && e.date >= today && e.status !== 'cancelled')
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 4);
  }, [savedIds.join(','), country]);

  const continueWatching = savedIds
    .map(getTitle)
    .filter((t): t is NonNullable<typeof t> => !!t && !!t.seasons && watchlist[t.id].status === 'watching')
    .map((t) => ({ t, next: nextUnwatched(t, watched), progress: seriesProgress(t, watched) }))
    .filter((x) => x.next && x.progress.watched > 0);

  const trending = [...catalog].sort((a, b) => b.trending - a.trending);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={type.caption}>Good to see you{user ? `, ${user.name}` : ''}</Text>
          <Text style={{ color: colors.text, fontSize: 24, fontFamily: 'Sora_800ExtraBold', letterSpacing: 1 }}>
            RELEASED<Text style={{ color: colors.accent, fontFamily: 'Sora_800ExtraBold' }}>.</Text>
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <IconButton icon="search" label="Search" onPress={() => router.push('/search')} />
          <View>
            <IconButton icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
            {unread > 0 ? (
              <View style={{ position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#140F24' }}>{unread}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <FadeIn>
        <HeroCarousel titles={trending.slice(0, 4)} />
      </FadeIn>

      <SectionHeader title="Coming up for you" action="Calendar" onAction={() => router.push('/calendar')} />
      {upcoming.length ? (
        upcoming.map((e) => <ReleaseRow key={e.id} event={e} />)
      ) : (
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg }}>
          <EmptyState icon="calendar-outline" title="Nothing scheduled yet" body="Save titles to see their upcoming releases here." action="Load demo data" onAction={() => useStore.getState().loadDemoData()} />
        </View>
      )}

      {continueWatching.length ? (
        <>
          <SectionHeader title="Continue watching" />
          {continueWatching.map(({ t, next, progress }) => (
            <Pressable key={t.id} onPress={() => router.push(`/episodes/${t.id}`)} style={{ flexDirection: 'row', gap: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, marginBottom: space.sm, alignItems: 'center' }}>
              <Poster title={t} width={56} height={80} showName={false} />
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={type.heading}>{t.name}</Text>
                <Text style={type.caption}>Next: S{next!.season}E{next!.number}</Text>
                <ProgressBar value={progress.ratio} />
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </>
      ) : null}

      <SectionHeader title="Trending now" action="See all" onAction={() => router.push('/discover')} />
      <PosterRail titles={trending} />

      <SectionHeader title="Anime" />
      <PosterRail titles={catalog.filter((t) => t.type === 'anime')} />

      {savedIds.length === 0 ? (
        <View style={{ marginTop: space.xl }}>
          <Button label="Search titles" icon="search" variant="secondary" onPress={() => router.push('/search')} />
        </View>
      ) : null}
    </Screen>
  );
}
