import pytest
import uuid
import hmac
import hashlib
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings


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


def test_payment_webhook_succeeded_confirms_booking(client, customer_token):
    """Phase 8: payment_intent.succeeded webhook confirms pending booking."""
    headers = {"Authorization": f"Bearer {customer_token}"}
    today = datetime.now(timezone.utc).date()
    check_in = (today + timedelta(days=40)).isoformat()
    check_out = (today + timedelta(days=43)).isoformat()

    # 1. Create booking in PENDING_PAYMENT
    create_res = client.post("/api/v1/bookings", json={
        "hotel_id": 1,
        "check_in": check_in,
        "check_out": check_out,
        "rooms": [{"room_type_id": 1, "quantity": 1}],
        "guests": [{"guest_name": "Webhook Test Guest", "guest_type": "adult"}]
    }, headers=headers)
    assert create_res.status_code == 201
    booking_id = create_res.json()["id"]

    # 2. Simulate webhook with valid HMAC signature
    event_id = f"evt_succ_{uuid.uuid4().hex[:12]}"
    signature = hmac.new(
        settings.PAYMENT_WEBHOOK_SECRET.encode(),
        event_id.encode(),
        hashlib.sha256
    ).hexdigest()

    webhook_payload = {
        "event_id": event_id,
        "event_type": "payment_intent.succeeded",
        "booking_id": booking_id,
        "amount": 1500.00,
        "currency": "USD",
        "provider_reference": f"pi_{uuid.uuid4().hex[:16]}"
    }
    wh_res = client.post(
        "/api/v1/payments/webhook",
        json=webhook_payload,
        headers={"X-Webhook-Signature": signature}
    )
    assert wh_res.status_code == 200
    assert wh_res.json()["status"] == "processed"

    # 3. Verify booking is now CONFIRMED
    b_res = client.get(f"/api/v1/bookings/{booking_id}", headers=headers)
    assert b_res.status_code == 200
    assert b_res.json()["status"] == "CONFIRMED"


def test_payment_webhook_failed_releases_hold(client, customer_token):
    """Phase 8: payment_intent.payment_failed marks booking PAYMENT_FAILED."""
    headers = {"Authorization": f"Bearer {customer_token}"}
    today = datetime.now(timezone.utc).date()
    check_in = (today + timedelta(days=45)).isoformat()
    check_out = (today + timedelta(days=47)).isoformat()

    # Create pending booking
    create_res = client.post("/api/v1/bookings", json={
        "hotel_id": 1,
        "check_in": check_in,
        "check_out": check_out,
        "rooms": [{"room_type_id": 2, "quantity": 1}],
        "guests": [{"guest_name": "Failed Card Guest", "guest_type": "adult"}]
    }, headers=headers)
    assert create_res.status_code == 201
    booking_id = create_res.json()["id"]

    # Webhook for failure
    event_id = f"evt_fail_{uuid.uuid4().hex[:12]}"
    signature = hmac.new(
        settings.PAYMENT_WEBHOOK_SECRET.encode(),
        event_id.encode(),
        hashlib.sha256
    ).hexdigest()

    webhook_payload = {
        "event_id": event_id,
        "event_type": "payment_intent.payment_failed",
        "booking_id": booking_id,
        "failure_reason": "card_declined_insufficient_funds"
    }
    wh_res = client.post(
        "/api/v1/payments/webhook",
        json=webhook_payload,
        headers={"X-Webhook-Signature": signature}
    )
    assert wh_res.status_code == 200

    # Verify status is PAYMENT_FAILED
    b_res = client.get(f"/api/v1/bookings/{booking_id}", headers=headers)
    assert b_res.status_code == 200
    assert b_res.json()["status"] == "PAYMENT_FAILED"


def test_payment_webhook_invalid_signature_rejected(client):
    """Phase 8: Webhook with tampered/invalid signature returns 403 Forbidden."""
    webhook_payload = {
        "event_id": "evt_fraud_123",
        "event_type": "payment_intent.succeeded",
        "booking_id": 1,
    }
    wh_res = client.post(
        "/api/v1/payments/webhook",
        json=webhook_payload,
        headers={"X-Webhook-Signature": "invalid_forged_signature_hex"}
    )
    assert wh_res.status_code == 403

