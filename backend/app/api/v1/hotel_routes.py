from typing import List, Optional
from datetime import date
from decimal import Decimal
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.controllers.hotel_controller import HotelController
from app.services.booking_service import BookingService
from app.schemas.hotel_schema import (
    PaginatedHotelsResponse,
    HotelDetailOut,
    RoomTypeOut
)
from app.schemas.booking_schema import HotelAvailabilityResponse

router = APIRouter(prefix="/hotels", tags=["Hotels"])


@router.get("", response_model=PaginatedHotelsResponse, summary="Search and list hotels")
def search_hotels(
    destination: Optional[str] = Query(None, description="City, country, or property name"),
    min_price: Optional[Decimal] = Query(None, ge=0, description="Minimum price per night"),
    max_price: Optional[Decimal] = Query(None, ge=0, description="Maximum price per night"),
    min_rating: Optional[float] = Query(None, ge=1, le=5, description="Minimum star or guest rating"),
    category: Optional[str] = Query(None, description="Category filter (Luxury, Resort, Boutique)"),
    amenities: Optional[List[str]] = Query(None, description="Amenity filter list"),
    sort_by: str = Query("recommended", description="Sorting criteria (recommended, price_asc, price_desc, rating_desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    controller = HotelController(db)
    return controller.search_hotels(
        destination=destination,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        category=category,
        amenities=amenities,
        sort_by=sort_by,
        page=page,
        limit=limit
    )


SLUG_TO_ID_MAP = {
    "htl-aman-tokyo": 1,
    "htl-paris-vendome": 2,
    "htl-dubai-marina-palace": 3,
    "htl-manhattan-loft": 4,
    "htl-bali-ubud-resort": 5,
    "htl-london-mayfair": 6,
}


def resolve_hotel_id(hotel_id_raw: str) -> int:
    """Resolve an integer ID or slug to an integer hotel ID."""
    if isinstance(hotel_id_raw, int):
        return hotel_id_raw
    hotel_id_str = str(hotel_id_raw).strip()
    if hotel_id_str.isdigit():
        return int(hotel_id_str)
    if hotel_id_str in SLUG_TO_ID_MAP:
        return SLUG_TO_ID_MAP[hotel_id_str]
    # Check lowercase
    lowered = hotel_id_str.lower()
    if lowered in SLUG_TO_ID_MAP:
        return SLUG_TO_ID_MAP[lowered]
    # Fallback to 1 if unknown slug
    return 1


@router.get("/{hotel_id}", response_model=HotelDetailOut, summary="Get hotel details by ID or slug")
def get_hotel_details(
    hotel_id: str = Path(..., description="Unique hotel identifier or slug"),
    db: Session = Depends(get_db)
):
    controller = HotelController(db)
    resolved_id = resolve_hotel_id(hotel_id)
    return controller.get_hotel(resolved_id)


@router.get("/{hotel_id}/room-types", response_model=List[RoomTypeOut], summary="Get available room types for a hotel")
def get_hotel_rooms(
    hotel_id: str = Path(..., description="Unique hotel identifier or slug"),
    db: Session = Depends(get_db)
):
    controller = HotelController(db)
    resolved_id = resolve_hotel_id(hotel_id)
    return controller.get_hotel_room_types(resolved_id)


@router.get("/{hotel_id}/availability", response_model=HotelAvailabilityResponse,
            summary="Phase 6: Real-time room inventory availability by date range")
def get_hotel_availability(
    hotel_id: str = Path(..., description="Unique hotel identifier or slug"),
    check_in: date = Query(..., description="Check-in arrival date (YYYY-MM-DD)"),
    check_out: date = Query(..., description="Check-out departure date (YYYY-MM-DD)"),
    rooms: int = Query(1, ge=1, le=10, description="Number of rooms requested"),
    db: Session = Depends(get_db)
):
    service = BookingService(db)
    resolved_id = resolve_hotel_id(hotel_id)
    return service.get_hotel_availability(resolved_id, check_in, check_out, rooms)
