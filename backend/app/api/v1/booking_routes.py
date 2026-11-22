from typing import Optional
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user
from app.models import User
from app.services.booking_service import BookingService
from app.schemas.booking_schema import (
    CreateBookingRequest, BookingOut, PaginatedBookingsResponse, CancelBookingRequest,
    ReconcileHoldsResponse
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingOut, status_code=201,
             summary="Create a new booking reservation")
def create_booking(
    data: CreateBookingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = BookingService(db)
    return service.create_booking(current_user, data)


@router.get("", response_model=PaginatedBookingsResponse,
            summary="List current user's bookings")
def list_my_bookings(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status: Optional[str] = Query(None, description="Filter by booking status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = BookingService(db)
    return service.get_user_bookings(current_user, page, limit, status)


@router.post("/reconcile-holds", response_model=ReconcileHoldsResponse,
             summary="Phase 6: Reconcile and reap expired inventory holds")
def reconcile_holds(
    db: Session = Depends(get_db)
):
    service = BookingService(db)
    return service.reap_expired_holds()


@router.get("/{booking_id}", response_model=BookingOut,
            summary="Get booking details")
def get_booking(
    booking_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = BookingService(db)
    return service.get_booking_detail(current_user, booking_id)


@router.post("/{booking_id}/cancel", response_model=BookingOut,
             summary="Cancel a booking")
def cancel_booking(
    booking_id: int = Path(..., ge=1),
    body: CancelBookingRequest = CancelBookingRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = BookingService(db)
    return service.cancel_booking(current_user, booking_id, reason=body.reason)
