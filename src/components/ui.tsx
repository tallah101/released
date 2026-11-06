import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Switch, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { kindLabel, countdownLabel, prettyDate, typeLabel } from '../lib/format';
import { colors, font, kindColor, radius, space, statusColor, type } from '../theme';
import type { Episode, ReleaseEvent, ReleaseStatus, Title } from '../types';
import { getTitle } from '../data/catalog';
import { useStore } from '../store';

export type IconName = keyof typeof Ionicons.glyphMap;

/* ---------- Layout ---------- */

export function Screen({
  children,
  scroll = true,
  padded = true,
  header,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  header?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const pad = padded ? space.lg : 0;
  if (!scroll)
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingHorizontal: pad }]}>
        {header}
        {children}
      </View>
    );
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingHorizontal: pad, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {header}
      {children}
    </ScrollView>
  );
}

export function TopBar({ title, back = true, right }: { title?: string; back?: boolean; right?: ReactNode }) {
  return (
    <View style={styles.topBar}>
      {back ? (
        <IconButton icon="chevron-back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} label="Back" />
      ) : (
        <View style={{ width: 40 }} />
      )}
      <Text style={[type.heading, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={type.title}>{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={{ color: colors.accent, fontWeight: '600' }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ---------- Primitives ---------- */

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  style,
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const bg =
    variant === 'primary' ? colors.accent : variant === 'secondary' ? colors.elevated : 'transparent';
  const fg =
    variant === 'primary' ? '#140F24' : variant === 'danger' ? colors.error : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
      <Text style={{ color: fg, fontWeight: '700', fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label, color = colors.text }: { icon: IconName; onPress: () => void; label: string; color?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} hitSlop={8} style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}>
      <Ionicons name={icon} size={22} color={color} />
    </Pressable>
  );
}

export function Chip({ label, active, onPress, icon }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: colors.accentDim, borderColor: colors.accent }]}
    >
      {icon ? <Ionicons name={icon} size={14} color={active ? colors.accent : colors.textSecondary} /> : null}
      <Text style={{ color: active ? colors.accent : colors.textSecondary, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function StatusBadge({ status }: { status: ReleaseStatus }) {
  const c = statusColor[status];
  return (
    <View style={[styles.badge, { borderColor: c }]}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <Text style={{ color: c, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>{status}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: space.md }}>
        <Text style={type.body}>{label}</Text>
        {hint ? <Text style={[type.caption, { marginTop: 2 }]}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.accent, false: '#2A2D3A' }}
        thumbColor={colors.text}
        ios_backgroundColor="#2A2D3A"
        {...({ activeThumbColor: colors.text } as object) /* react-native-web */}
      />
    </View>
  );
}

export function EmptyState({ icon, title, body, action, onAction }: { icon: IconName; title: string; body: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={28} color={colors.accent} />
      </View>
      <Text style={[type.heading, { textAlign: 'center' }]}>{title}</Text>
      <Text style={[type.caption, { textAlign: 'center', marginTop: 6, maxWidth: 280 }]}>{body}</Text>
      {action && onAction ? <Button label={action} onPress={onAction} style={{ marginTop: space.lg }} /> : null}
    </View>
  );
}

export function Skeleton({ width, height, style }: { width: number | `${number}%`; height: number; style?: StyleProp<ViewStyle> }) {
  const o = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(o, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(o, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [o]);
  return <Animated.View style={[{ width, height, borderRadius: radius.md, backgroundColor: colors.elevated, opacity: o }, style]} />;
}

export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 380, delay, useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

/* ---------- Content ---------- */

/** Pressable with a subtle spring scale — the app's standard touch feedback. */
export function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.97,
  accessibilityLabel,
  asButton = true,
}: {
  children: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  accessibilityLabel?: string;
  /** Set false on containers that hold their own buttons (no nested <button> on web). */
  asButton?: boolean;
}) {
  const s = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(s, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable onPress={onPress} onPressIn={() => to(scaleTo)} onPressOut={() => to(1)} accessibilityRole={asButton ? 'button' : 'link'} accessibilityLabel={accessibilityLabel}>
      <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

const hash = (str: string) => {
  let h = 7;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/**
 * Placeholder artwork. Titles are fictional, so posters use stock photos from
 * picsum.photos (seeded per title, so each title always gets the same photo),
 * tinted with the title's colours. The full build swaps this for TMDB poster/backdrop paths.
 */
export function artUrl(title: Title, width: number, height: number) {
  const r = (n: number) => Math.min(1200, Math.ceil((n * 2) / 100) * 100);
  return `https://picsum.photos/seed/released-${title.id}/${r(width)}/${r(height)}`;
}

/**
 * Key art: generated gradient + halo rings underneath (shown while loading or offline),
 * photo on top, then a colour tint and light sheen.
 */
export function Poster({ title, width, height, showName = true }: { title: Title; width: number; height: number; showName?: boolean }) {
  const h = hash(title.id);
  const small = width < 80;
  const ring = Math.max(width, height) * 0.9;
  const cx = ((h % 70) / 100) * width - ring / 2 + width * 0.15;
  const cy = (((h >> 4) % 45) / 100) * height - ring / 2 + height * 0.1;
  return (
    <View style={{ width, height, borderRadius: small ? radius.sm : radius.lg, overflow: 'hidden', backgroundColor: title.colors[1], borderWidth: 1, borderColor: colors.stroke }}>
      <LinearGradient colors={title.colors} start={{ x: 0.1, y: 0 }} end={{ x: 0.6, y: 1 }} style={StyleSheet.absoluteFill} />
      {[1, 0.72, 0.46].map((k) => (
        <View
          key={k}
          style={{
            position: 'absolute',
            width: ring * k,
            height: ring * k,
            borderRadius: (ring * k) / 2,
            left: cx + (ring * (1 - k)) / 2,
            top: cy + (ring * (1 - k)) / 2,
            borderWidth: 1,
            borderColor: `rgba(255,255,255,${0.05 + (1 - k) * 0.12})`,
          }}
        />
      ))}
      {small ? (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ fontFamily: font.displayHeavy, color: 'rgba(255,255,255,0.85)', fontSize: width * 0.38 }}>{title.name.charAt(0)}</Text>
        </View>
      ) : null}
      {/* Photo art on top of the generated art (which stays as the loading / offline placeholder) */}
      <Image source={{ uri: artUrl(title, width, height) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} cachePolicy="memory-disk" recyclingKey={`${title.id}-${width}x${height}`} />
      <LinearGradient colors={[`${title.colors[0]}66`, `${title.colors[1]}99`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 0.7, y: 0.5 }} style={StyleSheet.absoluteFill} />
      {showName && !small ? (
        <>
          <View style={styles.posterType}>
            <Text style={{ color: 'rgba(245,245,247,0.9)', fontSize: 9, fontWeight: '700', letterSpacing: 1.2 }}>{(title.type === 'documentary' && width < 140 ? 'Doc' : typeLabel[title.type]).toUpperCase()}</Text>
          </View>
          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.82)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.md, paddingTop: space.xxl }}>
            <Text style={{ fontFamily: font.display, color: colors.text, fontSize: width > 140 ? 19 : 14, letterSpacing: -0.3, lineHeight: width > 140 ? 23 : 18 }} numberOfLines={2}>
              {title.name}
            </Text>
            <Text style={{ color: 'rgba(245,245,247,0.65)', fontSize: 11, marginTop: 3 }}>{title.year}{title.score ? `  ·  ★ ${title.score.toFixed(1)}` : ''}</Text>
          </LinearGradient>
        </>
      ) : null}
    </View>
  );
}

export function PosterCard({ title, width = 132, subtitle }: { title: Title; width?: number; subtitle?: string }) {
  const saved = useStore((s) => !!s.watchlist[title.id]);
  return (
    <PressableScale onPress={() => router.push(`/title/${title.id}`)} style={{ width }} accessibilityLabel={title.name}>
      <View>
        <Poster title={title} width={width} height={width * 1.5} />
        {saved ? (
          <View style={styles.savedPip}>
            <Ionicons name="bookmark" size={12} color="#140F24" />
          </View>
        ) : null}
      </View>
      {subtitle ? <Text style={[type.caption, { marginTop: 6 }]} numberOfLines={1}>{subtitle}</Text> : null}
    </PressableScale>
  );
}

export function PosterRail({ titles, subtitle }: { titles: Title[]; subtitle?: (t: Title) => string | undefined }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md, paddingRight: space.lg }}>
      {titles.map((t) => (
        <PosterCard key={t.id} title={t} subtitle={subtitle?.(t)} />
      ))}
    </ScrollView>
  );
}

export function Countdown({ date, status }: { date: string; status: ReleaseStatus }) {
  return (
    <LinearGradient colors={['rgba(167,139,250,0.18)', 'rgba(167,139,250,0.04)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.countdown}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: font.displayHeavy, color: colors.text, fontSize: 24, letterSpacing: -0.6 }}>{countdownLabel(date)}</Text>
        <Text style={type.caption}>{prettyDate(date, { weekday: 'short' })}</Text>
      </View>
      <StatusBadge status={status} />
    </LinearGradient>
  );
}

export function ReleaseRow({ event, showTitle = true }: { event: ReleaseEvent; showTitle?: boolean }) {
  const t = getTitle(event.titleId);
  const spoilers = useStore((s) => s.spoilerProtection);
  const watched = useStore((s) => (event.episodeId ? !!s.watched[event.episodeId] : true));
  if (!t) return null;
  const d = new Date(`${event.date}T00:00:00`);
  // Spoiler protection: drop the episode name ("S2E4 · Ashes" -> "S2E4") until it's watched.
  const label = spoilers && event.episodeId && !watched ? event.label.split(' · ')[0] + (event.kind === 'finale' ? ' · Season finale' : '') : event.label;
  const kc = kindColor[event.kind];
  return (
    <PressableScale onPress={() => router.push(`/title/${t.id}`)} style={styles.eventRow} scaleTo={0.98}>
      <View style={styles.dateBlock}>
        <Text style={{ color: kc, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>
          {d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
        </Text>
        <Text style={{ fontFamily: font.display, color: colors.text, fontSize: 22, lineHeight: 26 }}>{d.getDate()}</Text>
      </View>
      <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: kc, opacity: 0.8 }} />
      {showTitle ? <Poster title={t} width={44} height={64} showName={false} /> : null}
      <View style={{ flex: 1, gap: 3 }}>
        {showTitle ? <Text style={type.heading} numberOfLines={1}>{t.name}</Text> : null}
        <Text style={showTitle ? type.caption : [type.body, { fontWeight: '500' }]} numberOfLines={1}>
          {showTitle ? `${kindLabel[event.kind]} · ` : ''}{label}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <StatusBadge status={event.status} />
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{event.country === 'ALL' ? 'Global' : event.country}</Text>
        </View>
        {event.previousDate ? (
          <Text style={{ color: colors.warning, fontSize: 11 }}>Moved from {prettyDate(event.previousDate)}</Text>
        ) : null}
      </View>
    </PressableScale>
  );
}

export function EpisodeRow({ episode, watched, onToggle, hideSpoilers }: { episode: Episode; watched: boolean; onToggle: () => void; hideSpoilers: boolean }) {
  const aired = !!episode.airDate && new Date(`${episode.airDate}T00:00:00`) <= new Date();
  return (
    <View style={styles.episodeRow}>
      <View style={{ flex: 1 }}>
        <Text style={type.overline}>Episode {episode.number}</Text>
        <Text style={[type.heading, { marginTop: 2 }]}>{hideSpoilers && !watched ? `Episode ${episode.number}` : episode.name}</Text>
        <Text style={[type.caption, { marginTop: 2 }]}>
          {episode.airDate ? (aired ? `Aired ${prettyDate(episode.airDate)}` : `Airs ${prettyDate(episode.airDate)}`) : 'Air date not announced'} · {episode.runtime} min
        </Text>
      </View>
      <Pressable
        onPress={onToggle}
        disabled={!aired}
        accessibilityLabel={watched ? 'Mark unwatched' : 'Mark watched'}
        style={[styles.check, watched && { backgroundColor: colors.success, borderColor: colors.success }, !aired && { opacity: 0.3 }]}
      >
        {watched ? <Ionicons name="checkmark" size={18} color="#062016" /> : null}
      </Pressable>
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.elevated, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, height: '100%', backgroundColor: colors.accent }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm, marginBottom: space.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: space.xl, marginBottom: space.md },
  button: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl, height: 50, borderRadius: radius.pill },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(23,26,36,0.8)' },
  chip: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 14, height: 34, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'transparent' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, height: 22, borderRadius: radius.pill, borderWidth: 1, alignSelf: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: space.xl },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  posterType: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.35)' },
  savedPip: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  countdown: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, padding: space.lg, borderWidth: 1, borderColor: 'rgba(167,139,250,0.22)' },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: space.sm, borderWidth: 1, borderColor: colors.hairline },
  dateBlock: { width: 40, alignItems: 'center' },
  episodeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  check: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: colors.textSecondary, alignItems: 'center', justifyContent: 'center' },
});
