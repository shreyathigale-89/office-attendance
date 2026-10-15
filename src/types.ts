/** One stretch in the office. Times are 24h HH:mm. */
export interface Session {
  inTime: string;
  outTime: string | null;
}

/** One office day: a local YYYY-MM-DD key plus one or more sessions. */
export interface Entry {
  date: string;
  sessions: Session[];
}

export type EntryMap = Record<string, Entry>;

export interface Settings {
  theme: 'light' | 'dark';
  /** Office days wanted per month. */
  targetDays: number;
}
