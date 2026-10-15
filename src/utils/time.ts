import type { Entry } from '../types';

/** The daily target the monthly average is divided by. */
export const TARGET_MINUTES = 6.5 * 60;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');

export const toDateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const toTimeString = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export const parseDateKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatDuration = (total: number) => `${Math.floor(total / 60)}h ${pad(total % 60)}m`;

export const formatDelta = (minutes: number) =>
  `${minutes >= 0 ? '+' : '−'}${formatDuration(Math.abs(minutes))}`;

export const formatDateLabel = (key: string) => {
  const d = parseDateKey(key);
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const formatMonthLabel = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

export const monthPrefix = (year: number, month: number) => `${year}-${pad(month + 1)}`;

export const weekdaysInMonth = (year: number, month: number) => {
  const last = new Date(year, month + 1, 0).getDate();
  let count = 0;
  for (let day = 1; day <= last; day++) {
    const dow = new Date(year, month, day).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
};

export const hasOpenSession = (entry: Entry) => entry.sessions.some((s) => s.outTime === null);

export const formatSessions = (entry: Entry) =>
  entry.sessions.map((s) => `${s.inTime}–${s.outTime ?? '…'}`).join(', ');

/**
 * Total minutes in office for a day.
 * - closed sessions: out − in
 * - an open session today: now − in (live)
 * - an open session on an older day: null (missing data)
 */
export const entryMinutes = (entry: Entry, now: Date): number | null => {
  const isToday = entry.date === toDateKey(now);
  let total = 0;
  for (const s of entry.sessions) {
    const start = toMinutes(s.inTime);
    if (s.outTime) total += Math.max(0, toMinutes(s.outTime) - start);
    else if (isToday) total += Math.max(0, toMinutes(toTimeString(now)) - start);
    else return null;
  }
  return total;
};
