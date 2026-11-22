from typing import List, Optional, Union
from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict, field_validator

SLUG_MAP = {
    "htl-aman-tokyo": 1,
    "htl-paris-vendome": 2,
    "htl-dubai-marina-palace": 3,
    "htl-manhattan-loft": 4,
    "htl-bali-ubud-resort": 5,
    "htl-london-mayfair": 6,
}


class RoomSelectionItem(BaseModel):
    room_type_id: int
    quantity: int = Field(..., ge=1, le=10)


class GuestInfo(BaseModel):
    guest_name: str = Field(..., min_length=1, max_length=120)
    guest_type: str = Field(default="adult", pattern="^(adult|child|infant)$")


class CreateBookingRequest(BaseModel):
    hotel_id: Union[int, str]
    check_in: date
    check_out: date
    rooms: List[RoomSelectionItem]
    guests: List[GuestInfo] = Field(default_factory=list)
    display_currency: str = Field(default="USD", max_length=3)

    @field_validator("hotel_id", mode="before")
    @classmethod
    def parse_hotel_id(cls, v):
        if isinstance(v, int):
            return v
        v_str = str(v).strip().lower()
        if v_str.isdigit():
            return int(v_str)
        if v_str in SLUG_MAP:
            return SLUG_MAP[v_str]
        return 1


class BookingRoomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    room_type_id: int
    room_type_name: Optional[str] = None
    quantity: int
    price_snapshot: Decimal
    currency: str


class GuestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    guest_name: str
    guest_type: str


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_reference: str
    user_id: int
    hotel_id: int
    hotel_name: Optional[str] = None
    hotel_city: Optional[str] = None
    hotel_country: Optional[str] = None
    hotel_hero_image: Optional[str] = None
    status: str
    check_in: date
    check_out: date
    guest_count: int
    base_currency: str
    display_currency: str
    exchange_rate: Decimal
    subtotal: Decimal
    taxes: Decimal
    fees: Decimal
    discount: Decimal
    total_amount: Decimal
    cancellation_deadline: Optional[str] = None
    hold_expires_at: Optional[str] = None
    cancellation_reason: Optional[str] = None
    cancellation_policy: Optional[str] = None
    is_cancellable: bool = True
    payment_reference: Optional[str] = None
    payment_status: Optional[str] = None
    rooms: List[BookingRoomOut] = Field(default_factory=list)
    guests: List[GuestOut] = Field(default_factory=list)
    created_at: Optional[str] = None


class PaginatedBookingsResponse(BaseModel):
    items: List[BookingOut]
    total: int
    page: int
    limit: int
    total_pages: int


class CancelBookingRequest(BaseModel):
    reason: Optional[str] = Field(default="Change of travel plans", description="Reason for cancellation")


# ─── Phase 6: Availability & Inventory Schemas ─────────────────────────────────

class DayAvailabilityItem(BaseModel):
    date: date
    available: int
    held: int
    booked: int
    total: int


class RoomAvailabilityItem(BaseModel):
    room_type_id: int
    room_type_name: str
    maximum_occupancy: int
    bed_configuration: str
    base_price: Decimal
    currency: str
    min_available: int
    is_available: bool
    status: str
    daily_breakdown: List[DayAvailabilityItem] = Field(default_factory=list)


class HotelAvailabilityResponse(BaseModel):
    hotel_id: int
    check_in: date
    check_out: date
    nights: int
    requested_rooms: int
    room_types: List[RoomAvailabilityItem]


class AdminRoomTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hotel_id: int
    hotel_name: Optional[str] = None
    name: str
    description: Optional[str] = None
    maximum_occupancy: int
    bed_configuration: str
    base_price: Decimal
    currency: str
    total_inventory_count: int
    status: str
    active_holds: int = 0
    active_bookings: int = 0


class UpdateRoomInventoryRequest(BaseModel):
    total_inventory_count: Optional[int] = Field(None, ge=1, le=500)
    base_price: Optional[Decimal] = Field(None, ge=1)
    status: Optional[str] = Field(None, pattern="^(active|inactive)$")


class ReconcileHoldsResponse(BaseModel):
    reaped_bookings_count: int
    released_rooms_count: int
    message: str
