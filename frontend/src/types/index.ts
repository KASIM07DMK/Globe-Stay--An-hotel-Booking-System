export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED' | 'INR';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstUSD: number;
}

export interface Amenity {
  id: string | number;
  name: string;
  icon: string;
  category: 'room' | 'hotel' | 'wellness' | 'dining';
}

export interface RoomTypePreview {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  bedConfiguration: string;
  basePrice: number;
  availableRooms: number;
}

export interface HotelSummary {
  id: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  country: string;
  countryCode: string;
  address: string;
  latitude: number;
  longitude: number;
  starRating: number;
  guestRating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: CurrencyCode;
  heroImage: string;
  images: string[];
  amenities: string[];
  badge?: string;
  featured?: boolean;
  category: 'Luxury' | 'Resort' | 'Boutique' | 'Urban' | 'Eco';
  cancellationPolicy: 'Free Cancellation' | 'Non-refundable' | 'Flexible';
}

export interface DestinationSummary {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  image: string;
  propertyCount: number;
  startingPrice: number;
  currency: CurrencyCode;
  tagline: string;
}

export interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export interface Testimonial {
  id: string;
  guestName: string;
  guestCity: string;
  guestCountry: string;
  hotelName: string;
  hotelCity: string;
  avatar: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedStay: boolean;
}

export interface TravelArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  image: string;
  excerpt: string;
  date: string;
}
