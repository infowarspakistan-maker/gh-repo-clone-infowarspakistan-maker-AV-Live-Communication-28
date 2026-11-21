import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { CURRENCY_META, SupportedCurrency } from '../lib/currency';
import { useCurrency } from '../contexts/CurrencyContext';

interface CurrencySelectorProps {
  variant?: 'topbar' | 'pill' | 'drawer';
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  variant = 'topbar',
  className = '',
}) => {
  const { currency, supportedCurrencies, setCurrency, rates } = useCurrency();

  if (variant === 'drawer') {
    return (
      <div className={`bg-white rounded-2xl p-3 border border-gray-100 shadow-xs ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-black text-[#1A2B4C] uppercase tracking-wider">
            <Globe size={13} className="text-[#00B4D8]" />
            <span>Display Currency</span>
          </div>
          {currency !== 'PKR' && (
            <span className="text-[10px] font-bold text-gray-500">
              1 {currency} = Rs. {rates[currency].toFixed(currency === 'AED' ? 1 : 0)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {supportedCurrencies.map((code) => {
            const active = code === currency;
            const meta = CURRENCY_META[code];
            return (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                aria-pressed={active}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-black transition-all cursor-pointer border ${
                  active
                    ? 'bg-[#1A2B4C] text-white border-[#1A2B4C] shadow-xs'
                    : 'bg-[#F8F9FA] text-[#1A2B4C] border-gray-200 hover:border-[#00B4D8]'
                }`}
              >
                <div>{code}</div>
                <div className={`text-[9px] font-semibold ${active ? 'text-[#00B4D8]' : 'text-gray-500'}`}>
                  {meta.symbol}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-xs ${className}`}>
        <Globe size={13} className="text-[#00B4D8] shrink-0" />
        <label htmlFor="currency-selector-pill" className="sr-only">
          Select display currency
        </label>
        <select
          id="currency-selector-pill"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
          className="bg-transparent text-xs font-black text-[#1A2B4C] focus:outline-none cursor-pointer pr-1"
        >
          {supportedCurrencies.map((code) => (
            <option key={code} value={code}>
              {code} ({CURRENCY_META[code].symbol}) — {CURRENCY_META[code].market}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Globe size={11} className="text-[#00B4D8] pointer-events-none mr-1 shrink-0" />
      <label htmlFor="topbar-currency-select" className="sr-only">
        Display Currency
      </label>
      <select
        id="topbar-currency-select"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
        title={`Switch currency (Current: ${CURRENCY_META[currency].name})`}
        className="appearance-none bg-white border border-gray-200 hover:border-[#00B4D8] rounded-md pl-1.5 pr-4 py-0.5 text-[10px] font-black text-[#1A2B4C] focus:outline-none focus:ring-1 focus:ring-[#00B4D8] cursor-pointer"
      >
        {supportedCurrencies.map((code) => (
          <option key={code} value={code}>
            {code} ({CURRENCY_META[code].symbol})
          </option>
        ))}
      </select>
      <ChevronDown size={10} className="text-gray-400 pointer-events-none absolute right-1" />
    </div>
  );
};
