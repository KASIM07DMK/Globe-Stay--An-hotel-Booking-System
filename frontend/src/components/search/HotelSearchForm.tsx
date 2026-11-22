import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { GuestSelector, GuestConfig } from './GuestSelector';

interface HotelSearchFormProps {
  initialDestination?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: GuestConfig;
  onSearch?: (params: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: GuestConfig;
  }) => void;
  compact?: boolean;
}

const popularDestinations = [
  { city: 'Tokyo', country: 'Japan', code: 'JP' },
  { city: 'Paris', country: 'France', code: 'FR' },
  { city: 'New York', country: 'United States', code: 'US' },
  { city: 'London', country: 'United Kingdom', code: 'GB' },
  { city: 'Dubai', country: 'United Arab Emirates', code: 'AE' },
  { city: 'Bali', country: 'Indonesia', code: 'ID' },
  { city: 'Rome', country: 'Italy', code: 'IT' },
  { city: 'Singapore', country: 'Singapore', code: 'SG' },
];

export const HotelSearchForm: React.FC<HotelSearchFormProps> = ({
  initialDestination = '',
  initialCheckIn,
  initialCheckOut,
  initialGuests = { adults: 2, children: 0, rooms: 1 },
  onSearch,
  compact = false,
}) => {
  const navigate = useNavigate();

  // Compute default dates
  const today = new Date();
  const defaultCheckIn = new Date(today);
  defaultCheckIn.setDate(today.getDate() + 1);
  const defaultCheckOut = new Date(today);
  defaultCheckOut.setDate(today.getDate() + 4);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [destination, setDestination] = useState(initialDestination);
  const [checkIn, setCheckIn] = useState(initialCheckIn || formatDate(defaultCheckIn));
  const [checkOut, setCheckOut] = useState(initialCheckOut || formatDate(defaultCheckOut));
  const [guests, setGuests] = useState<GuestConfig>(initialGuests);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIn = e.target.value;
    setCheckIn(newIn);
    if (newIn >= checkOut) {
      const nextDay = new Date(newIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(formatDate(nextDay));
      setDateError(null);
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOut = e.target.value;
    setCheckOut(newOut);
    if (newOut <= checkIn) {
      setDateError('Check-out must be at least one day after check-in.');
    } else {
      setDateError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkOut <= checkIn) {
      setDateError('Check-out date must be after check-in date.');
      return;
    }

    const searchParams = {
      destination: destination.trim(),
      checkIn,
      checkOut,
      guests,
    };

    if (onSearch) {
      onSearch(searchParams);
    } else {
      const query = new URLSearchParams({
        destination: searchParams.destination,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        adults: searchParams.guests.adults.toString(),
        children: searchParams.guests.children.toString(),
        rooms: searchParams.guests.rooms.toString(),
      });
      navigate(`/search?${query.toString()}`);
    }
  };

  return (
    <div
      className={`w-full ${
        compact
          ? ''
          : 'p-3 sm:p-5 rounded-3xl bg-[#060D1E]/90 backdrop-blur-xl border border-blue-900/60 shadow-card-dark'
      }`}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Destination */}
          <div className="md:col-span-4 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1">
              Destination
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-3.5 w-4 h-4 text-accent-400" />
              <input
                type="text"
                placeholder="Where to? (e.g. Tokyo, Paris, Bali)"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowDestSuggestions(true);
                }}
                onFocus={() => setShowDestSuggestions(true)}
                className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-blue-900/50 bg-[#020617] text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Destination Suggestions Popover */}
            {showDestSuggestions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDestSuggestions(false)}
                />
                <div className="absolute left-0 mt-2 w-full sm:w-80 bg-[#060D1E] rounded-2xl shadow-card-dark border border-blue-900/70 p-2 z-20 text-slate-100">
                  <div className="px-3 py-1.5 flex items-center space-x-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                    <span>Popular Global Getaways</span>
                  </div>
                  <div className="mt-1 max-h-60 overflow-y-auto space-y-0.5">
                    {popularDestinations
                      .filter(
                        (d) =>
                          !destination ||
                          d.city.toLowerCase().includes(destination.toLowerCase()) ||
                          d.country.toLowerCase().includes(destination.toLowerCase())
                      )
                      .map((dest) => (
                        <button
                          key={dest.city}
                          type="button"
                          onClick={() => {
                            setDestination(`${dest.city}, ${dest.country}`);
                            setShowDestSuggestions(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-blue-950/60 flex items-center justify-between group transition"
                        >
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3.5 h-3.5 text-blue-400 group-hover:text-accent-400 transition" />
                            <span className="font-semibold text-white">{dest.city}</span>
                            <span className="text-slate-400">&bull; {dest.country}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-blue-300 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-900">
                            {dest.code}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dates: Check-in & Check-out */}
          <div className="md:col-span-4 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1">
                Check-in
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-3.5 w-4 h-4 text-accent-400" />
                <input
                  type="date"
                  value={checkIn}
                  min={formatDate(today)}
                  onChange={handleCheckInChange}
                  className="w-full h-12 pl-9 pr-2 rounded-xl border border-blue-900/50 bg-[#020617] text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1">
                Check-out
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-3.5 w-4 h-4 text-accent-400" />
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={handleCheckOutChange}
                  className="w-full h-12 pl-9 pr-2 rounded-xl border border-blue-900/50 bg-[#020617] text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Guests & Rooms */}
          <div className="md:col-span-3">
            <GuestSelector value={guests} onChange={setGuests} />
          </div>

          {/* Search Button */}
          <div className="md:col-span-1 pt-4 md:pt-4">
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full h-12 px-0 rounded-xl"
              aria-label="Search Hotels"
              title="Search Hotels"
            >
              <Search className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>

        {dateError && (
          <p className="mt-2 text-xs font-semibold text-red-400 bg-red-950/60 p-2 rounded-lg border border-red-800">
            {dateError}
          </p>
        )}
      </form>
    </div>
  );
};
