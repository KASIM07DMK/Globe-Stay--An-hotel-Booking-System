from typing import List
from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user
from app.models import User
from app.services.review_service import ReviewService, FavoriteService
from app.schemas.payment_review_schema import ReviewCreateRequest, ReviewOut, FavoriteOut

router = APIRouter(tags=["Reviews & Favorites"])


# ─── Reviews ─────────────────────────────────────────────
@router.post("/reviews", response_model=ReviewOut, status_code=201,
             summary="Submit a review for a completed booking")
def create_review(
    data: ReviewCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReviewService(db)
    return service.create_review(current_user, data)


@router.get("/reviews/me", response_model=List[ReviewOut],
            summary="Get current user's reviews")
def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReviewService(db)
    return service.get_user_reviews(current_user)


@router.get("/hotels/{hotel_id}/reviews", response_model=List[ReviewOut],
            summary="Get approved reviews for a hotel")
def get_hotel_reviews(
    hotel_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    service = ReviewService(db)
    return service.get_hotel_reviews(hotel_id)


# ─── Favorites ───────────────────────────────────────────
@router.post("/favorites/{hotel_id}", summary="Toggle hotel favorite")
def toggle_favorite(
    hotel_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = FavoriteService(db)
    return service.toggle_favorite(current_user, hotel_id)


@router.get("/favorites", response_model=List[FavoriteOut],
            summary="List user's favorited hotels")
def get_my_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = FavoriteService(db)
    return service.get_user_favorites(current_user)


@router.get("/favorites/{hotel_id}/check", summary="Check if hotel is favorited")
def check_favorite(
    hotel_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = FavoriteService(db)
    return service.check_favorite(current_user, hotel_id)
