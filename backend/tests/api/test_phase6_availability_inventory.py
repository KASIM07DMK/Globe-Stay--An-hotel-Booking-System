import pytest
import uuid
from datetime import datetime, timedelta, timezone, date
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.database.session import get_db
from app.models import Booking, BookingStatus, BookingRoom, RoomType, RoomInventory, Hotel, User, UserRole
from app.core.security import create_access_token


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_token(client):
    # Log in as seeded admin
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@globestay.com", "password": "AdminPass123!"}
    )
    assert res.status_code == 200
    return res.json()["access_token"]


def test_hotel_room_availability_endpoint(client):
    """Test Phase 6 real-time availability endpoint."""
    today = datetime.now(timezone.utc).date()
    check_in = (today + timedelta(days=10)).isoformat()
    check_out = (today + timedelta(days=13)).isoformat()

    res = client.get(f"/api/v1/hotels/1/availability?check_in={check_in}&check_out={check_out}&rooms=1")
    assert res.status_code == 200
    data = res.json()

    assert data["hotel_id"] == 1
    assert data["nights"] == 3
    assert data["requested_rooms"] == 1
    assert len(data["room_types"]) >= 1

    room = data["room_types"][0]
    assert "room_type_name" in room
    assert "min_available" in room
    assert "is_available" in room
    assert room["is_available"] is True
    assert len(room["daily_breakdown"]) == 3


def test_hotel_availability_invalid_dates(client):
    """Test validation when check_out is prior to check_in."""
    today = datetime.now(timezone.utc).date()
    check_in = (today + timedelta(days=5)).isoformat()
    check_out = (today + timedelta(days=2)).isoformat()

    res = client.get(f"/api/v1/hotels/1/availability?check_in={check_in}&check_out={check_out}&rooms=1")
    assert res.status_code == 409  # InventoryUnavailableError mapped to 409


def test_reap_expired_holds_mechanism(client):
    """Test that expired holds are safely reaped and inventory is released."""
    db_gen = get_db()
    db: Session = next(db_gen)

    try:
        user = db.query(User).filter(User.role == UserRole.CUSTOMER).first()
        hotel = db.query(Hotel).first()
        room_type = db.query(RoomType).filter(RoomType.hotel_id == hotel.id).first()

        today = datetime.now(timezone.utc).date()
        # Random future date offset
        days_ahead = 200 + (hash(str(uuid.uuid4())) % 100)
        check_in = today + timedelta(days=days_ahead)
        check_out = today + timedelta(days=days_ahead + 2)

        # Ensure or get inventory records
        for d in [check_in, check_in + timedelta(days=1)]:
            inv = db.query(RoomInventory).filter(
                RoomInventory.room_type_id == room_type.id,
                RoomInventory.stay_date == d
            ).first()
            if inv:
                inv.held_rooms += 2
            else:
                inv = RoomInventory(
                    room_type_id=room_type.id,
                    stay_date=d,
                    total_rooms=10,
                    held_rooms=2,
                    booked_rooms=0
                )
                db.add(inv)
        db.flush()

        # Create expired booking with random reference
        unique_ref = f"GS-EXP-{uuid.uuid4().hex[:8].upper()}"
        expired_hold_time = datetime.now(timezone.utc) - timedelta(minutes=5)
        booking = Booking(
            booking_reference=unique_ref,
            user_id=user.id,
            hotel_id=hotel.id,
            status=BookingStatus.PENDING_PAYMENT,
            check_in=check_in,
            check_out=check_out,
            guest_count=1,
            base_currency="USD",
            display_currency="USD",
            exchange_rate=Decimal("1.0"),
            subtotal=Decimal("200.00"),
            taxes=Decimal("24.00"),
            fees=Decimal("9.99"),
            discount=Decimal("0.00"),
            total_amount=Decimal("233.99"),
            hold_expires_at=expired_hold_time
        )
        db.add(booking)
        db.flush()

        br = BookingRoom(
            booking_id=booking.id,
            room_type_id=room_type.id,
            quantity=2,
            price_snapshot=Decimal("100.00"),
            currency="USD"
        )
        db.add(br)
        db.commit()

        # Trigger reap endpoint
        res = client.post("/api/v1/bookings/reconcile-holds")
        assert res.status_code == 200
        reap_data = res.json()
        assert reap_data["reaped_bookings_count"] >= 1
        assert reap_data["released_rooms_count"] >= 2

        # Verify in DB
        db.refresh(booking)
        assert booking.status == BookingStatus.CANCELLED

    finally:
        db.close()


def test_admin_room_inventory_management(client, admin_token):
    """Test admin room listing and dynamic capacity updating."""
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. List room types
    res = client.get("/api/v1/admin/rooms", headers=headers)
    assert res.status_code == 200
    rooms = res.json()
    assert len(rooms) > 0
    test_room = rooms[0]
    initial_count = test_room["total_inventory_count"]

    # 2. Update room inventory capacity
    new_capacity = initial_count + 5
    res_patch = client.patch(
        f"/api/v1/admin/rooms/{test_room['id']}/inventory",
        headers=headers,
        json={"total_inventory_count": new_capacity}
    )
    assert res_patch.status_code == 200
    updated = res_patch.json()
    assert updated["total_inventory_count"] == new_capacity

    # 3. Restore capacity
    client.patch(
        f"/api/v1/admin/rooms/{test_room['id']}/inventory",
        headers=headers,
        json={"total_inventory_count": initial_count}
    )
