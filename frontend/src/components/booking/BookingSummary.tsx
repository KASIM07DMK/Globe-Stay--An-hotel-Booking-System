import React from 'react';
import {
  CalendarDays,
  MapPin,
  Moon,
  Users,
  BedDouble,
} from 'lucide-react';

interface RoomSelection {
  room_type_id: number;
  room_type_name: string;
  quantity: number;
  price_per_night: number;
  currency: string;
}

export interface BookingSummaryProps {
  hotelName: string;
  hotelCity: string;
  hotelCountry: string;
  heroImage: string;
  checkIn: string;
  checkOut: string;
  rooms: RoomSelection[];
  guestCount: number;
}

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  hotelName,
  hotelCity,
  hotelCountry,
  heroImage,
  checkIn,
  checkOut,
  rooms,
  guestCount,
}) => {
  const nights = calculateNights(checkIn, checkOut);

  return (
    <div className="rounded-3xl border border-blue-900/50 bg-[#060D1E]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={heroImage}
          alt={hotelName}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060D1E] via-[#060D1E]/40 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-bold text-white leading-tight drop-shadow-md">
            {hotelName}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-200">
              {hotelCity}, {hotelCountry}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4 text-slate-200">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#030712] border border-blue-950 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Check-in
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              {formatDate(checkIn)}
            </p>
          </div>
          <div className="rounded-2xl bg-[#030712] border border-blue-950 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Check-out
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              {formatDate(checkOut)}
            </p>
          </div>
        </div>

        {/* Nights */}
        <div className="flex items-center justify-between rounded-xl bg-blue-950/40 border border-blue-800/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-blue-200">
              Duration of Stay
            </span>
          </div>
          <span className="text-sm font-extrabold text-blue-400">
            {nights} {nights === 1 ? 'Night' : 'Nights'}
          </span>
        </div>

        {/* Rooms */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Selected Suite &amp; Accommodations
          </h4>
          {rooms.map((room) => (
            <div
              key={room.room_type_id}
              className="flex items-center justify-between rounded-xl border border-blue-900/40 bg-[#030712]/60 px-3.5 py-2.5"
            >
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-200">
                  {room.room_type_name}
                </span>
              </div>
              <span className="text-xs font-bold text-blue-300 bg-blue-900/40 border border-blue-700/50 px-2.5 py-1 rounded-lg">
                ×{room.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Guest count */}
        <div className="flex items-center gap-2 pt-2 border-t border-blue-900/40 text-slate-400">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-medium text-slate-300">
            Occupancy: <strong className="text-white">{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
