from typing import Optional, List
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, Path, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database.session import get_db
from app.core.deps import require_admin
from app.models import (
    User, Hotel, Booking, BookingStatus, UserRole, Payment, PaymentStatus,
    RoomInventory, Review, ReviewStatus
)
from app.services.booking_service import BookingService
from app.schemas.booking_schema import (
    PaginatedBookingsResponse, AdminRoomTypeOut, UpdateRoomInventoryRequest,
    ReconcileHoldsResponse
)
from app.schemas.payment_review_schema import PaymentOut

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", summary="Get admin dashboard statistics")
def admin_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_hotels = db.query(Hotel).count()
    total_bookings = db.query(Booking).count()
    confirmed = db.query(Booking).filter(Booking.status == BookingStatus.CONFIRMED).count()
    pending = db.query(Booking).filter(Booking.status == BookingStatus.PENDING_PAYMENT).count()
    cancelled = db.query(Booking).filter(Booking.status == BookingStatus.CANCELLED).count()

    return {
        "total_users": total_users,
        "total_hotels": total_hotels,
        "total_bookings": total_bookings,
        "bookings_confirmed": confirmed,
        "bookings_pending": pending,
        "bookings_cancelled": cancelled
    }


@router.get("/users", summary="List all users (admin)")
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[str] = Query(None),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    total = query.count()
    users = query.order_by(User.id).offset(skip).limit(limit).all()
    return {
        "items": [
            {
                "id": u.id,
                "full_name": u.full_name,
                "email": u.email,
                "role": u.role.value,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/bookings", response_model=PaginatedBookingsResponse,
            summary="List all bookings (admin)")
def list_all_bookings(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    service = BookingService(db)
    return service.get_all_bookings_admin(page, limit, status)


# ─── Phase 6: Admin Room Inventory & Reconcile Holds Endpoints ───────────────

@router.get("/rooms", response_model=List[AdminRoomTypeOut],
            summary="Phase 6: List all room types and inventory metrics (admin)")
def list_admin_room_types(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    service = BookingService(db)
    return service.get_admin_room_types()


@router.patch("/rooms/{room_type_id}/inventory", response_model=AdminRoomTypeOut,
              summary="Phase 6: Update room capacity, pricing, or status (admin)")
def update_room_inventory(
    room_type_id: int = Path(..., ge=1),
    data: UpdateRoomInventoryRequest = ...,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    service = BookingService(db)
    return service.update_room_inventory_admin(room_type_id, data)


@router.post("/reconcile-holds", response_model=ReconcileHoldsResponse,
             summary="Phase 6: Administrative trigger to reap all expired inventory holds")
def admin_reconcile_holds(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    service = BookingService(db)
    return service.reap_expired_holds()


# ─── Phase 8/9: Admin Payment Settlements & Refund Controls ──────────────────

@router.get("/payments", summary="List all payment transactions (admin)")
def list_admin_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    query = db.query(Payment).options(joinedload(Payment.booking))
    if status:
        query = query.filter(Payment.status == status)
    total = query.count()
    payments = query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()

    items = [
        {
            "id": p.id,
            "booking_id": p.booking_id,
            "booking_reference": p.booking.booking_reference if p.booking else None,
            "provider": p.provider,
            "provider_reference": p.provider_reference,
            "idempotency_key": p.idempotency_key,
            "amount": float(p.amount),
            "currency": p.currency,
            "status": p.status.value,
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in payments
    ]
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }


@router.post("/payments/{payment_id}/refund", summary="Issue administrative refund")
def admin_refund_payment(
    payment_id: int = Path(..., ge=1),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).options(
        joinedload(Payment.booking).joinedload(Booking.booking_rooms)
    ).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    if payment.status == PaymentStatus.REFUNDED:
        raise HTTPException(status_code=400, detail="Payment has already been refunded.")

    payment.status = PaymentStatus.REFUNDED

    # If associated booking is confirmed, cancel it and release rooms
    booking = payment.booking
    if booking and booking.status == BookingStatus.CONFIRMED:
        booking.status = BookingStatus.CANCELLED
        booking.cancellation_reason = "Administrative refund by manager"
        booking.cancelled_at = datetime.now(timezone.utc)
        num_nights = (booking.check_out - booking.check_in).days
        for br in booking.booking_rooms:
            for day_offset in range(num_nights):
                stay_date = booking.check_in + timedelta(days=day_offset)
                inv = db.query(RoomInventory).filter(
                    RoomInventory.room_type_id == br.room_type_id,
                    RoomInventory.stay_date == stay_date
                ).first()
                if inv:
                    inv.booked_rooms = max(0, inv.booked_rooms - br.quantity)

    db.commit()
    db.refresh(payment)
    return {
        "id": payment.id,
        "status": payment.status.value,
        "message": f"Payment #{payment.id} successfully refunded and inventory restored."
    }


# ─── Phase 9: Admin Review Moderation ────────────────────────────────────────

@router.get("/reviews", summary="List all reviews for moderation (admin)")
def list_admin_reviews(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    query = db.query(Review).options(
        joinedload(Review.user),
        joinedload(Review.hotel)
    )
    if status:
        query = query.filter(Review.status == status)
    total = query.count()
    reviews = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()

    items = [
        {
            "id": r.id,
            "user_id": r.user_id,
            "user_name": r.user.full_name if r.user else "Anonymous",
            "hotel_id": r.hotel_id,
            "hotel_name": r.hotel.name if r.hotel else "Unknown Hotel",
            "booking_id": r.booking_id,
            "rating": r.rating,
            "comment": r.comment,
            "status": r.status.value,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in reviews
    ]
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }


@router.patch("/reviews/{review_id}", summary="Moderate review status (admin)")
def moderate_review(
    review_id: int = Path(..., ge=1),
    status: str = Query(..., description="APPROVED, REJECTED, or PENDING_MODERATION"),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    valid_statuses = [s.value for s in ReviewStatus]
    status_upper = status.upper()
    if status_upper not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    review.status = ReviewStatus(status_upper)
    db.commit()
    db.refresh(review)
    return {
        "id": review.id,
        "status": review.status.value,
        "message": f"Review #{review.id} status updated to {review.status.value}."
    }


@router.delete("/reviews/{review_id}", summary="Delete review (admin)")
def delete_review(
    review_id: int = Path(..., ge=1),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")

    db.delete(review)
    db.commit()
    return {"message": f"Review #{review_id} has been permanently deleted."}

