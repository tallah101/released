import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { Text } from '../../components/Text';
import { Button, Card, EmptyState, Screen, ToggleRow, TopBar } from '../../components/ui';
import { catalog, eventsInCountry, getTitle } from '../../data/catalog';
import { anyAlertOn, buildSchedule } from '../../lib/alerts';
import { useStore } from '../../store';
import { colors, space, type } from '../../theme';
import type { AlertPrefs } from '../../types';

type PrefKey = Exclude<keyof AlertPrefs, 'timings'>;

const MOVIE: { key: PrefKey; label: string; hint: string }[] = [
  { key: 'cinema', label: 'Cinema release', hint: 'When it opens in cinemas in your region' },
  { key: 'digital', label: 'Digital release', hint: 'Only when a digital date is confirmed by a source' },
  { key: 'streaming', label: 'Streaming availability', hint: 'When it lands on a streaming service' },
  { key: 'dateChange', label: 'Release date changes', hint: 'Delays, moves and cancellations' },
];
const SHOW: { key: PrefKey; label: string; hint: string }[] = [
  { key: 'newSeason', label: 'New season', hint: 'Season announcements and premieres' },
  { key: 'newEpisode', label: 'New episode', hint: 'When each episode airs' },
  { key: 'episodeReminder', label: 'Episode reminders', hint: 'Reminders before episodes air (uses timings below)' },
  { key: 'scheduleChange', label: 'Schedule changes', hint: 'Delays, breaks and moved air dates' },
  { key: 'finale', label: 'Season finale', hint: 'Heads-up for the last episode of a season' },
];
const TIMINGS: { key: keyof AlertPrefs['timings']; label: string }[] = [
  { key: 'd7', label: '7 days before' },
  { key: 'd3', label: '3 days before' },
  { key: 'd1', label: '1 day before' },
  { key: 'day', label: 'On release day' },
  { key: 'immediate', label: 'Immediately when it happens' },
];

export default function AlertSettings() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = getTitle(id);
  const item = useStore((s) => s.watchlist[id]);
  const quiet = useStore((s) => s.quietHours);
  const country = useStore((s) => s.country);
  const pushEnabled = useStore((s) => s.pushEnabled);
  const { setPref, setTiming, disableAllAlerts, addTitle } = useStore.getState();

  const pending = useMemo(
    () => (item ? buildSchedule({ [id]: item }, eventsInCountry(country), catalog, quiet) : []),
    [item, id, quiet, country],
  );

  if (!t) return <Screen header={<TopBar title="Alerts" />}><Text style={type.caption}>Title not found.</Text></Screen>;
  if (!item)
    return (
      <Screen header={<TopBar title="Alerts" />}>
        <EmptyState icon="bookmark-outline" title="Save it first" body={`Add ${t.name} to your watchlist to choose alerts.`} action="Add to watchlist" onAction={() => addTitle(t.id)} />
      </Screen>
    );

  const options = t.seasons ? SHOW : MOVIE;
  const anyTiming = Object.values(item.prefs.timings).some(Boolean);

  return (
    <Screen header={<TopBar title="Alerts" right={<Text onPress={() => router.back()} style={{ color: colors.accent, fontWeight: '700' }}>Done</Text>} />}>
      <Text style={type.title}>{t.name}</Text>
      <Text style={[type.caption, { marginTop: 4 }]}>
        Everything is off until you switch it on. Saving a title alone never sends a notification.
      </Text>

      {!pushEnabled ? (
        <Card style={{ marginTop: space.lg, borderWidth: 1, borderColor: colors.warning }}>
          <Text style={{ color: colors.warning, fontWeight: '700' }}>Push notifications are off</Text>
          <Text style={[type.caption, { marginTop: 4 }]}>Alerts still appear in your notification center. Turn on push in Settings to get them on your lock screen.</Text>
        </Card>
      ) : null}

      <Text style={[type.overline, { marginTop: space.xl }]}>Notify me about</Text>
      {options.map((o) => (
        <ToggleRow key={o.key} label={o.label} hint={o.hint} value={item.prefs[o.key]} onChange={(v) => setPref(t.id, o.key, v)} />
      ))}

      <Text style={[type.overline, { marginTop: space.xl }]}>When</Text>
      {TIMINGS.map((o) => (
        <ToggleRow key={o.key} label={o.label} value={item.prefs.timings[o.key]} onChange={(v) => setTiming(t.id, o.key, v)} />
      ))}
      {anyAlertOn(item.prefs) && !anyTiming ? (
        <Text style={{ color: colors.warning, marginTop: space.sm, fontSize: 13 }}>Pick at least one timing, or no alerts will be scheduled.</Text>
      ) : null}

      <Text style={[type.overline, { marginTop: space.xl, marginBottom: space.sm }]}>Scheduled for this title ({pending.length})</Text>
      {pending.length ? (
        pending.slice(0, 8).map((p) => (
          <View key={p.key} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.hairline }}>
            <Text style={type.body}>{p.message}</Text>
            <Text style={type.caption}>{new Date(p.sendAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</Text>
          </View>
        ))
      ) : (
        <Text style={type.caption}>Nothing scheduled. Unverified dates never trigger reminders.</Text>
      )}
      {quiet.enabled ? (
        <Text style={[type.caption, { marginTop: space.sm, fontSize: 11 }]}>Quiet hours {quiet.start}:00–{quiet.end}:00 apply.</Text>
      ) : null}

      {anyAlertOn(item.prefs) || anyTiming ? (
        <Button label="Turn off all alerts" variant="danger" onPress={() => disableAllAlerts(t.id)} style={{ marginTop: space.xl }} />
      ) : null}
    </Screen>
  );
}
