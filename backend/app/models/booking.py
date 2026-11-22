import enum
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import String, Integer, Date, DateTime, Numeric, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin


class BookingStatus(str, enum.Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    PAYMENT_FAILED = "PAYMENT_FAILED"


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    booking_reference: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    hotel_id: Mapped[int] = mapped_column(ForeignKey("hotels.id", ondelete="CASCADE"), index=True, nullable=False)
    
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, native_enum=False),
        default=BookingStatus.PENDING_PAYMENT,
        index=True,
        nullable=False
    )
    
    check_in: Mapped[date] = mapped_column(Date, nullable=False)
    check_out: Mapped[date] = mapped_column(Date, nullable=False)
    guest_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    
    base_currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    display_currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    exchange_rate: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("1.0000"), nullable=False)
    
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    taxes: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    fees: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    cancellation_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    hold_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    cancellation_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="bookings")
    hotel: Mapped["Hotel"] = relationship("Hotel")
    booking_rooms: Mapped[List["BookingRoom"]] = relationship(
        "BookingRoom",
        back_populates="booking",
        cascade="all, delete-orphan"
    )
    guests: Mapped[List["Guest"]] = relationship(
        "Guest",
        back_populates="booking",
        cascade="all, delete-orphan"
    )
    payments: Mapped[List["Payment"]] = relationship(
        "Payment",
        back_populates="booking",
        cascade="all, delete-orphan"
    )
    review: Mapped[Optional["Review"]] = relationship(
        "Review",
        back_populates="booking",
        uselist=False
    )

    def __repr__(self) -> str:
        return f"<Booking id={self.id} ref='{self.booking_reference}' status='{self.status}'>"
