// Run with: npm test  (Node's built-in test runner + native TypeScript stripping)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applyQuietHours,
  buildSchedule,
  defaultPrefs,
  deliverDue,
  detectImmediate,
} from '../src/lib/alerts.ts';
import type { ReleaseEvent, Title, WatchlistItem } from '../src/types.ts';

const NOW = new Date('2026-11-06T12:00:00');
const day = (n: number) => new Date(NOW.getTime() + n * 86_400_000).toISOString().slice(0, 10);

const movie: Title = {
  id: 'm1', type: 'movie', name: 'Test Movie', year: 2026, genres: [], overview: '', score: 0,
  colors: ['#000', '#000'], cast: [], trending: 0, similar: [], availability: {},
};
const ev = (over: Partial<ReleaseEvent> = {}): ReleaseEvent => ({
  id: 'e1', titleId: 'm1', kind: 'cinema', date: day(10), status: 'confirmed', country: 'US',
  label: 'In cinemas', source: 'test', verifiedAt: NOW.toISOString(), ...over,
});
const item = (mut?: (i: WatchlistItem) => void): Record<string, WatchlistItem> => {
  const i: WatchlistItem = { titleId: 'm1', status: 'planned', rating: null, note: '', addedAt: NOW.toISOString(), prefs: defaultPrefs() };
  mut?.(i);
  return { m1: i };
};
const noQuiet = { enabled: false, start: 22, end: 8 };

test('every preference defaults to false', () => {
  const p = defaultPrefs();
  const flat = [p.cinema, p.digital, p.streaming, p.dateChange, p.newSeason, p.newEpisode,
    p.episodeReminder, p.scheduleChange, p.finale, ...Object.values(p.timings)];
  assert.ok(flat.every((v) => v === false));
});

test('saving a title alone schedules nothing', () => {
  assert.equal(buildSchedule(item(), [ev()], [movie], noQuiet, NOW).length, 0);
  assert.equal(detectImmediate(item(), [ev({ date: day(0) })], [movie], NOW).length, 0);
});

test('enabled event + timing schedules exactly that reminder', () => {
  const wl = item((i) => { i.prefs.cinema = true; i.prefs.timings.d3 = true; });
  const s = buildSchedule(wl, [ev(), ev({ id: 'e2', kind: 'digital' })], [movie], noQuiet, NOW);
  assert.equal(s.length, 1);
  assert.equal(s[0].eventId, 'e1');
  assert.equal(s[0].timing, 'd3');
});

test('unverified and cancelled dates never schedule reminders', () => {
  const wl = item((i) => { i.prefs.streaming = true; i.prefs.timings.d1 = true; });
  const s = buildSchedule(wl, [ev({ kind: 'streaming', status: 'unverified' }), ev({ id: 'e3', kind: 'streaming', status: 'cancelled' })], [movie], noQuiet, NOW);
  assert.equal(s.length, 0);
});

test('preferences are re-checked at delivery; disabling cancels pending', () => {
  const wl = item((i) => { i.prefs.cinema = true; i.prefs.timings.day = true; });
  const events = [ev({ date: day(0) })];
  const candidates = buildSchedule(wl, events, [movie], noQuiet, new Date(NOW.getTime() - 86_400_000));
  assert.equal(candidates.length, 1);
  wl.m1.prefs.cinema = false; // user turns it off before send time
  assert.equal(deliverDue(candidates, wl, events, new Set(), NOW).length, 0);
});

test('delivery is deduplicated', () => {
  const wl = item((i) => { i.prefs.cinema = true; i.prefs.timings.day = true; });
  const events = [ev({ date: day(0) })];
  const candidates = buildSchedule(wl, events, [movie], noQuiet, new Date(NOW.getTime() - 86_400_000));
  const sent = new Set<string>();
  assert.equal(deliverDue(candidates, wl, events, sent, NOW).length, 1);
  assert.equal(deliverDue(candidates, wl, events, sent, NOW).length, 0);
});

test('removing a title from the watchlist cancels its alerts', () => {
  const wl = item((i) => { i.prefs.cinema = true; i.prefs.timings.day = true; });
  const events = [ev({ date: day(0) })];
  const candidates = buildSchedule(wl, events, [movie], noQuiet, new Date(NOW.getTime() - 86_400_000));
  assert.equal(deliverDue(candidates, {}, events, new Set(), NOW).length, 0);
});

test('quiet hours push delivery to the end of the window', () => {
  const q = { enabled: true, start: 22, end: 8 };
  const late = new Date('2026-11-06T23:30:00');
  const out = applyQuietHours(late, q);
  assert.equal(out.getHours(), 8);
  assert.equal(out.getDate(), 7);
  const noon = new Date('2026-11-06T12:00:00');
  assert.equal(applyQuietHours(noon, q).getTime(), noon.getTime());
});

test('date-change alerts need the dateChange preference', () => {
  const moved = ev({ previousDate: day(5) });
  assert.equal(detectImmediate(item(), [moved], [movie], NOW).length, 0);
  const wl = item((i) => { i.prefs.dateChange = true; });
  assert.equal(detectImmediate(wl, [moved], [movie], NOW).length, 1);
});

test('notification text never includes episode names', () => {
  const show: Title = { ...movie, id: 's1', name: 'Show', seasons: [] };
  const e = ev({ id: 'ep', titleId: 's1', kind: 'episode', label: 'S1E2 · Secret Twist', episodeId: 's1-s1e2', date: day(3) });
  const wl = { s1: { ...item().m1, titleId: 's1', prefs: { ...defaultPrefs(), newEpisode: true, timings: { ...defaultPrefs().timings, d1: true } } } };
  const s = buildSchedule(wl, [e], [show], noQuiet, NOW);
  assert.equal(s.length, 1);
  assert.ok(!s[0].message.includes('Secret Twist'));
  assert.match(s[0].message, /S1E2/);
});
