from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from app.services.hotel_service import HotelService
from app.schemas.hotel_schema import (
    PaginatedHotelsResponse,
    HotelDetailOut,
    RoomTypeOut
)


class HotelController:
    def __init__(self, db: Session):
        self.service = HotelService(db)

    def search_hotels(
        self,
        destination: Optional[str] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        min_rating: Optional[float] = None,
        category: Optional[str] = None,
        amenities: Optional[List[str]] = None,
        sort_by: str = "recommended",
        page: int = 1,
        limit: int = 12
    ) -> PaginatedHotelsResponse:
        return self.service.search_hotels(
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

    def get_hotel(self, hotel_id: int) -> HotelDetailOut:
        return self.service.get_hotel_detail(hotel_id)

    def get_hotel_room_types(self, hotel_id: int) -> List[RoomTypeOut]:
        return self.service.get_room_types(hotel_id)
