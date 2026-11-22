import { apiClient } from './apiClient';

// ── Types ────────────────────────────────────────────────────────────

export interface BookingRoom {
  id: number;
  room_type_id: number;
  room_type_name: string;
  quantity: number;
  price_snapshot: number;
  currency: string;
}

export interface BookingGuest {
  id: number;
  guest_name: string;
  guest_type: 'adult' | 'child';
}

export interface BookingOut {
  id: number;
  booking_reference: string;
  user_id: number;
  hotel_id: number;
  hotel_name: string;
  hotel_city: string;
  hotel_country: string;
  hotel_hero_image: string;
  status:
    | 'PENDING_PAYMENT'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'PAYMENT_FAILED';
  check_in: string;
  check_out: string;
  guest_count: number;
  base_currency: string;
  display_currency: string;
  exchange_rate: number;
  subtotal: number;
  taxes: number;
  fees: number;
  discount: number;
  total_amount: number;
  cancellation_deadline: string | null;
  hold_expires_at: string | null;
  cancellation_reason?: string | null;
  cancellation_policy?: string | null;
  is_cancellable?: boolean;
  payment_reference?: string | null;
  payment_status?: string | null;
  rooms: BookingRoom[];
  guests: BookingGuest[];
  created_at: string;
}

export interface PaginatedBookingsResponse {
  items: BookingOut[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateBookingPayload {
  hotel_id: number;
  check_in: string;
  check_out: string;
  rooms: { room_type_id: number; quantity: number }[];
  guests: { guest_name: string; guest_type: 'adult' | 'child' }[];
  display_currency?: string;
}

// ── API ──────────────────────────────────────────────────────────────

export const bookingsApi = {
  /** Create a new booking (returns status "pending_payment"). */
  createBooking: async (data: CreateBookingPayload): Promise<BookingOut> => {
    return apiClient.post<BookingOut>('/bookings', data);
  },

  /** List current user's bookings with pagination & optional status filter. */
  getMyBookings: async (
    page = 1,
    limit = 10,
    status?: BookingOut['status']
  ): Promise<PaginatedBookingsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    return apiClient.get<PaginatedBookingsResponse>(
      `/bookings?${params.toString()}`
    );
  },

  /** Get full details for a single booking. */
  getBookingDetail: async (id: number | string): Promise<BookingOut> => {
    return apiClient.get<BookingOut>(`/bookings/${id}`);
  },

  /** Cancel a booking with optional reason. */
  cancelBooking: async (id: number | string, reason?: string): Promise<BookingOut> => {
    return apiClient.post<BookingOut>(`/bookings/${id}/cancel`, { reason });
  },
};
