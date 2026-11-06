/**
 * SAMPLE DATA — fictional titles, people and providers for the prototype only.
 * In the full build this comes from the shared content catalog (TMDB-backed)
 * via Supabase. Dates are generated relative to "today" so the calendar
 * and alerts always have something to show.
 */
import type { Availability, Episode, Offer, ReleaseEvent, Season, Title } from '../types';
import { localISO } from '../lib/format';

const DAY = 86_400_000;
const today = new Date();
today.setHours(0, 0, 0, 0);

export const iso = (offsetDays: number) =>
  localISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() + offsetDays));

const verified = new Date(today.getTime() - 2 * 3_600_000).toISOString();
const SRC = 'Sample data';

/* ---------- helpers ---------- */

const EP_NAMES = [
  'Arrival', 'The Signal', 'Undertow', 'Glass Hours', 'Northbound', 'Ashes', 'The Long Night',
  'Static', 'Reunion', 'Lanterns', 'The Divide', 'Afterglow', 'Paper Trail', 'Low Tide',
  'Second Sight', 'Embers', 'Crossing', 'Fault Lines', 'Homecoming', 'First Light',
];

const avail = (offers: Offer[], hoursAgo = 6): Availability => ({
  updatedAt: new Date(Date.now() - hoursAgo * 3_600_000).toISOString(),
  source: SRC,
  offers,
});

const sub = (provider: string, quality?: string): Offer => ({ provider, kind: 'subscription', quality });
const rent = (provider: string, price: string): Offer => ({ provider, kind: 'rent', price });
const buy = (provider: string, price: string): Offer => ({ provider, kind: 'buy', price });
const cinema: Offer = { provider: 'Cinemas', kind: 'cinema' };

type Req = Pick<Title, 'id' | 'type' | 'name' | 'year' | 'genres' | 'overview' | 'colors'>;
const mk = (p: Req & Partial<Title>): Title => ({ score: 0, cast: [], trending: 0, similar: [], availability: {}, ...p });

/* ---------- catalog ---------- */

export const catalog: Title[] = [
  // ----- Movies -----
  mk({
    id: 'm-halcyon', type: 'movie', name: 'Halcyon Drift', year: 2026, genres: ['Sci-Fi', 'Drama'], runtime: 138, score: 8.1, trending: 9,
    overview: 'A salvage pilot drifting at the edge of the solar system picks up a signal that should not exist.',
    colors: ['#3B1F6B', '#0B1430'],
    cast: [{ name: 'Mara Ellison', role: 'Juno Vale' }, { name: 'Teo Okafor', role: 'Dr. Ines Ruiz' }, { name: 'Sun-Hee Park', role: 'ARC (voice)' }],
    similar: ['m-ironbloom', 'm-lastorbit', 'd-deepline'],
    availability: { US: avail([cinema]), GB: avail([cinema], 30), IN: avail([cinema], 12), PK: avail([cinema], 20) },
  }),
  mk({
    id: 'm-ironbloom', type: 'movie', name: 'Iron Bloom', year: 2026, genres: ['Action', 'Thriller'], runtime: 121, score: 7.4, trending: 7,
    overview: 'A retired fixer is pulled back for one last job in a city run by automated syndicates.',
    colors: ['#6B1F2A', '#160A0D'],
    cast: [{ name: 'Rook Adeyemi', role: 'Cass' }, { name: 'Elena Marsh', role: 'Director Vey' }],
    similar: ['m-halcyon', 'm-paperkings', 'm-highwater'],
    availability: {
      US: avail([sub('StreamBox', '4K'), rent('FilmStore', '$5.99'), buy('FilmStore', '$19.99')]),
      GB: avail([rent('FilmStore', '£4.99'), buy('FilmStore', '£13.99')], 18),
      IN: avail([rent('FilmStore', '₹149')], 40),
    },
  }),
  mk({
    id: 'm-quietcoast', type: 'movie', name: 'The Quiet Coast', year: 2027, genres: ['Drama', 'Romance'], runtime: 112, trending: 4,
    overview: 'Two lighthouse keepers exchange letters across a sea that is slowly swallowing the coast.',
    colors: ['#1F4E5F', '#081419'],
    cast: [{ name: 'Lena Varga', role: 'Edith' }, { name: 'Tomas Reyes', role: 'Aurelio' }],
    similar: ['m-velvethour', 'd-deepline', 'm-overture'],
  }),
  mk({
    id: 'm-paperkings', type: 'movie', name: 'Paper Kings', year: 2026, genres: ['Crime', 'Drama'], runtime: 131, score: 7.8, trending: 6,
    overview: 'Three cousins run a counterfeiting ring out of a print shop, until one of them starts keeping a ledger.',
    colors: ['#5C4A1F', '#14100A'],
    cast: [{ name: 'Dario Castell', role: 'Nico' }, { name: 'Amara Bello', role: 'Yemi' }],
    similar: ['m-ironbloom', 't-ledger', 't-coldharbor'],
    availability: {
      US: avail([rent('FilmStore', '$5.99'), buy('FilmStore', '$17.99')]),
      GB: avail([cinema], 10),
      IN: avail([rent('FilmStore', '₹199')], 22),
    },
  }),
  mk({
    id: 'm-velvethour', type: 'movie', name: 'Velvet Hour', year: 2026, genres: ['Romance', 'Thriller'], runtime: 104, score: 6.9, trending: 3,
    overview: 'A jazz pianist falls for the stranger who requests the same song every night at 2 a.m.',
    colors: ['#6B1F4E', '#170814'],
    cast: [{ name: 'Celine Duvall', role: 'Margot' }, { name: 'Ray Okonkwo', role: 'The Stranger' }],
    similar: ['m-quietcoast', 'm-overture'],
    availability: { US: avail([cinema]) },
  }),
  mk({
    id: 'm-lastorbit', type: 'movie', name: 'Last Orbit', year: 2027, genres: ['Sci-Fi', 'Adventure'], trending: 8,
    overview: 'The final crew of a decommissioned station refuses to come home.',
    colors: ['#1F2F6B', '#060A1A'],
    cast: [{ name: 'Mara Ellison', role: 'Commander Shaw' }],
    similar: ['m-halcyon', 't-meridian'],
  }),
  mk({
    id: 'm-highwater', type: 'movie', name: 'High Water', year: 2026, genres: ['Action', 'Disaster'], runtime: 117, trending: 7,
    overview: 'When the river breaks its banks, a ferry captain has one night to get a town across.',
    colors: ['#1F5C6B', '#061417'],
    cast: [{ name: 'Gareth Booth', role: 'Captain Lyle' }, { name: 'Noor Haddad', role: 'Dr. Samira Aziz' }],
    similar: ['m-ironbloom', 'm-halcyon'],
    availability: { US: avail([cinema]), GB: avail([cinema], 8), IN: avail([cinema], 8) },
  }),
  mk({
    id: 'm-glassgarden', type: 'movie', name: 'The Glass Garden', year: 2026, genres: ['Fantasy', 'Family'], runtime: 98, trending: 5,
    overview: 'A girl discovers her grandmother’s greenhouse grows memories instead of flowers.',
    colors: ['#2F6B3B', '#08170C'],
    cast: [{ name: 'Ivy Chen', role: 'Wren' }, { name: 'Margaret Doyle', role: 'Grandma Iris' }],
    similar: ['a-spiritpost', 'm-quietcoast'],
  }),
  mk({
    id: 'm-nightshift', type: 'movie', name: 'Night Shift', year: 2026, genres: ['Horror'], runtime: 94, trending: 6,
    overview: 'The overnight staff of a hospital notice the same patient being admitted every night.',
    colors: ['#3A3A44', '#0A0A0E'],
    cast: [{ name: 'Petra Lind', role: 'Nurse Hale' }],
    similar: ['t-houseofkeys', 'm-velvethour'],
  }),
  mk({
    id: 'm-overture', type: 'movie', name: 'Overture', year: 2026, genres: ['Drama', 'Music'], runtime: 126, score: 8.4, trending: 5,
    overview: 'A conductor losing her hearing prepares one final performance.',
    colors: ['#6B5A1F', '#171307'],
    cast: [{ name: 'Helena Brandt', role: 'Clara Weiss' }],
    similar: ['m-velvethour', 'm-quietcoast'],
    availability: { US: avail([cinema]), DE: avail([cinema], 26), GB: avail([cinema], 26) },
  }),
  mk({
    id: 'm-longrunner', type: 'movie', name: 'The Long Runner', year: 2026, genres: ['Sports', 'Drama'], runtime: 115, trending: 2,
    overview: 'A marathoner from a mountain village trains for the race her father never finished.',
    colors: ['#6B3A1F', '#170C06'],
    similar: ['m-overture'],
  }),

  // ----- Series -----
  mk({
    id: 't-ledger', type: 'tv', name: 'The Ledger', year: 2024, genres: ['Crime', 'Drama'], score: 8.6, trending: 8,
    overview: 'An accountant discovers her firm launders money for half the city council.',
    colors: ['#24402F', '#0A120D'],
    cast: [{ name: 'Priya Natarajan', role: 'Nell Hart' }, { name: 'Owen Blake', role: 'Marcus Reyes' }],
    similar: ['t-saltroad', 't-coldharbor', 'm-paperkings'],
    availability: { US: avail([sub('StreamBox', 'HD')]), CA: avail([sub('NorthPlay')], 50), GB: avail([sub('StreamBox')], 12), IN: avail([sub('StreamBox')], 12) },
  }),
  mk({
    id: 't-saltroad', type: 'tv', name: 'Salt Road', year: 2025, genres: ['Western', 'Mystery'], score: 7.9, trending: 6,
    overview: 'A frontier marshal tracks a caravan that vanished on the salt flats.',
    colors: ['#6B4A1F', '#170F06'],
    cast: [{ name: 'Daniel Moss', role: 'Marshal Crane' }],
    similar: ['t-ledger', 't-ironcrown'],
    availability: { US: avail([sub('Vista+')]), AU: avail([sub('Vista+')], 30) },
  }),
  mk({
    id: 't-meridian', type: 'tv', name: 'Meridian', year: 2025, genres: ['Sci-Fi', 'Drama'], score: 8.3, trending: 9,
    overview: 'A generation ship’s crew wakes early and finds the captain’s log has been rewritten.',
    colors: ['#1F4A6B', '#06111A'],
    cast: [{ name: 'Kofi Mensah', role: 'Engineer Dax' }, { name: 'Ingrid Sol', role: 'Captain Arvid' }],
    similar: ['m-lastorbit', 'm-halcyon', 'a-titandrive'],
    availability: { US: avail([sub('Orbit TV', '4K')]), GB: avail([sub('Orbit TV', '4K')], 4), DE: avail([sub('Orbit TV')], 4), PK: avail([sub('Orbit TV')], 4) },
  }),
  mk({
    id: 't-houseofkeys', type: 'tv', name: 'House of Keys', year: 2024, genres: ['Mystery', 'Thriller'], score: 8.0, trending: 4,
    overview: 'A locksmith inherits a mansion where every door opens somewhere different.',
    colors: ['#4A1F6B', '#10061A'],
    cast: [{ name: 'Alma Reyes', role: 'Bea Locke' }],
    similar: ['m-nightshift', 't-ledger'],
    availability: { US: avail([sub('Reelhouse')]), GB: avail([sub('Reelhouse')], 9) },
  }),
  mk({
    id: 't-coldharbor', type: 'tv', name: 'Cold Harbor', year: 2026, genres: ['Crime', 'Drama'], score: 7.7, trending: 7,
    overview: 'A detective returns to her fishing town to reopen the case that drove her away.',
    colors: ['#1F3A4A', '#060D11'],
    cast: [{ name: 'Siobhan Kerr', role: 'DI Maeve Doran' }],
    similar: ['t-ledger', 'm-paperkings'],
    availability: { GB: avail([sub('Reelhouse')], 3), US: avail([sub('Reelhouse')], 3), AU: avail([sub('Reelhouse')], 3) },
  }),
  mk({
    id: 't-brigade', type: 'tv', name: 'Brigade', year: 2023, genres: ['Comedy', 'Drama'], score: 8.5, trending: 6,
    overview: 'A chaotic family restaurant tries to win back its lost star, one service at a time.',
    colors: ['#6B2F1F', '#170A06'],
    cast: [{ name: 'Joey Amato', role: 'Chef Rocco' }, { name: 'Dana Whitfield', role: 'Lou' }],
    similar: ['a-cafelumiere', 'd-nightmarkets'],
    availability: { US: avail([sub('StreamBox')]), CA: avail([sub('NorthPlay')], 20), IN: avail([sub('StreamBox')], 20) },
  }),
  mk({
    id: 't-ironcrown', type: 'tv', name: 'Iron Crown', year: 2025, genres: ['Fantasy', 'Drama'], score: 8.1, trending: 7,
    overview: 'Five rival houses, one cursed throne, and a winter that will not end.',
    colors: ['#4A3A1F', '#110D06'],
    cast: [{ name: 'Edmund Gray', role: 'Lord Aldric' }, { name: 'Yara Sabri', role: 'Queen Selene' }],
    similar: ['t-saltroad', 'a-moonblade'],
    availability: { US: avail([sub('Vista+', '4K')]), GB: avail([sub('Vista+', '4K')], 7), DE: avail([sub('Vista+')], 7) },
  }),

  // ----- Anime -----
  mk({
    id: 'a-kitsune', type: 'anime', name: 'Kitsune Protocol', year: 2025, genres: ['Anime', 'Action', 'Sci-Fi'], score: 8.8, trending: 10,
    overview: 'A hacker bonded to a fox spirit fights a corporate AI inside a neon Kyoto.',
    colors: ['#7A1F5C', '#12061A'],
    cast: [{ name: 'Aoi Tanaka', role: 'Rei (voice)' }, { name: 'Kenji Mori', role: 'Hoshi (voice)' }],
    similar: ['a-starforge', 'a-moonblade', 'a-titandrive'],
    availability: { US: avail([sub('AnimeHub', 'HD')], 2), JP: avail([sub('AnimeHub')], 2), IN: avail([sub('AnimeHub')], 2), PK: avail([sub('AnimeHub')], 2), GB: avail([sub('AnimeHub')], 2) },
  }),
  mk({
    id: 'a-starforge', type: 'anime', name: 'Starforge Academy', year: 2026, genres: ['Anime', 'Fantasy'], score: 7.6, trending: 5,
    overview: 'Students at a floating academy learn to forge weapons from fallen stars.',
    colors: ['#1F3A7A', '#060B1A'],
    cast: [{ name: 'Hana Mori', role: 'Sora (voice)' }],
    similar: ['a-kitsune', 'a-moonblade'],
  }),
  mk({
    id: 'a-moonblade', type: 'anime', name: 'Moonblade', year: 2026, genres: ['Anime', 'Action', 'Fantasy'], score: 8.4, trending: 9,
    overview: 'A swordsman who can only fight under moonlight hunts the demon that stole his shadow.',
    colors: ['#2A1F6B', '#08061A'],
    cast: [{ name: 'Ryo Takeda', role: 'Kaito (voice)' }],
    similar: ['a-kitsune', 't-ironcrown'],
    availability: { US: avail([sub('AnimeHub')], 1), JP: avail([sub('AnimeHub')], 1), IN: avail([sub('AnimeHub')], 1), PK: avail([sub('AnimeHub')], 1) },
  }),
  mk({
    id: 'a-cafelumiere', type: 'anime', name: 'Café Lumière', year: 2026, genres: ['Anime', 'Slice of Life'], trending: 4,
    overview: 'A tiny café on a rainy street where every customer leaves with exactly what they needed.',
    colors: ['#6B4A3A', '#170F0C'],
    similar: ['t-brigade', 'a-spiritpost'],
  }),
  mk({
    id: 'a-titandrive', type: 'anime', name: 'Titan Drive', year: 2024, genres: ['Anime', 'Mecha', 'Sci-Fi'], score: 8.2, trending: 6,
    overview: 'Teen pilots link minds with colossal machines to hold the last city wall.',
    colors: ['#6B1F1F', '#170606'],
    similar: ['a-kitsune', 't-meridian'],
    availability: { US: avail([sub('AnimeHub')], 5), JP: avail([sub('AnimeHub')], 5), DE: avail([sub('AnimeHub')], 5) },
  }),
  mk({
    id: 'a-spiritpost', type: 'anime', name: 'Spirit Post Office', year: 2026, genres: ['Anime', 'Fantasy', 'Slice of Life'], score: 8.0, trending: 5,
    overview: 'A new mail carrier delivers letters between the living and the spirits of a seaside town.',
    colors: ['#1F6B5C', '#061714'],
    similar: ['a-cafelumiere', 'm-glassgarden'],
    availability: { US: avail([sub('AnimeHub')], 3), JP: avail([sub('AnimeHub')], 3) },
  }),

  // ----- Documentaries -----
  mk({
    id: 'd-deepline', type: 'documentary', name: 'Deepline', year: 2026, genres: ['Documentary', 'Nature'], runtime: 94, score: 8.3, trending: 3,
    overview: 'Divers descend into the deepest trench ever filmed, and find it full of light.',
    colors: ['#0E4D6B', '#03111A'],
    cast: [{ name: 'Narrated by Ruth Adler', role: 'Narrator' }],
    similar: ['d-lastglacier', 'm-quietcoast'],
    availability: { US: avail([rent('FilmStore', '$3.99'), buy('FilmStore', '$12.99')]), GB: avail([rent('FilmStore', '£3.49')], 14) },
  }),
  mk({
    id: 'd-silicontide', type: 'documentary', name: 'Silicon Tide', year: 2026, genres: ['Documentary', 'Technology'], runtime: 88, trending: 4,
    overview: 'Inside the race to build the chips that run everything, and the towns built around the factories.',
    colors: ['#1F6B4A', '#061711'],
    similar: ['d-deepline'],
  }),
  mk({
    id: 'd-lastglacier', type: 'documentary', name: 'The Last Glacier', year: 2026, genres: ['Documentary', 'Nature'], runtime: 101, score: 8.7, trending: 4,
    overview: 'A decade-long portrait of one glacier and the scientists who refused to stop measuring it.',
    colors: ['#3A5C6B', '#0C1417'],
    similar: ['d-deepline', 'd-wildroutes'],
    availability: { US: avail([cinema]) },
  }),
  mk({
    id: 'd-nightmarkets', type: 'documentary', name: 'Night Markets', year: 2026, genres: ['Documentary', 'Food'], runtime: 76, score: 8.0, trending: 3,
    overview: 'Six cities, six night markets, and the families who cook until sunrise.',
    colors: ['#6B3A4A', '#170C10'],
    similar: ['t-brigade'],
    availability: { US: avail([sub('Vista+')]), IN: avail([sub('Vista+')], 9), PK: avail([sub('Vista+')], 9), AU: avail([sub('Vista+')], 9) },
  }),
  mk({
    id: 'd-wildroutes', type: 'documentary', name: 'Wild Routes', year: 2027, genres: ['Documentary', 'Nature'], trending: 2,
    overview: 'Following five migrations across a single year, from the air, the sea and the ground.',
    colors: ['#4A6B1F', '#111706'],
    similar: ['d-lastglacier'],
  }),
];

/* ---------- seasons ---------- */

function makeSeason(titleId: string, season: number, count: number, firstAirOffset: number | null, weekly = true): Season {
  const episodes: Episode[] = Array.from({ length: count }, (_, i) => ({
    id: `${titleId}-s${season}e${i + 1}`,
    season,
    number: i + 1,
    name: EP_NAMES[(i * 3 + season * 5 + titleId.length) % EP_NAMES.length],
    airDate: firstAirOffset === null ? null : iso(firstAirOffset + (weekly ? i * 7 : 0)),
    runtime: 24 + ((i * 7 + titleId.length) % 35),
    overview: 'Episode synopsis hidden until you reach it when spoiler protection is on.',
  }));
  return { number: season, name: `Season ${season}`, episodes };
}

const seasons: Record<string, Season[]> = {
  't-ledger': [makeSeason('t-ledger', 1, 8, -420), makeSeason('t-ledger', 2, 8, -10)],
  't-saltroad': [makeSeason('t-saltroad', 1, 6, -200), makeSeason('t-saltroad', 2, 6, null)],
  't-meridian': [makeSeason('t-meridian', 1, 10, -380), makeSeason('t-meridian', 2, 10, -20)],
  't-houseofkeys': [makeSeason('t-houseofkeys', 1, 8, -500, false), makeSeason('t-houseofkeys', 2, 8, -150, false)],
  't-coldharbor': [makeSeason('t-coldharbor', 1, 6, -35)],
  't-brigade': [makeSeason('t-brigade', 1, 8, -800, false), makeSeason('t-brigade', 2, 8, -420, false), makeSeason('t-brigade', 3, 8, 12, false)],
  't-ironcrown': [makeSeason('t-ironcrown', 1, 9, -300), makeSeason('t-ironcrown', 2, 9, 95)],
  'a-kitsune': [makeSeason('a-kitsune', 1, 12, -120), makeSeason('a-kitsune', 2, 12, -15)],
  'a-starforge': [makeSeason('a-starforge', 1, 10, 9)],
  'a-moonblade': [makeSeason('a-moonblade', 1, 12, -49)],
  'a-cafelumiere': [makeSeason('a-cafelumiere', 1, 12, 3)],
  'a-titandrive': [makeSeason('a-titandrive', 1, 24, -300), makeSeason('a-titandrive', 2, 12, -6)],
  'a-spiritpost': [makeSeason('a-spiritpost', 1, 12, -70)],
};
catalog.forEach((t) => {
  if (seasons[t.id]) t.seasons = seasons[t.id];
});

/* ---------- release events ---------- */

function ev(
  titleId: string,
  kind: ReleaseEvent['kind'],
  offset: number,
  status: ReleaseEvent['status'],
  label: string,
  extra: Partial<ReleaseEvent> = {},
): ReleaseEvent {
  const country = extra.country ?? 'US';
  return {
    id: `${titleId}-${kind}-${country}-${offset}-${extra.episodeId ?? ''}`,
    titleId,
    kind,
    date: iso(offset),
    status,
    country,
    label,
    source: SRC,
    verifiedAt: verified,
    ...extra,
  };
}

/** Same release in several countries, each with its own day offset. */
const intl = (
  titleId: string,
  kind: ReleaseEvent['kind'],
  offsets: Record<string, number>,
  status: (offset: number) => ReleaseEvent['status'],
  label: string,
) => Object.entries(offsets).map(([country, o]) => ev(titleId, kind, o, status(o), label, { country }));

const byDate = (o: number): ReleaseEvent['status'] => (o < 0 ? 'released' : 'confirmed');

function episodeEvents(t: Title, seasonNumber: number): ReleaseEvent[] {
  const s = t.seasons?.find((x) => x.number === seasonNumber);
  if (!s) return [];
  return s.episodes
    .filter((e) => e.airDate)
    .map((e, i, arr) => {
      const offset = Math.round((new Date(`${e.airDate}T00:00:00`).getTime() - today.getTime()) / DAY);
      const isFinale = i === arr.length - 1 && arr.length > 1;
      return ev(
        t.id,
        isFinale ? 'finale' : i === 0 ? 'season_premiere' : 'episode',
        offset,
        offset < 0 ? 'released' : offset < 21 ? 'confirmed' : 'estimated',
        `S${s.number}E${e.number} · ${e.name}${isFinale ? ' (Season finale)' : ''}`,
        { episodeId: e.id, country: 'ALL' }, // streamed globally
      );
    });
}

const T = (id: string) => catalog.find((t) => t.id === id)!;

export const releaseEvents: ReleaseEvent[] = [
  // Movies — no digital date is inferred from a cinema date anywhere below.
  ...intl('m-halcyon', 'cinema', { US: 2, GB: 2, IN: 7, PK: 9 }, byDate, 'In cinemas'),
  ev('m-ironbloom', 'cinema', -60, 'released', 'In cinemas'),
  ev('m-ironbloom', 'digital', -12, 'released', 'Digital release'),
  ev('m-ironbloom', 'streaming', 5, 'confirmed', 'Streaming on StreamBox'),
  ...intl('m-ironbloom', 'digital', { GB: -5, IN: 14 }, byDate, 'Digital release'),
  ev('m-quietcoast', 'cinema', 74, 'delayed', 'In cinemas', { previousDate: iso(31) }),
  ...intl('m-paperkings', 'cinema', { US: -40, GB: -33, IN: -38 }, byDate, 'In cinemas'),
  ev('m-paperkings', 'digital', -5, 'released', 'Digital release'),
  ev('m-paperkings', 'streaming', 18, 'confirmed', 'Streaming on StreamBox'),
  ev('m-velvethour', 'cinema', -3, 'released', 'In cinemas'),
  ev('m-velvethour', 'digital', 4, 'confirmed', 'Digital release'),
  ev('m-lastorbit', 'cinema', 210, 'announced', 'In cinemas (announced)'),
  ...intl('m-highwater', 'cinema', { US: 9, GB: 9, IN: 16, AU: 23 }, byDate, 'In cinemas'),
  ev('m-glassgarden', 'cinema', 30, 'estimated', 'In cinemas (estimated)'),
  ev('m-nightshift', 'cinema', 23, 'confirmed', 'In cinemas'),
  ev('m-nightshift', 'streaming', 60, 'unverified', 'Streaming (reported, unverified)'),
  ...intl('m-overture', 'cinema', { US: -14, GB: -7, DE: -7 }, byDate, 'In cinemas'),
  ev('m-overture', 'digital', 31, 'estimated', 'Digital release (estimated)'),
  ev('m-longrunner', 'cinema', 45, 'cancelled', 'Theatrical release cancelled'),

  // Documentaries
  ev('d-deepline', 'digital', -3, 'released', 'Digital release'),
  ev('d-deepline', 'streaming', 26, 'unverified', 'Streaming (reported, unverified)'),
  ev('d-silicontide', 'streaming', 6, 'confirmed', 'Streaming on Vista+'),
  ev('d-lastglacier', 'cinema', -9, 'released', 'Limited cinema release'),
  ev('d-lastglacier', 'digital', 15, 'confirmed', 'Digital release'),
  ...intl('d-nightmarkets', 'streaming', { US: -2, IN: -2, PK: -2, AU: -1 }, byDate, 'Streaming on Vista+'),
  ev('d-wildroutes', 'cinema', 40, 'announced', 'Festival premiere (announced)'),

  // Seasons announced without dates / delayed
  ev('t-saltroad', 'season_premiere', 120, 'announced', 'Season 2 announced · date TBA', { country: 'ALL' }),
  ev('t-ironcrown', 'season_premiere', 95, 'delayed', 'S2E1 · Season 2 premiere', { country: 'ALL', previousDate: iso(60) }),

  // Episodes
  ...episodeEvents(T('t-ledger'), 2),
  ...episodeEvents(T('t-meridian'), 2),
  ...episodeEvents(T('t-coldharbor'), 1),
  ...episodeEvents(T('t-brigade'), 3),
  ...episodeEvents(T('a-kitsune'), 2),
  ...episodeEvents(T('a-starforge'), 1),
  ...episodeEvents(T('a-moonblade'), 1),
  ...episodeEvents(T('a-cafelumiere'), 1),
  ...episodeEvents(T('a-titandrive'), 2),
  ...episodeEvents(T('a-spiritpost'), 1),
];

export const getTitle = (id: string) => catalog.find((t) => t.id === id);
export const eventsFor = (titleId: string, country?: string) =>
  releaseEvents
    .filter((e) => e.titleId === titleId && (!country || e.country === 'ALL' || e.country === country))
    .sort((a, b) => a.date.localeCompare(b.date));

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'JP', name: 'Japan' },
  { code: 'DE', name: 'Germany' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'AU', name: 'Australia' },
];

/** Release events that apply to a region (its own dates plus global ones). */
export const eventsInCountry = (country: string) =>
  releaseEvents.filter((e) => e.country === 'ALL' || e.country === country);
