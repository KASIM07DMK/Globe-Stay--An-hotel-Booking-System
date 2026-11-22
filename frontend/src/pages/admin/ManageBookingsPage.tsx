import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  Clock,
  XCircle,
  Eye,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { BookingOut } from '../../services/bookingsApi';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';

export const ManageBookingsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<BookingOut | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page, statusFilter],
    queryFn: async () => {
      return await adminApi.getBookings(
        page,
        15,
        statusFilter === 'all' ? undefined : statusFilter
      );
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Confirmed</span>
          </span>
        );
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Pending</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800/40">
            <XCircle className="w-3 h-3 text-red-400" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800/40">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayout
      title="Global Reservation Ledger"
      description="Monitor active guest reservations, audit inventory holds, and trace financial settlement."
    >
      <div className="bg-[#060D1E]/90 rounded-3xl border border-blue-900/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 sm:p-6 border-b border-blue-900/40 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Bookings' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'pending_payment', label: 'Pending Settlement' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-glow-blue'
                    : 'text-slate-400 hover:bg-blue-950/40 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Total Records: <strong className="text-blue-400">{data?.total || 0}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#030712] border-b border-blue-900/40 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Reference</th>
                <th className="py-3.5 px-6">Destination Property</th>
                <th className="py-3.5 px-6">Check-In / Out</th>
                <th className="py-3.5 px-6">Guests</th>
                <th className="py-3.5 px-6">Total Billed</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/30">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Skeleton className="h-6 w-full bg-blue-950/40" />
                  </td>
                </tr>
              ) : !data?.items || data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No reservations found matching this filter criteria.
                  </td>
                </tr>
              ) : (
                data.items.map((booking) => (
                  <tr key={booking.id} className="hover:bg-blue-950/20 transition">
                    <td className="py-4 px-6 font-mono font-bold text-blue-400">
                      {booking.booking_reference}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-white">{booking.hotel_name}</p>
                      <span className="text-[10px] text-slate-400">
                        {booking.hotel_city}, {booking.hotel_country}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-medium">
                      {booking.check_in} → {booking.check_out}
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-semibold">
                      {booking.guest_count} Guest{booking.guest_count > 1 ? 's' : ''}
                    </td>
                    <td className="py-4 px-6 font-bold text-white">
                      ${Number(booking.total_amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(booking.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Audit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="p-4 border-t border-blue-900/40 flex justify-between items-center bg-[#030712]">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-blue-900/60 bg-[#060D1E] text-slate-300"
            >
              Previous
            </Button>
            <span className="text-xs text-slate-400">
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

      {/* Booking Details Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={`Audit Record: ${selectedBooking?.booking_reference || ''}`}
        maxWidth="lg"
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#030712] border border-blue-950 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Hotel Name:</span>
                <span className="font-bold text-white">{selectedBooking.hotel_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="font-semibold text-slate-300">
                  {selectedBooking.hotel_city}, {selectedBooking.hotel_country}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stay Duration:</span>
                <span className="font-semibold text-slate-300">
                  {selectedBooking.check_in} to {selectedBooking.check_out}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span>{getStatusBadge(selectedBooking.status)}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#030712] border border-blue-950 space-y-2">
              <span className="font-bold text-white block">Financial Breakdown</span>
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>${Number(selectedBooking.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Taxes</span>
                <span>${Number(selectedBooking.taxes).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Platform Fees</span>
                <span>${Number(selectedBooking.fees).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-2 border-t border-blue-900/40">
                <span>Total Amount Charged</span>
                <span className="text-blue-400 font-black">${Number(selectedBooking.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedBooking(null)}>
                Close Audit View
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default ManageBookingsPage;
