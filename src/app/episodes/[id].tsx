import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { Button, Card, Chip, EmptyState, EpisodeRow, ProgressBar, Screen, TopBar } from '../../components/ui';
import { getTitle } from '../../data/catalog';
import { nextUnwatched, seasonProgress, seriesProgress } from '../../lib/progress';
import { useStore } from '../../store';
import { colors, space, type } from '../../theme';

export default function EpisodeTracker() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = getTitle(id);
  const watched = useStore((s) => s.watched);
  const saved = useStore((s) => !!s.watchlist[id]);
  const spoilers = useStore((s) => s.spoilerProtection);
  const { toggleWatched, markSeason, addTitle, setStatus } = useStore.getState();
  const latestAired = t?.seasons?.filter((s) => s.episodes.some((e) => e.airDate && new Date(e.airDate) <= new Date())).pop()?.number;
  const [season, setSeason] = useState(latestAired ?? 1);

  if (!t?.seasons)
    return (
      <Screen header={<TopBar title="Episodes" />}>
        <EmptyState icon="tv-outline" title="No episodes" body="Episode tracking is available for series and anime." />
      </Screen>
    );

  const s = t.seasons.find((x) => x.number === season) ?? t.seasons[0];
  const sp = seasonProgress(s.episodes, watched);
  const total = seriesProgress(t, watched);
  const next = nextUnwatched(t, watched);
  const noDates = s.episodes.every((e) => !e.airDate);

  const toggle = (epId: string) => {
    if (!saved) addTitle(t.id);
    toggleWatched(epId);
    const st = useStore.getState();
    const p = seriesProgress(t, st.watched);
    if (p.watched > 0 && st.watchlist[t.id]?.status === 'planned') setStatus(t.id, 'watching');
  };

  return (
    <Screen header={<TopBar title={t.name} />}>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.sm }}>
          <Text style={type.heading}>Overall progress</Text>
          <Text style={type.caption}>{total.watched}/{total.total}</Text>
        </View>
        <ProgressBar value={total.ratio} />
        <Text style={[type.caption, { marginTop: space.sm }]}>
          {next ? `Next unwatched: S${next.season}E${next.number}${spoilers ? '' : ` · ${next.name}`}` : 'You are all caught up.'}
        </Text>
        {saved ? (
          <Text style={[type.caption, { fontSize: 11, marginTop: 4 }]}>Future seasons are followed automatically while this title is in your watchlist.</Text>
        ) : null}
      </Card>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.lg }} contentContainerStyle={{ gap: space.sm }}>
        {t.seasons.map((x) => (
          <Chip key={x.number} label={x.name} active={x.number === s.number} onPress={() => setSeason(x.number)} />
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.lg }}>
        <Text style={type.caption}>
          {sp.watched}/{sp.total} aired episodes watched{sp.complete ? ' · Season complete' : ''}
        </Text>
        {sp.total ? (
          <Button
            label={sp.complete ? 'Unmark season' : 'Mark season'}
            variant="secondary"
            style={{ height: 36, paddingHorizontal: space.md }}
            onPress={() => {
              if (!saved) addTitle(t.id);
              markSeason(
                s.episodes.filter((e) => e.airDate && new Date(e.airDate) <= new Date()).map((e) => e.id),
                !sp.complete,
              );
            }}
          />
        ) : null}
      </View>

      {noDates ? (
        <Text style={{ color: colors.warning, marginTop: space.md, fontSize: 13 }}>
          Episode air dates for this season haven't been published. We'll show them once a source confirms them.
        </Text>
      ) : null}

      <View style={{ marginTop: space.sm }}>
        {s.episodes.map((e) => (
          <EpisodeRow key={e.id} episode={e} watched={!!watched[e.id]} onToggle={() => toggle(e.id)} hideSpoilers={spoilers} />
        ))}
      </View>
      <Button label="Episode alerts" icon="notifications-outline" variant="secondary" style={{ marginTop: space.xl }} onPress={() => { if (!saved) addTitle(t.id); router.push(`/alerts/${t.id}`); }} />
    </Screen>
  );
}
