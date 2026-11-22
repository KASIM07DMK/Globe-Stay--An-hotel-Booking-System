import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { bookingsApi, BookingOut } from '../services/bookingsApi';
import { useAuth } from '../features/auth/AuthContext';

type FilterStatus = 'all' | 'CONFIRMED' | 'PENDING_PAYMENT' | 'CANCELLED';

export const MyBookingsPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<FilterStatus>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', page, activeTab],
    queryFn: async () => {
      const statusParam = activeTab === 'all' ? undefined : (activeTab as BookingOut['status']);
      return await bookingsApi.getMyBookings(page, 10, statusParam);
    },
    enabled: isAuthenticated,
  });
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Confirmed</span>
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Payment Pending</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/60 text-red-400 border border-red-800/40">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-950/60 text-blue-300 border border-blue-800/40">
            <span>{status}</span>
          </span>
        );
    }
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto my-20 px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-glow-blue">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Access Your Bookings</h2>
          <p className="text-sm text-slate-400">
            Please log in with your registered GlobeStay credentials to view and manage your reservations.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/login" state={{ from: '/my-bookings' }}>
              <Button variant="primary">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="border-blue-900/60 text-blue-300 hover:text-white">
                Create Account
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            My Reservation Portfolio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review past excursions, monitor upcoming departures, and access travel vouchers.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-2 border-b border-blue-900/40 pb-3 overflow-x-auto">
          {[
            { id: 'all', label: 'All Reservations' },
            { id: 'CONFIRMED', label: 'Confirmed Stays' },
            { id: 'PENDING_PAYMENT', label: 'Pending Payment' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as FilterStatus);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-glow-blue'
                  : 'text-slate-400 hover:bg-blue-950/40 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-3xl w-full bg-blue-950/40" />
            ))}
          </div>
        ) : !data?.items || data.items.length === 0 ? (
          <div className="rounded-3xl border border-blue-900/50 bg-[#060D1E]/90 p-12 text-center space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">No Reservations Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              You do not have any reservations currently matching this status. Explore our curated global stays to plan your next itinerary.
            </p>
            <Link to="/search">
              <Button variant="primary" size="md">
                Explore Destinations
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.items.map((booking) => (
              <div
                key={booking.id}
                className="rounded-3xl border border-blue-900/50 bg-[#060D1E]/90 p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:border-blue-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <img
                    src={
                      booking.hotel_hero_image ||
                      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
                    }
                    alt={booking.hotel_name}
                    className="w-full sm:w-36 h-28 rounded-2xl object-cover shrink-0 border border-blue-900/40"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold font-mono text-blue-400">
                        {booking.booking_reference}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <h3 className="text-lg font-bold text-white">{booking.hotel_name}</h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>
                        {booking.hotel_city}, {booking.hotel_country}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs font-semibold text-slate-300 pt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          {booking.check_in} → {booking.check_out}
                        </span>
                      </div>
                    </div>
                    {booking.status === 'CANCELLED' && (
                      <p className="text-[11px] text-red-400/90 pt-1 flex items-center gap-1 font-medium">
                        <span>Cancelled:</span>
                        <span className="text-slate-300">{booking.cancellation_reason || 'Refund Processed'}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t md:border-t-0 pt-4 md:pt-0 border-blue-900/40 flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                  <div className="md:text-right">
                    <span className="text-xs text-slate-400 block">Total Billed</span>
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 font-sans">
                      ${Number(booking.total_amount).toFixed(2)}
                    </span>
                  </div>

                  <Link to={`/bookings/${booking.id}`}>
                    <Button variant="secondary" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {data.total_pages > 1 && (
              <div className="flex justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="border-blue-900/60 bg-[#060D1E] text-slate-300"
                >
                  Previous
                </Button>
                <span className="text-xs font-bold flex items-center px-3 text-slate-400">
                  Page {page} of {data.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-blue-900/60 bg-[#060D1E] text-slate-300"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyBookingsPage;
