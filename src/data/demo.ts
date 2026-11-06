/**
 * Demo seed: a believable account state for showing the prototype.
 * Alerts are only switched on for a few titles, on purpose — the rest stay
 * silent, matching the "nothing is on by default" rule.
 */
import { defaultPrefs } from '../lib/alerts';
import type { AlertPrefs, Collection, WatchStatus, WatchlistItem } from '../types';
import type { InboxNotification } from '../types';
import { catalog, releaseEvents } from './catalog';

const at9 = (date: string) => new Date(`${date}T09:00:00`).getTime();

type Seed = { id: string; status: WatchStatus; rating?: number; note?: string; daysAgo: number; prefs?: (p: AlertPrefs) => void };

const seeds: Seed[] = [
  { id: 'a-kitsune', status: 'watching', rating: 5, note: 'Best thing airing right now.', daysAgo: 40,
    prefs: (p) => { p.newEpisode = true; p.finale = true; p.timings.day = true; p.timings.immediate = true; } },
  { id: 't-ledger', status: 'watching', rating: 4, daysAgo: 90,
    prefs: (p) => { p.newEpisode = true; p.scheduleChange = true; p.timings.d1 = true; } },
  { id: 'm-halcyon', status: 'planned', note: 'Opening night with Sam?', daysAgo: 12,
    prefs: (p) => { p.cinema = true; p.digital = true; p.timings.d3 = true; p.timings.day = true; } },
  { id: 'm-quietcoast', status: 'planned', daysAgo: 30, prefs: (p) => { p.dateChange = true; p.cinema = true; p.timings.d7 = true; } },
  { id: 't-meridian', status: 'watching', rating: 4, daysAgo: 60 },
  { id: 'a-moonblade', status: 'watching', daysAgo: 20 },
  { id: 'm-highwater', status: 'planned', daysAgo: 4 },
  { id: 't-brigade', status: 'completed', rating: 5, note: 'Rewatch S2 before S3.', daysAgo: 300,
    prefs: (p) => { p.newSeason = true; p.timings.d7 = true; p.timings.day = true; } },
  { id: 'm-ironbloom', status: 'completed', rating: 3, daysAgo: 70 },
  { id: 'm-overture', status: 'planned', daysAgo: 8 },
  { id: 'd-deepline', status: 'planned', daysAgo: 15 },
  { id: 'd-lastglacier', status: 'planned', daysAgo: 6 },
  { id: 'a-titandrive', status: 'dropped', rating: 2, note: 'Lost me in season 1.', daysAgo: 200 },
  { id: 't-coldharbor', status: 'watching', daysAgo: 30 },
];

/** Watch everything aired in these seasons, plus the first N episodes of the next. */
const progress: { id: string; fullSeasons: number[]; partial?: [number, number] }[] = [
  { id: 'a-kitsune', fullSeasons: [1], partial: [2, 1] },
  { id: 't-ledger', fullSeasons: [1], partial: [2, 2] },
  { id: 't-meridian', fullSeasons: [1], partial: [2, 1] },
  { id: 'a-moonblade', fullSeasons: [], partial: [1, 4] },
  { id: 't-brigade', fullSeasons: [1, 2] },
  { id: 't-coldharbor', fullSeasons: [], partial: [1, 3] },
  { id: 'a-titandrive', fullSeasons: [], partial: [1, 5] },
];

export function buildDemoState() {
  const now = Date.now();
  const watchlist: Record<string, WatchlistItem> = {};
  for (const s of seeds) {
    const prefs = defaultPrefs();
    s.prefs?.(prefs);
    watchlist[s.id] = {
      titleId: s.id,
      status: s.status,
      rating: s.rating ?? null,
      note: s.note ?? '',
      addedAt: new Date(now - s.daysAgo * 86_400_000).toISOString(),
      prefs,
    };
  }

  const watched: Record<string, true> = {};
  const aired = (d: string | null) => !!d && new Date(`${d}T00:00:00`).getTime() <= now;
  for (const p of progress) {
    const t = catalog.find((x) => x.id === p.id);
    t?.seasons?.forEach((season) => {
      season.episodes.forEach((e) => {
        if (!aired(e.airDate)) return;
        if (p.fullSeasons.includes(season.number)) watched[e.id] = true;
        if (p.partial && p.partial[0] === season.number && e.number <= p.partial[1]) watched[e.id] = true;
      });
    });
  }

  const created = new Date(now - 10 * 86_400_000).toISOString();
  const collections: Collection[] = [
    { id: 'c-demo-weekend', name: 'Weekend movie night', titleIds: ['m-halcyon', 'm-highwater', 'm-overture', 'm-ironbloom'], createdAt: created },
    { id: 'c-demo-anime', name: 'Anime backlog', titleIds: ['a-kitsune', 'a-moonblade', 'a-titandrive'], createdAt: created },
    { id: 'c-demo-docs', name: 'Docs to watch', titleIds: ['d-deepline', 'd-lastglacier'], createdAt: created },
  ];

  // History: alerts these prefs would already have delivered for recent sample releases.
  const inbox: InboxNotification[] = releaseEvents
    .filter((e) => watchlist[e.titleId] && (e.kind === 'episode' || e.kind === 'season_premiere') && e.status === 'released')
    .filter((e) => watchlist[e.titleId].prefs.newEpisode)
    .filter((e) => now - at9(e.date) < 21 * 86_400_000)
    .map((e) => {
      const t = catalog.find((x) => x.id === e.titleId)!;
      return {
        key: `${e.id}:demo`,
        titleId: e.titleId,
        eventId: e.id,
        message: `${t.name}: ${e.label.split(' · ')[0]} is out now`,
        deliveredAt: new Date(at9(e.date)).toISOString(),
        read: now - at9(e.date) > 4 * 86_400_000,
      };
    })
    .sort((a, b) => b.deliveredAt.localeCompare(a.deliveredAt));

  return { watchlist, watched, collections, inbox };
}
