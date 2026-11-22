import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  MapPin, 
  Hotel as HotelIcon, 
  Sparkles,
  Search,
  FilterX
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HotelSearchForm } from '../components/search/HotelSearchForm';
import { HotelCard } from '../components/hotels/HotelCard';
import { HotelFilters, FilterState } from '../components/hotels/HotelFilters';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { hotelsApi } from '../services/hotelsApi';
import { mockHotels } from '../features/hotels/mockData';
import { CurrencyCode, HotelSummary } from '../types';
import { useCurrency } from '../features/currency/CurrencyContext';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currency, setCurrency } = useCurrency();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const destinationParam = searchParams.get('destination') || '';
  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const adultsParam = parseInt(searchParams.get('adults') || '2', 10);
  const roomsParam = parseInt(searchParams.get('rooms') || '1', 10);

  const [filters, setFilters] = useState<FilterState>({
    minPrice: 100,
    maxPrice: 2500,
    minRating: 0,
    category: 'All',
    amenities: [],
  });

  const [sortBy, setSortBy] = useState<string>('recommended');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch hotels from API with TanStack Query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['hotels', destinationParam, filters, sortBy, currentPage],
    queryFn: async () => {
      try {
        const res = await hotelsApi.searchHotels({
          destination: destinationParam || undefined,
          min_price: filters.minPrice > 100 ? filters.minPrice : undefined,
          max_price: filters.maxPrice < 2500 ? filters.maxPrice : undefined,
          min_rating: filters.minRating > 0 ? filters.minRating : undefined,
          category: filters.category !== 'All' ? filters.category : undefined,
          amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
          sort_by: sortBy,
          page: currentPage,
          limit: 12,
        });
        return res;
      } catch (err) {
        // Safe graceful fallback to mock data when API is offline or initial setup
        let items = [...mockHotels];
        if (destinationParam) {
          const q = destinationParam.toLowerCase();
          items = items.filter(
            (h) =>
              h.city.toLowerCase().includes(q) ||
              h.country.toLowerCase().includes(q) ||
              h.name.toLowerCase().includes(q)
          );
        }
        if (filters.category !== 'All') {
          items = items.filter((h) => h.category === filters.category);
        }
        if (filters.maxPrice < 2500) {
          items = items.filter((h) => h.pricePerNight <= filters.maxPrice);
        }
        if (filters.minRating > 0) {
          items = items.filter((h) => h.guestRating >= filters.minRating);
        }
        if (filters.amenities.length > 0) {
          items = items.filter((h) =>
            filters.amenities.every((a) => h.amenities.includes(a))
          );
        }
        if (sortBy === 'price_asc') {
          items.sort((a, b) => a.pricePerNight - b.pricePerNight);
        } else if (sortBy === 'price_desc') {
          items.sort((a, b) => b.pricePerNight - a.pricePerNight);
        } else if (sortBy === 'rating_desc') {
          items.sort((a, b) => b.guestRating - a.guestRating);
        }

        return {
          items: items.map((h) => ({
            id: typeof h.id === 'string' ? parseInt(h.id.replace(/\D/g, '') || '1', 10) : (h.id as number),
            name: h.name,
            tagline: h.tagline,
            description: h.description,
            city: h.city,
            country: h.country,
            country_code: h.countryCode,
            address: h.address,
            latitude: h.latitude,
            longitude: h.longitude,
            star_rating: h.starRating,
            base_currency: h.currency,
            hero_image: h.heroImage,
            category: h.category,
            cancellation_policy: h.cancellationPolicy,
            status: 'active',
            starting_price: h.pricePerNight,
            guest_rating: h.guestRating,
            review_count: h.reviewCount,
            amenities: h.amenities,
          })),
          total: items.length,
          page: 1,
          limit: 12,
          total_pages: 1,
        };
      }
    },
    staleTime: 1000 * 60,
  });

  const handleResetFilters = () => {
    setFilters({
      minPrice: 100,
      maxPrice: 2500,
      minRating: 0,
      category: 'All',
      amenities: [],
    });
  };

  const hotelsList: HotelSummary[] = (data?.items || []).map((h) => ({
    id: h.id.toString(),
    name: h.name,
    tagline: h.tagline,
    description: h.description,
    city: h.city,
    country: h.country,
    countryCode: h.country_code,
    address: h.address,
    latitude: h.latitude,
    longitude: h.longitude,
    starRating: h.star_rating,
    guestRating: h.guest_rating,
    reviewCount: h.review_count,
    pricePerNight: Number(h.starting_price),
    currency: h.base_currency as CurrencyCode,
    heroImage: h.hero_image,
    images: [h.hero_image],
    amenities: h.amenities || [],
    category: (h.category as any) || 'Luxury',
    cancellationPolicy: (h.cancellation_policy as any) || 'Free Cancellation',
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans">
      <Navbar currentCurrency={currency} onCurrencyChange={setCurrency} />

      {/* Top Search Bar */}
      <div className="bg-[#020617] py-6 border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HotelSearchForm
            compact
            initialDestination={destinationParam}
            initialCheckIn={checkInParam}
            initialCheckOut={checkOutParam}
            initialGuests={{ adults: adultsParam, children: 0, rooms: roomsParam }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-blue-950">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {destinationParam ? `Stays in ${destinationParam}` : 'All Curated International Stays'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isLoading
                ? 'Searching real-time inventory...'
                : `${data?.total || 0} properties available with guaranteed booking hold`}
            </p>
          </div>

          {/* Controls: Mobile filter trigger & Sort */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden px-3.5 py-2 rounded-xl border border-blue-900/60 bg-[#060D1E] text-xs font-bold text-blue-200 flex items-center space-x-2 shadow-sm hover:border-blue-700"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-accent-400" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2 bg-[#060D1E] px-3.5 py-2 rounded-xl border border-blue-900/60 shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="recommended" className="bg-[#060D1E] text-white">Recommended</option>
                <option value="price_asc" className="bg-[#060D1E] text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-[#060D1E] text-white">Price: High to Low</option>
                <option value="rating_desc" className="bg-[#060D1E] text-white">Highest Guest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28">
              <HotelFilters
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Mobile Filters Drawer Modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden overflow-y-auto bg-black/80 backdrop-blur-md p-4">
              <div className="bg-[#060D1E] rounded-3xl p-6 max-w-md mx-auto my-8 shadow-card-dark border border-blue-900/70 text-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-white">Refine Stays</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <HotelFilters
                  filters={filters}
                  onChange={setFilters}
                  onReset={handleResetFilters}
                />
                <Button
                  variant="accent"
                  className="w-full mt-4"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <section className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#060D1E] rounded-3xl p-4 border border-blue-900/40 space-y-3">
                    <Skeleton className="aspect-[16/10] w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : hotelsList.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotelsList.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      displayCurrency={currency}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {data && data.total_pages > 1 && (
                  <div className="mt-12 flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    {[...Array(data.total_pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white shadow-glow-blue border border-blue-400/40'
                            : 'bg-[#060D1E] border border-blue-900/60 text-slate-300 hover:bg-blue-950/60'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= data.total_pages}
                      onClick={() => setCurrentPage((p) => Math.min(data.total_pages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Informative Empty State */
              <div className="bg-[#060D1E] rounded-3xl border border-blue-900/50 p-12 text-center max-w-lg mx-auto my-12 shadow-card-dark text-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-blue-950/80 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-800/60">
                  <FilterX className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  No accommodations match your filters
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Try broadening your price range, choosing "All Types", or removing specific amenities to see more available international stays.
                </p>
                <div className="mt-6 flex justify-center space-x-3">
                  <Button variant="accent" onClick={handleResetFilters}>
                    Reset All Filters
                  </Button>
                  <Link to="/">
                    <Button variant="outline">
                      Explore All Destinations
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;
