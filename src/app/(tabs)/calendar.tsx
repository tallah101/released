import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { Chip, EmptyState, IconButton, ReleaseRow, Screen } from '../../components/ui';
import { releaseEvents } from '../../data/catalog';
import { useStore } from '../../store';
import { colors, radius, space, type } from '../../theme';
import type { ReleaseEvent } from '../../types';

type View_ = 'month' | 'week' | 'list';
type Scope = 'mine' | 'all';
type Kind = 'all' | 'movies' | 'episodes' | 'streaming';

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Calendar() {
  const watchlist = useStore((s) => s.watchlist);
  const country = useStore((s) => s.country);
  const [mode, setMode] = useState<View_>('month');
  const [scope, setScope] = useState<Scope>('mine');
  const [kind, setKind] = useState<Kind>('all');
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => ymd(new Date()));

  const events = useMemo(
    () =>
      releaseEvents
        .filter((e) => scope === 'all' || watchlist[e.titleId])
        .filter((e) => e.country === 'ALL' || e.country === country)
        .filter((e) =>
          kind === 'all'
            ? true
            : kind === 'movies'
              ? e.kind === 'cinema' || e.kind === 'digital'
              : kind === 'streaming'
                ? e.kind === 'streaming'
                : ['episode', 'season_premiere', 'finale'].includes(e.kind),
        ),
    [scope, kind, watchlist, country],
  );

  const byDay = useMemo(() => {
    const m = new Map<string, ReleaseEvent[]>();
    events.forEach((e) => m.set(e.date, [...(m.get(e.date) ?? []), e]));
    return m;
  }, [events]);

  const todayStr = ymd(new Date());

  // Month grid
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startPad = (first.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
  ];

  // Week strip
  const weekStart = new Date(cursor);
  weekStart.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i));

  const shift = (dir: number) => {
    const d = new Date(cursor);
    if (mode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir, 1);
    setCursor(d);
  };

  const dayCell = (d: Date, tall = false) => {
    const k = ymd(d);
    const count = byDay.get(k)?.length ?? 0;
    const isSel = k === selected;
    return (
      <Pressable
        key={k}
        onPress={() => setSelected(k)}
        style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: tall ? 10 : 6 }}
      >
        <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isSel ? colors.accent : k === todayStr ? colors.elevated : 'transparent' }}>
          <Text style={{ color: isSel ? '#140F24' : colors.text, fontWeight: isSel || k === todayStr ? '800' : '500' }}>{d.getDate()}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 2, height: 6, marginTop: 3 }}>
          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
            <View key={i} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent }} />
          ))}
        </View>
      </Pressable>
    );
  };

  const upcoming = events.filter((e) => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));
  const dayEvents = byDay.get(selected) ?? [];

  return (
    <Screen>
      <Text style={type.display}>Calendar</Text>
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, marginTop: space.lg }}>
        {(['month', 'week', 'list'] as View_[]).map((m) => (
          <Pressable key={m} onPress={() => setMode(m)} style={{ flex: 1, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === m ? colors.elevated : 'transparent' }}>
            <Text style={{ color: mode === m ? colors.text : colors.textSecondary, fontWeight: '700', textTransform: 'capitalize' }}>{m === 'list' ? 'Upcoming' : m}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.md }} contentContainerStyle={{ gap: space.sm }}>
        <Chip label="My titles" active={scope === 'mine'} onPress={() => setScope('mine')} />
        <Chip label="Everything" active={scope === 'all'} onPress={() => setScope('all')} />
        <View style={{ width: 1, backgroundColor: colors.hairline }} />
        {(['all', 'movies', 'episodes', 'streaming'] as Kind[]).map((k) => (
          <Chip key={k} label={k === 'all' ? 'All types' : k[0].toUpperCase() + k.slice(1)} active={kind === k} onPress={() => setKind(k)} />
        ))}
      </ScrollView>
      <Text style={[type.caption, { marginTop: space.sm, fontSize: 11 }]}>Showing release dates for {country}. Change region in Settings.</Text>

      {mode !== 'list' ? (
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, marginTop: space.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.sm }}>
            <IconButton icon="chevron-back" label="Previous" onPress={() => shift(-1)} />
            <Text style={type.heading}>
              {mode === 'week'
                ? `${week[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${week[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                : cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </Text>
            <IconButton icon="chevron-forward" label="Next" onPress={() => shift(1)} />
          </View>
          <View style={{ flexDirection: 'row' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <Text key={i} style={{ width: `${100 / 7}%`, textAlign: 'center', color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>{d}</Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {mode === 'month'
              ? cells.map((d, i) => (d ? dayCell(d) : <View key={`p${i}`} style={{ width: `${100 / 7}%` }} />))
              : week.map((d) => dayCell(d, true))}
          </View>
        </View>
      ) : null}

      <View style={{ marginTop: space.xl }}>
        {mode === 'list' ? (
          upcoming.length ? (
            upcoming.map((e) => <ReleaseRow key={e.id} event={e} />)
          ) : (
            <EmptyState icon="calendar-outline" title="No upcoming releases" body={scope === 'mine' ? 'Save titles to fill your calendar, or switch to Everything.' : 'Nothing scheduled.'} />
          )
        ) : (
          <>
            <Text style={[type.overline, { marginBottom: space.md }]}>
              {new Date(`${selected}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            {dayEvents.length ? dayEvents.map((e) => <ReleaseRow key={e.id} event={e} />) : <Text style={type.caption}>No releases on this day.</Text>}
          </>
        )}
      </View>
    </Screen>
  );
}
