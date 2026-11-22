import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import verify_password


@pytest.mark.asyncio
async def test_auth_registration_and_login():
    unique_email = f"traveler_{uuid.uuid4().hex[:8]}@example.com"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register new user
        reg_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Test Traveler",
                "email": unique_email,
                "password": "Password123!",
            },
        )
        assert reg_resp.status_code == 201
        data = reg_resp.json()
        assert "access_token" in data
        assert "refresh_token" in data

        # Login with registered user
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={
                "email": unique_email,
                "password": "Password123!",
            },
        )
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]

        # Get profile
        me_resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["email"] == unique_email
        assert me_data["full_name"] == "Test Traveler"


@pytest.mark.asyncio
async def test_admin_stats_authorized_vs_unauthorized():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Anonymous request should be 401
        unauth_resp = await client.get("/api/v1/admin/stats")
        assert unauth_resp.status_code == 401

        # 2. Login as admin
        admin_login = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@globestay.com",
                "password": "AdminPass123!",
            },
        )
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["access_token"]

        # 3. Request stats with admin token
        stats_resp = await client.get(
            "/api/v1/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert stats_resp.status_code == 200
        stats = stats_resp.json()
        assert "total_users" in stats
        assert "total_hotels" in stats
        assert "total_bookings" in stats


@pytest.mark.asyncio
async def test_booking_and_payment_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login as customer
        login = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "traveler@example.com",
                "password": "Password123!",
            },
        )
        token = login.json()["access_token"]
        auth_header = {"Authorization": f"Bearer {token}"}

        # Create booking
        booking_resp = await client.post(
            "/api/v1/bookings",
            json={
                "hotel_id": 1,
                "check_in": "2026-12-10",
                "check_out": "2026-12-13",
                "rooms": [{"room_type_id": 1, "quantity": 1}],
                "guests": [{"guest_name": "Test Traveler", "guest_type": "adult"}],
                "display_currency": "USD",
            },
            headers=auth_header,
        )
        assert booking_resp.status_code == 201
        booking = booking_resp.json()
        assert booking["status"].lower() == "pending_payment"
        booking_id = booking["id"]

        # Process payment
        pay_resp = await client.post(
            "/api/v1/payments",
            json={
                "booking_id": booking_id,
                "payment_method": "card",
                "card_token": "tok_visa_valid",
                "idempotency_key": f"test_idemp_{booking_id}_{uuid.uuid4().hex[:6]}",
            },
            headers=auth_header,
        )
        assert pay_resp.status_code == 201
        payment = pay_resp.json()
        assert payment["status"].lower() == "completed"

        # Check booking is now confirmed
        detail_resp = await client.get(f"/api/v1/bookings/{booking_id}", headers=auth_header)
        assert detail_resp.status_code == 200
        assert detail_resp.json()["status"].lower() == "confirmed"
