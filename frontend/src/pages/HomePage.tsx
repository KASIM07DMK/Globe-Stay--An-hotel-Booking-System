import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Sparkles, 
  MapPin, 
  Star, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Award, 
  Headphones, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Globe2,
  Calendar,
  Compass
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HotelSearchForm } from '../components/search/HotelSearchForm';
import { HotelCard } from '../components/hotels/HotelCard';
import { Button } from '../components/ui/Button';
import { HotelSummary } from '../types';
import { hotelsApi } from '../services/hotelsApi';
import { 
  mockDestinations, 
  mockHotels, 
  mockTestimonials, 
  mockArticles 
} from '../features/hotels/mockData';
import { useCurrency } from '../features/currency/CurrencyContext';

export const HomePage: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  const categories = ['All', 'Luxury', 'Resort', 'Boutique'];

  const { data: hotelsData } = useQuery({
    queryKey: ['home-featured-hotels'],
    queryFn: async () => {
      try {
        const res = await hotelsApi.searchHotels({ limit: 12 });
        if (res && res.items && res.items.length > 0) {
          return res.items.map((h): HotelSummary => ({
            id: String(h.id),
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
            currency: 'USD',
            heroImage: h.hero_image,
            images: [h.hero_image],
            amenities: h.amenities,
            category: (h.category as any) || 'Luxury',
            cancellationPolicy: (h.cancellation_policy as any) || 'Free Cancellation',
            featured: true,
          }));
        }
        return mockHotels;
      } catch {
        return mockHotels;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const allHotels = hotelsData && hotelsData.length > 0 ? hotelsData : mockHotels;

  const filteredHotels = selectedCategory === 'All'
    ? allHotels
    : allHotels.filter((h) => h.category === selectedCategory);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    if (!newsletterConsent) {
      setNewsletterError('Please consent to receiving GlobeStay travel communications.');
      return;
    }
    setNewsletterError('');
    setNewsletterSubscribed(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans">
      
      {/* Navigation */}
      <Navbar currentCurrency={currency} onCurrencyChange={setCurrency} />

      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-[#020617] via-[#050C1F] to-[#030712]">
        
        {/* Background Image with Deep Midnight Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85"
            alt="Luxury resort sanctuary"
            className="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-[#050C1F]/80 to-[#030712]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-accent-300 text-xs font-bold tracking-wide backdrop-blur-md shadow-glow-blue">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              <span>International Luxury Collection &bull; 2026 Curated Portfolio</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Extraordinary Stays, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-300 to-accent-400">
                Guaranteed Availability.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Book vetted boutique retreats, private villas, and landmark grand hotels worldwide with real-time transactional inventory holds and zero overbooking risk.
            </p>
          </div>

          {/* Search Form Card Floating */}
          <div className="mt-10 max-w-5xl mx-auto">
            <HotelSearchForm />
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-blue-200/80">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-accent-400" />
              <span>Zero-Overbooking Hold Lock</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-accent-400" />
              <span>256-Bit SSL Encrypted Booking</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-accent-400" />
              <span>Zero FX Hidden Markup Fees</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Popular Destinations Grid */}
      <section id="destinations" className="py-20 bg-[#030712] border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-accent-400 block mb-2">
                Global Sanctuaries
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Curated Destinations
              </h2>
              <p className="mt-2 text-slate-400 text-sm max-w-xl">
                Explore handpicked luxury accommodations across major cultural centers, coastal archipelagos, and alpine retreats.
              </p>
            </div>
            <a
              href="/search"
              className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-accent-400 hover:text-accent-300 transition"
            >
              <span>View All 85+ Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockDestinations.map((dest) => (
              <a
                key={dest.id}
                href={`/search?destination=${encodeURIComponent(dest.name)}`}
                className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-card-dark border border-blue-900/40 hover:border-blue-500/60 transition-all duration-300 transform hover:-translate-y-1.5"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />

                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-black/50 text-blue-200 backdrop-blur-md border border-blue-500/30">
                    {dest.countryCode}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center space-x-1.5 text-xs text-accent-300 font-medium mb-1">
                    <MapPin className="w-3.5 h-3.5 text-accent-400" />
                    <span>{dest.country}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-accent-300 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                    {dest.tagline}
                  </p>
                  <div className="mt-3 pt-3 border-t border-blue-900/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{dest.propertyCount} properties</span>
                    <span className="font-bold text-accent-300">from ${dest.startingPrice}/nt</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* 3. Featured Hotel Listings */}
      <section id="featured-hotels" className="py-20 bg-[#040A18] border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-accent-400 block mb-2">
                Handpicked Stays
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Featured Accommodations
              </h2>
              <p className="mt-2 text-slate-400 text-sm max-w-xl">
                Every property undergoes rigorous inspection for architectural character, hospitality standards, and verified availability.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-6 md:mt-0 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-glow-blue border border-blue-400/40'
                      : 'bg-[#060D1E] text-slate-300 border border-blue-900/50 hover:bg-blue-950/60 hover:border-blue-700'
                  }`}
                >
                  {cat === 'All' ? 'All Stays' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Hotel Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                displayCurrency={currency}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 4. Why Choose GlobeStay (Engineered for Trust) */}
      <section id="why-globestay" className="py-20 bg-[#020617] border-y border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent-400 block mb-2">
              The GlobeStay Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why Discerning Travelers Choose GlobeStay
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              We rebuilt international hospitality reservations from the database layer up to eliminate the compromises of legacy booking sites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-[#060D1E] border border-blue-900/50 hover:border-blue-500/60 transition-all hover:shadow-glow-blue group">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800/60 text-accent-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Zero Overbooking Guarantee
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by PostgreSQL row-level locks and atomic 15-minute hold reservations. Your room is held the millisecond you begin checkout.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-[#060D1E] border border-blue-900/50 hover:border-blue-500/60 transition-all hover:shadow-glow-blue group">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800/60 text-accent-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Transparent Multi-Currency
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No hidden foreign transaction markups or surprise arrival fees. See guaranteed prices in USD, EUR, GBP, JPY, AED, or INR upfront.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-[#060D1E] border border-blue-900/50 hover:border-blue-500/60 transition-all hover:shadow-glow-blue group">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800/60 text-accent-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                100% Verified Guest Reviews
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Only guests with verified, completed stays can submit reviews. Zero fabricated ratings, affiliate bias, or unvetted guest opinions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-[#060D1E] border border-blue-900/50 hover:border-blue-500/60 transition-all hover:shadow-glow-blue group">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800/60 text-accent-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                24/7 Global Concierge
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct access to responsive human concierge specialists ready to coordinate arrival transfers, dietary preferences, and room requests.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Customer Testimonials */}
      <section className="py-20 bg-[#030712]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent-400 block mb-2">
              Guest Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Stories from GlobeStay Travelers
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              Discover how our guests experience flawless reservations across the globe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockTestimonials.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-3xl bg-[#060D1E] border border-blue-900/40 shadow-card-dark flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <h4 className="font-bold text-base text-white mb-2">
                    &ldquo;{t.title}&rdquo;
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t.comment}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-blue-950 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={t.avatar}
                      alt={t.guestName}
                      className="w-10 h-10 rounded-full object-cover border border-blue-800"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{t.guestName}</p>
                      <p className="text-[11px] text-slate-400">{t.guestCity}, {t.guestCountry}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center text-[10px] font-bold text-accent-300 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800/60">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-accent-400" />
                      Verified
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.hotelCity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Travel Journal / Inspiration */}
      <section id="inspiration" className="py-20 bg-[#040A18] border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-accent-400 block mb-2">
                Editorial &amp; Guides
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                GlobeStay Travel Journal
              </h2>
              <p className="mt-2 text-slate-400 text-sm max-w-xl">
                Essays on visionary hotel design, cultural etiquette, and private escapes penned by international travel writers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockArticles.map((article) => (
              <div
                key={article.id}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-[#060D1E] border border-blue-900/40 shadow-card-dark hover:border-blue-500/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#020617]/90 text-blue-200 border border-blue-800/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {article.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-[11px] font-semibold text-blue-400 mb-1.5 flex items-center space-x-2">
                      <span>{article.date}</span>
                      <span>&bull;</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-accent-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <span className="inline-flex items-center text-xs font-bold text-accent-400 group-hover:text-accent-300 transition space-x-1">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-[#020617] via-blue-950 to-[#020617] border-t border-blue-900/60 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-500/40 text-accent-400 flex items-center justify-center mx-auto mb-4 shadow-glow-blue">
            <Globe2 className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Join the GlobeStay Private Collection
          </h2>
          <p className="mt-2 text-sm text-blue-200 max-w-xl mx-auto">
            Receive private member rates, newly added international suites, and editorial travel itineraries once per month. No spam, ever.
          </p>

          {newsletterSubscribed ? (
            <div className="mt-6 p-4 rounded-2xl bg-blue-950/80 border border-blue-500/40 text-accent-300 text-sm font-semibold max-w-md mx-auto flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-accent-400 shrink-0" />
              <span>Thank you! You are now subscribed to GlobeStay Private Collection.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="mt-8 max-w-md mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 h-12 px-4 rounded-xl bg-[#020617] border border-blue-900 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  className="h-12 px-6 rounded-xl font-bold"
                >
                  Subscribe
                </Button>
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start text-left space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="newsletter-consent"
                  checked={newsletterConsent}
                  onChange={(e) => setNewsletterConsent(e.target.checked)}
                  className="mt-0.5 rounded border-blue-900 text-blue-600 focus:ring-blue-500 bg-[#020617]"
                />
                <label htmlFor="newsletter-consent" className="text-[11px] text-blue-200/80 leading-tight">
                  I agree to receive curated travel stories, availability alerts, and member offers. I can unsubscribe at any time.
                </label>
              </div>

              {newsletterError && (
                <p className="text-xs font-semibold text-red-400 text-left bg-red-950/60 p-2 rounded-lg border border-red-800">
                  {newsletterError}
                </p>
              )}
            </form>
          )}

        </div>
      </section>

      {/* 8. Footer */}
      <Footer />

    </div>
  );
};

export default HomePage;
