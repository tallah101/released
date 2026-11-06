import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Text } from '../components/Text';
import { Button, EmptyState, Poster, Screen, TopBar } from '../components/ui';
import { getTitle } from '../data/catalog';
import { useStore } from '../store';
import { colors, radius, space, type } from '../theme';

export default function Collections() {
  const collections = useStore((s) => s.collections);
  const create = useStore((s) => s.createCollection);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const n = name.trim();
    if (n.length < 2) return setError('Name must be at least 2 characters.');
    if (collections.some((c) => c.name.toLowerCase() === n.toLowerCase())) return setError('You already have a collection with that name.');
    setError(null);
    setName('');
    router.push(`/collection/${create(n)}`);
  };

  return (
    <Screen header={<TopBar title="Collections" />}>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <TextInput
          value={name}
          onChangeText={setName}
          onSubmitEditing={add}
          placeholder="New collection name"
          placeholderTextColor={colors.textSecondary}
          style={{ flex: 1, backgroundColor: colors.surface, color: colors.text, fontFamily: 'Inter_400Regular', height: 50, borderRadius: radius.md, paddingHorizontal: space.lg }}
        />
        <Button label="Create" onPress={add} />
      </View>
      {error ? <Text style={{ color: colors.error, marginTop: space.sm }}>{error}</Text> : null}

      {collections.length === 0 ? (
        <EmptyState icon="albums-outline" title="No collections" body="Group titles your way — “Weekend movies”, “Anime backlog”, anything." />
      ) : (
        <View style={{ marginTop: space.xl, gap: space.md }}>
          {collections.map((c) => {
            const titles = c.titleIds.map(getTitle).filter((x): x is NonNullable<typeof x> => !!x);
            return (
              <Pressable key={c.id} onPress={() => router.push(`/collection/${c.id}`)} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg }}>
                <Text style={type.heading}>{c.name}</Text>
                <Text style={type.caption}>{titles.length} title{titles.length === 1 ? '' : 's'}</Text>
                {titles.length ? (
                  <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
                    {titles.slice(0, 5).map((t) => (
                      <Poster key={t.id} title={t} width={48} height={72} showName={false} />
                    ))}
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
