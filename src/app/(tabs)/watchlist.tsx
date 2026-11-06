import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Text } from '../../components/Text';
import { Button, Chip, EmptyState, IconButton, Poster, ProgressBar, Screen } from '../../components/ui';
import { getTitle } from '../../data/catalog';
import { anyAlertOn } from '../../lib/alerts';
import { typeLabel } from '../../lib/format';
import { seriesProgress } from '../../lib/progress';
import { useStore } from '../../store';
import { colors, radius, space, type } from '../../theme';
import type { ContentType, WatchStatus } from '../../types';

type Sort = 'added' | 'name' | 'rating' | 'year';
const STATUSES: (WatchStatus | 'all')[] = ['all', 'planned', 'watching', 'completed', 'dropped'];
const TYPES: (ContentType | 'all')[] = ['all', 'movie', 'tv', 'anime', 'documentary'];

export default function Watchlist() {
  const watchlist = useStore((s) => s.watchlist);
  const watched = useStore((s) => s.watched);
  const collections = useStore((s) => s.collections);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<WatchStatus | 'all'>('all');
  const [kind, setKind] = useState<ContentType | 'all'>('all');
  const [sort, setSort] = useState<Sort>('added');

  const items = Object.values(watchlist)
    .map((w) => ({ w, t: getTitle(w.titleId)! }))
    .filter((x) => x.t)
    .filter((x) => status === 'all' || x.w.status === status)
    .filter((x) => kind === 'all' || x.t.type === kind)
    .filter((x) => !q || x.t.name.toLowerCase().includes(q.toLowerCase()) || x.w.note.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) =>
      sort === 'name'
        ? a.t.name.localeCompare(b.t.name)
        : sort === 'rating'
          ? (b.w.rating ?? -1) - (a.w.rating ?? -1)
          : sort === 'year'
            ? b.t.year - a.t.year
            : b.w.addedAt.localeCompare(a.w.addedAt),
    );

  const total = Object.keys(watchlist).length;
  const nextSort: Record<Sort, Sort> = { added: 'name', name: 'rating', rating: 'year', year: 'added' };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={type.display}>Watchlist</Text>
        <IconButton icon="albums-outline" label="Collections" onPress={() => router.push('/collections')} />
      </View>
      <Text style={type.caption}>
        {total} saved · {collections.length} collection{collections.length === 1 ? '' : 's'}
      </Text>

      {total === 0 ? (
        <>
          <EmptyState icon="bookmark-outline" title="Your watchlist is empty" body="Save movies, series, anime and documentaries to track their releases." action="Discover titles" onAction={() => router.push('/discover')} />
          <Button label="Load demo data" icon="sparkles-outline" variant="secondary" onPress={() => useStore.getState().loadDemoData()} />
        </>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, height: 46, borderRadius: radius.md, paddingHorizontal: space.lg, marginTop: space.lg }}>
            <Ionicons name="search" size={17} color={colors.textSecondary} />
            <TextInput value={q} onChangeText={setQ} placeholder="Search your watchlist" placeholderTextColor={colors.textSecondary} style={{ flex: 1, color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 15 }} />
            {q ? <Ionicons name="close-circle" size={18} color={colors.textSecondary} onPress={() => setQ('')} /> : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.md }} contentContainerStyle={{ gap: space.sm }}>
            {STATUSES.map((s) => (
              <Chip key={s} label={s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)} active={status === s} onPress={() => setStatus(s)} />
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.sm }} contentContainerStyle={{ gap: space.sm }}>
            <Chip icon="swap-vertical" label={`Sort: ${sort}`} active onPress={() => setSort(nextSort[sort])} />
            {TYPES.map((k) => (
              <Chip key={k} label={k === 'all' ? 'All types' : typeLabel[k]} active={kind === k} onPress={() => setKind(k)} />
            ))}
          </ScrollView>

          <View style={{ marginTop: space.lg, gap: space.sm }}>
            {items.length === 0 ? <Text style={type.caption}>No titles match.</Text> : null}
            {items.map(({ w, t }) => {
              const p = t.seasons ? seriesProgress(t, watched) : null;
              return (
                <Pressable key={t.id} onPress={() => router.push(`/title/${t.id}`)} style={({ pressed }) => ({ flexDirection: 'row', gap: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, opacity: pressed ? 0.85 : 1 })}>
                  <Poster title={t} width={64} height={96} showName={false} />
                  <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
                    <Text style={type.heading} numberOfLines={1}>{t.name}</Text>
                    <Text style={type.caption}>{typeLabel[t.type]} · {t.year} · <Text style={{ textTransform: 'capitalize' }}>{w.status}</Text></Text>
                    <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                      {w.rating ? <Text style={{ color: colors.warning, fontSize: 12 }}>★ {w.rating}/5</Text> : null}
                      <Ionicons name={anyAlertOn(w.prefs) ? 'notifications' : 'notifications-off-outline'} size={14} color={anyAlertOn(w.prefs) ? colors.accent : colors.textSecondary} />
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{anyAlertOn(w.prefs) ? 'Alerts on' : 'No alerts'}</Text>
                    </View>
                    {p ? <View style={{ marginTop: 4 }}><ProgressBar value={p.ratio} /></View> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}
