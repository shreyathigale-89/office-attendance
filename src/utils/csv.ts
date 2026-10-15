import type { Entry } from '../types';
import { downloadFile } from './download';
import { entryMinutes, formatDuration, formatSessions } from './time';

export function downloadCsv(entries: Entry[], now: Date, filename: string) {
  const rows = [['Date', 'Sessions', 'Total']];
  for (const e of [...entries].sort((a, b) => a.date.localeCompare(b.date))) {
    const minutes = entryMinutes(e, now);
    rows.push([e.date, `"${formatSessions(e)}"`, minutes === null ? '' : formatDuration(minutes)]);
  }
  downloadFile(rows.map((r) => r.join(',')).join('\n'), filename, 'text/csv');
}
