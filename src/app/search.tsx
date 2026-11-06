import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Text } from '../components/Text';
import { Chip, EmptyState, IconButton, Poster, Screen, Skeleton } from '../components/ui';
import { catalog } from '../data/catalog';
import { typeLabel } from '../lib/format';
import { useStore } from '../store';
import { colors, radius, space, type } from '../theme';
import type { ContentType } from '../types';

export default function Search() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [kind, setKind] = useState<ContentType | 'all'>('all');
  const watchlist = useStore((s) => s.watchlist);
  const addTitle = useStore((s) => s.addTitle);

  // Debounce like the real (network) search would.
  useEffect(() => {
    const h = setTimeout(() => setDebounced(q.trim().toLowerCase()), 250);
    return () => clearTimeout(h);
  }, [q]);
  const loading = q.trim().toLowerCase() !== debounced;

  const results = debounced
    ? catalog.filter(
        (t) =>
          (kind === 'all' || t.type === kind) &&
          (t.name.toLowerCase().includes(debounced) ||
            t.genres.some((g) => g.toLowerCase().includes(debounced)) ||
            t.cast.some((c) => c.name.toLowerCase().includes(debounced))),
      )
    : [];

  return (
    <Screen
      header={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md }}>
          <IconButton icon="chevron-back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, height: 46, borderRadius: radius.md, paddingHorizontal: space.md }}>
            <Ionicons name="search" size={17} color={colors.textSecondary} />
            <TextInput autoFocus value={q} onChangeText={setQ} placeholder="Titles, genres, people" placeholderTextColor={colors.textSecondary} style={{ flex: 1, color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 16 }} returnKeyType="search" />
            {q ? <Ionicons name="close-circle" size={18} color={colors.textSecondary} onPress={() => setQ('')} /> : null}
          </View>
        </View>
      }
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.lg }}>
        {(['all', 'movie', 'tv', 'anime', 'documentary'] as const).map((k) => (
          <Chip key={k} label={k === 'all' ? 'All' : typeLabel[k]} active={kind === k} onPress={() => setKind(k)} />
        ))}
      </View>

      {!q ? (
        <EmptyState icon="search" title="Find something to track" body="Search the catalog by title, genre, or cast." />
      ) : loading ? (
        [0, 1, 2].map((i) => (
          <View key={i} style={{ flexDirection: 'row', gap: space.md, marginBottom: space.md }}>
            <Skeleton width={56} height={84} />
            <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
              <Skeleton width="70%" height={16} />
              <Skeleton width="40%" height={12} />
            </View>
          </View>
        ))
      ) : results.length === 0 ? (
        <EmptyState icon="film-outline" title="No results" body={`Nothing in the sample catalog matches “${q}”.`} />
      ) : (
        results.map((t) => {
          const saved = !!watchlist[t.id];
          return (
            <Pressable key={t.id} onPress={() => router.push(`/title/${t.id}`)} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center', marginBottom: space.md }}>
              <Poster title={t} width={56} height={84} showName={false} />
              <View style={{ flex: 1 }}>
                <Text style={type.heading}>{t.name}</Text>
                <Text style={type.caption}>{typeLabel[t.type]} · {t.year} · {t.genres.slice(0, 2).join(', ')}</Text>
              </View>
              <IconButton
                icon={saved ? 'bookmark' : 'bookmark-outline'}
                color={saved ? colors.accent : colors.text}
                label={saved ? 'Saved' : 'Save'}
                onPress={() => (saved ? router.push(`/title/${t.id}`) : addTitle(t.id))}
              />
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}
