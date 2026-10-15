import type { Entry } from '../types';
import type { MonthStats } from '../utils/stats';
import { TARGET_MINUTES, entryMinutes, formatDateLabel, formatDelta, formatDuration, formatSessions, hasOpenSession } from '../utils/time';

interface Props {
  entries: Entry[];
  stats: MonthStats;
  now: Date;
  today: string;
  onAdd: () => void;
  onEdit: (date: string) => void;
  onExport: () => void;
}

function Badge({ entry, minutes, today }: { entry: Entry; minutes: number | null; today: string }) {
  if (minutes === null) return <span className="badge neg">Missing out time</span>;
  if (entry.date === today && hasOpenSession(entry)) return <span className="in-progress">In progress</span>;
  const delta = minutes - TARGET_MINUTES;
  return <span className={delta >= 0 ? 'badge pos' : 'badge neg'}>{formatDelta(delta)}</span>;
}

export default function LogTable({ entries, stats, now, today, onAdd, onEdit, onExport }: Props) {
  return (
    <section className="card" aria-label="Daily log">
      <div className="log-head">
        <h2>Daily log</h2>
        <div className="log-actions">
          <button className="btn btn-secondary" onClick={onExport} disabled={entries.length === 0}>
            Export CSV
          </button>
          <button className="btn btn-secondary" onClick={onAdd}>
            + Add past entry
          </button>
        </div>
      </div>
      {entries.length === 0 ? (
        <p className="empty">No entries this month. Clock in above, or add a past day.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sessions</th>
                <th>Total</th>
                <th>vs 6.5 hrs</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const minutes = entryMinutes(entry, now);
                return (
                  <tr key={entry.date}>
                    <td>{formatDateLabel(entry.date)}</td>
                    <td className="mono">{formatSessions(entry)}</td>
                    <td className="mono">{minutes === null ? '—' : formatDuration(minutes)}</td>
                    <td><Badge entry={entry} minutes={minutes} today={today} /></td>
                    <td>
                      <button className="icon-btn" aria-label={`Edit ${formatDateLabel(entry.date)}`} onClick={() => onEdit(entry.date)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <path d="M4 20h4L19 9l-4-4L4 16z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td>Month total</td>
                <td />
                <td className="mono">{formatDuration(stats.totalMinutes)}</td>
                <td>{stats.daysAttended} days</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
