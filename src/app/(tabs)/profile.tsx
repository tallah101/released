import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Text } from '../../components/Text';
import { Card, Screen, type IconName } from '../../components/ui';
import { getTitle } from '../../data/catalog';
import { anyAlertOn } from '../../lib/alerts';
import { useStore } from '../../store';
import { colors, radius, space, type } from '../../theme';

export default function Profile() {
  const user = useStore((s) => s.user);
  const watchlist = useStore((s) => s.watchlist);
  const watched = useStore((s) => s.watched);
  const items = Object.values(watchlist);

  const minutes = Object.keys(watched).reduce((sum, id) => {
    const titleId = id.replace(/-s\d+e\d+$/, '');
    const ep = getTitle(titleId)?.seasons?.flatMap((s) => s.episodes).find((e) => e.id === id);
    return sum + (ep?.runtime ?? 0);
  }, 0);

  const stats = [
    { label: 'Saved', value: items.length },
    { label: 'Completed', value: items.filter((i) => i.status === 'completed').length },
    { label: 'Episodes', value: Object.keys(watched).length },
    { label: 'Hours', value: Math.round(minutes / 60) },
  ];

  const rows: { icon: IconName; label: string; hint?: string; to: string }[] = [
    { icon: 'notifications-outline', label: 'Notification center', to: '/notifications' },
    { icon: 'albums-outline', label: 'Collections', to: '/collections' },
    { icon: 'settings-outline', label: 'Settings', hint: 'Region, quiet hours, spoilers', to: '/settings' },
  ];

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: space.lg }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.accent, fontSize: 32, fontFamily: 'Sora_700Bold' }}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={[type.title, { marginTop: space.md }]}>{user?.name}</Text>
        <Text style={type.caption}>{user?.email}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xl }}>
        {stats.map((s) => (
          <View key={s.label} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: space.lg, alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 22, fontFamily: 'Sora_700Bold' }}>{s.value}</Text>
            <Text style={[type.caption, { fontSize: 11, marginTop: 2 }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Card style={{ marginTop: space.md }}>
        <Text style={type.overline}>Alerts</Text>
        <Text style={[type.body, { marginTop: 6 }]}>
          {items.filter((i) => anyAlertOn(i.prefs)).length} of {items.length} saved titles have alerts switched on.
        </Text>
      </Card>

      <View style={{ marginTop: space.xl, backgroundColor: colors.surface, borderRadius: radius.lg }}>
        {rows.map((r, i) => (
          <Pressable key={r.label} onPress={() => router.push(r.to as never)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderTopWidth: i ? 1 : 0, borderTopColor: colors.hairline }}>
            <Ionicons name={r.icon} size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={type.body}>{r.label}</Text>
              {r.hint ? <Text style={type.caption}>{r.hint}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
