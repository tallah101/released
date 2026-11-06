import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { Text } from '../../components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Chip,
  Countdown,
  EmptyState,
  IconButton,
  Poster,
  PosterRail,
  ProgressBar,
  ReleaseRow,
  SectionHeader,
} from '../../components/ui';
import { eventsFor, getTitle } from '../../data/catalog';
import { anyAlertOn } from '../../lib/alerts';
import { localISO, relativeTime, typeLabel } from '../../lib/format';
import { nextUnwatched, seriesProgress } from '../../lib/progress';
import { useStore } from '../../store';
import { colors, font, radius, space, type } from '../../theme';
import type { WatchStatus } from '../../types';

const STATUSES: WatchStatus[] = ['planned', 'watching', 'completed', 'dropped'];

/** One details screen serving movies, series, anime and documentaries, with type-specific sections. */
export default function TitleDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const t = getTitle(id);
  const item = useStore((s) => (id ? s.watchlist[id] : undefined));
  const watched = useStore((s) => s.watched);
  const spoilers = useStore((s) => s.spoilerProtection);
  const country = useStore((s) => s.country);
  const collections = useStore((s) => s.collections);
  const { addTitle, removeTitle, setStatus, setRating, setNote, toggleInCollection } = useStore.getState();
  const [noteDraft, setNoteDraft] = useState(item?.note ?? '');
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  if (!t) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
        <EmptyState icon="alert-circle-outline" title="Title not found" body="It may have been removed from the catalog." action="Go home" onAction={() => router.replace('/home')} />
      </View>
    );
  }

  const events = eventsFor(t.id, country);
  const today = localISO();
  const nextEvent = events.find((e) => e.date >= today && e.status !== 'cancelled');
  const isShow = !!t.seasons;
  const progress = isShow ? seriesProgress(t, watched) : null;
  const next = isShow ? nextUnwatched(t, watched) : null;
  const avail = t.availability[country];
  const similar = t.similar.map(getTitle).filter((x): x is NonNullable<typeof x> => !!x);
  const movieLike = t.type === 'movie' || t.type === 'documentary';

  const HERO = 340;
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/home'));
  const barOpacity = scrollY.interpolate({ inputRange: [HERO - 160, HERO - 80], outputRange: [0, 1], extrapolate: 'clamp' });
  const artShift = scrollY.interpolate({ inputRange: [-100, 0, HERO], outputRange: [-50, 0, HERO * 0.4], extrapolate: 'clamp' });
  const artScale = scrollY.interpolate({ inputRange: [-150, 0], outputRange: [1.35, 1], extrapolate: 'clamp' });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        <View style={{ height: HERO, overflow: 'hidden' }}>
          <Animated.View style={{ transform: [{ translateY: artShift }, { scale: artScale }] }}>
            <Poster title={t} width={width} height={HERO} showName={false} />
          </Animated.View>
          <LinearGradient colors={['rgba(9,10,15,0.35)', 'rgba(9,10,15,0)', colors.bg]} locations={[0, 0.35, 1]} style={StyleSheet.absoluteFill} />
        </View>

        <View style={{ flexDirection: 'row', gap: space.lg, paddingHorizontal: space.lg, marginTop: -110, alignItems: 'flex-end' }}>
          <View style={{ shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 12 }}>
            <Poster title={t} width={104} height={156} showName={false} />
          </View>
          <View style={{ flex: 1, paddingBottom: 4 }}>
            <Text style={type.overline}>{typeLabel[t.type]} · {t.year}{t.runtime ? ` · ${t.runtime} min` : ''}</Text>
            <Text style={[type.display, { fontSize: 28, lineHeight: 33, marginTop: 6 }]} numberOfLines={3}>{t.name}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: space.sm }}>
              {t.score > 0 ? <Text style={{ color: colors.warning, fontWeight: '700' }}>★ {t.score.toFixed(1)}</Text> : <Text style={type.caption}>Not yet rated</Text>}
              <Text style={type.caption} numberOfLines={1}>· {t.genres.filter((g) => g !== 'Anime' && g !== 'Documentary').join(', ')}</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: space.lg, marginTop: space.md }}>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
            {item ? (
              <Button label="Saved" icon="bookmark" variant="secondary" style={{ flex: 1 }} onPress={() => removeTitle(t.id)} />
            ) : (
              <Button label="Add to watchlist" icon="bookmark-outline" style={{ flex: 1 }} onPress={() => addTitle(t.id)} />
            )}
            <Button
              label={item && anyAlertOn(item.prefs) ? 'Alerts on' : 'Alerts'}
              icon={item && anyAlertOn(item.prefs) ? 'notifications' : 'notifications-outline'}
              variant="secondary"
              disabled={!item}
              onPress={() => router.push(`/alerts/${t.id}`)}
            />
          </View>
          {item && !anyAlertOn(item.prefs) ? (
            <Text style={[type.caption, { marginTop: space.sm }]}>Saved. No alerts are on for this title — tap Alerts to choose which releases to be notified about.</Text>
          ) : null}

          {nextEvent ? (
            <View style={{ marginTop: space.lg }}>
              <Text style={[type.overline, { marginBottom: 6 }]}>Next release · {spoilers && nextEvent.episodeId && !watched[nextEvent.episodeId] ? nextEvent.label.split(' · ')[0] : nextEvent.label}</Text>
              <Countdown date={nextEvent.date} status={nextEvent.status} />
            </View>
          ) : null}

          <Text style={[type.body, { color: colors.textSecondary, marginTop: space.lg }]}>{t.overview}</Text>

          {item ? (
            <Card style={{ marginTop: space.lg }}>
              <Text style={type.overline}>Your status</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm }}>
                {STATUSES.map((s) => (
                  <Chip key={s} label={s[0].toUpperCase() + s.slice(1)} active={item.status === s} onPress={() => setStatus(t.id, s)} />
                ))}
              </View>
              <Text style={[type.overline, { marginTop: space.lg }]}>Your rating</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: space.sm }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable key={n} onPress={() => setRating(t.id, item.rating === n ? null : n)} hitSlop={6}>
                    <Ionicons name={item.rating && n <= item.rating ? 'star' : 'star-outline'} size={26} color={colors.warning} />
                  </Pressable>
                ))}
              </View>
              <Text style={[type.overline, { marginTop: space.lg }]}>Notes</Text>
              <TextInput
                value={noteDraft}
                onChangeText={setNoteDraft}
                onEndEditing={() => setNote(t.id, noteDraft)}
                onBlur={() => setNote(t.id, noteDraft)}
                placeholder="Add a private note"
                placeholderTextColor={colors.textSecondary}
                multiline
                style={{ color: colors.text, fontFamily: 'Inter_400Regular', backgroundColor: colors.elevated, borderRadius: radius.md, padding: space.md, minHeight: 64, marginTop: space.sm, textAlignVertical: 'top' }}
              />
              {collections.length ? (
                <>
                  <Text style={[type.overline, { marginTop: space.lg }]}>Collections</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm }}>
                    {collections.map((c) => (
                      <Chip key={c.id} icon={c.titleIds.includes(t.id) ? 'checkmark' : 'add'} label={c.name} active={c.titleIds.includes(t.id)} onPress={() => toggleInCollection(c.id, t.id)} />
                    ))}
                  </View>
                </>
              ) : null}
            </Card>
          ) : null}

          {isShow && progress ? (
            <>
              <SectionHeader title="Episodes" action="Open tracker" onAction={() => router.push(`/episodes/${t.id}`)} />
              <Pressable onPress={() => router.push(`/episodes/${t.id}`)}>
                <Card>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.sm }}>
                    <Text style={type.body}>{t.seasons!.length} season{t.seasons!.length > 1 ? 's' : ''}</Text>
                    <Text style={type.caption}>{progress.watched}/{progress.total} watched</Text>
                  </View>
                  <ProgressBar value={progress.ratio} />
                  <Text style={[type.caption, { marginTop: space.sm }]}>
                    {next ? `Up next: S${next.season}E${next.number}` : progress.total ? 'All aired episodes watched' : 'No episodes have aired yet'}
                  </Text>
                </Card>
              </Pressable>
            </>
          ) : null}

          <SectionHeader title="Release timeline" />
          {events.length ? (
            events.slice(0, isShow ? 6 : 10).map((e) => <ReleaseRow key={e.id} event={e} showTitle={false} />)
          ) : (
            <Text style={type.caption}>No release dates have been published.</Text>
          )}
          {movieLike && !events.some((e) => e.kind === 'digital') ? (
            <Text style={[type.caption, { marginTop: space.sm }]}>No digital release date has been announced. We don't estimate it from the cinema date.</Text>
          ) : null}

          <SectionHeader title="Where to watch" action="Details" onAction={() => router.push(`/where/${t.id}`)} />
          <Pressable onPress={() => router.push(`/where/${t.id}`)}>
            <Card>
              {avail && avail.offers.length ? (
                <>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                    {avail.offers.map((o, i) => (
                      <View key={i} style={{ backgroundColor: colors.elevated, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6 }}>
                        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{o.provider}</Text>
                        <Text style={[type.caption, { fontSize: 11, textTransform: 'capitalize' }]}>{o.kind}{o.price ? ` · ${o.price}` : ''}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={[type.caption, { fontSize: 11, marginTop: space.sm }]}>{country} · updated {relativeTime(avail.updatedAt)}</Text>
                </>
              ) : (
                <Text style={type.caption}>No availability data for {country} yet.</Text>
              )}
            </Card>
          </Pressable>

          <SectionHeader title="Cast" />
          <View style={{ gap: space.sm }}>
            {t.cast.map((c) => (
              <View key={c.name} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.elevated, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{c.name[0]}</Text>
                </View>
                <View>
                  <Text style={type.body}>{c.name}</Text>
                  <Text style={type.caption}>{c.role}</Text>
                </View>
              </View>
            ))}
          </View>

          {similar.length ? (
            <>
              <SectionHeader title="More like this" />
              <PosterRail titles={similar} />
            </>
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* Floating back button + header bar that fades in once the hero scrolls away */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { height: insets.top + 56, backgroundColor: 'rgba(9,10,15,0.94)', borderBottomWidth: 1, borderBottomColor: colors.hairline, opacity: barOpacity }]} />
      <View style={{ position: 'absolute', top: insets.top + space.sm, left: space.lg, right: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <IconButton icon="chevron-back" label="Back" onPress={goBack} />
        <Animated.Text numberOfLines={1} style={{ flex: 1, opacity: barOpacity, color: colors.text, fontFamily: font.semibold, fontSize: 16 }}>
          {t.name}
        </Animated.Text>
        {item ? <IconButton icon={anyAlertOn(item.prefs) ? 'notifications' : 'notifications-outline'} color={anyAlertOn(item.prefs) ? colors.accent : colors.text} label="Alerts" onPress={() => router.push(`/alerts/${t.id}`)} /> : null}
      </View>
    </View>
  );
}
