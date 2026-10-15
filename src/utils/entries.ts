import type { Entry, Session } from '../types';
import { toMinutes } from './time';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const isTime = (v: unknown): v is string => typeof v === 'string' && TIME_RE.test(v);

/** Accepts the current shape and the old single in/out shape; returns null if unusable. */
export function normalizeEntry(raw: unknown): Entry | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.date !== 'string' || !DATE_RE.test(r.date)) return null;

  let sessions: Session[] = [];
  if (Array.isArray(r.sessions)) {
    for (const s of r.sessions) {
      if (typeof s !== 'object' || s === null) continue;
      const { inTime, outTime } = s as Record<string, unknown>;
      if (!isTime(inTime)) continue;
      sessions.push({ inTime, outTime: isTime(outTime) ? outTime : null });
    }
  } else if (isTime(r.inTime)) {
    sessions = [{ inTime: r.inTime, outTime: isTime(r.outTime) ? r.outTime : null }];
  }
  if (sessions.length === 0) return null;
  sessions.sort((a, b) => a.inTime.localeCompare(b.inTime));
  return { date: r.date, sessions };
}

/** Returns an error message, or '' when the sessions are valid. */
export function validateSessions(sessions: Session[]): string {
  const sorted = [...sessions].sort((a, b) => a.inTime.localeCompare(b.inTime));
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    if (s.outTime !== null && toMinutes(s.outTime) < toMinutes(s.inTime)) {
      return `Session ${i + 1}: out time must be after in time.`;
    }
    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev.outTime === null) return 'Only the last session can be missing an out time.';
      if (toMinutes(prev.outTime) > toMinutes(s.inTime)) return 'Sessions overlap. Check the times.';
    }
  }
  return '';
}
