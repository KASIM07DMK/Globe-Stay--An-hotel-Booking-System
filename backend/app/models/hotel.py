from typing import List, Optional
from sqlalchemy import String, Text, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin
from app.models.amenity import hotel_amenities


class Hotel(Base, TimestampMixin):
    __tablename__ = "hotels"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    tagline: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    country: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    country_code: Mapped[str] = mapped_column(String(3), index=True, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    star_rating: Mapped[float] = mapped_column(Float, default=5.0, nullable=False)
    base_currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    check_in_time: Mapped[str] = mapped_column(String(10), default="15:00", nullable=False)
    check_out_time: Mapped[str] = mapped_column(String(10), default="11:00", nullable=False)
    hero_image: Mapped[str] = mapped_column(String(500), nullable=False)
    images: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="Luxury", nullable=False)
    cancellation_policy: Mapped[str] = mapped_column(String(50), default="Free Cancellation", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)

    # Relationships
    room_types: Mapped[List["RoomType"]] = relationship(
        "RoomType",
        back_populates="hotel",
        cascade="all, delete-orphan"
    )
    amenities: Mapped[List["Amenity"]] = relationship(
        "Amenity",
        secondary=hotel_amenities,
        back_populates="hotels"
    )
    reviews: Mapped[List["Review"]] = relationship(
        "Review",
        back_populates="hotel",
        cascade="all, delete-orphan"
    )
    favorites: Mapped[List["Favorite"]] = relationship(
        "Favorite",
        back_populates="hotel",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Hotel id={self.id} name='{self.name}' city='{self.city}'>"
