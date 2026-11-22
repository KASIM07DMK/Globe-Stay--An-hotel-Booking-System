import { apiClient } from './apiClient';

// ── Types ────────────────────────────────────────────────────────────

export interface PaymentOut {
  id: number;
  booking_id: number;
  provider: string;
  provider_reference: string;
  idempotency_key: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}

export interface ProcessPaymentPayload {
  booking_id: number;
  payment_method: string;
  card_token?: string;
  idempotency_key: string;
}

// ── API ──────────────────────────────────────────────────────────────

export const paymentsApi = {
  /** Submit a payment for a booking. */
  processPayment: async (data: ProcessPaymentPayload): Promise<PaymentOut> => {
    return apiClient.post<PaymentOut>('/payments', data);
  },

  /** Retrieve all payments for a given booking. */
  getBookingPayments: async (
    bookingId: number | string
  ): Promise<PaymentOut[]> => {
    return apiClient.get<PaymentOut[]>(`/payments/booking/${bookingId}`);
  },
};
