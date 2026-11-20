import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { GeneralSettings } from '../lib/firebase/firestore-helpers';

interface SettingsContextType {
  settings: GeneralSettings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: false,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;

    const timer = setTimeout(() => {
      import('../lib/firebase/firestore-helpers')
        .then(({ subscribeToGeneralSettings }) => {
          if (cancelled) return;
          unsub = subscribeToGeneralSettings((data) => {
            setSettings(data);
            setLoading(false);
          });
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    }, 3600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (unsub) unsub();
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
