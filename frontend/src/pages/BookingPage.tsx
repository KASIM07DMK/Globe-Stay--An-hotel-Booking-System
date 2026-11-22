import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { BookingSummary } from '../components/booking/BookingSummary';
import { PriceBreakdown } from '../components/booking/PriceBreakdown';
import { hotelsApi } from '../services/hotelsApi';
import { bookingsApi, BookingOut } from '../services/bookingsApi';
import { paymentsApi } from '../services/paymentsApi';
import { useAuth } from '../features/auth/AuthContext';
import { useCurrency } from '../features/currency/CurrencyContext';
import { useToast } from '../features/toast/ToastContext';
import { mockHotels } from '../features/hotels/mockData';

const bookingFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid contact phone number'),
  specialRequests: z.string().optional(),
  cardNumber: z.string().min(15, 'Card number must be valid').max(19),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Format MM/YY required'),
  cardCvc: z.string().min(3, '3 or 4 digits required').max(4),
  cardholderName: z.string().min(2, 'Cardholder name is required'),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

const SLUG_TO_ID: Record<string, number> = {
  'htl-aman-tokyo': 1,
  'htl-paris-vendome': 2,
  'htl-dubai-marina-palace': 3,
  'htl-manhattan-loft': 4,
  'htl-bali-ubud-resort': 5,
  'htl-london-mayfair': 6,
};

const resolveNumericHotelId = (idStr: string): number => {
  if (SLUG_TO_ID[idStr]) return SLUG_TO_ID[idStr];
  const parsed = parseInt(idStr, 10);
  return isNaN(parsed) ? 1 : parsed;
};

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const rawHotelId = searchParams.get('hotelId') || '1';
  const numericHotelId = resolveNumericHotelId(rawHotelId);
  const hotelId = String(numericHotelId);
  const rawRoomId = searchParams.get('roomId');
  const parsedRoomId = rawRoomId ? parseInt(rawRoomId, 10) : NaN;
  const roomId = !isNaN(parsedRoomId) && parsedRoomId < 100 ? parsedRoomId : (numericHotelId - 1) * 3 + 1;
  const checkIn = searchParams.get('checkIn') || new Date().toISOString().split('T')[0];
  const defaultCheckOut = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  };
  const checkOut = searchParams.get('checkOut') || defaultCheckOut();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const { format, currency: globalCurrency } = useCurrency();
  const { showToast } = useToast();

  // Fetch hotel details
  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel-booking', hotelId],
    queryFn: async () => {
      try {
        return await hotelsApi.getHotelDetail(hotelId);
      } catch {
        const fallback = mockHotels.find((h) => h.id.toString() === hotelId) || mockHotels[0];
        const baseRoomId = (numericHotelId - 1) * 3 + 1;
        return {
          id: numericHotelId,
          name: fallback.name,
          city: fallback.city,
          country: fallback.country,
          hero_image: fallback.heroImage,
          starting_price: fallback.pricePerNight,
          cancellation_policy: fallback.cancellationPolicy,
          room_types: [
            {
              id: baseRoomId,
              hotel_id: numericHotelId,
              name: 'Deluxe Sanctuary Suite',
              description: 'King bed with panoramic city vistas',
              maximum_occupancy: 2,
              bed_configuration: '1 King Bed',
              base_price: fallback.pricePerNight,
              currency: 'USD',
              total_inventory_count: 5,
              status: 'active',
            },
          ],
        };
      }
    },
  });

  const selectedRoom =
    hotel?.room_types?.find((r) => r.id === roomId) ||
    hotel?.room_types?.[0] || {
      id: roomId,
      name: 'Sanctuary Suite',
      base_price: hotel?.starting_price || 280,
      currency: 'USD',
    };

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const VIP_EXPERIENCES = [
    {
      id: 'chauffeur',
      name: 'Private Airport Chauffeur (Mercedes-Maybach)',
      description: 'VIP meet-and-greet curbside at airport arrival terminal with private luggage escort.',
      price: 120,
      icon: '🚗',
    },
    {
      id: 'champagne',
      name: 'Veuve Clicquot & Artisan Truffles on Arrival',
      description: 'Chilled bottle of French Champagne & hand-crafted Belgian chocolate confections placed in suite.',
      price: 95,
      icon: '🍾',
    },
    {
      id: 'spa',
      name: 'VIP Thermal Suite & Hydrotherapy Day Pass',
      description: 'All-day private access to hydrotherapy vitality pools, cedar saunas, and relaxation lounges.',
      price: 80,
      icon: '🧖',
    },
    {
      id: 'breakfast',
      name: 'Michelin-Inspired Daily Gourmet Breakfast',
      description: 'A la carte culinary morning spread served in suite or private garden terrace.',
      price: 45 * nights,
      icon: '🍳',
    },
  ];

  const handleToggleAddOn = (id: string) => {
    const next = selectedAddOns.includes(id)
      ? selectedAddOns.filter((item) => item !== id)
      : [...selectedAddOns, id];
    setSelectedAddOns(next);
    const item = VIP_EXPERIENCES.find((e) => e.id === id);
    if (item) {
      showToast(
        next.includes(id) ? `Added ${item.name}` : `Removed ${item.name}`,
        next.includes(id) ? 'success' : 'info'
      );
    }
  };

  const activeAddOnsList = VIP_EXPERIENCES.filter((e) => selectedAddOns.includes(e.id)).map((e) => ({
    name: e.name,
    amount: e.price,
  }));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: user?.full_name || '',
      email: user?.email || '',
      phone: '+1 555-0199',
      specialRequests: '',
      cardNumber: '4242 4242 4242 4242',
      cardExpiry: '12/28',
      cardCvc: '888',
      cardholderName: user?.full_name || 'Valued Traveler',
    },
  });

  const onSubmit = async (formData: BookingFormData) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);

    try {
      // 1. Create booking in backend
      const bookingPayload = {
        hotel_id: hotel?.id ? Number(hotel.id) : numericHotelId,
        check_in: checkIn,
        check_out: checkOut,
        rooms: [{ room_type_id: selectedRoom.id, quantity: 1 }],
        guests: [{ guest_name: formData.fullName, guest_type: 'adult' as const }],
        display_currency: selectedRoom.currency || 'USD',
      };

      const booking: BookingOut = await bookingsApi.createBooking(bookingPayload);

      // 2. Process sandbox payment
      const idempotencyKey = `pay_${booking.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await paymentsApi.processPayment({
        booking_id: booking.id,
        payment_method: 'credit_card',
        card_token: 'tok_sandbox_visa_verified',
        idempotency_key: idempotencyKey,
      });

      // 3. Navigate to confirmation
      navigate(`/booking-confirmation/${booking.id}`, { state: { booking } });
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Payment processing encountered an issue. Please verify your details.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#030712]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12 w-full space-y-6">
          <Skeleton className="h-8 w-1/3 bg-blue-950/40" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="lg:col-span-2 h-96 rounded-3xl bg-blue-950/40" />
            <Skeleton className="h-96 rounded-3xl bg-blue-950/40" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Title */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/" className="hover:text-blue-400 transition">Home</Link>
            <span>/</span>
            <Link to={`/hotels/${hotelId}`} className="hover:text-blue-400 transition">{hotel?.name}</Link>
            <span>/</span>
            <span className="text-blue-400">Confirm Reservation</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Complete Your Reservation</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Instant Confirmation
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review your itinerary, enter guest details, and secure your room with immediate confirmation.
          </p>
        </div>

        {/* Hold Guarantee Banner */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#071233] to-[#0A1A4A] border border-blue-800/40 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_25px_rgba(37,99,235,0.12)]">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Guaranteed Room Allocation</p>
              <p className="text-xs text-blue-200/80">
                Your suite is reserved exclusively for you during this checkout session.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300 bg-blue-950/60 border border-blue-800/50 px-3.5 py-1.5 rounded-xl shrink-0">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Encrypted 256-bit Checkout</span>
          </div>
        </div>

        {/* Auth prompt if not signed in */}
        {!isAuthenticated && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-amber-300">Booking as Guest</p>
                <p className="text-amber-200/80">
                  Sign in or create an account to earn GlobeStay points and view reservations easily.
                </p>
              </div>
            </div>
            <Link to="/login" state={{ from: window.location.pathname + window.location.search }}>
              <Button variant="outline" size="sm" className="shrink-0 bg-transparent border-amber-500/50 text-amber-300 hover:bg-amber-500/10">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-red-950/50 border border-red-800/50 text-red-300 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Form */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" id="booking-form">
              {/* 1. Guest Information */}
              <div className="bg-[#060D1E]/90 border border-blue-900/50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-6">
                <div className="flex items-center space-x-3 pb-4 border-b border-blue-900/40">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="text-lg font-bold text-white">Primary Guest Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Full Name (as on Government ID)"
                      placeholder="e.g. John Doe"
                      leftIcon={<User className="w-4 h-4 text-blue-400" />}
                      error={errors.fullName?.message}
                      {...register('fullName')}
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    leftIcon={<Mail className="w-4 h-4 text-blue-400" />}
                    error={errors.email?.message}
                    helperText="Booking confirmation and receipt will be sent here"
                    {...register('email')}
                  />

                  <Input
                    label="Contact Phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    leftIcon={<Phone className="w-4 h-4 text-blue-400" />}
                    error={errors.phone?.message}
                    helperText="For vital check-in notifications"
                    {...register('phone')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Special Requests (Optional)
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      placeholder="Early check-in, dietary accommodations, high-floor preference..."
                      className="w-full rounded-xl border border-blue-900/60 bg-[#030712] p-3.5 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      {...register('specialRequests')}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Special requests cannot be guaranteed but the property will do its utmost to accommodate.
                  </p>
                </div>
              </div>

              {/* 2. Bespoke VIP Concierge Experiences */}
              <div className="bg-[#060D1E]/90 border border-blue-900/50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-accent-500/20 border border-accent-500/40 text-accent-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>VIP Concierge &amp; Bespoke Experiences</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-300 border border-accent-500/30">
                          Optional Curations
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">Personalize your luxury stay with tailored private services.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {VIP_EXPERIENCES.map((exp) => {
                    const isSelected = selectedAddOns.includes(exp.id);
                    return (
                      <div
                        key={exp.id}
                        onClick={() => handleToggleAddOn(exp.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-blue-950/70 border-accent-400 shadow-glow-blue'
                            : 'bg-[#030712] border-blue-900/40 hover:border-blue-700/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl shrink-0">{exp.icon}</span>
                            <div>
                              <h3 className="text-xs font-bold text-white leading-snug">{exp.name}</h3>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-accent-500 border-accent-400 text-brand-950 font-bold'
                                : 'border-blue-800 bg-blue-950/40'
                            }`}
                          >
                            {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-blue-900/30 text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Curated Rate</span>
                          <span className="font-extrabold text-accent-300">
                            +{format(exp.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="bg-[#060D1E]/90 border border-blue-900/50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-blue-900/40">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Payment Information</h2>
                      <p className="text-xs text-blue-300">Sandbox Test Mode — Any test card is accepted</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
                    <Lock className="w-3.5 h-3.5" />
                    <span>SSL Secured</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Cardholder Name"
                    placeholder="Name as it appears on card"
                    leftIcon={<User className="w-4 h-4 text-blue-400" />}
                    error={errors.cardholderName?.message}
                    {...register('cardholderName')}
                  />

                  <Input
                    label="Card Number"
                    placeholder="4242 •••• •••• 4242"
                    leftIcon={<CreditCard className="w-4 h-4 text-blue-400" />}
                    error={errors.cardNumber?.message}
                    {...register('cardNumber')}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiration Date"
                      placeholder="MM/YY"
                      error={errors.cardExpiry?.message}
                      {...register('cardExpiry')}
                    />
                    <Input
                      label="CVC / CVV"
                      placeholder="123"
                      error={errors.cardCvc?.message}
                      {...register('cardCvc')}
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-[#030712] p-4 border border-blue-950 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2 font-semibold text-emerald-400">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Free cancellation before {checkIn}</span>
                  </div>
                  <p className="text-slate-400">
                    By completing this booking, you agree to GlobeStay's Booking Conditions and {hotel?.name}'s reservation policies.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full text-base py-4 font-bold shadow-glow-blue"
                  isLoading={isProcessing}
                >
                  Pay &amp; Confirm Booking
                </Button>
              </div>
            </form>
          </div>

          {/* Right Col: Sticky Summary */}
          <div className="lg:col-span-1 space-y-6">
            <BookingSummary
              hotelName={hotel?.name || 'Grand Heritage'}
              hotelCity={hotel?.city || 'Tokyo'}
              hotelCountry={hotel?.country || 'Japan'}
              heroImage={hotel?.hero_image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'}
              checkIn={checkIn}
              checkOut={checkOut}
              rooms={[
                {
                  room_type_id: selectedRoom.id,
                  room_type_name: selectedRoom.name,
                  quantity: 1,
                  price_per_night: Number(selectedRoom.base_price),
                  currency: selectedRoom.currency || 'USD',
                },
              ]}
              guestCount={1}
            />

            <PriceBreakdown
              basePrice={Number(selectedRoom.base_price)}
              nights={nights}
              quantity={1}
              currency={globalCurrency}
              addOns={activeAddOnsList}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
