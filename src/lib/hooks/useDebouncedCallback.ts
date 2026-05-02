import { useEffect, useRef } from 'react';

/** Calls `fn(delayedValue)` after `ms` silence; returns cleanup on unmount/unschedule. */
export function useDebouncedEffect<T>(value: T, ms: number, fn: (v: T) => void): void {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const tid = window.setTimeout(() => fnRef.current(value), ms);
    return () => window.clearTimeout(tid);
  }, [value, ms]);
}
