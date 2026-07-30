/** Asia/Makassar week identity — Monday 00:00 start */

export const APP_TIMEZONE = 'Asia/Makassar';

const MAKASSAR_OFFSET_MS = 8 * 60 * 60 * 1000;

/** Get calendar parts in Asia/Makassar for an instant */
export function toMakassarParts(date: Date): {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');
  let hour = get('hour');
  // Some engines emit 24 for midnight
  if (hour === 24) hour = 0;
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour,
    minute: get('minute'),
    second: get('second'),
  };
}

/** Local calendar date YYYY-MM-DD in Makassar */
export function localDateMakassar(date: Date = new Date()): string {
  const p = toMakassarParts(date);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/**
 * Instant of Monday 00:00 Asia/Makassar for the week containing `date`.
 * Uses Makassar wall-clock arithmetic (UTC+8, no DST).
 */
export function startOfWeekMakassar(date: Date = new Date()): Date {
  const p = toMakassarParts(date);
  // Build UTC ms for this Makassar midnight of calendar day
  const localMidnightUtc =
    Date.UTC(p.year, p.month - 1, p.day, 0, 0, 0) - MAKASSAR_OFFSET_MS;
  // weekday of that local day: 0=Sun..6=Sat in UTC terms via local
  const weekday = new Date(
    Date.UTC(p.year, p.month - 1, p.day, 12, 0, 0),
  ).getUTCDay();
  // Monday-based: Mon=0 ... Sun=6
  const daysFromMonday = (weekday + 6) % 7;
  return new Date(localMidnightUtc - daysFromMonday * 24 * 60 * 60 * 1000);
}

export function endOfWeekMakassar(date: Date = new Date()): Date {
  const start = startOfWeekMakassar(date);
  return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
}

/**
 * ISO-style week number for the Monday of the week in Makassar calendar.
 * weekId format: YYYY-Www
 */
export function weekId(date: Date = new Date()): string {
  const monday = startOfWeekMakassar(date);
  // ISO week: week containing Thursday; with Mon-start, use Thursday of week
  const thursday = new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000);
  const tp = toMakassarParts(thursday);
  // Jan 4 is always in week 1
  const jan4 = new Date(
    Date.UTC(tp.year, 0, 4, 12, 0, 0) - MAKASSAR_OFFSET_MS,
  );
  const week1Monday = startOfWeekMakassar(jan4);
  const diffDays = Math.round(
    (monday.getTime() - week1Monday.getTime()) / (24 * 60 * 60 * 1000),
  );
  let weekNum = Math.floor(diffDays / 7) + 1;
  let year = tp.year;
  if (weekNum < 1) {
    // late Dec belonging to previous year's last week
    const prevJan4 = new Date(
      Date.UTC(tp.year - 1, 0, 4, 12, 0, 0) - MAKASSAR_OFFSET_MS,
    );
    const prevW1 = startOfWeekMakassar(prevJan4);
    const d = Math.round(
      (monday.getTime() - prevW1.getTime()) / (24 * 60 * 60 * 1000),
    );
    weekNum = Math.floor(d / 7) + 1;
    year = tp.year - 1;
  } else if (weekNum > 52) {
    // may be week 1 of next year
    const nextJan4 = new Date(
      Date.UTC(tp.year + 1, 0, 4, 12, 0, 0) - MAKASSAR_OFFSET_MS,
    );
    const nextW1 = startOfWeekMakassar(nextJan4);
    if (monday.getTime() >= nextW1.getTime()) {
      weekNum = 1;
      year = tp.year + 1;
    }
  }
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

export function weekBounds(date: Date = new Date()): {
  weekId: string;
  startsAt: string;
  endsAt: string;
} {
  const starts = startOfWeekMakassar(date);
  const ends = endOfWeekMakassar(date);
  return {
    weekId: weekId(date),
    startsAt: starts.toISOString(),
    endsAt: ends.toISOString(),
  };
}
