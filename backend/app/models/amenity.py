from typing import List
from sqlalchemy import String, Table, Column, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

# Association table for Hotel and Amenity
hotel_amenities = Table(
    "hotel_amenities",
    Base.metadata,
    Column("hotel_id", Integer, ForeignKey("hotels.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="hotel", nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="sparkles", nullable=False)

    # Relationship back to hotels
    hotels: Mapped[List["Hotel"]] = relationship(
        "Hotel",
        secondary=hotel_amenities,
        back_populates="amenities"
    )

    def __repr__(self) -> str:
        return f"<Amenity id={self.id} name='{self.name}'>"
