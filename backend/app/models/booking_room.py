from decimal import Decimal
from sqlalchemy import Integer, Numeric, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class BookingRoom(Base):
    __tablename__ = "booking_rooms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    room_type_id: Mapped[int] = mapped_column(
        ForeignKey("room_types.id", ondelete="RESTRICT"),
        index=True,
        nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    price_snapshot: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)

    # Relationships
    booking: Mapped["Booking"] = relationship("Booking", back_populates="booking_rooms")
    room_type: Mapped["RoomType"] = relationship("RoomType", back_populates="booking_rooms")

    def __repr__(self) -> str:
        return (
            f"<BookingRoom id={self.id} booking_id={self.booking_id} "
            f"room_type_id={self.room_type_id} snapshot={self.price_snapshot}>"
        )
