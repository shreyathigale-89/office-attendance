import { useRef, useState } from 'react';
import type { Entry, EntryMap, Settings } from '../types';
import { downloadBackup, readBackup } from '../utils/backup';

interface Props {
  entries: EntryMap;
  settings: Settings;
  onImport: (entries: Entry[], targetDays?: number) => void;
}

export default function BackupCard({ entries, settings, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const restore = async (file: File | undefined) => {
    if (!file) return;
    try {
      const { entries: restored, targetDays } = await readBackup(file);
      onImport(restored, targetDays);
      setMessage({ ok: true, text: `Restored ${restored.length} day${restored.length === 1 ? '' : 's'}.` });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Could not read this file.' });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <section className="card backup" aria-label="Backup and restore">
      <div className="backup-text">
        <h2>Backup and restore</h2>
        <span className="stat-note">
          Your data is saved in this browser only. Download a backup before clearing browser data. Restoring adds the
          backup's days and replaces days with the same date.
        </span>
        {message && (
          <span className={message.ok ? 'msg-ok' : 'error'} role="status">
            {message.text}
          </span>
        )}
      </div>
      <div className="log-actions">
        <button className="btn btn-secondary" onClick={() => downloadBackup(entries, settings)} disabled={Object.keys(entries).length === 0}>
          Download backup
        </button>
        <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
          Restore from file
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void restore(e.target.files?.[0])} />
      </div>
    </section>
  );
}
