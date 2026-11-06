import type { Episode, Title } from '../types';

const aired = (e: Episode, now = new Date()) =>
  !!e.airDate && new Date(`${e.airDate}T00:00:00`) <= now;

export function seriesProgress(t: Title, watched: Record<string, true>) {
  const eps = (t.seasons ?? []).flatMap((s) => s.episodes).filter((e) => aired(e));
  const w = eps.filter((e) => watched[e.id]).length;
  return { watched: w, total: eps.length, ratio: eps.length ? w / eps.length : 0 };
}

export function seasonProgress(episodes: Episode[], watched: Record<string, true>) {
  const eps = episodes.filter((e) => aired(e));
  const w = eps.filter((e) => watched[e.id]).length;
  return { watched: w, total: eps.length, complete: eps.length > 0 && w === eps.length };
}

/** First aired episode, in order, that the user hasn't watched. */
export function nextUnwatched(t: Title, watched: Record<string, true>): Episode | null {
  for (const s of t.seasons ?? []) for (const e of s.episodes) if (aired(e) && !watched[e.id]) return e;
  return null;
}
