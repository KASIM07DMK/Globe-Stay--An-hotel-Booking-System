"""
Phase 10 & 11 Integration Tests:
- Currency conversion API & exchange rates
- Admin review moderation API lifecycle
"""
import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import get_db, SessionLocal
from app.models import User, Hotel, Booking, BookingStatus, Review, ReviewStatus
from datetime import date, timedelta


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def admin_token(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@globestay.com",
        "password": "AdminPass123!"
    })
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.fixture
def customer_token(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "customer@globestay.com",
        "password": "CustomerPass123!"
    })
    assert res.status_code == 200
    return res.json()["access_token"]


# ─── Currency Tests ─────────────────────────────────────────────────────────

def test_currency_exchange_rates(client):
    res = client.get("/api/v1/currency/rates")
    assert res.status_code == 200
    data = res.json()
    assert data["base"] == "USD"
    assert "EUR" in data["rates"]
    assert "GBP" in data["rates"]
    assert "JPY" in data["rates"]
    assert data["symbols"]["USD"] == "$"


def test_currency_conversion(client):
    res = client.get("/api/v1/currency/convert?amount=100&target=EUR")
    assert res.status_code == 200
    data = res.json()
    assert data["original_usd"] == 100.0
    assert data["target_currency"] == "EUR"
    assert data["converted"] == 92.0
    assert "€" in data["formatted"]


def test_currency_conversion_invalid_currency(client):
    res = client.get("/api/v1/currency/convert?amount=100&target=XYZ")
    assert res.status_code == 400


# ─── Admin Review Moderation Tests ──────────────────────────────────────────

def test_admin_review_moderation_lifecycle(client, admin_token, customer_token):
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    headers_cust = {"Authorization": f"Bearer {customer_token}"}

    # 1. Create a confirmed booking to allow review creation
    db = SessionLocal()
    try:
        hotel = db.query(Hotel).first()
        assert hotel is not None
        hotel_id = hotel.id

        # Create a mock completed booking directly with unique reference
        unique_ref = f"REV-{uuid.uuid4().hex[:8].upper()}"
        booking = Booking(
            user_id=2,  # customer
            hotel_id=hotel_id,
            booking_reference=unique_ref,
            status=BookingStatus.CONFIRMED,
            check_in=date.today() - timedelta(days=5),
            check_out=date.today() - timedelta(days=2),
            guest_count=1,
            subtotal=450.0,
            taxes=50.0,
            fees=0.0,
            total_amount=500.0,
            base_currency="USD",
            display_currency="USD",
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        booking_id = booking.id
    finally:
        db.close()

    # 2. Submit a review as customer
    review_res = client.post("/api/v1/reviews", headers=headers_cust, json={
        "hotel_id": hotel_id,
        "booking_id": booking_id,
        "rating": 5,
        "comment": "Outstanding stay and exquisite concierge service."
    })
    assert review_res.status_code in (201, 200)
    review_id = review_res.json()["id"]

    # 3. List reviews as admin
    list_res = client.get("/api/v1/admin/reviews", headers=headers_admin)
    assert list_res.status_code == 200
    data = list_res.json()
    assert "items" in data
    assert any(r["id"] == review_id for r in data["items"])

    # 4. Moderate review to REJECTED
    mod_res = client.patch(
        f"/api/v1/admin/reviews/{review_id}?status=REJECTED",
        headers=headers_admin
    )
    assert mod_res.status_code == 200
    assert mod_res.json()["status"] == "REJECTED"

    # 5. Moderate review to APPROVED
    appr_res = client.patch(
        f"/api/v1/admin/reviews/{review_id}?status=APPROVED",
        headers=headers_admin
    )
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "APPROVED"

    # 6. Delete review
    del_res = client.delete(f"/api/v1/admin/reviews/{review_id}", headers=headers_admin)
    assert del_res.status_code == 200

    # 7. Non-admin access should be forbidden (403)
    unauth_res = client.get("/api/v1/admin/reviews", headers=headers_cust)
    assert unauth_res.status_code == 403
