import React from 'react';
import { Receipt, ShieldCheck, Sparkles } from 'lucide-react';
import { useCurrency } from '../../features/currency/CurrencyContext';

export interface PriceBreakdownProps {
  basePrice: number;
  nights: number;
  quantity?: number;
  currency?: string;
  taxRate?: number; // e.g. 0.12 (12%)
  serviceFeeRate?: number; // e.g. 0.05 (5%)
  discount?: number;
  addOns?: { name: string; amount: number }[];
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  basePrice,
  nights,
  quantity = 1,
  currency: propCurrency,
  taxRate = 0.12,
  serviceFeeRate = 0.05,
  discount = 0,
  addOns = [],
}) => {
  const { format, currency: globalCurrency } = useCurrency();
  const roomSubtotal = basePrice * nights * quantity;
  const addOnsSubtotal = addOns.reduce((sum, item) => sum + item.amount, 0);
  const taxableSubtotal = roomSubtotal + addOnsSubtotal;
  const taxes = Math.round(taxableSubtotal * taxRate * 100) / 100;
  const serviceFees = Math.round(roomSubtotal * serviceFeeRate * 100) / 100;
  const total = Math.max(0, taxableSubtotal + taxes + serviceFees - discount);

  const formatPrice = (val: number) => {
    return format(val);
  };

  return (
    <div className="rounded-3xl border border-blue-900/50 bg-[#060D1E]/90 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-blue-900/40">
        <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
          <Receipt className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Price Breakdown &amp; Fees
        </h3>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-slate-300">
          <span>
            {formatPrice(basePrice)} × {nights} {nights === 1 ? 'night' : 'nights'}
            {quantity > 1 ? ` × ${quantity} rooms` : ''}
          </span>
          <span className="font-semibold text-white">{formatPrice(roomSubtotal)}</span>
        </div>

        {addOns.length > 0 && (
          <div className="py-2 border-y border-blue-900/30 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-400 block">
              VIP Concierge Experiences
            </span>
            {addOns.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent-400 shrink-0" />
                  <span>{item.name}</span>
                </span>
                <span className="font-semibold text-accent-300">{formatPrice(item.amount)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between text-slate-300">
          <span>Taxes &amp; Tourism Surcharges (12%)</span>
          <span className="font-semibold text-white">{formatPrice(taxes)}</span>
        </div>

        <div className="flex justify-between text-slate-300">
          <span>GlobeStay Protection &amp; Service (5%)</span>
          <span className="font-semibold text-white">{formatPrice(serviceFees)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-400 font-medium">
            <span>Special Promotion Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-blue-900/40 flex items-baseline justify-between">
        <div>
          <span className="text-sm font-bold text-white">Total Amount</span>
          <p className="text-[10px] text-slate-400">All local duties &amp; resort fees included</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
            {formatPrice(total)}
          </span>
          <span className="text-[10px] text-blue-300 block uppercase font-bold tracking-wider">{globalCurrency}</span>
        </div>
      </div>

      <div className="rounded-xl bg-blue-950/40 p-2.5 border border-blue-800/40 flex items-center gap-2 text-[11px] text-blue-200">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
        <span>Price Match Guarantee &amp; Zero hidden transaction fees.</span>
      </div>
    </div>
  );
};
