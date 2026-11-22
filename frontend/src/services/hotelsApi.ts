import { apiClient } from './apiClient';
import { HotelSummary, Amenity, RoomTypePreview } from '../types';

export interface HotelDetailResponse {
  id: number;
  name: string;
  tagline: string;
  description: string;
  city: string;
  country: string;
  country_code: string;
  address: string;
  latitude: number;
  longitude: number;
  star_rating: number;
  base_currency: string;
  hero_image: string;
  images: string[];
  category: string;
  cancellation_policy: string;
  status: string;
  starting_price: number;
  guest_rating: number;
  review_count: number;
  check_in_time: string;
  check_out_time: string;
  amenities: string[];
  full_amenities: Amenity[];
  room_types: {
    id: number;
    hotel_id: number;
    name: string;
    description: string;
    maximum_occupancy: number;
    bed_configuration: string;
    base_price: number;
    currency: string;
    total_inventory_count: number;
    status: string;
  }[];
  reviews: {
    id: number;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
  }[];
}

export interface PaginatedHotelsResult {
  items: {
    id: number;
    name: string;
    tagline: string;
    description: string;
    city: string;
    country: string;
    country_code: string;
    address: string;
    latitude: number;
    longitude: number;
    star_rating: number;
    base_currency: string;
    hero_image: string;
    category: string;
    cancellation_policy: string;
    status: string;
    starting_price: number;
    guest_rating: number;
    review_count: number;
    amenities: string[];
  }[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface HotelSearchParams {
  destination?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  category?: string;
  amenities?: string[];
  sort_by?: string;
  page?: number;
  limit?: number;
}

export interface DayAvailability {
  date: string;
  available: number;
  held: number;
  booked: number;
  total: number;
}

export interface RoomAvailability {
  room_type_id: number;
  room_type_name: string;
  maximum_occupancy: number;
  bed_configuration: string;
  base_price: number;
  currency: string;
  min_available: number;
  is_available: boolean;
  status: string;
  daily_breakdown: DayAvailability[];
}

export interface HotelAvailabilityResult {
  hotel_id: number;
  check_in: string;
  check_out: string;
  nights: number;
  requested_rooms: number;
  room_types: RoomAvailability[];
}

export const hotelsApi = {
  searchHotels: async (params: HotelSearchParams = {}): Promise<PaginatedHotelsResult> => {
    const query = new URLSearchParams();
    if (params.destination) query.append('destination', params.destination);
    if (params.min_price !== undefined) query.append('min_price', params.min_price.toString());
    if (params.max_price !== undefined) query.append('max_price', params.max_price.toString());
    if (params.min_rating !== undefined) query.append('min_rating', params.min_rating.toString());
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.amenities) {
      params.amenities.forEach((am) => query.append('amenities', am));
    }

    const endpoint = `/hotels${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<PaginatedHotelsResult>(endpoint);
  },

  getHotelDetail: async (hotelId: string | number): Promise<HotelDetailResponse> => {
    return apiClient.get<HotelDetailResponse>(`/hotels/${hotelId}`);
  },

  getHotelRoomTypes: async (hotelId: string | number) => {
    return apiClient.get<any[]>(`/hotels/${hotelId}/room-types`);
  },

  checkAvailability: async (
    hotelId: string | number,
    checkIn: string,
    checkOut: string,
    rooms = 1
  ): Promise<HotelAvailabilityResult> => {
    return apiClient.get<HotelAvailabilityResult>(
      `/hotels/${hotelId}/availability?check_in=${checkIn}&check_out=${checkOut}&rooms=${rooms}`
    );
  },
};
