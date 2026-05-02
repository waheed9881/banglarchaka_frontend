import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_MARKET_PRESET,
  findPreset,
  readStoredMarketPrefs,
  writeStoredMarketPrefs,
  type MarketPreset,
} from '@/lib/marketPrefs';
import { getAuthToken } from '@/lib/api';
import { patchAccountPreferences, type MeResponse } from '@/lib/auth';

type MarketPrefsContextValue = {
  preset: MarketPreset;
  setPreset: (next: MarketPreset) => Promise<void>;
  /** Apply saved profile from `/auth/me` (non-destructive if columns unset). */
  applyFromMe: (me: MeResponse | null) => void;
};

const MarketPrefsContext = createContext<MarketPrefsContextValue | null>(null);

export function MarketPrefsProvider({ children }: { children: ReactNode }) {
  const [preset, setPresetState] = useState<MarketPreset>(() =>
    typeof window !== 'undefined' ? readStoredMarketPrefs() : DEFAULT_MARKET_PRESET,
  );

  const applyFromMe = useCallback((me: MeResponse | null) => {
    const cc = me?.country_code?.trim().toUpperCase();
    const cur = me?.preferred_currency?.trim().toUpperCase();
    if (!cc || !cur) return;
    const hit = findPreset(cc, cur);
    if (!hit) return;
    writeStoredMarketPrefs(hit);
    setPresetState(hit);
  }, []);

  const setPreset = useCallback(async (next: MarketPreset) => {
    writeStoredMarketPrefs(next);
    setPresetState(next);
    if (getAuthToken()) {
      try {
        await patchAccountPreferences({ country_code: next.countryCode, preferred_currency: next.currency });
      } catch {
        /* offline / validation — local prefs still applied */
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      preset,
      setPreset,
      applyFromMe,
    }),
    [preset, setPreset, applyFromMe],
  );

  return <MarketPrefsContext.Provider value={value}>{children}</MarketPrefsContext.Provider>;
}

export function useMarketPrefs(): MarketPrefsContextValue {
  const ctx = useContext(MarketPrefsContext);
  if (!ctx) {
    throw new Error('useMarketPrefs must be used within MarketPrefsProvider');
  }
  return ctx;
}
