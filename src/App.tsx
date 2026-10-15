import { useMemo, useState } from 'react';
import BackupCard from './components/BackupCard';
import EntryDialog from './components/EntryDialog';
import LogTable from './components/LogTable';
import StatsGrid from './components/StatsGrid';
import TargetCard from './components/TargetCard';
import TodayCard from './components/TodayCard';
import { useAttendance } from './hooks/useAttendance';
import { useNow } from './hooks/useNow';
import { useSettings } from './hooks/useSettings';
import { downloadCsv } from './utils/csv';
import { computeStats } from './utils/stats';
import { formatDateLabel, formatMonthLabel, monthPrefix, toDateKey } from './utils/time';

type DialogState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; date: string };

export default function App() {
  const now = useNow();
  const today = toDateKey(now);
  const { entries, upsert, remove, clockIn, clockOut, importEntries } = useAttendance();
  const { settings, toggleTheme, setTargetDays } = useSettings();
  const [view, setView] = useState(() => ({ year: now.getFullYear(), month: now.getMonth() }));
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });

  const prefix = monthPrefix(view.year, view.month);
  const monthEntries = useMemo(
    () =>
      Object.values(entries)
        .filter((e) => e.date.startsWith(prefix))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [entries, prefix],
  );
  const stats = useMemo(
    () => computeStats(monthEntries, now, view.year, view.month),
    [monthEntries, now, view.year, view.month],
  );

  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const dark = settings.theme === 'dark';

  return (
    <main className="page">
      <header className="page-head">
        <h1>Office Attendance</h1>
        <div className="head-right">
          <button className="icon-btn bordered" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
            {dark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
          <div className="month-switch">
            <button className="icon-btn" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <span className="month-label" aria-live="polite">{formatMonthLabel(view.year, view.month)}</span>
            <button className="icon-btn" aria-label="Next month" onClick={() => shiftMonth(1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </header>

      <TodayCard
        entry={entries[today]}
        now={now}
        dateLabel={formatDateLabel(today)}
        onClockIn={clockIn}
        onClockOut={clockOut}
        onEdit={() => setDialog(entries[today] ? { mode: 'edit', date: today } : { mode: 'add' })}
      />
      <StatsGrid stats={stats} />
      <TargetCard stats={stats} targetDays={settings.targetDays} onTargetChange={setTargetDays} />
      <LogTable
        entries={monthEntries}
        stats={stats}
        now={now}
        today={today}
        onAdd={() => setDialog({ mode: 'add' })}
        onEdit={(date) => setDialog({ mode: 'edit', date })}
        onExport={() => downloadCsv(monthEntries, now, `attendance-${prefix}.csv`)}
      />
      <BackupCard
        entries={entries}
        settings={settings}
        onImport={(list, target) => {
          importEntries(list);
          if (target) setTargetDays(target);
        }}
      />

      {dialog.mode !== 'closed' && (
        <EntryDialog
          initial={dialog.mode === 'edit' ? entries[dialog.date] : undefined}
          defaultDate={today}
          maxDate={today}
          existing={entries}
          onSave={upsert}
          onDelete={remove}
          onClose={() => setDialog({ mode: 'closed' })}
        />
      )}
    </main>
  );
}
