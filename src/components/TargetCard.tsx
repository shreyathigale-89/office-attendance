import type { MonthStats } from '../utils/stats';
import { TARGET_MINUTES, formatDuration } from '../utils/time';

interface Props {
  stats: MonthStats;
  targetDays: number;
  onTargetChange: (days: number) => void;
}

export default function TargetCard({ stats, targetDays, onTargetChange }: Props) {
  const targetMinutes = targetDays * TARGET_MINUTES;
  const needed = Math.max(0, targetMinutes - stats.totalMinutes);
  const daysLeft = Math.max(0, targetDays - stats.daysAttended);
  const percent = Math.min(100, Math.round((stats.daysAttended / targetDays) * 100));

  let headline: string;
  let note: string;
  if (needed === 0) {
    headline = 'Target met';
    note = `${formatDuration(stats.totalMinutes - targetMinutes)} over the ${formatDuration(targetMinutes)} target`;
  } else {
    headline = `${formatDuration(needed)} needed`;
    note =
      daysLeft > 0
        ? `About ${formatDuration(Math.round(needed / daysLeft))} on each of the ${daysLeft} days left`
        : `Day target reached, but ${formatDuration(needed)} short of ${formatDuration(targetMinutes)}`;
  }

  return (
    <section className="card target" aria-label="Monthly target">
      <div className="target-head">
        <div className="target-text">
          <h2>Monthly target</h2>
          <span className="target-headline">{headline}</span>
          <span className="stat-note">{note}</span>
        </div>
        <div className="stepper" role="group" aria-label="Office days target">
          <button className="icon-btn" aria-label="Decrease target days" onClick={() => onTargetChange(targetDays - 1)} disabled={targetDays <= 1}>
            −
          </button>
          <span className="stepper-value">
            <strong>{targetDays}</strong> days · {targetDays * 6.5}h
          </span>
          <button className="icon-btn" aria-label="Increase target days" onClick={() => onTargetChange(targetDays + 1)} disabled={targetDays >= 31}>
            +
          </button>
        </div>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label="Office days toward target"
        aria-valuemin={0}
        aria-valuemax={targetDays}
        aria-valuenow={Math.min(stats.daysAttended, targetDays)}
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="stat-note">
        {stats.daysAttended} of {targetDays} office days
      </span>
    </section>
  );
}
