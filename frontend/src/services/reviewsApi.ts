import { apiClient } from './apiClient';

export interface ReviewCreatePayload {
  booking_id: number;
  rating: number;
  comment: string;
}

export interface ReviewItem {
  id: number;
  user_id: number;
  user_name: string;
  hotel_id: number;
  hotel_name?: string;
  booking_id: number;
  rating: number;
  comment: string;
  status: string;
  created_at?: string;
}

export interface FavoriteItem {
  id: number;
  user_id: number;
  hotel_id: number;
  hotel_name: string;
  hotel_city: string;
  hotel_country: string;
  hotel_hero_image: string;
  hotel_star_rating: number;
  created_at?: string;
}

export const reviewsApi = {
  createReview: async (data: ReviewCreatePayload): Promise<ReviewItem> => {
    return await apiClient.post<ReviewItem>('/reviews', data);
  },

  getMyReviews: async (): Promise<ReviewItem[]> => {
    return await apiClient.get<ReviewItem[]>('/reviews/me');
  },

  getHotelReviews: async (hotelId: number): Promise<ReviewItem[]> => {
    return await apiClient.get<ReviewItem[]>(`/hotels/${hotelId}/reviews`);
  },

  toggleFavorite: async (hotelId: number): Promise<{ favorited: boolean }> => {
    return await apiClient.post<{ favorited: boolean }>(`/favorites/${hotelId}`);
  },

  getMyFavorites: async (): Promise<FavoriteItem[]> => {
    return await apiClient.get<FavoriteItem[]>('/favorites');
  },

  checkFavorite: async (hotelId: number): Promise<{ favorited: boolean }> => {
    return await apiClient.get<{ favorited: boolean }>(`/favorites/${hotelId}/check`);
  },
};

