import type { Entry } from '../types';
import { entryMinutes, formatDuration, hasOpenSession } from '../utils/time';

interface Props {
  entry: Entry | undefined;
  now: Date;
  dateLabel: string;
  onClockIn: () => void;
  onClockOut: () => void;
  onEdit: () => void;
}

export default function TodayCard({ entry, now, dateLabel, onClockIn, onClockOut, onEdit }: Props) {
  const open = entry ? hasOpenSession(entry) : false;
  const total = formatDuration(entry ? (entryMinutes(entry, now) ?? 0) : 0);

  let status = 'Not clocked in yet';
  if (entry) status = open ? `In office · ${total} today` : `Out of office · ${total} today`;

  return (
    <section className="card today" aria-label="Today">
      <div className="today-text">
        <span className="lbl">Today · {dateLabel}</span>
        <span className="today-status">{status}</span>
        {entry && (
          <ul className="chips" aria-label="Today's sessions">
            {entry.sessions.map((s) => (
              <li key={s.inTime} className="chip mono">
                {s.inTime} – {s.outTime ?? 'now'}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="today-controls">
        <button className="btn btn-secondary" onClick={onEdit}>
          {entry ? 'Edit today' : 'Add manually'}
        </button>
        <button className="btn btn-secondary" onClick={onClockIn} disabled={open}>
          Clock in
        </button>
        <button className="btn btn-primary" onClick={onClockOut} disabled={!open}>
          Clock out
        </button>
      </div>
    </section>
  );
}
