import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_get_hotels_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/hotels")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 1
        assert len(data["items"]) >= 1
        
        # Verify schema of first hotel item
        first = data["items"][0]
        assert "name" in first
        assert "city" in first
        assert "starting_price" in first
        assert float(first["starting_price"]) > 0


@pytest.mark.asyncio
async def test_search_hotels_by_destination():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/hotels?destination=Tokyo")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        for item in data["items"]:
            assert "tokyo" in item["city"].lower() or "tokyo" in item["name"].lower()


@pytest.mark.asyncio
async def test_search_hotels_filter_category():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/hotels?category=Resort")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        for item in data["items"]:
            assert item["category"].lower() == "resort"


@pytest.mark.asyncio
async def test_search_hotels_sorting_price():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/hotels?sort_by=price_asc")
        assert response.status_code == 200
        data = response.json()
        items = data["items"]
        if len(items) >= 2:
            prices = [float(item["starting_price"]) for item in items]
            # Verify prices are non-decreasing
            assert prices == sorted(prices)


@pytest.mark.asyncio
async def test_get_hotel_details():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # First list to get a valid ID
        list_resp = await client.get("/api/v1/hotels")
        hotel_id = list_resp.json()["items"][0]["id"]

        detail_resp = await client.get(f"/api/v1/hotels/{hotel_id}")
        assert detail_resp.status_code == 200
        detail = detail_resp.json()
        assert detail["id"] == hotel_id
        assert len(detail["room_types"]) >= 1
        assert "check_in_time" in detail
        assert "check_out_time" in detail
        assert "full_amenities" in detail


@pytest.mark.asyncio
async def test_get_hotel_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/hotels/999999")
        assert response.status_code == 404
        data = response.json()
        assert "not found" in data["detail"]["message"].lower()
