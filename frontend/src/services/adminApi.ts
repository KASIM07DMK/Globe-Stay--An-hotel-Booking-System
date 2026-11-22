import { apiClient } from './apiClient';
import { BookingOut, PaginatedBookingsResponse } from './bookingsApi';

export interface AdminStats {
  total_users: number;
  total_hotels: number;
  total_bookings: number;
  bookings_confirmed: number;
  bookings_pending: number;
  bookings_cancelled: number;
}

export interface AdminUserItem {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string | null;
}

export interface PaginatedUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminRoomType {
  id: number;
  hotel_id: number;
  hotel_name?: string;
  name: string;
  description?: string;
  maximum_occupancy: number;
  bed_configuration: string;
  base_price: number;
  currency: string;
  total_inventory_count: number;
  status: string;
  active_holds: number;
  active_bookings: number;
}

export interface UpdateRoomPayload {
  total_inventory_count?: number;
  base_price?: number;
  status?: 'active' | 'inactive';
}

export interface ReconcileResponse {
  reaped_bookings_count: number;
  released_rooms_count: number;
  message: string;
}

export interface AdminPaymentItem {
  id: number;
  booking_id: number;
  booking_reference: string | null;
  provider: string;
  provider_reference: string | null;
  idempotency_key: string;
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'REFUNDED' | 'FAILED' | string;
  created_at: string | null;
}

export interface PaginatedPaymentsResponse {
  items: AdminPaymentItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AdminReviewItem {
  id: number;
  user_id: number;
  user_name: string;
  hotel_id: number;
  hotel_name: string;
  booking_id: number;
  rating: number;
  comment: string;
  status: 'APPROVED' | 'PENDING_MODERATION' | 'REJECTED' | string;
  created_at: string | null;
}

export interface PaginatedReviewsResponse {
  items: AdminReviewItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    return apiClient.get<AdminStats>('/admin/stats');
  },

  getUsers: async (page = 1, limit = 20, role?: string): Promise<PaginatedUsersResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (role) params.append('role', role);
    return apiClient.get<PaginatedUsersResponse>(`/admin/users?${params.toString()}`);
  },

  getBookings: async (page = 1, limit = 20, status?: string): Promise<PaginatedBookingsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    return apiClient.get<PaginatedBookingsResponse>(`/admin/bookings?${params.toString()}`);
  },

  getRooms: async (): Promise<AdminRoomType[]> => {
    return apiClient.get<AdminRoomType[]>('/admin/rooms');
  },

  updateRoomInventory: async (roomTypeId: number, payload: UpdateRoomPayload): Promise<AdminRoomType> => {
    return apiClient.patch<AdminRoomType>(`/admin/rooms/${roomTypeId}/inventory`, payload);
  },

  reconcileHolds: async (): Promise<ReconcileResponse> => {
    return apiClient.post<ReconcileResponse>('/admin/reconcile-holds');
  },

  getPayments: async (page = 1, limit = 20, status?: string): Promise<PaginatedPaymentsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    return apiClient.get<PaginatedPaymentsResponse>(`/admin/payments?${params.toString()}`);
  },

  refundPayment: async (paymentId: number): Promise<{ id: number; status: string; message: string }> => {
    return apiClient.post(`/admin/payments/${paymentId}/refund`);
  },

  getReviews: async (page = 1, limit = 20, status?: string): Promise<PaginatedReviewsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    return apiClient.get<PaginatedReviewsResponse>(`/admin/reviews?${params.toString()}`);
  },

  moderateReview: async (reviewId: number, status: 'APPROVED' | 'REJECTED' | 'PENDING_MODERATION'): Promise<{ id: number; status: string; message: string }> => {
    return apiClient.patch(`/admin/reviews/${reviewId}?status=${status}`);
  },

  deleteReview: async (reviewId: number): Promise<{ message: string }> => {
    return apiClient.delete(`/admin/reviews/${reviewId}`);
  },
};
