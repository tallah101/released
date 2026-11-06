import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../components/Text';
import { Button, Chip, EmptyState, Poster, Screen, TopBar } from '../components/ui';
import { catalog, eventsInCountry, getTitle } from '../data/catalog';
import { buildSchedule } from '../lib/alerts';
import { relativeTime } from '../lib/format';
import { useStore } from '../store';
import { colors, radius, space, type } from '../theme';

export default function NotificationCenter() {
  const inbox = useStore((s) => s.inbox);
  const watchlist = useStore((s) => s.watchlist);
  const quiet = useStore((s) => s.quietHours);
  const lastCheck = useStore((s) => s.lastCheck);
  const { runReleaseCheck, markAllRead, markRead, clearInbox } = useStore.getState();
  const [tab, setTab] = useState<'inbox' | 'scheduled'>('inbox');
  const [msg, setMsg] = useState<string | null>(null);

  const country = useStore((s) => s.country);
  const scheduled = useMemo(() => buildSchedule(watchlist, eventsInCountry(country), catalog, quiet), [watchlist, quiet, country]);

  const check = () => {
    const n = runReleaseCheck();
    setMsg(n ? `${n} new notification${n > 1 ? 's' : ''}` : 'No new alerts. Only releases you switched on can notify you.');
  };

  return (
    <Screen header={<TopBar title="Notifications" right={inbox.some((n) => !n.read) ? <Text onPress={markAllRead} style={{ color: colors.accent, fontWeight: '600' }}>Read all</Text> : null} />}>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Chip label={`Inbox (${inbox.length})`} active={tab === 'inbox'} onPress={() => setTab('inbox')} />
        <Chip label={`Scheduled (${scheduled.length})`} active={tab === 'scheduled'} onPress={() => setTab('scheduled')} />
      </View>

      <Button label="Check for releases now" icon="refresh" variant="secondary" onPress={check} style={{ marginTop: space.lg }} />
      <Text style={[type.caption, { marginTop: space.sm, fontSize: 11 }]}>
        {msg ?? (lastCheck ? `Last checked ${relativeTime(lastCheck)}` : 'In the full app this runs on the server on a schedule.')}
      </Text>

      <View style={{ marginTop: space.lg }}>
        {tab === 'inbox' ? (
          inbox.length ? (
            <>
              {inbox.map((n) => {
                const t = getTitle(n.titleId);
                return (
                  <Pressable
                    key={n.key}
                    onPress={() => {
                      markRead(n.key);
                      router.push(`/title/${n.titleId}`);
                    }}
                    style={{ flexDirection: 'row', gap: space.md, padding: space.md, borderRadius: radius.lg, backgroundColor: n.read ? 'transparent' : colors.surface, marginBottom: space.sm, alignItems: 'center' }}
                  >
                    {t ? <Poster title={t} width={40} height={60} showName={false} /> : null}
                    <View style={{ flex: 1 }}>
                      <Text style={type.body}>{n.message}</Text>
                      <Text style={type.caption}>{relativeTime(n.deliveredAt)}</Text>
                    </View>
                    {!n.read ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} /> : null}
                  </Pressable>
                );
              })}
              <Button label="Clear history" variant="ghost" onPress={clearInbox} />
            </>
          ) : (
            <EmptyState icon="notifications-off-outline" title="No notifications yet" body="You'll only hear about releases you've switched alerts on for." />
          )
        ) : scheduled.length ? (
          scheduled.map((s) => (
            <Pressable key={s.key} onPress={() => router.push(`/alerts/${s.titleId}`)} style={{ paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: colors.hairline }}>
              <Text style={type.body}>{s.message}</Text>
              <Text style={type.caption}>Sends {new Date(s.sendAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</Text>
            </Pressable>
          ))
        ) : (
          <EmptyState icon="time-outline" title="Nothing scheduled" body="Open a saved title and switch on the alerts and timings you want." />
        )}
      </View>
    </Screen>
  );
}
