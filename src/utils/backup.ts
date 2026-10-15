import type { Entry, EntryMap, Settings } from '../types';
import { downloadFile } from './download';
import { normalizeEntry } from './entries';

export function downloadBackup(entries: EntryMap, settings: Settings) {
  const payload = {
    app: 'office-attendance',
    version: 2,
    exportedAt: new Date().toISOString(),
    settings: { targetDays: settings.targetDays },
    entries: Object.values(entries),
  };
  const stamp = new Date().toISOString().slice(0, 10);
  downloadFile(JSON.stringify(payload, null, 2), `attendance-backup-${stamp}.json`, 'application/json');
}

/** Reads a backup file. Throws an Error with a user-readable message if it is unusable. */
export async function readBackup(file: File): Promise<{ entries: Entry[]; targetDays?: number }> {
  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error('This file is not valid JSON. Choose a backup downloaded from this app.');
  }
  const rawEntries = Array.isArray(data) ? data : (data as { entries?: unknown } | null)?.entries;
  if (!Array.isArray(rawEntries)) throw new Error('No entries found in this file.');

  const entries = rawEntries.map(normalizeEntry).filter((e): e is Entry => e !== null);
  if (entries.length === 0) throw new Error('No valid entries found in this file.');

  const target = (data as { settings?: { targetDays?: unknown } }).settings?.targetDays;
  const targetDays = typeof target === 'number' && Number.isInteger(target) && target >= 1 && target <= 31 ? target : undefined;
  return { entries, targetDays };
}
