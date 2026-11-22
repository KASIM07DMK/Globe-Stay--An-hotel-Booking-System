from typing import List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from app.repositories.hotel_repository import HotelRepository
from app.models import Hotel, ReviewStatus
from app.schemas.hotel_schema import (
    HotelSummaryOut,
    HotelDetailOut,
    RoomTypeOut,
    AmenityOut,
    ReviewOut,
    PaginatedHotelsResponse
)
from app.core.exceptions import NotFoundError


class HotelService:
    def __init__(self, db: Session):
        self.repo = HotelRepository(db)

    def _build_summary(self, hotel: Hotel) -> HotelSummaryOut:
        # Compute lowest starting price across rooms
        prices = [r.base_price for r in hotel.room_types if r.status == "active"]
        starting_price = min(prices) if prices else Decimal("0.00")

        # Compute guest rating from approved reviews
        approved_reviews = [r for r in hotel.reviews if r.status == ReviewStatus.APPROVED]
        review_count = len(approved_reviews)
        if review_count > 0:
            guest_rating = round(sum(r.rating for r in approved_reviews) / review_count, 2)
        else:
            guest_rating = round(hotel.star_rating, 1)

        amenities_list = [a.name for a in hotel.amenities]

        return HotelSummaryOut(
            id=hotel.id,
            name=hotel.name,
            tagline=hotel.tagline,
            description=hotel.description,
            city=hotel.city,
            country=hotel.country,
            country_code=hotel.country_code,
            address=hotel.address,
            latitude=hotel.latitude,
            longitude=hotel.longitude,
            star_rating=hotel.star_rating,
            base_currency=hotel.base_currency,
            hero_image=hotel.hero_image,
            category=hotel.category,
            cancellation_policy=hotel.cancellation_policy,
            status=hotel.status,
            starting_price=starting_price,
            guest_rating=guest_rating,
            review_count=review_count,
            amenities=amenities_list,
        )

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
        page = max(1, page)
        limit = max(1, min(100, limit))
        skip = (page - 1) * limit

        hotels, total = self.repo.search_hotels(
            destination=destination,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            category=category,
            amenity_names=amenities,
            sort_by=sort_by,
            skip=skip,
            limit=limit
        )

        items = [self._build_summary(h) for h in hotels]
        total_pages = (total + limit - 1) // limit if total > 0 else 1

        return PaginatedHotelsResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages
        )

    def get_hotel_detail(self, hotel_id: int) -> HotelDetailOut:
        hotel = self.repo.get_by_id(hotel_id)
        if not hotel:
            raise NotFoundError(entity="Hotel", identifier=hotel_id)

        summary = self._build_summary(hotel)

        room_types_out = [
            RoomTypeOut(
                id=r.id,
                hotel_id=r.hotel_id,
                name=r.name,
                description=r.description,
                maximum_occupancy=r.maximum_occupancy,
                bed_configuration=r.bed_configuration,
                base_price=r.base_price,
                currency=r.currency,
                total_inventory_count=r.total_inventory_count,
                status=r.status
            )
            for r in hotel.room_types if r.status == "active"
        ]

        full_amenities = [
            AmenityOut(
                id=a.id,
                name=a.name,
                category=a.category,
                icon=a.icon
            )
            for a in hotel.amenities
        ]

        approved_reviews = [
            ReviewOut(
                id=r.id,
                user_name=r.user.full_name if r.user else "Verified Guest",
                rating=r.rating,
                comment=r.comment,
                created_at=r.created_at.strftime("%B %Y") if r.created_at else "Recent"
            )
            for r in hotel.reviews if r.status == ReviewStatus.APPROVED
        ]

        return HotelDetailOut(
            **summary.model_dump(),
            images=hotel.images or [hotel.hero_image],
            check_in_time=hotel.check_in_time,
            check_out_time=hotel.check_out_time,
            room_types=room_types_out,
            full_amenities=full_amenities,
            reviews=approved_reviews
        )

    def get_room_types(self, hotel_id: int) -> List[RoomTypeOut]:
        hotel = self.repo.get_by_id(hotel_id)
        if not hotel:
            raise NotFoundError(entity="Hotel", identifier=hotel_id)

        rooms = self.repo.get_room_types(hotel_id)
        return [
            RoomTypeOut(
                id=r.id,
                hotel_id=r.hotel_id,
                name=r.name,
                description=r.description,
                maximum_occupancy=r.maximum_occupancy,
                bed_configuration=r.bed_configuration,
                base_price=r.base_price,
                currency=r.currency,
                total_inventory_count=r.total_inventory_count,
                status=r.status
            )
            for r in rooms
        ]
