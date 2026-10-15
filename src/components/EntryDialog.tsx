import { useEffect, useRef, useState } from 'react';
import type { Entry, EntryMap } from '../types';
import { validateSessions } from '../utils/entries';

interface Props {
  /** Entry being edited; undefined when adding a day. */
  initial?: Entry;
  defaultDate: string;
  maxDate: string;
  existing: EntryMap;
  onSave: (entry: Entry, replaceDate?: string) => void;
  onDelete: (date: string) => void;
  onClose: () => void;
}

interface Row {
  id: number;
  inTime: string;
  outTime: string;
}

export default function EntryDialog({ initial, defaultDate, maxDate, existing, onSave, onDelete, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const nextId = useRef(0);
  const makeRow = (inTime: string, outTime: string): Row => ({ id: nextId.current++, inTime, outTime });

  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [rows, setRows] = useState<Row[]>(() =>
    initial ? initial.sessions.map((s) => makeRow(s.inTime, s.outTime ?? '')) : [makeRow('09:30', '')],
  );
  const [error, setError] = useState('');

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const updateRow = (id: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const replacing = date !== initial?.date && Boolean(existing[date]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return setError('Choose a date.');
    if (rows.length === 0) return setError('Add at least one session.');
    const sessions = rows
      .map((r) => ({ inTime: r.inTime, outTime: r.outTime || null }))
      .sort((a, b) => a.inTime.localeCompare(b.inTime));
    const problem = validateSessions(sessions);
    if (problem) return setError(problem);
    onSave({ date, sessions }, initial?.date);
    onClose();
  };

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} aria-labelledby="dialog-title">
      <form onSubmit={submit}>
        <h2 id="dialog-title">{initial ? 'Edit entry' : 'Add entry'}</h2>
        <div className="field">
          <label className="lbl" htmlFor="d-date">Date</label>
          <input id="d-date" className="time-input" type="date" max={maxDate} value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        {replacing && <p className="stat-note">An entry for this date already exists and will be replaced.</p>}

        <fieldset className="sessions">
          <legend className="lbl">Sessions</legend>
          {rows.map((row, i) => (
            <div className="session-row" key={row.id}>
              <div className="field">
                <label className="lbl" htmlFor={`in-${row.id}`}>In {i + 1}</label>
                <input id={`in-${row.id}`} className="time-input" type="time" value={row.inTime} onChange={(e) => updateRow(row.id, { inTime: e.target.value })} required />
              </div>
              <div className="field">
                <label className="lbl" htmlFor={`out-${row.id}`}>Out {i + 1}</label>
                <input id={`out-${row.id}`} className="time-input" type="time" value={row.outTime} onChange={(e) => updateRow(row.id, { outTime: e.target.value })} />
              </div>
              <button type="button" className="icon-btn" aria-label={`Remove session ${i + 1}`} onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))} disabled={rows.length === 1}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={() => setRows((prev) => [...prev, makeRow('', '')])}>
            + Add session
          </button>
        </fieldset>

        {error && <p className="error" role="alert">{error}</p>}
        <div className="dialog-actions">
          {initial && (
            <button type="button" className="btn btn-danger" onClick={() => { onDelete(initial.date); onClose(); }}>
              Delete day
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn btn-secondary" onClick={() => ref.current?.close()}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save entry
          </button>
        </div>
      </form>
    </dialog>
  );
}
