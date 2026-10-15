import { useCallback, useEffect, useState } from 'react';
import type { Entry, EntryMap } from '../types';
import { normalizeEntry } from '../utils/entries';
import { hasOpenSession, toDateKey, toTimeString } from '../utils/time';

const KEY = 'office-attendance-v2';
const LEGACY_KEY = 'office-attendance-v1'; // single in/out per day; migrated on first load

function readMap(key: string): EntryMap | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const result: EntryMap = {};
    for (const value of Object.values(parsed as Record<string, unknown>)) {
      const entry = normalizeEntry(value);
      if (entry) result[entry.date] = entry;
    }
    return result;
  } catch {
    return null;
  }
}

const load = (): EntryMap => readMap(KEY) ?? readMap(LEGACY_KEY) ?? {};

export function useAttendance() {
  const [entries, setEntries] = useState<EntryMap>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(entries));
    } catch {
      /* storage full or blocked: keep working in memory */
    }
  }, [entries]);

  const upsert = useCallback((entry: Entry, replaceDate?: string) => {
    setEntries((prev) => {
      const next = { ...prev };
      if (replaceDate && replaceDate !== entry.date) delete next[replaceDate];
      next[entry.date] = entry;
      return next;
    });
  }, []);

  const remove = useCallback((date: string) => {
    setEntries((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  }, []);

  const clockIn = useCallback(() => {
    const now = new Date();
    const date = toDateKey(now);
    setEntries((prev) => {
      const entry = prev[date];
      if (entry && hasOpenSession(entry)) return prev;
      const sessions = [...(entry?.sessions ?? []), { inTime: toTimeString(now), outTime: null }];
      return { ...prev, [date]: { date, sessions } };
    });
  }, []);

  const clockOut = useCallback(() => {
    const now = new Date();
    const date = toDateKey(now);
    setEntries((prev) => {
      const entry = prev[date];
      if (!entry) return prev;
      const index = entry.sessions.findIndex((s) => s.outTime === null);
      if (index === -1) return prev;
      const sessions = entry.sessions.map((s, i) => (i === index ? { ...s, outTime: toTimeString(now) } : s));
      return { ...prev, [date]: { date, sessions } };
    });
  }, []);

  /** Merge a restored backup: days with the same date are replaced, other days are kept. */
  const importEntries = useCallback((list: Entry[]) => {
    setEntries((prev) => {
      const next = { ...prev };
      for (const entry of list) next[entry.date] = entry;
      return next;
    });
  }, []);

  return { entries, upsert, remove, clockIn, clockOut, importEntries };
}
