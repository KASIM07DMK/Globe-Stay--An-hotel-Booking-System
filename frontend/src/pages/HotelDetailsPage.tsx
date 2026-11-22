import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Star, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  Bed, 
  Coffee, 
  Wifi, 
  Sparkles, 
  ArrowLeft,
  ChevronRight,
  Heart,
  Share2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HotelGallery } from '../components/hotels/HotelGallery';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { hotelsApi, HotelDetailResponse } from '../services/hotelsApi';
import { mockHotels } from '../features/hotels/mockData';
import { useCurrency } from '../features/currency/CurrencyContext';
import { useToast } from '../features/toast/ToastContext';
import { useWishlist } from '../features/wishlist/WishlistContext';

export const HotelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency, setCurrency, format } = useCurrency();
  const { showToast } = useToast();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });

  const hotelIdNumber = parseInt(id || '1', 10);

  // TanStack Query to fetch hotel details
  const { data: hotel, isLoading, isError } = useQuery<HotelDetailResponse>({
    queryKey: ['hotel-detail', id],
    queryFn: async (): Promise<HotelDetailResponse> => {
      try {
        return await hotelsApi.getHotelDetail(id || '1');
      } catch (err) {
        // Fallback to mock item if backend is offline
        const fallback = mockHotels.find((h) => h.id === id) || mockHotels[0];
        const targetHotelId = typeof fallback.id === 'string' ? (parseInt(fallback.id, 10) || 1) : fallback.id;
        const baseRoomId = (targetHotelId - 1) * 3 + 1;
        return {
          id: targetHotelId,
          name: fallback.name,
          tagline: fallback.tagline,
          description: fallback.description,
          city: fallback.city,
          country: fallback.country,
          country_code: fallback.countryCode,
          address: fallback.address,
          latitude: fallback.latitude,
          longitude: fallback.longitude,
          star_rating: fallback.starRating,
          base_currency: fallback.currency,
          hero_image: fallback.heroImage,
          images: fallback.images,
          category: fallback.category,
          cancellation_policy: fallback.cancellationPolicy,
          status: 'active',
          starting_price: fallback.pricePerNight,
          guest_rating: fallback.guestRating,
          review_count: fallback.reviewCount,
          check_in_time: '15:00',
          check_out_time: '11:00',
          amenities: fallback.amenities,
          full_amenities: fallback.amenities.map((a, i) => ({
            id: String(i + 1),
            name: a,
            category: 'hotel' as const,
            icon: 'sparkles',
          })),
          room_types: [
            {
              id: baseRoomId,
              hotel_id: targetHotelId,
              name: 'Deluxe Sanctuary Suite',
              description: 'Panoramic floor-to-ceiling windows, private soaking cedar onsen bath, and bespoke organic linens.',
              maximum_occupancy: 2,
              bed_configuration: '1 King Bed',
              base_price: fallback.pricePerNight,
              currency: 'USD',
              total_inventory_count: 10,
              status: 'active',
            },
            {
              id: baseRoomId + 1,
              hotel_id: targetHotelId,
              name: 'Skyline Executive Suite',
              description: 'Corner suite with luxury bedding, walk-in rain shower, and dedicated espresso bar.',
              maximum_occupancy: 3,
              bed_configuration: '2 Double Beds',
              base_price: fallback.pricePerNight + 120,
              currency: 'USD',
              total_inventory_count: 8,
              status: 'active',
            },
            {
              id: baseRoomId + 2,
              hotel_id: targetHotelId,
              name: 'Royal Landmark Penthouse',
              description: 'Top-tier duplex suite with private rooftop terrace, dedicated butler service, and 360-degree vistas.',
              maximum_occupancy: 4,
              bed_configuration: '2 King Beds',
              base_price: fallback.pricePerNight * 2,
              currency: 'USD',
              total_inventory_count: 3,
              status: 'active',
            },
          ],
          reviews: [
            {
              id: 1,
              user_name: 'Elena Rostova',
              rating: 5,
              comment: 'The check-in was seamless with GlobeStay. The instant booking hold meant no anxiety about losing our suite during peak cherry blossom season.',
              created_at: 'October 2026',
            },
            {
              id: 2,
              user_name: 'Alexander Wright',
              rating: 5,
              comment: 'Flawless room service, impeccably quiet rooms, and stunning architectural craftsmanship.',
              created_at: 'September 2026',
            },
          ],
        } as HotelDetailResponse;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  // Phase 6: Real-time room availability query
  const { data: availabilityData } = useQuery({
    queryKey: ['hotel-availability', id, checkInDate, checkOutDate],
    queryFn: async () => {
      try {
        if (!checkInDate || !checkOutDate || checkInDate >= checkOutDate) return null;
        return await hotelsApi.checkAvailability(id || '1', checkInDate, checkOutDate, 1);
      } catch {
        return null;
      }
    },
    enabled: !!id && !!checkInDate && !!checkOutDate && checkInDate < checkOutDate,
  });

  const handleSelectRoomAndBook = (roomId: number) => {
    setSelectedRoomId(roomId);
    navigate(
      `/booking?hotelId=${hotel?.id}&roomId=${roomId}&checkIn=${checkInDate}&checkOut=${checkOutDate}`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar currentCurrency={currency} onCurrencyChange={setCurrency} />
        <div className="max-w-7xl mx-auto px-4 py-12 w-full space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="aspect-[21/9] w-full rounded-3xl" />
          <div className="grid grid-cols-3 gap-8">
            <Skeleton className="col-span-2 h-64 rounded-2xl" />
            <Skeleton className="col-span-1 h-64 rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar currentCurrency={currency} onCurrencyChange={setCurrency} />
        <div className="max-w-md mx-auto my-24 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-card">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-brand-950">Property Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            The requested hotel listing is unavailable or has been archived.
          </p>
          <Link to="/search" className="mt-6 inline-block">
            <Button variant="accent">Back to Search</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans">
      <Navbar currentCurrency={currency} onCurrencyChange={setCurrency} />

      {/* Breadcrumb Navigation */}
      <div className="bg-[#020617] border-b border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs font-semibold text-blue-300">
          <div className="flex items-center space-x-2 truncate">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <Link to={`/search?destination=${encodeURIComponent(hotel.city)}`} className="hover:text-white transition">
              {hotel.city}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-white font-bold truncate">{hotel.name}</span>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => {
                if (hotel) toggleWishlist(hotel.id, hotel.name);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-blue-900/60 bg-[#060D1E] hover:bg-blue-950/60 transition text-slate-200"
            >
              <Heart className={`w-4 h-4 ${hotel && isWishlisted(hotel.id) ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="hidden sm:inline">{hotel && isWishlisted(hotel.id) ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast('Property link copied to clipboard', 'info');
              }}
              className="p-1.5 rounded-xl border border-blue-900/60 bg-[#060D1E] hover:bg-blue-950/60 transition text-slate-200"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Header Section */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-950 text-accent-300 border border-blue-800">
              {hotel.category} Collection
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{hotel.cancellation_policy}</span>
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {hotel.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-medium mt-1">
                {hotel.tagline}
              </p>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-blue-300 mt-2">
                <MapPin className="w-4 h-4 text-accent-400 shrink-0" />
                <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
              </div>
            </div>

            {/* Ratings & Starting Price Banner */}
            <div className="flex items-center space-x-4 shrink-0 bg-[#060D1E] p-3 rounded-2xl border border-blue-900/60 shadow-card-dark">
              <div className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-sm text-white">{hotel.guest_rating.toFixed(1)}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">{hotel.review_count} verified reviews</p>
              </div>
              <div className="h-8 w-px bg-blue-950" />
              <div>
                <span className="text-[10px] text-blue-400 block font-bold uppercase">From</span>
                <span className="text-xl font-black text-white">
                  {format(Number(hotel.starting_price))}
                  <span className="text-xs font-normal text-slate-400"> / nt</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Showcase */}
        <HotelGallery images={hotel.images} hotelName={hotel.name} />

        {/* Two-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Description, Rooms, Amenities, Reviews */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview & Highlights */}
            <section className="bg-[#060D1E] rounded-3xl p-6 sm:p-8 border border-blue-900/50 shadow-card-dark space-y-4">
              <h2 className="text-xl font-bold text-white">About This Sanctuary</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {hotel.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-blue-950 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Clock className="w-4 h-4 text-accent-400" />
                  <span>Check-in: <strong className="text-white">{hotel.check_in_time}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Clock className="w-4 h-4 text-accent-400" />
                  <span>Check-out: <strong className="text-white">{hotel.check_out_time}</strong></span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-accent-400" />
                  <span>Zero Overbooking Held</span>
                </div>
              </div>
            </section>

            {/* Room Types & Availability Selector */}
            <section id="available-rooms" className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Available Room Types</h2>
                <p className="text-xs text-blue-300/80 mt-0.5">
                  Select your preferred accommodation with guaranteed room reservation hold
                </p>
              </div>

              <div className="space-y-4">
                {hotel.room_types.map((room) => {
                  const availInfo = availabilityData?.room_types?.find((r) => r.room_type_id === room.id);
                  const availableCount = availInfo !== undefined ? availInfo.min_available : room.total_inventory_count;
                  const isSoldOut = availInfo !== undefined ? (!availInfo.is_available || availableCount <= 0) : false;

                  return (
                    <div
                      key={room.id}
                      className="bg-[#060D1E] rounded-3xl border border-blue-900/50 p-6 shadow-card-dark hover:border-blue-500/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white">{room.name}</h3>
                          {isSoldOut ? (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-950/80 text-red-400 border border-red-800/60">
                              Sold Out for Dates
                            </span>
                          ) : availableCount <= 2 ? (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 animate-pulse">
                              🔥 Only {availableCount} suites left!
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-accent-300 border border-blue-800">
                              ✓ {availableCount} Available
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{room.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
                          <div className="flex items-center space-x-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            <span>Up to {room.maximum_occupancy} Guests</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Bed className="w-3.5 h-3.5 text-blue-400" />
                            <span>{room.bed_configuration}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Instant Confirmation</span>
                          </div>
                        </div>
                      </div>

                      {/* Price and CTA */}
                      <div className="md:text-right shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-blue-950 flex md:flex-col justify-between items-center md:items-end gap-2">
                        <div>
                          <span className="text-xl font-extrabold text-white font-sans">
                            {format(Number(room.base_price))}
                          </span>
                          <span className="text-xs text-slate-400"> / night</span>
                          <span className="text-[10px] text-blue-400 block">+ taxes &amp; fees</span>
                        </div>

                        <Button
                          variant={isSoldOut ? "outline" : "accent"}
                          size="md"
                          disabled={isSoldOut}
                          onClick={() => handleSelectRoomAndBook(room.id)}
                          className="px-6"
                        >
                          {isSoldOut ? "Sold Out" : "Reserve Suite"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Categorized Hotel Amenities */}
            <section className="bg-[#060D1E] rounded-3xl p-6 sm:p-8 border border-blue-900/50 shadow-card-dark space-y-6">
              <h2 className="text-xl font-bold text-white">Property Amenities &amp; Facilities</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-xs font-semibold text-slate-300">
                    <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800 text-accent-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Verified Reviews Section */}
            <section className="bg-[#060D1E] rounded-3xl p-6 sm:p-8 border border-blue-900/50 shadow-card-dark space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-blue-950">
                <div>
                  <h2 className="text-xl font-bold text-white">Verified Guest Reviews</h2>
                  <p className="text-xs text-blue-300/80 mt-0.5">
                    100% verified completed stays via GlobeStay reservation records
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">{hotel.guest_rating.toFixed(1)} / 5</span>
                </div>
              </div>

              <div className="space-y-4">
                {hotel.reviews.map((review) => (
                  <div key={review.id} className="p-4 rounded-2xl bg-[#020617] border border-blue-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{review.user_name}</span>
                      <div className="flex text-amber-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{review.comment}</p>
                    <span className="text-[10px] text-blue-400 block">{review.created_at}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Reservation Summary & Location Map */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Reservation Card */}
            <div className="bg-[#060D1E] rounded-3xl p-6 border border-blue-900/60 shadow-card-dark sticky top-28 space-y-5">
              <div className="pb-4 border-b border-blue-950">
                <span className="text-xs text-blue-400 block font-semibold uppercase">Pricing Guarantee</span>
                <div className="flex items-baseline space-x-1 mt-1">
                  <span className="text-3xl font-black text-white">
                    {format(Number(hotel.starting_price))}
                  </span>
                  <span className="text-xs text-slate-400">/ night</span>
                </div>
              </div>

              {/* Date Pickers */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-blue-300 mb-1">
                      Check-In
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full h-10 px-2.5 rounded-xl border border-blue-900 bg-[#020617] text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-blue-300 mb-1">
                      Check-Out
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      min={checkInDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full h-10 px-2.5 rounded-xl border border-blue-900 bg-[#020617] text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <a href="#available-rooms" className="w-full block">
                  <Button variant="accent" size="lg" className="w-full">
                    Check Room Availability
                  </Button>
                </a>
              </div>

              {/* Guarantees */}
              <div className="pt-4 border-t border-blue-950 space-y-2 text-xs text-blue-200/80 font-medium">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-accent-400 shrink-0" />
                  <span>15-Minute Zero Overbooking Hold</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-400 shrink-0" />
                  <span>No Foreign Exchange Surcharges</span>
                </div>
              </div>

              {/* Luxury Location & Neighborhood Visualizer */}
              <div className="pt-4 border-t border-blue-950 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    Neighborhood &amp; Transit
                  </span>
                  <span className="text-[10px] font-mono text-accent-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800/40">
                    Prime District
                  </span>
                </div>

                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#020617] border border-blue-900/60 p-4 flex flex-col justify-between group">
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:14px_14px]" />
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-blue-500/10 rounded-full blur-xl" />

                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-white">{hotel.name}</p>
                      <p className="text-[10px] text-slate-400">{hotel.address}, {hotel.city}</p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-accent-500/20 text-accent-400 border border-accent-500/30 flex items-center justify-center shadow-glow-blue animate-pulse">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-1.5 pt-2 border-t border-blue-900/40 text-[11px] text-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">✈️ Airport Chauffeur</span>
                      <span className="font-semibold text-white">~25 mins</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">🚇 Luxury Metro Station</span>
                      <span className="font-semibold text-white">3 mins walk</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">🏛️ Historic Cultural Center</span>
                      <span className="font-semibold text-white">8 mins walk</span>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name} ${hotel.city} ${hotel.country}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="relative z-10 mt-2 py-1.5 px-3 rounded-xl bg-blue-900/50 hover:bg-blue-800/60 border border-blue-700/40 text-center text-[10px] font-bold text-accent-300 hover:text-white transition flex items-center justify-center gap-1.5"
                  >
                    <span>View on Live Google Maps &amp; Satellite</span>
                    <Share2 className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HotelDetailsPage;
