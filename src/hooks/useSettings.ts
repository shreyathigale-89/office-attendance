import { useCallback, useEffect, useState } from 'react';
import type { Settings } from '../types';

const KEY = 'office-attendance-settings-v1';

function load(): Settings {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const fallback: Settings = { theme: prefersDark ? 'dark' : 'light', targetDays: 8 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as Partial<Settings>;
    return {
      theme: p.theme === 'dark' || p.theme === 'light' ? p.theme : fallback.theme,
      targetDays:
        typeof p.targetDays === 'number' && Number.isInteger(p.targetDays) && p.targetDays >= 1 && p.targetDays <= 31
          ? p.targetDays
          : fallback.targetDays,
    };
  } catch {
    return fallback;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  const toggleTheme = useCallback(
    () => setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' })),
    [],
  );
  const setTargetDays = useCallback(
    (targetDays: number) => setSettings((s) => ({ ...s, targetDays: Math.min(31, Math.max(1, targetDays)) })),
    [],
  );

  return { settings, toggleTheme, setTargetDays };
}
