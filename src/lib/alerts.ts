/**
 * Notification engine (prototype, runs on-device).
 * Rules mirrored from the product spec:
 *  - Every preference defaults to FALSE when a title is saved.
 *  - Being on the watchlist never triggers anything by itself.
 *  - Preferences are re-checked at delivery time (see `deliverDue`).
 *  - Dedupe by a stable key; quiet hours push delivery to the end of the window.
 *  - Unverified / cancelled dates never produce reminders.
 * Only type-only imports here so it can be unit-tested with plain Node.
 */
import type {
  AlertPrefs,
  InboxNotification,
  QuietHours,
  ReleaseEvent,
  ScheduledAlert,
  Title,
  WatchlistItem,
} from '../types';

export const defaultPrefs = (): AlertPrefs => ({
  cinema: false,
  digital: false,
  streaming: false,
  dateChange: false,
  newSeason: false,
  newEpisode: false,
  episodeReminder: false,
  scheduleChange: false,
  finale: false,
  timings: { d7: false, d3: false, d1: false, day: false, immediate: false },
});

export const anyAlertOn = (p: AlertPrefs) =>
  [p.cinema, p.digital, p.streaming, p.dateChange, p.newSeason, p.newEpisode,
    p.episodeReminder, p.scheduleChange, p.finale].some(Boolean);

/** Does the user want to hear about this kind of event for this title? */
export function eventEnabled(ev: ReleaseEvent, p: AlertPrefs): boolean {
  switch (ev.kind) {
    case 'cinema':
      return p.cinema;
    case 'digital':
      return p.digital;
    case 'streaming':
      return p.streaming;
    case 'season_premiere':
      return p.newSeason || p.newEpisode || p.episodeReminder;
    case 'finale':
      return p.finale || p.newEpisode || p.episodeReminder;
    case 'episode':
      return p.newEpisode || p.episodeReminder;
    default:
      return false;
  }
}

/** Notifications never include episode names (they can spoil): "S2E4 · Ashes" -> "S2E4". */
const safeLabel = (ev: ReleaseEvent) =>
  ev.episodeId ? ev.label.split(' · ')[0] + (ev.kind === 'finale' ? ' (season finale)' : ev.kind === 'season_premiere' ? ' (premiere)' : '') : ev.label;

const shortDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const OFFSETS: Record<keyof AlertPrefs['timings'], number> = {
  d7: 7, d3: 3, d1: 1, day: 0, immediate: 0,
};

const TIMING_TEXT: Record<keyof AlertPrefs['timings'], string> = {
  d7: 'in 7 days', d3: 'in 3 days', d1: 'tomorrow', day: 'today', immediate: 'now',
};

/** Shift a send time out of the quiet-hours window. */
export function applyQuietHours(when: Date, q: QuietHours): Date {
  if (!q.enabled || q.start === q.end) return when;
  const h = when.getHours();
  const inWindow = q.start < q.end ? h >= q.start && h < q.end : h >= q.start || h < q.end;
  if (!inWindow) return when;
  const out = new Date(when);
  out.setHours(q.end, 0, 0, 0);
  if (out <= when) out.setDate(out.getDate() + 1);
  return out;
}

export function buildSchedule(
  watchlist: Record<string, WatchlistItem>,
  events: ReleaseEvent[],
  titles: Title[],
  quiet: QuietHours,
  now: Date = new Date(),
): ScheduledAlert[] {
  const out = new Map<string, ScheduledAlert>();
  for (const ev of events) {
    const item = watchlist[ev.titleId];
    if (!item) continue;
    if (!eventEnabled(ev, item.prefs)) continue;
    if (ev.status === 'unverified' || ev.status === 'cancelled' || ev.status === 'released') continue;
    const title = titles.find((t) => t.id === ev.titleId);
    if (!title) continue;
    const release = new Date(`${ev.date}T09:00:00`);
    (Object.keys(item.prefs.timings) as (keyof AlertPrefs['timings'])[]).forEach((timing) => {
      if (!item.prefs.timings[timing]) return;
      if (timing === 'immediate') return; // immediate = sent when the event is detected, not scheduled
      const send = new Date(release.getTime() - OFFSETS[timing] * 86_400_000);
      if (send < now) return;
      const key = `${ev.id}:${timing}`;
      const tentative = ev.status !== 'confirmed' ? ' (date not yet confirmed)' : '';
      out.set(key, {
        key,
        titleId: ev.titleId,
        eventId: ev.id,
        timing,
        sendAt: applyQuietHours(send, quiet).toISOString(),
        message: `${title.name}: ${safeLabel(ev)} ${TIMING_TEXT[timing]}${tentative}`,
      });
    });
  }
  return [...out.values()].sort((a, b) => a.sendAt.localeCompare(b.sendAt));
}

/**
 * "Immediate" event notifications: things that just happened/changed
 * (released today, date changed). Only for titles with the matching pref ON.
 */
export function detectImmediate(
  watchlist: Record<string, WatchlistItem>,
  events: ReleaseEvent[],
  titles: Title[],
  now: Date = new Date(),
): ScheduledAlert[] {
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const out: ScheduledAlert[] = [];
  for (const ev of events) {
    const item = watchlist[ev.titleId];
    if (!item) continue;
    const title = titles.find((t) => t.id === ev.titleId);
    if (!title) continue;
    const p = item.prefs;
    if (ev.previousDate && (p.dateChange || p.scheduleChange)) {
      out.push({
        key: `${ev.id}:changed:${ev.date}`,
        titleId: ev.titleId,
        eventId: ev.id,
        timing: 'immediate',
        sendAt: now.toISOString(),
        message: `${title.name}: ${safeLabel(ev)} moved from ${shortDate(ev.previousDate)} to ${shortDate(ev.date)} (${ev.status})`,
      });
    }
    if (p.timings.immediate && ev.date === todayStr && eventEnabled(ev, p) && ev.status !== 'unverified') {
      out.push({
        key: `${ev.id}:immediate`,
        titleId: ev.titleId,
        eventId: ev.id,
        timing: 'immediate',
        sendAt: now.toISOString(),
        message: `${title.name}: ${safeLabel(ev)} is out now`,
      });
    }
  }
  return out;
}

/**
 * Delivery step: re-verifies current prefs right before "sending",
 * and skips anything already delivered (dedupe).
 */
export function deliverDue(
  candidates: ScheduledAlert[],
  watchlist: Record<string, WatchlistItem>,
  events: ReleaseEvent[],
  alreadyDelivered: Set<string>,
  now: Date = new Date(),
): InboxNotification[] {
  const delivered: InboxNotification[] = [];
  for (const c of candidates) {
    if (alreadyDelivered.has(c.key)) continue;
    if (new Date(c.sendAt) > now) continue;
    const item = watchlist[c.titleId];
    const ev = events.find((e) => e.id === c.eventId);
    if (!item || !ev) continue; // removed from watchlist -> cancelled
    const changeAlert = c.key.includes(':changed:');
    const stillWanted = changeAlert
      ? item.prefs.dateChange || item.prefs.scheduleChange
      : eventEnabled(ev, item.prefs) && item.prefs.timings[c.timing];
    if (!stillWanted) continue;
    delivered.push({
      key: c.key,
      titleId: c.titleId,
      eventId: c.eventId,
      message: c.message,
      deliveredAt: now.toISOString(),
      read: false,
    });
    alreadyDelivered.add(c.key);
  }
  return delivered;
}
