from sqlalchemy.orm import Session, joinedload
from app.models import Review, ReviewStatus, Booking, BookingStatus, Hotel, User, Favorite
from app.schemas.payment_review_schema import ReviewCreateRequest, ReviewOut, FavoriteOut
from app.core.exceptions import NotFoundError, ForbiddenError
from fastapi import HTTPException, status


class ReviewService:
    def __init__(self, db: Session):
        self.db = db

    def create_review(self, user: User, data: ReviewCreateRequest) -> ReviewOut:
        # Must have a confirmed booking
        booking = self.db.query(Booking).filter(
            Booking.id == data.booking_id,
            Booking.user_id == user.id,
            Booking.status == BookingStatus.CONFIRMED
        ).first()
        if not booking:
            raise ForbiddenError(detail="You can only review a confirmed booking you own.")

        # Check if already reviewed
        existing = self.db.query(Review).filter(Review.booking_id == data.booking_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"message": "You have already reviewed this booking.", "code": "REVIEW_EXISTS"}
            )

        review = Review(
            user_id=user.id,
            hotel_id=booking.hotel_id,
            booking_id=data.booking_id,
            rating=data.rating,
            comment=data.comment,
            status=ReviewStatus.APPROVED  # Auto-approve in sandbox
        )
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return self._build_review_out(review)

    def get_user_reviews(self, user: User) -> list[ReviewOut]:
        reviews = self.db.query(Review).options(
            joinedload(Review.user),
            joinedload(Review.hotel)
        ).filter(
            Review.user_id == user.id
        ).order_by(Review.created_at.desc()).all()
        return [self._build_review_out(r) for r in reviews]

    def get_hotel_reviews(self, hotel_id: int) -> list[ReviewOut]:
        reviews = self.db.query(Review).options(
            joinedload(Review.user)
        ).filter(
            Review.hotel_id == hotel_id,
            Review.status == ReviewStatus.APPROVED
        ).order_by(Review.created_at.desc()).all()
        return [self._build_review_out(r) for r in reviews]

    def _build_review_out(self, review: Review) -> ReviewOut:
        return ReviewOut(
            id=review.id,
            user_id=review.user_id,
            user_name=review.user.full_name if review.user else "Guest",
            hotel_id=review.hotel_id,
            hotel_name=review.hotel.name if review.hotel else None,
            booking_id=review.booking_id,
            rating=review.rating,
            comment=review.comment,
            status=review.status.value,
            created_at=review.created_at.isoformat() if review.created_at else None
        )


class FavoriteService:
    def __init__(self, db: Session):
        self.db = db

    def toggle_favorite(self, user: User, hotel_id: int) -> dict:
        hotel = self.db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not hotel:
            raise NotFoundError(entity="Hotel", identifier=hotel_id)

        existing = self.db.query(Favorite).filter(
            Favorite.user_id == user.id,
            Favorite.hotel_id == hotel_id
        ).first()

        if existing:
            self.db.delete(existing)
            self.db.commit()
            return {"action": "removed", "hotel_id": hotel_id}
        else:
            fav = Favorite(user_id=user.id, hotel_id=hotel_id)
            self.db.add(fav)
            self.db.commit()
            return {"action": "added", "hotel_id": hotel_id}

    def get_user_favorites(self, user: User) -> list[FavoriteOut]:
        favorites = self.db.query(Favorite).options(
            joinedload(Favorite.hotel)
        ).filter(
            Favorite.user_id == user.id
        ).order_by(Favorite.created_at.desc()).all()

        return [
            FavoriteOut(
                id=f.id,
                user_id=f.user_id,
                hotel_id=f.hotel_id,
                hotel_name=f.hotel.name if f.hotel else None,
                hotel_city=f.hotel.city if f.hotel else None,
                hotel_country=f.hotel.country if f.hotel else None,
                hotel_hero_image=f.hotel.hero_image if f.hotel else None,
                hotel_star_rating=f.hotel.star_rating if f.hotel else None
            )
            for f in favorites
        ]

    def check_favorite(self, user: User, hotel_id: int) -> dict:
        existing = self.db.query(Favorite).filter(
            Favorite.user_id == user.id,
            Favorite.hotel_id == hotel_id
        ).first()
        return {"is_favorite": existing is not None, "hotel_id": hotel_id}
