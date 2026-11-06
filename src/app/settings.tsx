import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../components/Text';
import { Button, Chip, IconButton, Screen, ToggleRow, TopBar } from '../components/ui';
import { COUNTRIES } from '../data/catalog';
import { useStore } from '../store';
import { colors, radius, space, type } from '../theme';

const wrap = (h: number) => (h + 24) % 24;

export default function Settings() {
  const s = useStore();
  const [demoMsg, setDemoMsg] = useState<string | null>(null);

  const hourStepper = (label: string, value: number, onChange: (v: number) => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space.sm }}>
      <Text style={type.body}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <IconButton icon="remove" label={`Earlier ${label}`} onPress={() => onChange(wrap(value - 1))} />
        <Text style={[type.heading, { width: 56, textAlign: 'center' }]}>{String(value).padStart(2, '0')}:00</Text>
        <IconButton icon="add" label={`Later ${label}`} onPress={() => onChange(wrap(value + 1))} />
      </View>
    </View>
  );

  return (
    <Screen header={<TopBar title="Settings" />}>
      <Text style={type.overline}>Region</Text>
      <Text style={[type.caption, { marginTop: 4, marginBottom: space.sm }]}>Used for release dates and where-to-watch.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {COUNTRIES.map((c) => (
          <Chip key={c.code} label={`${c.code} · ${c.name}`} active={s.country === c.code} onPress={() => s.setCountry(c.code)} />
        ))}
      </View>

      <Text style={[type.overline, { marginTop: space.xl }]}>Notifications</Text>
      <ToggleRow
        label="Push notifications"
        hint="Prototype: delivery goes to the in-app notification center. Device push needs a development build."
        value={s.pushEnabled}
        onChange={s.setPushEnabled}
      />
      <ToggleRow label="Quiet hours" hint="Alerts that fall inside this window are delivered when it ends." value={s.quietHours.enabled} onChange={(v) => s.setQuietHours({ enabled: v })} />
      {s.quietHours.enabled ? (
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: space.lg, marginTop: space.sm }}>
          {hourStepper('Start', s.quietHours.start, (v) => s.setQuietHours({ start: v }))}
          {hourStepper('End', s.quietHours.end, (v) => s.setQuietHours({ end: v }))}
        </View>
      ) : null}

      <Text style={[type.overline, { marginTop: space.xl }]}>Viewing</Text>
      <ToggleRow label="Spoiler protection" hint="Hide episode names you haven't watched yet." value={s.spoilerProtection} onChange={s.setSpoilerProtection} />

      <Text style={[type.overline, { marginTop: space.xl, marginBottom: space.sm }]}>Demo</Text>
      <Text style={[type.caption, { marginBottom: space.md }]}>
        Fill the app with a sample watchlist, episode progress, collections, a few alerts and notification history. Replaces your current watchlist.
      </Text>
      <Button
        label={demoMsg ?? 'Load demo data'}
        icon="sparkles-outline"
        variant="secondary"
        onPress={() => {
          s.loadDemoData();
          setDemoMsg('Demo data loaded');
        }}
      />

      <Text style={[type.overline, { marginTop: space.xl, marginBottom: space.md }]}>Account</Text>
      <Text style={type.caption}>Signed in as {s.user?.email}</Text>
      <Button
        label="Sign out"
        variant="secondary"
        style={{ marginTop: space.md }}
        onPress={() => {
          s.signOut();
          router.replace('/auth');
        }}
      />
      <Button
        label="Reset prototype data"
        variant="danger"
        style={{ marginTop: space.sm }}
        onPress={() => {
          s.resetAll();
          router.replace('/onboarding');
        }}
      />
      <Text style={[type.caption, { textAlign: 'center', marginTop: space.xl, fontSize: 11 }]}>RELEASED. prototype v0.1 · sample data only</Text>
    </Screen>
  );
}
