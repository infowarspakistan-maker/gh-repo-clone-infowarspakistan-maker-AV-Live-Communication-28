import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GeneralSettings, subscribeToGeneralSettings } from '../lib/firebase/firestore-helpers';

interface SettingsContextType {
  settings: GeneralSettings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  loading: true,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = subscribeToGeneralSettings((data) => {
      setSettings(data);
      setLoading(false);
    });

    return () => unsub();
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
