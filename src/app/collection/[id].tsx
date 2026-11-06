import { router, useLocalSearchParams } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { Text } from '../../components/Text';
import { Button, Chip, EmptyState, PosterCard, Screen, TopBar } from '../../components/ui';
import { getTitle } from '../../data/catalog';
import { useStore } from '../../store';
import { space, type } from '../../theme';

export default function CollectionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useStore((s) => s.collections.find((x) => x.id === id));
  const watchlist = useStore((s) => s.watchlist);
  const { toggleInCollection, deleteCollection } = useStore.getState();
  const { width } = useWindowDimensions();
  const cardW = (Math.min(width, 700) - space.lg * 2 - space.md * 2) / 3;

  if (!c)
    return (
      <Screen header={<TopBar title="Collection" />}>
        <EmptyState icon="albums-outline" title="Collection not found" body="It may have been deleted." />
      </Screen>
    );

  const titles = c.titleIds.map(getTitle).filter((x): x is NonNullable<typeof x> => !!x);
  const addable = Object.keys(watchlist)
    .filter((tid) => !c.titleIds.includes(tid))
    .map(getTitle)
    .filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <Screen header={<TopBar title={c.name} />}>
      {titles.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {titles.map((t) => (
            <View key={t.id}>
              <PosterCard title={t} width={cardW} />
              <Chip label="Remove" icon="close" onPress={() => toggleInCollection(c.id, t.id)} />
            </View>
          ))}
        </View>
      ) : (
        <EmptyState icon="film-outline" title="Empty collection" body="Add titles from your watchlist below." />
      )}

      <Text style={[type.overline, { marginTop: space.xl, marginBottom: space.sm }]}>Add from your watchlist</Text>
      {addable.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {addable.map((t) => (
            <Chip key={t.id} icon="add" label={t.name} onPress={() => toggleInCollection(c.id, t.id)} />
          ))}
        </View>
      ) : (
        <Text style={type.caption}>Everything in your watchlist is already here.</Text>
      )}

      <Button
        label="Delete collection"
        variant="danger"
        style={{ marginTop: space.xxl }}
        onPress={() => {
          deleteCollection(c.id);
          router.back();
        }}
      />
    </Screen>
  );
}
