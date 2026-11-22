import React from 'react';
import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  minRating: number;
  category: string;
  amenities: string[];
}

interface HotelFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  className?: string;
}

const availableAmenities = [
  'Onsen Hot Spring',
  'Infinity Pool',
  'Michelin Star Dining',
  'High-Speed Wi-Fi',
  'Luxury Spa',
  'Private Beach',
  'Butler Service',
  'Concierge Desk',
  'Traditional Afternoon Tea',
];

const categories = ['All', 'Luxury', 'Resort', 'Boutique'];

export const HotelFilters: React.FC<HotelFiltersProps> = ({
  filters,
  onChange,
  onReset,
  className = '',
}) => {
  const toggleAmenity = (name: string) => {
    const exists = filters.amenities.includes(name);
    const updated = exists
      ? filters.amenities.filter((a) => a !== name)
      : [...filters.amenities, name];
    onChange({ ...filters, amenities: updated });
  };

  return (
    <div
      className={`bg-[#060D1E] rounded-3xl border border-blue-900/50 p-6 shadow-card-dark text-slate-100 space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-blue-950">
        <div className="flex items-center space-x-2 text-white font-bold text-base">
          <SlidersHorizontal className="w-4 h-4 text-accent-400" />
          <span>Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-blue-400 hover:text-accent-300 flex items-center space-x-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. Category */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3">
          Property Type
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ ...filters, category: cat })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filters.category === cat
                  ? 'bg-blue-600 text-white shadow-glow-blue border border-blue-400/40'
                  : 'bg-blue-950/60 text-slate-300 hover:bg-blue-900/60 border border-blue-900/40'
              }`}
            >
              {cat === 'All' ? 'All Types' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Price Range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
            Price Per Night (USD)
          </h4>
          <span className="text-xs font-bold text-white">
            ${filters.minPrice} &ndash; ${filters.maxPrice}
          </span>
        </div>
        <input
          type="range"
          min="100"
          max="2500"
          step="50"
          value={filters.maxPrice}
          onChange={(e) =>
            onChange({ ...filters, maxPrice: parseInt(e.target.value, 10) })
          }
          className="w-full accent-blue-500 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-blue-400/80 mt-1 font-mono">
          <span>$100</span>
          <span>$1,000</span>
          <span>$2,500+</span>
        </div>
      </div>

      {/* 3. Star / Guest Rating */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3">
          Minimum Rating
        </h4>
        <div className="space-y-2">
          {[
            { label: '4.8+ Exceptional', val: 4.8 },
            { label: '4.5+ Wonderful', val: 4.5 },
            { label: '4.0+ Very Good', val: 4.0 },
            { label: 'Any Rating', val: 0 },
          ].map((item) => (
            <label
              key={item.val}
              className="flex items-center space-x-2 text-xs font-medium text-slate-300 cursor-pointer hover:text-white"
            >
              <input
                type="radio"
                name="ratingFilter"
                checked={filters.minRating === item.val}
                onChange={() => onChange({ ...filters, minRating: item.val })}
                className="text-blue-600 focus:ring-blue-500 rounded-full border-blue-900 bg-[#020617]"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 4. Amenities Checklist */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3">
          Key Amenities
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {availableAmenities.map((amenity) => {
            const isChecked = filters.amenities.includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center space-x-2.5 text-xs font-medium text-slate-300 cursor-pointer hover:text-white group"
              >
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                    isChecked
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'border-blue-900/80 bg-[#020617] group-hover:border-blue-600'
                  }`}
                  onClick={() => toggleAmenity(amenity)}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span onClick={() => toggleAmenity(amenity)}>{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
