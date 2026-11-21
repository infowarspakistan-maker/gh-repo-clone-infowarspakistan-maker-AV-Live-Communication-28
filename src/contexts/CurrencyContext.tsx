import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  CURRENCY_META,
  CurrencyMetadata,
  DEFAULT_PKR_PER_UNIT,
  FormatCurrencyOptions,
  PkrPerUnitRates,
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
  convertFromPkr,
  convertToPkr,
  formatCurrencyAmount,
  normalizeSupportedCurrency,
} from '../lib/currency';

const CURRENCY_STORAGE_KEY = 'avlive_currency';
const RATES_STORAGE_KEY = 'avlive_exchange_rates_v1';
const RATES_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface StoredRatesPayload {
  pkrPerUnit: PkrPerUnitRates;
  source: 'live' | 'fallback';
  updatedAt: number;
}

interface CurrencyContextType {
  currency: SupportedCurrency;
  meta: CurrencyMetadata;
  supportedCurrencies: SupportedCurrency[];
  rates: PkrPerUnitRates;
  ratesSource: 'live' | 'fallback';
  lastUpdated: number | null;
  isRefreshing: boolean;
  setCurrency: (next: SupportedCurrency) => void;
  refreshRates: () => Promise<void>;
  convert: (amountPkr: number) => number;
  toPkr: (amountInActiveCurrency: number) => number;
  formatPrice: (amountPkr: number, options?: FormatCurrencyOptions) => string;
  formatExactPkr: (amountPkr: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function getInitialCurrency(): SupportedCurrency {
  if (typeof window === 'undefined') return 'PKR';
  try {
    const params = new URLSearchParams(window.location.search);
    const urlCurrency = params.get('currency');
    if (urlCurrency) {
      const normalized = normalizeSupportedCurrency(urlCurrency);
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, normalized);
      return normalized;
    }
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored) {
      return normalizeSupportedCurrency(stored);
    }
  } catch {
    // Ignore storage access errors
  }
  return 'PKR';
}

function getInitialStoredRates(): StoredRatesPayload {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(RATES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredRatesPayload>;
        if (parsed && parsed.pkrPerUnit && typeof parsed.updatedAt === 'number') {
          return {
            pkrPerUnit: { ...DEFAULT_PKR_PER_UNIT, ...parsed.pkrPerUnit, PKR: 1 },
            source: parsed.source === 'live' ? 'live' : 'fallback',
            updatedAt: parsed.updatedAt,
          };
        }
      }
    } catch {
      // Ignore invalid JSON
    }
  }
  return {
    pkrPerUnit: { ...DEFAULT_PKR_PER_UNIT },
    source: 'fallback',
    updatedAt: 0,
  };
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(getInitialCurrency);
  const initialRates = useMemo(() => getInitialStoredRates(), []);
  const [rates, setRates] = useState<PkrPerUnitRates>(initialRates.pkrPerUnit);
  const [ratesSource, setRatesSource] = useState<'live' | 'fallback'>(initialRates.source);
  const [lastUpdated, setLastUpdated] = useState<number | null>(
    initialRates.updatedAt > 0 ? initialRates.updatedAt : null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshRates = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/exchange-rates', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.pkrPerUnit && typeof data.pkrPerUnit === 'object') {
        const merged: PkrPerUnitRates = {
          PKR: 1,
          USD: Number(data.pkrPerUnit.USD) || DEFAULT_PKR_PER_UNIT.USD,
          GBP: Number(data.pkrPerUnit.GBP) || DEFAULT_PKR_PER_UNIT.GBP,
          AED: Number(data.pkrPerUnit.AED) || DEFAULT_PKR_PER_UNIT.AED,
          EUR: Number(data.pkrPerUnit.EUR) || DEFAULT_PKR_PER_UNIT.EUR,
        };
        const source = data.source === 'live' ? 'live' : 'fallback';
        const updatedAt = Number(data.updatedAt) || Date.now();
        setRates(merged);
        setRatesSource(source);
        setLastUpdated(updatedAt);
        try {
          window.localStorage.setItem(
            RATES_STORAGE_KEY,
            JSON.stringify({ pkrPerUnit: merged, source, updatedAt })
          );
        } catch {
          // Ignore quota errors
        }
      }
    } catch {
      // Keep fallback rates silently
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Refresh live FX rates on idle if cache is missing/stale or if user picks a non-PKR currency
  useEffect(() => {
    const isStale = !lastUpdated || Date.now() - lastUpdated > RATES_CACHE_TTL_MS;
    if (!isStale) return;

    let idleHandle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const trigger = () => {
      void refreshRates();
    };

    if (currency !== 'PKR') {
      trigger();
    } else if (typeof (window as any).requestIdleCallback === 'function') {
      idleHandle = (window as any).requestIdleCallback(trigger, { timeout: 3500 });
    } else {
      timer = setTimeout(trigger, 1800);
    }

    return () => {
      if (idleHandle !== undefined && typeof (window as any).cancelIdleCallback === 'function') {
        (window as any).cancelIdleCallback(idleHandle);
      }
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [currency, lastUpdated, refreshRates]);

  const setCurrency = useCallback(
    (next: SupportedCurrency) => {
      const normalized = normalizeSupportedCurrency(next);
      setCurrencyState(normalized);
      try {
        window.localStorage.setItem(CURRENCY_STORAGE_KEY, normalized);
      } catch {
        // Ignore storage errors
      }
      if (normalized !== 'PKR' && (!lastUpdated || Date.now() - lastUpdated > RATES_CACHE_TTL_MS)) {
        void refreshRates();
      }
    },
    [lastUpdated, refreshRates]
  );

  const convert = useCallback(
    (amountPkr: number) => convertFromPkr(amountPkr, currency, rates),
    [currency, rates]
  );

  const toPkr = useCallback(
    (amountInActiveCurrency: number) => convertToPkr(amountInActiveCurrency, currency, rates),
    [currency, rates]
  );

  const formatPrice = useCallback(
    (amountPkr: number, options?: FormatCurrencyOptions) =>
      formatCurrencyAmount(amountPkr, currency, rates, options),
    [currency, rates]
  );

  const formatExactPkr = useCallback(
    (amountPkr: number) => formatCurrencyAmount(amountPkr, 'PKR', DEFAULT_PKR_PER_UNIT),
    []
  );

  const value = useMemo<CurrencyContextType>(
    () => ({
      currency,
      meta: CURRENCY_META[currency],
      supportedCurrencies: SUPPORTED_CURRENCIES,
      rates,
      ratesSource,
      lastUpdated,
      isRefreshing,
      setCurrency,
      refreshRates,
      convert,
      toPkr,
      formatPrice,
      formatExactPkr,
    }),
    [currency, rates, ratesSource, lastUpdated, isRefreshing, setCurrency, refreshRates, convert, toPkr, formatPrice, formatExactPkr]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export function useCurrency(): CurrencyContextType {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    // Graceful fallback if ever called outside provider (e.g. isolated test)
    return {
      currency: 'PKR',
      meta: CURRENCY_META.PKR,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      rates: DEFAULT_PKR_PER_UNIT,
      ratesSource: 'fallback',
      lastUpdated: null,
      isRefreshing: false,
      setCurrency: () => {},
      refreshRates: async () => {},
      convert: (amountPkr: number) => amountPkr,
      toPkr: (amount: number) => amount,
      formatPrice: (amountPkr: number, options?: FormatCurrencyOptions) =>
        formatCurrencyAmount(amountPkr, 'PKR', DEFAULT_PKR_PER_UNIT, options),
      formatExactPkr: (amountPkr: number) => formatCurrencyAmount(amountPkr, 'PKR', DEFAULT_PKR_PER_UNIT),
    };
  }
  return ctx;
}
