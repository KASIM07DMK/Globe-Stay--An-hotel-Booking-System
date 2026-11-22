from datetime import date
from typing import Optional
from decimal import Decimal
from sqlalchemy import Integer, Date, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class RoomInventory(Base, TimestampMixin):
    __tablename__ = "room_inventory"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    room_type_id: Mapped[int] = mapped_column(
        ForeignKey("room_types.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    stay_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    total_rooms: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    held_rooms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    booked_rooms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    price_override: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    __table_args__ = (
        UniqueConstraint("room_type_id", "stay_date", name="uq_room_type_stay_date"),
    )

    # Relationships
    room_type: Mapped["RoomType"] = relationship("RoomType", back_populates="inventory")

    @property
    def available_rooms(self) -> int:
        return max(0, self.total_rooms - (self.booked_rooms + self.held_rooms))

    def __repr__(self) -> str:
        return (
            f"<RoomInventory id={self.id} room_type_id={self.room_type_id} "
            f"date={self.stay_date} avail={self.available_rooms} total={self.total_rooms}>"
        )
