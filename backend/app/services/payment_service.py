import uuid
import hmac
import hashlib
from datetime import timedelta, datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models import (
    Payment, PaymentStatus, Booking, BookingStatus, RoomInventory
)
from app.schemas.payment_review_schema import (
    ProcessPaymentRequest, PaymentOut, PaymentWebhookPayload, WebhookResponse
)
from app.core.config import settings
from app.core.exceptions import (
    NotFoundError, PaymentProcessingError, BookingHoldExpiredError, ForbiddenError
)


class PaymentService:
    def __init__(self, db: Session):
        self.db = db

    def process_payment(self, user_id: int, data: ProcessPaymentRequest) -> PaymentOut:
        # 1. Get booking
        booking = self.db.query(Booking).options(
            joinedload(Booking.booking_rooms)
        ).filter(
            Booking.id == data.booking_id,
            Booking.user_id == user_id
        ).first()
        if not booking:
            raise NotFoundError(entity="Booking", identifier=data.booking_id)

        # 2. Check status
        if booking.status != BookingStatus.PENDING_PAYMENT:
            raise PaymentProcessingError(
                detail=f"Booking is in '{booking.status.value}' state and cannot be paid."
            )

        # 3. Check idempotency
        existing = self.db.query(Payment).filter(
            Payment.idempotency_key == data.idempotency_key
        ).first()
        if existing:
            return self._build_payment_out(existing)

        # 4. Sandbox payment simulation — always succeeds
        provider_reference = f"sandbox_pi_{uuid.uuid4().hex[:16]}"

        payment = Payment(
            booking_id=booking.id,
            provider="sandbox",
            provider_reference=provider_reference,
            idempotency_key=data.idempotency_key,
            amount=booking.total_amount,
            currency=booking.base_currency,
            status=PaymentStatus.COMPLETED
        )
        self.db.add(payment)

        # 5. Confirm booking and convert held rooms to booked
        booking.status = BookingStatus.CONFIRMED
        num_nights = (booking.check_out - booking.check_in).days
        for br in booking.booking_rooms:
            for day_offset in range(num_nights):
                stay_date = booking.check_in + timedelta(days=day_offset)
                inv = self.db.query(RoomInventory).filter(
                    RoomInventory.room_type_id == br.room_type_id,
                    RoomInventory.stay_date == stay_date
                ).first()
                if inv:
                    inv.held_rooms = max(0, inv.held_rooms - br.quantity)
                    inv.booked_rooms += br.quantity

        self.db.commit()
        self.db.refresh(payment)
        return self._build_payment_out(payment)

    def get_booking_payments(self, user_id: int, booking_id: int) -> list[PaymentOut]:
        booking = self.db.query(Booking).filter(
            Booking.id == booking_id, Booking.user_id == user_id
        ).first()
        if not booking:
            raise NotFoundError(entity="Booking", identifier=booking_id)

        payments = self.db.query(Payment).filter(
            Payment.booking_id == booking_id
        ).order_by(Payment.created_at.desc()).all()

        return [self._build_payment_out(p) for p in payments]

    def handle_webhook(self, payload: PaymentWebhookPayload, signature: Optional[str] = None) -> WebhookResponse:
        # Signature verification if signature provided
        if signature:
            computed = hmac.new(
                settings.PAYMENT_WEBHOOK_SECRET.encode(),
                payload.event_id.encode(),
                hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(computed, signature):
                raise ForbiddenError(detail="Invalid webhook signature.")

        # Find target booking
        booking = self.db.query(Booking).options(
            joinedload(Booking.booking_rooms),
            joinedload(Booking.payments)
        ).filter(Booking.id == payload.booking_id).first()
        if not booking:
            raise NotFoundError(entity="Booking", identifier=payload.booking_id)

        # 1. Event: payment_intent.succeeded
        if payload.event_type == "payment_intent.succeeded":
            if booking.status == BookingStatus.PENDING_PAYMENT:
                booking.status = BookingStatus.CONFIRMED
                num_nights = (booking.check_out - booking.check_in).days
                for br in booking.booking_rooms:
                    for day_offset in range(num_nights):
                        stay_date = booking.check_in + timedelta(days=day_offset)
                        inv = self.db.query(RoomInventory).filter(
                            RoomInventory.room_type_id == br.room_type_id,
                            RoomInventory.stay_date == stay_date
                        ).first()
                        if inv:
                            inv.held_rooms = max(0, inv.held_rooms - br.quantity)
                            inv.booked_rooms += br.quantity

            # Record or update payment
            payment_ref = payload.provider_reference or f"sandbox_pi_{payload.event_id}"
            existing_pay = self.db.query(Payment).filter(
                (Payment.provider_reference == payment_ref) | (Payment.idempotency_key == payload.event_id)
            ).first()
            if not existing_pay:
                payment = Payment(
                    booking_id=booking.id,
                    provider="sandbox",
                    provider_reference=payment_ref,
                    idempotency_key=payload.event_id,
                    amount=payload.amount or booking.total_amount,
                    currency=payload.currency or booking.base_currency,
                    status=PaymentStatus.COMPLETED
                )
                self.db.add(payment)
            else:
                existing_pay.status = PaymentStatus.COMPLETED

            self.db.commit()
            return WebhookResponse(
                received=True,
                event_id=payload.event_id,
                status="processed",
                message=f"Booking {booking.booking_reference} confirmed successfully via webhook."
            )

        # 2. Event: payment_intent.payment_failed
        elif payload.event_type == "payment_intent.payment_failed":
            if booking.status == BookingStatus.PENDING_PAYMENT:
                booking.status = BookingStatus.PAYMENT_FAILED
                # Release held rooms
                num_nights = (booking.check_out - booking.check_in).days
                for br in booking.booking_rooms:
                    for day_offset in range(num_nights):
                        stay_date = booking.check_in + timedelta(days=day_offset)
                        inv = self.db.query(RoomInventory).filter(
                            RoomInventory.room_type_id == br.room_type_id,
                            RoomInventory.stay_date == stay_date
                        ).first()
                        if inv:
                            inv.held_rooms = max(0, inv.held_rooms - br.quantity)

            # Record failed payment
            payment = Payment(
                booking_id=booking.id,
                provider="sandbox",
                provider_reference=payload.provider_reference or f"sandbox_failed_{payload.event_id}",
                idempotency_key=payload.event_id,
                amount=payload.amount or booking.total_amount,
                currency=payload.currency or booking.base_currency,
                status=PaymentStatus.FAILED
            )
            self.db.add(payment)
            self.db.commit()
            return WebhookResponse(
                received=True,
                event_id=payload.event_id,
                status="processed",
                message=f"Booking {booking.booking_reference} marked as payment failed; held rooms released."
            )

        # 3. Event: charge.refunded
        elif payload.event_type == "charge.refunded":
            # Mark payments refunded
            for p in booking.payments:
                if p.status == PaymentStatus.COMPLETED:
                    p.status = PaymentStatus.REFUNDED

            # If not yet cancelled, cancel and release booked rooms
            if booking.status == BookingStatus.CONFIRMED:
                booking.status = BookingStatus.CANCELLED
                booking.cancellation_reason = "Payment refunded by gateway"
                booking.cancelled_at = datetime.now(timezone.utc)
                num_nights = (booking.check_out - booking.check_in).days
                for br in booking.booking_rooms:
                    for day_offset in range(num_nights):
                        stay_date = booking.check_in + timedelta(days=day_offset)
                        inv = self.db.query(RoomInventory).filter(
                            RoomInventory.room_type_id == br.room_type_id,
                            RoomInventory.stay_date == stay_date
                        ).first()
                        if inv:
                            inv.booked_rooms = max(0, inv.booked_rooms - br.quantity)

            self.db.commit()
            return WebhookResponse(
                received=True,
                event_id=payload.event_id,
                status="processed",
                message=f"Booking {booking.booking_reference} payment refunded and booking cancelled."
            )

        else:
            return WebhookResponse(
                received=True,
                event_id=payload.event_id,
                status="ignored",
                message=f"Unhandled event type: {payload.event_type}"
            )

    def _build_payment_out(self, payment: Payment) -> PaymentOut:
        return PaymentOut(
            id=payment.id,
            booking_id=payment.booking_id,
            provider=payment.provider,
            provider_reference=payment.provider_reference,
            idempotency_key=payment.idempotency_key,
            amount=payment.amount,
            currency=payment.currency,
            status=payment.status.value,
            created_at=payment.created_at.isoformat() if payment.created_at else None
        )
