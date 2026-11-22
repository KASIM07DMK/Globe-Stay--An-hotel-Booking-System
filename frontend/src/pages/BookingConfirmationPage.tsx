import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  MapPin,
  Printer,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { bookingsApi, BookingOut } from '../services/bookingsApi';
import { DigitalCheckInPass } from '../components/booking/DigitalCheckInPass';
import { useCurrency } from '../features/currency/CurrencyContext';

export const BookingConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const stateBooking = (location.state as { booking?: BookingOut })?.booking;
  const { format } = useCurrency();

  const { data: booking } = useQuery<BookingOut>({
    queryKey: ['booking-confirmation', bookingId],
    queryFn: async () => {
      if (stateBooking) return stateBooking;
      return await bookingsApi.getBookingDetail(bookingId || '1');
    },
    initialData: stateBooking,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans print:bg-white print:text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Success Banner */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600/20 border-2 border-blue-500 text-blue-400 flex items-center justify-center mx-auto shadow-glow-blue animate-bounce">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
            Payment Verified &amp; Room Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            You're Going on an Adventure!
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            A confirmation voucher and receipt have been dispatched to your email address.
          </p>
        </div>

        {/* Digital Boarding Pass & QR Key */}
        <DigitalCheckInPass
          bookingReference={booking?.booking_reference || `GS-${bookingId || '83921'}`}
          hotelName={booking?.hotel_name || 'Aman Tokyo'}
          hotelCity={booking?.hotel_city || 'Tokyo'}
          guestName={booking?.guests?.[0]?.guest_name || 'Valued Traveler'}
          checkIn={booking?.check_in || '2026-11-20'}
          checkOut={booking?.check_out || '2026-11-24'}
          roomName={booking?.rooms?.[0]?.room_type_name || 'Grand Panoramic Sanctuary Suite'}
          totalAmount={booking?.total_amount ? Number(booking.total_amount) : 324.8}
        />

        {/* Booking Card */}
        <div className="rounded-3xl border border-blue-900/50 bg-[#060D1E]/95 shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Card Header with Reference */}
          <div className="bg-gradient-to-r from-[#071233] to-[#0B1A45] border-b border-blue-800/40 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Reservation Reference
              </span>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-blue-300 font-mono mt-0.5">
                {booking?.booking_reference || `GS-${bookingId || '83921'}`}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 rounded-xl shrink-0">
              <ShieldCheck className="w-4 h-4" />
              <span>Confirmed &amp; Guaranteed</span>
            </div>
          </div>

          {/* Hotel & Stay Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start pb-6 border-b border-blue-900/40">
              {booking?.hotel_hero_image && (
                <img
                  src={booking.hotel_hero_image}
                  alt={booking?.hotel_name}
                  className="w-full sm:w-44 h-32 rounded-2xl object-cover shrink-0 border border-blue-900/40"
                />
              )}
              <div className="space-y-2 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Accommodating Sanctuary
                </span>
                <h2 className="text-xl font-bold text-white">
                  {booking?.hotel_name || 'Grand Heritage Kyoto'}
                </h2>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>
                    {booking?.hotel_city || 'Kyoto'}, {booking?.hotel_country || 'Japan'}
                  </span>
                </div>
              </div>
            </div>

            {/* Itinerary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#030712] border border-blue-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Check-In
                </span>
                <p className="text-sm font-bold text-white">{booking?.check_in || '2026-11-01'}</p>
                <span className="text-[11px] text-slate-400">From 15:00</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#030712] border border-blue-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Check-Out
                </span>
                <p className="text-sm font-bold text-white">{booking?.check_out || '2026-11-04'}</p>
                <span className="text-[11px] text-slate-400">Until 11:00</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#030712] border border-blue-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Reserved Rooms
                </span>
                <p className="text-sm font-bold text-white">
                  {booking?.rooms?.length ? `${booking.rooms.length} Suite` : '1 Deluxe Suite'}
                </p>
                <span className="text-[11px] text-slate-400">
                  {booking?.guest_count || 1} Registered Guest
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#030712] border border-blue-950">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Paid
                </span>
                <p className="text-sm font-extrabold text-blue-400">
                  {format(booking?.total_amount ? Number(booking.total_amount) : 324.8)}
                </p>
                <span className="text-[11px] text-slate-400">All Taxes Included</span>
              </div>
            </div>

            {/* Special Instructions & Cancellation */}
            <div className="rounded-2xl bg-[#030712] p-4 border border-blue-950 text-xs text-slate-300 space-y-1.5">
              <p className="font-bold text-blue-300">Check-In Instructions:</p>
              <p className="text-slate-400">
                Present this confirmation voucher along with your government-issued photo ID and credit card at the hotel front desk upon arrival.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-[#030712]/80 p-6 border-t border-blue-900/40 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4" />}
                className="border-blue-900/60 bg-[#060D1E] text-slate-300 hover:text-white"
              >
                Print Receipt
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Link to="/my-bookings">
                <Button variant="secondary" size="md">
                  View My Bookings
                </Button>
              </Link>
              <Link to="/">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
