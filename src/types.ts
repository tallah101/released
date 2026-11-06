export type ContentType = 'movie' | 'tv' | 'anime' | 'documentary';

export type ReleaseStatus =
  | 'confirmed'
  | 'estimated'
  | 'announced'
  | 'delayed'
  | 'cancelled'
  | 'released'
  | 'unverified';

export type ReleaseKind =
  | 'cinema'
  | 'digital'
  | 'streaming'
  | 'season_premiere'
  | 'episode'
  | 'finale';

export interface ReleaseEvent {
  id: string;
  titleId: string;
  kind: ReleaseKind;
  date: string; // ISO date (YYYY-MM-DD)
  status: ReleaseStatus;
  country: string; // ISO 3166-1 alpha-2, or 'ALL'
  label: string;
  source: string;
  verifiedAt: string;
  previousDate?: string; // set when the date changed
  episodeId?: string;
}

export interface Episode {
  id: string;
  season: number;
  number: number;
  name: string;
  airDate: string | null;
  runtime: number;
  overview: string;
}

export interface Season {
  number: number;
  name: string;
  episodes: Episode[];
}

export type OfferKind = 'subscription' | 'rent' | 'buy' | 'cinema';

export interface Offer {
  provider: string;
  kind: OfferKind;
  price?: string;
  quality?: string;
}

export interface Availability {
  updatedAt: string;
  source: string;
  offers: Offer[];
}

export interface Title {
  id: string;
  type: ContentType;
  name: string;
  year: number;
  genres: string[];
  overview: string;
  runtime?: number;
  score: number;
  colors: [string, string];
  cast: { name: string; role: string }[];
  trending: number; // 0 = not trending, higher = more
  similar: string[];
  seasons?: Season[];
  availability: Record<string, Availability>;
}

export type WatchStatus = 'planned' | 'watching' | 'completed' | 'dropped';

export interface AlertPrefs {
  // movies
  cinema: boolean;
  digital: boolean;
  streaming: boolean;
  dateChange: boolean;
  // shows
  newSeason: boolean;
  newEpisode: boolean;
  episodeReminder: boolean;
  scheduleChange: boolean;
  finale: boolean;
  // timings
  timings: { d7: boolean; d3: boolean; d1: boolean; day: boolean; immediate: boolean };
}

export interface WatchlistItem {
  titleId: string;
  status: WatchStatus;
  rating: number | null;
  note: string;
  addedAt: string;
  prefs: AlertPrefs;
}

export interface Collection {
  id: string;
  name: string;
  titleIds: string[];
  createdAt: string;
}

export interface QuietHours {
  enabled: boolean;
  start: number; // hour 0-23
  end: number; // hour 0-23
}

export interface ScheduledAlert {
  key: string; // dedupe key
  titleId: string;
  eventId: string;
  sendAt: string; // ISO datetime
  message: string;
  timing: keyof AlertPrefs['timings'];
}

export interface InboxNotification {
  key: string;
  titleId: string;
  eventId: string;
  message: string;
  deliveredAt: string;
  read: boolean;
}
