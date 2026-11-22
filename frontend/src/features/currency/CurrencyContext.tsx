import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CurrencyCode } from '../../types';

// Static exchange rates relative to USD (Phase 10 — updated daily in prod via API)
const RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AED: 3.67,
  INR: 83.5,
};

const SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AED: 'AED ',
  INR: '₹',
};

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  convert: (amountUSD: number) => number;
  format: (amountUSD: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('gs_currency') as CurrencyCode) || 'USD';
  });

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('gs_currency', c);
  }, []);

  const convert = useCallback(
    (amountUSD: number): number => {
      const rate = RATES[currency] ?? 1;
      return amountUSD * rate;
    },
    [currency]
  );

  const format = useCallback(
    (amountUSD: number): string => {
      const converted = convert(amountUSD);
      const sym = SYMBOLS[currency] ?? currency + ' ';
      if (currency === 'JPY') {
        return `${sym}${Math.round(converted).toLocaleString()}`;
      }
      return `${sym}${converted.toFixed(2)}`;
    },
    [convert, currency]
  );

  const symbol = SYMBOLS[currency] ?? currency;

  const value = useMemo(
    () => ({ currency, setCurrency, convert, format, symbol }),
    [currency, setCurrency, convert, format, symbol]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextValue => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

