import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  MapPin,
  Clock,
  Printer,
  XCircle,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Receipt,
  Star,
  MessageSquare,
  ShieldCheck,
  FileText,
  Compass,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { bookingsApi, BookingOut } from '../services/bookingsApi';
import { reviewsApi } from '../services/reviewsApi';
import { useAuth } from '../features/auth/AuthContext';
import { useCurrency } from '../features/currency/CurrencyContext';
import { DigitalCheckInPass } from '../components/booking/DigitalCheckInPass';

export const BookingDetailsPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { format } = useCurrency();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('Change of travel dates / itinerary');
  const [customReason, setCustomReason] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const { data: booking, isLoading, isError } = useQuery<BookingOut>({
    queryKey: ['booking-detail', bookingId],
    queryFn: async () => {
      return await bookingsApi.getBookingDetail(bookingId || '1');
    },
    enabled: !!bookingId,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!bookingId) return;
      const reasonToSubmit =
        cancellationReason === 'Other' && customReason.trim()
          ? customReason.trim()
          : cancellationReason;
      return await bookingsApi.cancelBooking(bookingId, reasonToSubmit);
    },
    onSuccess: (updatedBooking) => {
      setIsCancelModalOpen(false);
      queryClient.setQueryData(['booking-detail', bookingId], updatedBooking);
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!bookingId) return;
      return await reviewsApi.createReview({
        booking_id: parseInt(bookingId, 10),
        rating,
        comment: reviewComment,
      });
    },
    onSuccess: () => {
      setReviewSuccess(true);
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess(false);
        setReviewComment('');
      }, 1500);
    },
    onError: (err: any) => {
      setReviewError(err.message || 'Failed to submit review. Comment must be at least 10 characters.');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#030712]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 w-full space-y-6">
          <Skeleton className="h-8 w-1/3 bg-blue-950/40" />
          <Skeleton className="h-64 rounded-3xl bg-blue-950/40" />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100">
        <Navbar />
        <div className="max-w-md mx-auto my-24 p-8 bg-[#060D1E] rounded-3xl border border-blue-900/50 text-center shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
          <p className="text-xs text-slate-400 mt-2">
            The reservation record you requested is either unavailable or belongs to another user profile.
          </p>
          <Link to="/my-bookings" className="mt-6 inline-block">
            <Button variant="primary">Return to Reservations</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const statusLower = booking.status?.toLowerCase();
  const canCancel = statusLower === 'confirmed' || statusLower === 'pending_payment';
  const canReview = statusLower === 'confirmed';

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans print:bg-white print:text-slate-900 selection:bg-blue-600 selection:text-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Breadcrumb & Actions */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/my-bookings"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Bookings</span>
          </Link>

          <div className="flex items-center space-x-3">
            {canReview && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReviewModalOpen(true)}
                leftIcon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
              >
                Write Review
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInvoiceModalOpen(true)}
              leftIcon={<Receipt className="w-4 h-4 text-accent-400" />}
              className="border-blue-900/60 bg-[#060D1E] text-slate-300 hover:text-white"
            >
              Tax Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-4 h-4" />}
              className="border-blue-900/60 bg-[#060D1E] text-slate-300 hover:text-white"
            >
              Print Record
            </Button>
            {canCancel && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Cancel Reservation
              </Button>
            )}
          </div>
        </div>

        {/* Status Header */}
        <div className="bg-[#060D1E]/90 rounded-3xl border border-blue-900/50 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Reservation Reference
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 font-mono">
              {booking.booking_reference}
            </h1>
            <p className="text-xs text-slate-400">
              Created on {new Date(booking.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="shrink-0">
            {statusLower === 'confirmed' && (
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-bold text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Confirmed &amp; Secured</span>
              </div>
            )}
            {statusLower === 'pending_payment' && (
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-950/60 border border-amber-800/50 text-amber-400 font-bold text-sm">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Pending Settlement</span>
              </div>
            )}
            {statusLower === 'cancelled' && (
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-red-950/60 border border-red-800/50 text-red-400 font-bold text-sm">
                <XCircle className="w-5 h-5 text-red-400" />
                <span>Reservation Cancelled</span>
              </div>
            )}
          </div>
        </div>

        {/* Cancelled Info Alert */}
        {statusLower === 'cancelled' && (
          <div className="rounded-2xl border border-red-800/40 bg-red-950/30 p-4 sm:p-5 flex items-start gap-3.5 shadow-sm">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-red-300">Reservation Cancelled &amp; Inventory Released</h4>
              <p className="text-xs text-red-200/90">
                <span className="font-semibold text-slate-300">Reason:</span> {booking.cancellation_reason || 'Cancelled upon customer request'}
              </p>
              <p className="text-[11px] text-slate-400">
                Any pre-authorized amounts or completed payments (${Number(booking.total_amount).toFixed(2)}) have been scheduled for full automatic refund via your payment provider.
              </p>
            </div>
          </div>
        )}

        {/* Digital Boarding Pass & QR Key for Confirmed Guests */}
        {statusLower === 'confirmed' && (
          <DigitalCheckInPass
            bookingReference={booking.booking_reference}
            hotelName={booking.hotel_name}
            hotelCity={booking.hotel_city}
            guestName={booking.guests?.[0]?.guest_name || 'Valued Guest'}
            checkIn={booking.check_in}
            checkOut={booking.check_out}
            roomName={booking.rooms?.[0]?.room_type_name || 'Deluxe Suite'}
            totalAmount={Number(booking.total_amount)}
          />
        )}

        {/* Accommodation Overview */}
        <div className="bg-[#060D1E]/90 rounded-3xl border border-blue-900/50 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={
                booking.hotel_hero_image ||
                'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
              }
              alt={booking.hotel_name}
              className="w-full sm:w-48 h-36 rounded-2xl object-cover shrink-0 border border-blue-900/40"
            />
            <div className="space-y-2 flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Property Destination
              </span>
              <h2 className="text-xl font-bold text-white">{booking.hotel_name}</h2>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  {booking.hotel_city}, {booking.hotel_country}
                </span>
              </div>
              <div className="pt-2">
                <Link
                  to={`/hotels/${booking.hotel_id}`}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 underline"
                >
                  View Hotel Details &amp; Directory
                </Link>
              </div>
            </div>
          </div>

          {/* Stay Timings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-blue-900/40">
            <div className="p-4 rounded-2xl bg-[#030712] border border-blue-950">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Check-In
              </span>
              <p className="text-sm font-bold text-white">{booking.check_in}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#030712] border border-blue-950">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Check-Out
              </span>
              <p className="text-sm font-bold text-white">{booking.check_out}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#030712] border border-blue-950">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Guests
              </span>
              <p className="text-sm font-bold text-white">
                {booking.guest_count} Registered
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#030712] border border-blue-950">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Rooms
              </span>
              <p className="text-sm font-bold text-white">
                {booking.rooms?.length || 1} Reserved
              </p>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-[#060D1E]/90 rounded-3xl border border-blue-900/50 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-4">
          <div className="flex items-center space-x-2 pb-4 border-b border-blue-900/40">
            <Receipt className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Billing Summary</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Accommodation Subtotal</span>
              <span className="font-semibold text-white">
                {format(Number(booking.subtotal))}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Occupancy Taxes &amp; Surcharges</span>
              <span className="font-semibold text-white">
                {format(Number(booking.taxes))}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>GlobeStay Facilitation Fee</span>
              <span className="font-semibold text-white">
                {format(Number(booking.fees))}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-blue-900/40 flex justify-between items-baseline">
            <span className="text-sm font-bold text-white">Total Amount Charged</span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">
              {format(Number(booking.total_amount))}
            </span>
          </div>
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Confirm Cancellation"
        description="Are you certain you wish to release this room hold?"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Releasing this reservation will return the suite to public inventory. Refund processing will be governed by the property's cancellation rules.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Please select reason for cancellation:
            </label>
            <select
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-blue-900/60 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="Change of travel dates / itinerary">Change of travel dates / itinerary</option>
              <option value="Found alternative accommodation">Found alternative accommodation</option>
              <option value="Personal emergency or illness">Personal emergency or illness</option>
              <option value="Reservation made by mistake">Reservation made by mistake</option>
              <option value="Work / flight schedule conflict">Work / flight schedule conflict</option>
              <option value="Other">Other reason</option>
            </select>
          </div>

          {cancellationReason === 'Other' && (
            <div>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Please describe why you are cancelling..."
                className="w-full h-20 p-2.5 rounded-xl bg-[#030712] border border-blue-900/60 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 flex items-center justify-between">
            <span>Estimated Refund Eligible:</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">
              ${Number(booking.total_amount).toFixed(2)} USD
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsCancelModalOpen(false)}
              className="border-blue-900/60 bg-[#060D1E] text-slate-300"
            >
              Keep Reservation
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Tax Invoice & Travel Voucher Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Official Tax Invoice & Voucher"
        description="GlobeStay International Hospitality & Reservations Ltd."
      >
        <div className="space-y-6 pt-2 font-sans text-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-black tracking-wider text-white">GLOBESTAY</span>
                <span className="text-[10px] text-slate-400 block font-mono">TAX INVOICE #INV-{booking.booking_reference}</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <span className="block font-mono">Date: {new Date(booking.created_at).toLocaleDateString()}</span>
              <span className="text-emerald-400 font-bold">PAID IN FULL</span>
            </div>
          </div>

          {/* Guest and Hotel Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-[#030712] p-4 rounded-2xl border border-blue-950">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Billed To (Guest)</span>
              <p className="font-bold text-white">{booking.guests?.[0]?.guest_name || 'Valued Guest'}</p>
              <p className="text-slate-400 text-[11px]">GlobeStay Rewards Member</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Property Reserved</span>
              <p className="font-bold text-white">{booking.hotel_name}</p>
              <p className="text-slate-400 text-[11px]">{booking.hotel_city}, {booking.hotel_country}</p>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-400 border-b border-blue-900/30 pb-1">
              <span>Item Description</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Room Accommodations ({booking.check_in} to {booking.check_out})</span>
              <span>${Number(booking.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Occupancy &amp; Regional Tourism Taxes (12%)</span>
              <span>${Number(booking.taxes).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Standard Service &amp; Technology Fee</span>
              <span>${Number(booking.fees).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-900/40 font-bold text-sm text-white">
              <span>Total Paid ({booking.display_currency || 'USD'})</span>
              <span className="text-emerald-400">${Number(booking.total_amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer & Print */}
          <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 border-t border-blue-900/30">
            <span>Payment Provider: Sandbox Verified (tok_sandbox_verified)</span>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => window.print()}
            >
              Print Invoice
            </Button>
          </div>
        </div>
      </Modal>

      {/* Leave Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Rate & Review Your Stay"
        description={`Share your feedback for ${booking.hotel_name}`}
      >
        <div className="space-y-4 pt-2">
          {reviewSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-center font-bold text-sm">
              Thank you! Your review has been submitted successfully.
            </div>
          ) : (
            <>
              {reviewError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-300 text-xs font-semibold">
                  {reviewError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-blue-300 ml-2">
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Your Feedback (minimum 10 characters)
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe the rooms, service, amenities, and overall experience..."
                  className="w-full rounded-xl border border-blue-900/60 bg-[#030712] p-3 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="border-blue-900/60 bg-[#060D1E] text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  isLoading={reviewMutation.isPending}
                  disabled={reviewComment.trim().length < 10}
                  onClick={() => reviewMutation.mutate()}
                >
                  Submit Review
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default BookingDetailsPage;
