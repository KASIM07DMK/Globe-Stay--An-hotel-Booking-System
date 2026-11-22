from typing import List
from decimal import Decimal
from sqlalchemy import String, Text, Integer, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class RoomType(Base, TimestampMixin):
    __tablename__ = "room_types"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    hotel_id: Mapped[int] = mapped_column(ForeignKey("hotels.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    maximum_occupancy: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    bed_configuration: Mapped[str] = mapped_column(String(100), default="1 King Bed", nullable=False)
    base_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    total_inventory_count: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)

    # Relationships
    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="room_types")
    inventory: Mapped[List["RoomInventory"]] = relationship(
        "RoomInventory",
        back_populates="room_type",
        cascade="all, delete-orphan"
    )
    booking_rooms: Mapped[List["BookingRoom"]] = relationship("BookingRoom", back_populates="room_type")

    def __repr__(self) -> str:
        return f"<RoomType id={self.id} hotel_id={self.hotel_id} name='{self.name}' price={self.base_price}>"
