from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class AmenityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    icon: str


class RoomTypeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hotel_id: int
    name: str
    description: str
    maximum_occupancy: int
    bed_configuration: str
    base_price: Decimal
    currency: str
    total_inventory_count: int
    status: str


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_name: str
    rating: int
    comment: str
    created_at: str


class HotelSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    tagline: str
    description: str
    city: str
    country: str
    country_code: str
    address: str
    latitude: float
    longitude: float
    star_rating: float
    base_currency: str
    hero_image: str
    category: str
    cancellation_policy: str
    status: str
    
    # Aggregates / computed fields
    starting_price: Decimal
    guest_rating: float
    review_count: int
    amenities: List[str] = Field(default_factory=list)


class HotelDetailOut(HotelSummaryOut):
    images: List[str] = Field(default_factory=list)
    check_in_time: str
    check_out_time: str
    room_types: List[RoomTypeOut] = Field(default_factory=list)
    full_amenities: List[AmenityOut] = Field(default_factory=list)
    reviews: List[ReviewOut] = Field(default_factory=list)


class PaginatedHotelsResponse(BaseModel):
    items: List[HotelSummaryOut]
    total: int
    page: int
    limit: int
    total_pages: int
