from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import date


class HotelSupplierAdapter(ABC):
    """Abstract interface for external hotel inventory suppliers."""

    @abstractmethod
    async def search_properties(
        self,
        destination: str,
        check_in: Optional[date] = None,
        check_out: Optional[date] = None,
        guests: int = 2
    ) -> List[Dict[str, Any]]:
        """Search hotels from supplier by destination and travel dates."""
        pass

    @abstractmethod
    async def get_property_rates(
        self,
        supplier_hotel_id: str,
        check_in: date,
        check_out: date
    ) -> Dict[str, Any]:
        """Fetch live live supplier rates and room availability."""
        pass
