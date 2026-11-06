import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Text } from '../../components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Chip, PosterCard, Screen, SectionHeader } from '../../components/ui';
import { catalog } from '../../data/catalog';
import { colors, radius, space, type } from '../../theme';
import type { ContentType } from '../../types';

const FILTERS: { key: ContentType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'Series' },
  { key: 'anime', label: 'Anime' },
  { key: 'documentary', label: 'Documentaries' },
];

export default function Discover() {
  const [filter, setFilter] = useState<ContentType | 'all'>('all');
  const [genre, setGenre] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const cardW = (Math.min(width, 700) - space.lg * 2 - space.md * 2) / 3;

  const genres = [...new Set(catalog.flatMap((t) => t.genres))].filter((g) => g !== 'Anime' && g !== 'Documentary').sort();
  const list = catalog
    .filter((t) => filter === 'all' || t.type === filter)
    .filter((t) => !genre || t.genres.includes(genre))
    .sort((a, b) => b.trending - a.trending);

  return (
    <Screen>
      <Text style={type.display}>Discover</Text>
      <Pressable onPress={() => router.push('/search')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, height: 48, borderRadius: radius.md, paddingHorizontal: space.lg, marginTop: space.lg }}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, fontSize: 15 }}>Search movies, series, anime…</Text>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.lg }} contentContainerStyle={{ gap: space.sm }}>
        {FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.sm }} contentContainerStyle={{ gap: space.sm }}>
        {genres.map((g) => (
          <Chip key={g} label={g} active={genre === g} onPress={() => setGenre(genre === g ? null : g)} />
        ))}
      </ScrollView>

      <SectionHeader title={genre ? genre : 'Trending'} />
      {list.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {list.map((t) => (
            <PosterCard key={t.id} title={t} width={cardW} />
          ))}
        </View>
      ) : (
        <Text style={type.caption}>No titles match these filters.</Text>
      )}
    </Screen>
  );
}
