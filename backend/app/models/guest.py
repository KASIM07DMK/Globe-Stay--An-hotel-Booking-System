from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class Guest(Base):
    __tablename__ = "guests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    guest_name: Mapped[str] = mapped_column(String(120), nullable=False)
    guest_type: Mapped[str] = mapped_column(String(20), default="adult", nullable=False)

    # Relationships
    booking: Mapped["Booking"] = relationship("Booking", back_populates="guests")

    def __repr__(self) -> str:
        return f"<Guest id={self.id} name='{self.guest_name}' type='{self.guest_type}'>"
