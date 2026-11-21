export type SupportedCurrency = 'PKR' | 'USD' | 'GBP' | 'AED' | 'EUR';

export interface CurrencyMetadata {
  code: SupportedCurrency;
  symbol: string;
  shortLabel: string;
  name: string;
  market: string;
  decimals: number;
  /** Number of PKR equal to 1 unit of this currency */
  fallbackPkrPerUnit: number;
}

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['PKR', 'USD', 'GBP', 'AED', 'EUR'];

export const CURRENCY_META: Record<SupportedCurrency, CurrencyMetadata> = {
  PKR: {
    code: 'PKR',
    symbol: 'Rs.',
    shortLabel: 'PKR',
    name: 'Pakistani Rupee',
    market: 'Pakistan',
    decimals: 0,
    fallbackPkrPerUnit: 1,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    shortLabel: 'USD',
    name: 'US Dollar',
    market: 'United States / Global',
    decimals: 0,
    fallbackPkrPerUnit: 278,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    shortLabel: 'GBP',
    name: 'British Pound',
    market: 'United Kingdom',
    decimals: 0,
    fallbackPkrPerUnit: 353,
  },
  AED: {
    code: 'AED',
    symbol: 'AED',
    shortLabel: 'AED',
    name: 'UAE Dirham',
    market: 'United Arab Emirates',
    decimals: 0,
    fallbackPkrPerUnit: 75.7,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    shortLabel: 'EUR',
    name: 'Euro',
    market: 'European Union',
    decimals: 0,
    fallbackPkrPerUnit: 294,
  },
};

export type PkrPerUnitRates = Record<SupportedCurrency, number>;

export const DEFAULT_PKR_PER_UNIT: PkrPerUnitRates = {
  PKR: 1,
  USD: 278,
  GBP: 353,
  AED: 75.7,
  EUR: 294,
};

export function normalizeSupportedCurrency(input?: string | null): SupportedCurrency {
  const upper = String(input || '')
    .trim()
    .toUpperCase();
  if (upper === 'USD' || upper === 'GBP' || upper === 'AED' || upper === 'EUR' || upper === 'PKR') {
    return upper;
  }
  return 'PKR';
}

export function convertFromPkr(
  amountPkr: number,
  targetCurrency: SupportedCurrency,
  pkrPerUnit: Partial<Record<SupportedCurrency, number>> = DEFAULT_PKR_PER_UNIT
): number {
  const safePkr = Number.isFinite(amountPkr) ? amountPkr : 0;
  if (targetCurrency === 'PKR') return safePkr;
  const rate = Number(pkrPerUnit[targetCurrency]) || DEFAULT_PKR_PER_UNIT[targetCurrency] || 1;
  return safePkr / rate;
}

export function convertToPkr(
  amountInCurrency: number,
  sourceCurrency: SupportedCurrency,
  pkrPerUnit: Partial<Record<SupportedCurrency, number>> = DEFAULT_PKR_PER_UNIT
): number {
  const safeAmount = Number.isFinite(amountInCurrency) ? amountInCurrency : 0;
  if (sourceCurrency === 'PKR') return safeAmount;
  const rate = Number(pkrPerUnit[sourceCurrency]) || DEFAULT_PKR_PER_UNIT[sourceCurrency] || 1;
  return safeAmount * rate;
}

export interface FormatCurrencyOptions {
  /** Minimum/maximum decimal places override */
  decimals?: number;
  /** Compact rendering e.g. "$1.2k" or "Rs. 450k" */
  compact?: boolean;
  /** Show "Rs." or "$" etc. Default true */
  withSymbol?: boolean;
  /** Append currency code e.g. "$1,250 USD" */
  withCode?: boolean;
}

export function formatCurrencyAmount(
  amountPkr: number,
  currency: SupportedCurrency = 'PKR',
  pkrPerUnit: Partial<Record<SupportedCurrency, number>> = DEFAULT_PKR_PER_UNIT,
  options: FormatCurrencyOptions = {}
): string {
  const meta = CURRENCY_META[currency] || CURRENCY_META.PKR;
  const converted = convertFromPkr(amountPkr, currency, pkrPerUnit);
  const { withSymbol = true, withCode = false, compact = false } = options;

  const decimals =
    typeof options.decimals === 'number'
      ? options.decimals
      : currency === 'PKR'
      ? 0
      : converted < 100 && converted > 0
      ? 2
      : 0;

  let formattedNum: string;
  if (compact) {
    if (currency === 'PKR' && Math.abs(converted) >= 100000) {
      formattedNum = `${Math.round(converted / 1000)}k`;
    } else if (Math.abs(converted) >= 1000) {
      const kVal = converted / 1000;
      formattedNum = `${kVal >= 10 ? Math.round(kVal) : Number(kVal.toFixed(1))}k`;
    } else {
      formattedNum = Math.round(converted).toLocaleString('en-US');
    }
  } else {
    formattedNum = converted.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  let out = formattedNum;
  if (withSymbol) {
    out = currency === 'AED' || currency === 'PKR' ? `${meta.symbol} ${formattedNum}` : `${meta.symbol}${formattedNum}`;
  }
  if (withCode && currency !== 'PKR') {
    out = `${out} ${meta.code}`;
  }
  return out;
}

/**
 * Formats a value for Google Merchant Center (ISO 4217 "XXXX.XX CURRENCY").
 */
export function formatGmcPriceValue(
  amountPkr: number,
  currency: SupportedCurrency = 'PKR',
  pkrPerUnit: Partial<Record<SupportedCurrency, number>> = DEFAULT_PKR_PER_UNIT
): string {
  const converted = convertFromPkr(amountPkr, currency, pkrPerUnit);
  return `${converted.toFixed(2)} ${currency}`;
}
