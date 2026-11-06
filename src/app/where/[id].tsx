import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Text } from '../../components/Text';
import { Button, Card, EmptyState, Screen, TopBar } from '../../components/ui';
import { COUNTRIES, getTitle } from '../../data/catalog';
import { relativeTime } from '../../lib/format';
import { useStore } from '../../store';
import { colors, radius, space, type } from '../../theme';
import type { OfferKind } from '../../types';

const GROUPS: { kind: OfferKind; label: string }[] = [
  { kind: 'subscription', label: 'Stream' },
  { kind: 'rent', label: 'Rent' },
  { kind: 'buy', label: 'Buy' },
  { kind: 'cinema', label: 'In cinemas' },
];

export default function WhereToWatch() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = getTitle(id);
  const country = useStore((s) => s.country);
  const countryName = COUNTRIES.find((c) => c.code === country)?.name ?? country;
  const a = t?.availability[country];

  return (
    <Screen header={<TopBar title="Where to watch" />}>
      <Text style={type.title}>{t?.name}</Text>
      <Text style={[type.caption, { marginTop: 4 }]}>Region: {countryName} ({country})</Text>

      {!a || a.offers.length === 0 ? (
        <EmptyState
          icon="tv-outline"
          title="No availability data"
          body={`We don't have verified availability for ${countryName}. We never guess where a title is streaming.`}
          action="Change region"
          onAction={() => router.push('/settings')}
        />
      ) : (
        <>
          {GROUPS.map((g) => {
            const offers = a.offers.filter((o) => o.kind === g.kind);
            if (!offers.length) return null;
            return (
              <View key={g.kind} style={{ marginTop: space.xl }}>
                <Text style={[type.overline, { marginBottom: space.sm }]}>{g.label}</Text>
                {offers.map((o, i) => (
                  <Card key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.sm }}>
                    <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center', marginRight: space.md }}>
                      <Text style={{ color: colors.accent, fontWeight: '800' }}>{o.provider[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={type.heading}>{o.provider}</Text>
                      <Text style={type.caption}>{[o.quality, o.price].filter(Boolean).join(' · ') || g.label}</Text>
                    </View>
                  </Card>
                ))}
              </View>
            );
          })}
          <Text style={[type.caption, { marginTop: space.lg, fontSize: 11 }]}>
            Source: {a.source} · updated {relativeTime(a.updatedAt)}. Availability can change; check the provider before purchasing.
          </Text>
          <Button label="Change region" variant="secondary" style={{ marginTop: space.xl }} onPress={() => router.push('/settings')} />
        </>
      )}
    </Screen>
  );
}
