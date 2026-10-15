import type { MonthStats } from '../utils/stats';
import { formatDuration } from '../utils/time';

export default function StatsGrid({ stats }: { stats: MonthStats }) {
  return (
    <section className="stats" aria-label="Monthly summary">
      <div className="card stat">
        <span className="lbl">Days attended</span>
        <span className="stat-value">{stats.daysAttended}</span>
        <span className="stat-note">of {stats.weekdays} weekdays</span>
      </div>
      <div className="card stat">
        <span className="lbl">Total hours</span>
        <span className="stat-value">{formatDuration(stats.totalMinutes)}</span>
        <span className="stat-note">this month</span>
      </div>
      <div className="card stat">
        <span className="lbl">Avg hours / day</span>
        <span className="stat-value">{formatDuration(stats.avgMinutes)}</span>
        <span className="stat-note">total ÷ days with a clock-out</span>
      </div>
      <div className="card stat stat-accent">
        <span className="lbl">Average ÷ 8</span>
        <span className="stat-value">{stats.ratio.toFixed(2)}</span>
        <span className="stat-note">{Math.round(stats.ratio * 100)}% of the 6.5-hour target</span>
      </div>
    </section>
  );
}
