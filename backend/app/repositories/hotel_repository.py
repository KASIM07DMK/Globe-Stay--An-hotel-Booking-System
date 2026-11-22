from typing import List, Optional, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func, desc, asc
from app.models import Hotel, RoomType, Amenity, Review, ReviewStatus


class HotelRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, hotel_id: int) -> Optional[Hotel]:
        """Fetch hotel by primary key with preloaded room types, amenities, and approved reviews."""
        return (
            self.db.query(Hotel)
            .options(
                joinedload(Hotel.room_types),
                joinedload(Hotel.amenities),
                joinedload(Hotel.reviews).joinedload(Review.user),
            )
            .filter(Hotel.id == hotel_id, Hotel.status == "active")
            .first()
        )

    def get_room_types(self, hotel_id: int) -> List[RoomType]:
        """Fetch active room types for a given hotel."""
        return (
            self.db.query(RoomType)
            .filter(RoomType.hotel_id == hotel_id, RoomType.status == "active")
            .all()
        )

    def search_hotels(
        self,
        destination: Optional[str] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        min_rating: Optional[float] = None,
        category: Optional[str] = None,
        amenity_names: Optional[List[str]] = None,
        sort_by: str = "recommended",
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[Hotel], int]:
        """
        Search hotels with flexible multi-field filtering and pagination.
        Returns a tuple of (hotels_page, total_count).
        """
        query = (
            self.db.query(Hotel)
            .options(
                joinedload(Hotel.room_types),
                joinedload(Hotel.amenities),
                joinedload(Hotel.reviews)
            )
            .filter(Hotel.status == "active")
        )

        # Destination search (matches city, country, or hotel name, handles comma-separated inputs like "Tokyo, Japan")
        if destination and destination.strip():
            # Split by comma or space if user enters "Tokyo, Japan"
            tokens = [t.strip().lower() for t in destination.replace(',', ' ').split() if t.strip()]
            for token in tokens:
                term = f"%{token}%"
                query = query.filter(
                    or_(
                        func.lower(Hotel.city).like(term),
                        func.lower(Hotel.country).like(term),
                        func.lower(Hotel.name).like(term),
                        func.lower(Hotel.country_code).like(term),
                    )
                )

        # Star Rating filter
        if min_rating is not None and min_rating > 0:
            query = query.filter(Hotel.star_rating >= min_rating)

        # Category filter
        if category and category.lower() != "all":
            query = query.filter(func.lower(Hotel.category) == category.lower())

        # Amenities filter
        if amenity_names:
            for am_name in amenity_names:
                if am_name.strip():
                    query = query.filter(
                        Hotel.amenities.any(func.lower(Amenity.name) == am_name.strip().lower())
                    )

        # Price range filter based on room_types minimum price
        if min_price is not None:
            query = query.filter(Hotel.room_types.any(RoomType.base_price >= min_price))
        if max_price is not None:
            query = query.filter(Hotel.room_types.any(RoomType.base_price <= max_price))

        # Distinct hotels count before pagination
        total = query.distinct().count()

        # Sorting
        if sort_by == "price_asc":
            # Sort by lowest room price
            query = query.join(Hotel.room_types).order_by(asc(RoomType.base_price))
        elif sort_by == "price_desc":
            query = query.join(Hotel.room_types).order_by(desc(RoomType.base_price))
        elif sort_by == "rating_desc":
            query = query.order_by(desc(Hotel.star_rating), desc(Hotel.id))
        else:
            # Default: recommended
            query = query.order_by(desc(Hotel.star_rating), desc(Hotel.created_at))

        hotels = query.distinct().offset(skip).limit(limit).all()
        return hotels, total
