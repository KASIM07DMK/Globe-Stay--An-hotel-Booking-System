import React from 'react';
import { QrCode, Shield, Sparkles, Building, Calendar, User, Printer, Smartphone } from 'lucide-react';
import { useCurrency } from '../../features/currency/CurrencyContext';

interface DigitalCheckInPassProps {
  bookingReference: string;
  hotelName: string;
  hotelCity: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomName: string;
  totalAmount: number;
}

export const DigitalCheckInPass: React.FC<DigitalCheckInPassProps> = ({
  bookingReference,
  hotelName,
  hotelCity,
  guestName,
  checkIn,
  checkOut,
  roomName,
  totalAmount,
}) => {
  const { format } = useCurrency();

  // Deterministic SVG QR pattern generator based on the reference code
  const generateQrMatrix = (code: string) => {
    const size = 15;
    const matrix: boolean[][] = [];
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = (hash << 5) - hash + code.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        // Corners: standard QR finder patterns
        if (
          (r < 4 && c < 4) ||
          (r < 4 && c >= size - 4) ||
          (r >= size - 4 && c < 4)
        ) {
          const isCornerBorder =
            r === 0 || r === 3 || c === 0 || c === 3 ||
            r === 0 || r === 3 || c === size - 4 || c === size - 1 ||
            r === size - 4 || r === size - 1 || c === 0 || c === 3;
          row.push(isCornerBorder);
        } else {
          const pseudoRandom = Math.sin(hash + r * 17 + c * 31) * 10000;
          row.push((pseudoRandom - Math.floor(pseudoRandom)) > 0.45);
        }
      }
      matrix.push(row);
    }
    return matrix;
  };

  const qrMatrix = generateQrMatrix(bookingReference || 'GS-EXP-2026');

  return (
    <div className="rounded-3xl border border-accent-500/40 bg-gradient-to-b from-[#071233] via-[#050D24] to-[#030712] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.6)] relative overflow-hidden text-white space-y-6">
      {/* Background glow effects */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl" />

      {/* Header Badge */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-900/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/40 flex items-center justify-center text-accent-300 font-bold shadow-glow-blue">
            <Smartphone className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-widest text-accent-400">
                GlobeStay Digital Boarding Pass
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                Verified Priority Pass
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-0.5">Express Front Desk Key &amp; Check-In</h3>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Pass Reference</span>
          <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 font-mono">
            {bookingReference}
          </span>
        </div>
      </div>

      {/* Pass Body: Details + QR Code */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left 2 Cols: Reservation Passport */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#030712]/80 border border-blue-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Property &amp; Destination
              </span>
              <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{hotelName}</span>
              </p>
              <span className="text-[11px] text-slate-400">{hotelCity}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#030712]/80 border border-blue-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Guest of Honor
              </span>
              <p className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{guestName}</span>
              </p>
              <span className="text-[11px] text-accent-300 font-medium">VIP Tier Access</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#030712]/80 border border-blue-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Itinerary Dates
              </span>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{checkIn} → {checkOut}</span>
              </p>
              <span className="text-[11px] text-emerald-400 font-semibold">Confirmed Suite Stay</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#030712]/80 border border-blue-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Suite Accommodation
              </span>
              <p className="text-xs font-bold text-white truncate">
                {roomName}
              </p>
              <span className="text-[11px] text-slate-400 font-mono">Total Paid: {format(totalAmount)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-blue-300/80 bg-blue-950/40 p-2.5 rounded-xl border border-blue-900/40">
            <Sparkles className="w-4 h-4 text-accent-400 shrink-0" />
            <span>Present this QR code or mobile screen at the concierge reception for immediate suite key issuance.</span>
          </div>
        </div>

        {/* Right Col: High-Res SVG QR Code Matrix */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-950 shadow-2xl space-y-2">
          <svg viewBox="0 0 15 15" className="w-36 h-36">
            {qrMatrix.map((row, r) =>
              row.map((fill, c) =>
                fill ? (
                  <rect
                    key={`${r}-${c}`}
                    x={c}
                    y={r}
                    width={1}
                    height={1}
                    fill="#030712"
                  />
                ) : null
              )
            )}
          </svg>
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 block">
              Scan for Fast-Track Room Key
            </span>
            <span className="text-[10px] font-mono font-black text-slate-900">
              {bookingReference}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
