import React, { useState, useRef, useEffect } from 'react';
import { Users, Plus, Minus } from 'lucide-react';

export interface GuestConfig {
  adults: number;
  children: number;
  rooms: number;
}

interface GuestSelectorProps {
  value: GuestConfig;
  onChange: (value: GuestConfig) => void;
}

export const GuestSelector: React.FC<GuestSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateField = (field: keyof GuestConfig, delta: number) => {
    const current = value[field];
    let next = current + delta;

    if (field === 'adults') next = Math.max(1, Math.min(10, next));
    if (field === 'children') next = Math.max(0, Math.min(6, next));
    if (field === 'rooms') next = Math.max(1, Math.min(5, next));

    onChange({
      ...value,
      [field]: next,
    });
  };

  const summary = `${value.adults} ${value.adults === 1 ? 'Adult' : 'Adults'}, ${
    value.children > 0 ? `${value.children} ${value.children === 1 ? 'Child' : 'Children'}, ` : ''
  }${value.rooms} ${value.rooms === 1 ? 'Room' : 'Rooms'}`;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1">
        Guests &amp; Rooms
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 flex items-center justify-between px-3.5 rounded-xl border border-blue-900/50 bg-[#020617] hover:border-blue-600 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <div className="flex items-center space-x-2.5 truncate">
          <Users className="w-4 h-4 text-accent-400 shrink-0" />
          <span className="text-sm font-semibold text-white truncate">{summary}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#060D1E] shadow-card-dark border border-blue-900/70 p-4 z-30 space-y-4 text-slate-100">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Adults</p>
              <p className="text-[10px] text-slate-400">Ages 13 and above</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => updateField('adults', -1)}
                disabled={value.adults <= 1}
                className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-200 hover:bg-blue-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-white">{value.adults}</span>
              <button
                type="button"
                onClick={() => updateField('adults', 1)}
                disabled={value.adults >= 10}
                className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-200 hover:bg-blue-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between pt-2 border-t border-blue-950">
            <div>
              <p className="text-xs font-bold text-white">Children</p>
              <p className="text-[10px] text-slate-400">Ages 0 to 12</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => updateField('children', -1)}
                disabled={value.children <= 0}
                className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-200 hover:bg-blue-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-white">{value.children}</span>
              <button
                type="button"
                onClick={() => updateField('children', 1)}
                disabled={value.children >= 6}
                className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-200 hover:bg-blue-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rooms */}
          <div className="flex items-center justify-between pt-2 border-t border-blue-950">
            <div>
              <p className="text-xs font-bold text-white">Rooms</p>
              <p className="text-[10px] text-slate-400">Number of suites</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => updateField('rooms', -1)}
                disabled={value.rooms <= 1}
                className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-200 hover:bg-blue-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center text-xs font-bold text-white">{value.rooms}</span>
              <button
                type="button"
                onClick={() => updateField('rooms', 1)}
                disabled={value.rooms >= 5}
                className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-200 hover:bg-blue-900 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition"
          >
            Apply Selection
          </button>
        </div>
      )}
    </div>
  );
};
