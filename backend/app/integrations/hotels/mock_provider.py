from typing import List, Dict, Any, Optional
from datetime import date
from app.integrations.hotels.base import HotelSupplierAdapter
from app.core.logging import logger


class MockHotelSupplierAdapter(HotelSupplierAdapter):
    """
    Mock supplier adapter demonstrating external supplier integration.
    Clearly marked as synthetic demonstration data for fallback.
    """

    async def search_properties(
        self,
        destination: str,
        check_in: Optional[date] = None,
        check_out: Optional[date] = None,
        guests: int = 2
    ) -> List[Dict[str, Any]]:
        logger.info(f"[MockHotelSupplierAdapter] Querying external inventory for destination='{destination}'")
        # In mock mode, the primary database provides official curated properties
        return []

    async def get_property_rates(
        self,
        supplier_hotel_id: str,
        check_in: date,
        check_out: date
    ) -> Dict[str, Any]:
        logger.info(f"[MockHotelSupplierAdapter] Checking external supplier rates for {supplier_hotel_id}")
        return {
            "supplier_id": supplier_hotel_id,
            "status": "available",
            "currency": "USD",
            "is_mock": True
        }
