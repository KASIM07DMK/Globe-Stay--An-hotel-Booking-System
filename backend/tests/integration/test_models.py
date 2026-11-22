import pytest
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.exc import IntegrityError
from app.models import (
    User, UserRole,
    Hotel,
    RoomType,
    RoomInventory,
    Booking, BookingStatus,
    BookingRoom,
    Review, ReviewStatus
)
from app.core.security import verify_password


def test_seeded_users_exist(db):
    admin = db.query(User).filter_by(email="admin@globestay.com").first()
    assert admin is not None
    assert admin.role == UserRole.ADMIN
    assert verify_password("AdminPass123!", admin.password_hash) is True

    customer = db.query(User).filter_by(email="customer@globestay.com").first()
    assert customer is not None
    assert customer.role == UserRole.CUSTOMER
    assert verify_password("CustomerPass123!", customer.password_hash) is True


def test_hotel_and_room_types_relationship(db):
    hotel = db.query(Hotel).filter_by(city="Tokyo").first()
    assert hotel is not None
    assert len(hotel.room_types) >= 1
    assert len(hotel.amenities) >= 1
    
    first_room = hotel.room_types[0]
    assert first_room.base_price > 0
    assert len(first_room.inventory) >= 60


def test_room_inventory_unique_constraint(db):
    first_room = db.query(RoomType).first()
    today = date.today()

    # Attempting to insert a duplicate inventory record for the same room_type and date
    duplicate_inv = RoomInventory(
        room_type_id=first_room.id,
        stay_date=today,
        total_rooms=5,
        held_rooms=0,
        booked_rooms=0
    )
    db.add(duplicate_inv)
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_room_inventory_availability_calculation():
    inv = RoomInventory(
        room_type_id=1,
        stay_date=date(2099, 1, 1),
        total_rooms=10,
        held_rooms=3,
        booked_rooms=4
    )
    assert inv.available_rooms == 3  # 10 - (3 + 4) = 3


def test_booking_price_snapshot_and_unique_review(db):
    customer = db.query(User).filter_by(email="customer@globestay.com").first()
    hotel = db.query(Hotel).first()
    room = hotel.room_types[0]
    
    # Verify existing demo booking
    demo_booking = db.query(Booking).filter_by(booking_reference="GS-2026-DEMO1").first()
    assert demo_booking is not None
    assert demo_booking.status == BookingStatus.CONFIRMED
    assert len(demo_booking.booking_rooms) == 1
    assert demo_booking.booking_rooms[0].price_snapshot == room.base_price
    
    # Verify review relationship
    assert demo_booking.review is not None
    assert demo_booking.review.rating == 5
    
    # Verify that a second review on the same booking fails unique constraint
    duplicate_review = Review(
        user_id=customer.id,
        hotel_id=hotel.id,
        booking_id=demo_booking.id,
        rating=4,
        comment="Duplicate review attempt",
        status=ReviewStatus.APPROVED
    )
    db.add(duplicate_review)
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()
