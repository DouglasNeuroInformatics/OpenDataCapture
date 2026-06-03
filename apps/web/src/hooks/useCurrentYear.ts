import { useEffect, useState } from 'react';

/** The largest delay `setTimeout` accepts (~24.8 days); longer values overflow and fire immediately. */
const MAX_TIMEOUT_MS = 2_147_483_647;

/**
 * Returns the current calendar year and keeps it current even when the page is
 * left open for a long time (e.g. across a New Year boundary).
 *
 * A plain `new Date().getFullYear()` computed at render — or worse, at module
 * load — would otherwise display a stale year until the next reload. This hook
 * re-arms a timer at each year boundary and also recomputes when the tab becomes
 * visible again, so the displayed year (e.g. a footer copyright) always rolls over.
 */
export function useCurrentYear(): number {
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    let timer: number;

    // Schedule an update for the next Jan 1. Because the delay until then can
    // exceed setTimeout's max, clamp it and re-arm — each tick either rolls the
    // year over or just re-schedules until the boundary is actually reached.
    const schedule = () => {
      const now = new Date();
      const msUntilNewYear = new Date(now.getFullYear() + 1, 0, 1).getTime() - now.getTime();
      timer = window.setTimeout(
        () => {
          setYear(new Date().getFullYear());
          schedule();
        },
        Math.min(msUntilNewYear, MAX_TIMEOUT_MS)
      );
    };
    schedule();

    // Cheap catch-all: a backgrounded tab's timers can be throttled, so refresh
    // the year whenever the tab is shown again.
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setYear(new Date().getFullYear());
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return year;
}
