import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { catalog, eventsInCountry } from './data/catalog';
import { buildSchedule, defaultPrefs, deliverDue, detectImmediate } from './lib/alerts';
import { buildDemoState } from './data/demo';
import type {
  AlertPrefs,
  Collection,
  InboxNotification,
  QuietHours,
  WatchStatus,
  WatchlistItem,
} from './types';

interface User {
  name: string;
  email: string;
}

interface State {
  hydrated: boolean;
  onboarded: boolean;
  user: User | null;
  country: string;
  quietHours: QuietHours;
  spoilerProtection: boolean;
  pushEnabled: boolean;
  watchlist: Record<string, WatchlistItem>;
  collections: Collection[];
  watched: Record<string, true>;
  inbox: InboxNotification[];
  deliveredKeys: string[];
  lastCheck: string | null;

  finishOnboarding: () => void;
  signIn: (u: User) => void;
  signOut: () => void;
  setCountry: (c: string) => void;
  setQuietHours: (q: Partial<QuietHours>) => void;
  setSpoilerProtection: (v: boolean) => void;
  setPushEnabled: (v: boolean) => void;

  addTitle: (id: string) => void;
  removeTitle: (id: string) => void;
  setStatus: (id: string, s: WatchStatus) => void;
  setRating: (id: string, r: number | null) => void;
  setNote: (id: string, n: string) => void;
  setPref: (id: string, key: Exclude<keyof AlertPrefs, 'timings'>, v: boolean) => void;
  setTiming: (id: string, key: keyof AlertPrefs['timings'], v: boolean) => void;
  disableAllAlerts: (id: string) => void;

  createCollection: (name: string) => string;
  deleteCollection: (cid: string) => void;
  toggleInCollection: (cid: string, titleId: string) => void;

  toggleWatched: (episodeId: string) => void;
  markSeason: (episodeIds: string[], watched: boolean) => void;

  runReleaseCheck: () => number;
  markAllRead: () => void;
  markRead: (key: string) => void;
  clearInbox: () => void;
  resetAll: () => void;
  loadDemoData: () => number;
}

const initial = {
  onboarded: false,
  user: null,
  country: 'US',
  quietHours: { enabled: true, start: 22, end: 8 },
  spoilerProtection: true,
  pushEnabled: false,
  watchlist: {},
  collections: [],
  watched: {},
  inbox: [],
  deliveredKeys: [],
  lastCheck: null,
};

const patchItem = (
  s: State,
  id: string,
  fn: (i: WatchlistItem) => WatchlistItem,
): Partial<State> => {
  const item = s.watchlist[id];
  if (!item) return {};
  return { watchlist: { ...s.watchlist, [id]: fn(item) } };
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      hydrated: false,

      finishOnboarding: () => set({ onboarded: true }),
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      setCountry: (country) => set({ country }),
      setQuietHours: (q) => set((s) => ({ quietHours: { ...s.quietHours, ...q } })),
      setSpoilerProtection: (spoilerProtection) => set({ spoilerProtection }),
      setPushEnabled: (pushEnabled) => set({ pushEnabled }),

      addTitle: (id) =>
        set((s) =>
          s.watchlist[id]
            ? {} // prevent duplicates
            : {
                watchlist: {
                  ...s.watchlist,
                  [id]: {
                    titleId: id,
                    status: 'planned',
                    rating: null,
                    note: '',
                    addedAt: new Date().toISOString(),
                    prefs: defaultPrefs(), // every alert OFF by default
                  },
                },
              },
        ),
      removeTitle: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.watchlist;
          return {
            watchlist: rest,
            collections: s.collections.map((c) => ({
              ...c,
              titleIds: c.titleIds.filter((t) => t !== id),
            })),
          };
        }),
      setStatus: (id, status) => set((s) => patchItem(s, id, (i) => ({ ...i, status }))),
      setRating: (id, rating) => set((s) => patchItem(s, id, (i) => ({ ...i, rating }))),
      setNote: (id, note) => set((s) => patchItem(s, id, (i) => ({ ...i, note }))),
      setPref: (id, key, v) =>
        set((s) => patchItem(s, id, (i) => ({ ...i, prefs: { ...i.prefs, [key]: v } }))),
      setTiming: (id, key, v) =>
        set((s) =>
          patchItem(s, id, (i) => ({
            ...i,
            prefs: { ...i.prefs, timings: { ...i.prefs.timings, [key]: v } },
          })),
        ),
      disableAllAlerts: (id) => set((s) => patchItem(s, id, (i) => ({ ...i, prefs: defaultPrefs() }))),

      createCollection: (name) => {
        const id = `c-${Date.now()}`;
        set((s) => ({
          collections: [
            ...s.collections,
            { id, name: name.trim(), titleIds: [], createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },
      deleteCollection: (cid) => set((s) => ({ collections: s.collections.filter((c) => c.id !== cid) })),
      toggleInCollection: (cid, titleId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id !== cid
              ? c
              : {
                  ...c,
                  titleIds: c.titleIds.includes(titleId)
                    ? c.titleIds.filter((t) => t !== titleId)
                    : [...c.titleIds, titleId],
                },
          ),
        })),

      toggleWatched: (episodeId) =>
        set((s) => {
          const watched = { ...s.watched };
          if (watched[episodeId]) delete watched[episodeId];
          else watched[episodeId] = true;
          return { watched };
        }),
      markSeason: (ids, value) =>
        set((s) => {
          const watched = { ...s.watched };
          ids.forEach((id) => (value ? (watched[id] = true) : delete watched[id]));
          return { watched };
        }),

      runReleaseCheck: () => {
        const s = get();
        const now = new Date();
        const releaseEvents = eventsInCountry(s.country);
        const schedule = buildSchedule(s.watchlist, releaseEvents, catalog, s.quietHours, now);
        const immediate = detectImmediate(s.watchlist, releaseEvents, catalog, now);
        const keys = new Set(s.deliveredKeys);
        const fresh = deliverDue([...immediate, ...schedule], s.watchlist, releaseEvents, keys, now);
        set({
          inbox: [...fresh, ...s.inbox],
          deliveredKeys: [...keys],
          lastCheck: now.toISOString(),
        });
        return fresh.length;
      },
      markAllRead: () => set((s) => ({ inbox: s.inbox.map((n) => ({ ...n, read: true })) })),
      markRead: (key) =>
        set((s) => ({ inbox: s.inbox.map((n) => (n.key === key ? { ...n, read: true } : n)) })),
      clearInbox: () => set({ inbox: [] }),
      resetAll: () => set({ ...initial }),
      loadDemoData: () => {
        // Replaces the watchlist, progress and collections; keeps account and settings.
        const demo = buildDemoState();
        set({ ...demo, deliveredKeys: demo.inbox.map((n) => n.key), lastCheck: null });
        return get().runReleaseCheck();
      },
    }),
    {
      name: 'released-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _h, ...rest }) => rest,
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    },
  ),
);
