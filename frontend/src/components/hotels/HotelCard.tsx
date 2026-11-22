import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, CheckCircle2 } from 'lucide-react';
import { HotelSummary, CurrencyCode } from '../../types';
import { useCurrency } from '../../features/currency/CurrencyContext';
import { useWishlist } from '../../features/wishlist/WishlistContext';

interface HotelCardProps {
  hotel: HotelSummary;
  displayCurrency?: CurrencyCode;
  isFavorite?: boolean;
  onToggleFavorite?: (hotelId: string) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  onToggleFavorite,
}) => {
  const { format } = useCurrency();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const favorite = isWishlisted(hotel.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(hotel.id, hotel.name);
    onToggleFavorite?.(hotel.id);
  };

  return (
    <div className="group relative bg-[#060D1E] rounded-3xl border border-blue-900/40 hover:border-blue-500/60 overflow-hidden shadow-card-dark hover:shadow-glow-blue hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full text-slate-100">
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <img
          src={hotel.heroImage}
          alt={hotel.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060D1E] via-transparent to-black/40" />

        {/* Badge / Category */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          {hotel.badge ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-950/90 text-accent-300 backdrop-blur-md border border-blue-500/40 shadow-sm">
              {hotel.badge}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#020617]/90 text-blue-200 border border-blue-800/40 backdrop-blur-md">
              {hotel.category}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#020617]/80 border border-blue-900/60 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-red-400 hover:border-red-500/50 transition shadow-sm"
          aria-label="Save to favorites"
        >
          <Heart
            className={`w-4 h-4 transition ${
              favorite ? 'fill-red-500 text-red-500' : 'text-slate-300'
            }`}
          />
        </button>

        {/* Location tag */}
        <div className="absolute bottom-3 left-3 flex items-center text-xs font-semibold text-white drop-shadow">
          <MapPin className="w-3.5 h-3.5 mr-1 text-accent-400" />
          <span>
            {hotel.city}, {hotel.country}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Rating */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-accent-400 transition-colors line-clamp-1">
                {hotel.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{hotel.tagline}</p>
            </div>

            <div className="flex items-center space-x-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/30 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">
                {hotel.guestRating.toFixed(1)}
              </span>
              <span className="text-[10px] text-amber-400/80">({hotel.reviewCount})</span>
            </div>
          </div>

          {/* Amenities preview */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-950/60 border border-blue-900/50 text-blue-200 text-[10px] font-medium"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-[10px] text-blue-400 font-medium">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>

          {/* Cancellation Policy */}
          <div className="mt-3 flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{hotel.cancellationPolicy}</span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-4 border-t border-blue-950 flex items-end justify-between">
          <div>
            <span className="text-[10px] text-blue-300/70 block uppercase font-semibold tracking-wider">
              Starting from
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-black text-white font-sans">
                {format(hotel.pricePerNight)}
              </span>
              <span className="text-xs text-slate-400">/ nt</span>
            </div>
          </div>

          <Link
            to={`/hotels/${hotel.id}`}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-accent-600 hover:from-blue-500 hover:to-accent-500 text-white transition shadow-glow-blue"
          >
            Reserve
          </Link>
        </div>
      </div>
    </div>
  );
};
