from fastapi import HTTPException, status

class GlobeStayException(HTTPException):
    """Base exception for all domain errors with structured detail."""
    def __init__(self, status_code: int, detail: str, code: str = "ERROR"):
        super().__init__(status_code=status_code, detail={"message": detail, "code": code})


class NotFoundError(GlobeStayException):
    def __init__(self, entity: str, identifier: str | int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity} with id '{identifier}' not found.",
            code="NOT_FOUND"
        )


class InventoryUnavailableError(GlobeStayException):
    def __init__(self, detail: str = "Requested rooms are unavailable for selected dates."):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            code="INVENTORY_UNAVAILABLE"
        )


class BookingHoldExpiredError(GlobeStayException):
    def __init__(self, detail: str = "Booking reservation hold has expired."):
        super().__init__(
            status_code=status.HTTP_410_GONE,
            detail=detail,
            code="HOLD_EXPIRED"
        )


class UnauthorizedError(GlobeStayException):
    def __init__(self, detail: str = "Authentication credentials were invalid or expired."):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code="UNAUTHORIZED"
        )


class ForbiddenError(GlobeStayException):
    def __init__(self, detail: str = "You do not have permission to perform this action."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            code="FORBIDDEN"
        )


class PaymentProcessingError(GlobeStayException):
    def __init__(self, detail: str = "Payment transaction could not be processed."):
        super().__init__(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=detail,
            code="PAYMENT_FAILED"
        )
