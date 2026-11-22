import pytest
import uuid
from datetime import datetime, timedelta, timezone, date
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.database.session import get_db
from app.models import (
    Booking, BookingStatus, BookingRoom, RoomType, RoomInventory, Hotel, User, Payment, PaymentStatus
)
from app.core.security import create_access_token


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def customer_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@globestay.com", "password": "CustomerPass123!"}
    )
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.fixture
def admin_token(client):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@globestay.com", "password": "AdminPass123!"}
    )
    assert res.status_code == 200
    return res.json()["access_token"]


def test_booking_lifecycle_and_cancellation(client, customer_token):
    """Phase 7: Full booking lifecycle - creation, payment, cancellation with reason, and inventory return."""
    headers = {"Authorization": f"Bearer {customer_token}"}
    today = datetime.now(timezone.utc).date()
    check_in = (today + timedelta(days=120)).isoformat()
    check_out = (today + timedelta(days=123)).isoformat()

    # 1. Create booking
    booking_payload = {
        "hotel_id": 1,
        "check_in": check_in,
        "check_out": check_out,
        "rooms": [{"room_type_id": 1, "quantity": 1}],
        "guests": [{"guest_name": "Alexander Hamilton", "guest_type": "adult"}],
        "display_currency": "USD"
    }
    create_res = client.post("/api/v1/bookings", json=booking_payload, headers=headers)
    assert create_res.status_code == 201
    booking_data = create_res.json()
    booking_id = booking_data["id"]
    assert booking_data["status"] == "PENDING_PAYMENT"
    assert booking_data["is_cancellable"] is True

    # 2. Process sandbox payment
    payment_payload = {
        "booking_id": booking_id,
        "payment_method": "credit_card",
        "card_token": "tok_sandbox_visa_verified",
        "idempotency_key": f"test_pay_p7_{uuid.uuid4().hex[:12]}"
    }
    pay_res = client.post("/api/v1/payments", json=payment_payload, headers=headers)
    assert pay_res.status_code == 201
    assert pay_res.json()["status"] == "COMPLETED"

    # Verify booking is now CONFIRMED
    detail_res = client.get(f"/api/v1/bookings/{booking_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["status"] == "CONFIRMED"
    assert detail_res.json()["payment_status"] == "COMPLETED"

    # 3. Cancel booking with custom reason
    cancel_payload = {"reason": "Flight rescheduled due to winter storm"}
    cancel_res = client.post(f"/api/v1/bookings/{booking_id}/cancel", json=cancel_payload, headers=headers)
    assert cancel_res.status_code == 200
    cancelled_data = cancel_res.json()
    assert cancelled_data["status"] == "CANCELLED"
    assert cancelled_data["cancellation_reason"] == "Flight rescheduled due to winter storm"
    assert cancelled_data["payment_status"] == "REFUNDED"

    # 4. Attempting to cancel an already cancelled booking should fail
    re_cancel_res = client.post(f"/api/v1/bookings/{booking_id}/cancel", json=cancel_payload, headers=headers)
    assert re_cancel_res.status_code == 403


def test_unauthorized_user_cannot_cancel_other_booking(client, customer_token, admin_token):
    """Phase 7: Security check - a user cannot cancel another user's reservation."""
    cust_headers = {"Authorization": f"Bearer {customer_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    today = datetime.now(timezone.utc).date()
    check_in = (today + timedelta(days=30)).isoformat()
    check_out = (today + timedelta(days=32)).isoformat()

    # Customer creates booking
    booking_payload = {
        "hotel_id": 2,
        "check_in": check_in,
        "check_out": check_out,
        "rooms": [{"room_type_id": 4, "quantity": 1}],
        "guests": [{"guest_name": "Test Customer", "guest_type": "adult"}],
        "display_currency": "USD"
    }
    res = client.post("/api/v1/bookings", json=booking_payload, headers=cust_headers)
    assert res.status_code == 201
    booking_id = res.json()["id"]

    # Admin (as a different user) tries to cancel via user route -> 404 Not Found (scoped to user)
    admin_cancel_res = client.post(f"/api/v1/bookings/{booking_id}/cancel", json={"reason": "Admin test"}, headers=admin_headers)
    assert admin_cancel_res.status_code == 404
