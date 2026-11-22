from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class Favorite(Base, TimestampMixin):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    hotel_id: Mapped[int] = mapped_column(
        ForeignKey("hotels.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "hotel_id", name="uq_user_hotel_favorite"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="favorites")
    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="favorites")

    def __repr__(self) -> str:
        return f"<Favorite id={self.id} user_id={self.user_id} hotel_id={self.hotel_id}>"
