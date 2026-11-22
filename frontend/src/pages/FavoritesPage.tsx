import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Star, MapPin, Compass } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { hotelsApi } from '../services/hotelsApi';
import { useWishlist } from '../features/wishlist/WishlistContext';
import { useCurrency } from '../features/currency/CurrencyContext';

export const FavoritesPage: React.FC = () => {
  const { wishlistIds, toggleWishlist, isLoading: wishlistLoading } = useWishlist();
  const { format } = useCurrency();

  // Fetch all hotels so we can display details for all wishlisted IDs
  const { data: allHotelsData, isLoading: hotelsLoading } = useQuery({
    queryKey: ['wishlist-hotels'],
    queryFn: async () => {
      const res = await hotelsApi.searchHotels({ limit: 50 });
      return res.items;
    },
  });

  const isLoading = wishlistLoading || hotelsLoading;

  // Filter hotels that are currently wishlisted
  const wishlistedHotels = (allHotelsData || []).filter((h) => wishlistIds.has(h.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-950 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Saved Properties</h1>
            <p className="text-sm text-slate-400 mt-1">
              Hand-curated retreats and sanctuaries saved to your personal wishlist ({wishlistIds.size} saved).
            </p>
          </div>
          <Link to="/search">
            <Button variant="outline" size="sm">
              Explore More Hotels
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 rounded-3xl bg-blue-950/40" />
            ))}
          </div>
        ) : wishlistedHotels.length === 0 ? (
          <div className="rounded-3xl border border-blue-900/50 bg-[#060D1E]/90 p-12 text-center space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto shadow-glow-blue">
              <Heart className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Whenever you encounter a luxury stay you love, click the heart icon on any hotel card to preserve it here for easy booking.
            </p>
            <div className="pt-2">
              <Link to="/search">
                <Button variant="primary">Explore Curated Stays</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistedHotels.map((item) => (
              <div
                key={item.id}
                className="group rounded-3xl border border-blue-900/50 bg-[#060D1E]/90 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-blue-500/50 transition-all flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={item.hero_image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060D1E] via-transparent to-transparent" />
                  
                  {/* Remove / Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(item.id, item.name);
                    }}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-red-500 hover:scale-110 transition shadow-md border border-red-500/30"
                    title="Remove from wishlist"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>

                  <div className="absolute bottom-3 left-4 flex items-center space-x-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-amber-400 border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{item.star_rating} Stars</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>
                        {item.city}, {item.country}
                      </span>
                    </div>
                    {item.starting_price && (
                      <p className="text-xs text-slate-300 mt-2">
                        Starting from <span className="font-bold text-blue-300">{format(Number(item.starting_price))}</span> / night
                      </p>
                    )}
                  </div>

                  <Link to={`/hotels/${item.id}`} className="w-full">
                    <Button variant="secondary" size="sm" className="w-full">
                      View Property &amp; Reserve
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
