import type { Entry } from '../types';
import { TARGET_MINUTES, entryMinutes, weekdaysInMonth } from './time';

export interface MonthStats {
  daysAttended: number;
  weekdays: number;
  totalMinutes: number;
  avgMinutes: number;
  /** average hours per day ÷ 8 */
  ratio: number;
}

export function computeStats(entries: Entry[], now: Date, year: number, month: number): MonthStats {
  let totalMinutes = 0;
  let counted = 0;
  for (const entry of entries) {
    const minutes = entryMinutes(entry, now);
    if (minutes === null) continue; // missing out time: attended, but excluded from the average
    totalMinutes += minutes;
    counted++;
  }
  const avgMinutes = counted ? Math.round(totalMinutes / counted) : 0;
  return {
    daysAttended: entries.length,
    weekdays: weekdaysInMonth(year, month),
    totalMinutes,
    avgMinutes,
    ratio: avgMinutes / TARGET_MINUTES,
  };
}
