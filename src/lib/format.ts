const DAY = 86_400_000;

export function daysUntil(isoDate: string, now = new Date()): number {
  const d = new Date(`${isoDate}T00:00:00`);
  const t = new Date(now);
  t.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - t.getTime()) / DAY);
}

export function countdownLabel(isoDate: string): string {
  const n = daysUntil(isoDate);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n < 0) return `${-n} days ago`;
  if (n < 7) return `In ${n} days`;
  if (n < 60) return `In ${Math.round(n / 7)} wk`;
  return `In ${Math.round(n / 30)} mo`;
}

export function prettyDate(isoDate: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  });
}

export function relativeTime(isoDateTime: string): string {
  const mins = Math.round((Date.now() - new Date(isoDateTime).getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

export const typeLabel = { movie: 'Movie', tv: 'Series', anime: 'Anime', documentary: 'Documentary' } as const;

export const kindLabel = {
  cinema: 'Cinema',
  digital: 'Digital',
  streaming: 'Streaming',
  season_premiere: 'Premiere',
  episode: 'Episode',
  finale: 'Finale',
} as const;

/** YYYY-MM-DD in the device's local timezone (toISOString would use UTC). */
export function localISO(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
