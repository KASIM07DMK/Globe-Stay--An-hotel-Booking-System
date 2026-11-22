import enum
from sqlalchemy import String, Text, Integer, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class ReviewStatus(str, enum.Enum):
    APPROVED = "APPROVED"
    PENDING_MODERATION = "PENDING_MODERATION"
    REJECTED = "REJECTED"


class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    hotel_id: Mapped[int] = mapped_column(ForeignKey("hotels.id", ondelete="CASCADE"), index=True, nullable=False)
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ReviewStatus] = mapped_column(
        Enum(ReviewStatus, native_enum=False),
        default=ReviewStatus.APPROVED,
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="reviews")
    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="reviews")
    booking: Mapped["Booking"] = relationship("Booking", back_populates="review")

    def __repr__(self) -> str:
        return f"<Review id={self.id} hotel_id={self.hotel_id} rating={self.rating}>"
