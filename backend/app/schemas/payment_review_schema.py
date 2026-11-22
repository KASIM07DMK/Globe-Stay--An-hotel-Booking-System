from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class ProcessPaymentRequest(BaseModel):
    booking_id: int
    payment_method: str = Field(default="card", description="Payment method type")
    card_token: Optional[str] = Field(None, description="Tokenized card (sandbox: any string)")
    idempotency_key: str = Field(..., description="Client-generated unique key for idempotency")


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    provider: str
    provider_reference: Optional[str] = None
    idempotency_key: str
    amount: Decimal
    currency: str
    status: str
    created_at: Optional[str] = None


class PaymentWebhookPayload(BaseModel):
    event_id: str = Field(..., description="Unique event identifier from payment provider")
    event_type: str = Field(..., description="Event type: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded")
    booking_id: int = Field(..., description="Target booking identifier")
    amount: Optional[Decimal] = None
    currency: Optional[str] = "USD"
    provider_reference: Optional[str] = None
    failure_reason: Optional[str] = None


class WebhookResponse(BaseModel):
    received: bool = True
    event_id: str
    status: str
    message: str


class ReviewCreateRequest(BaseModel):
    booking_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating 1-5")
    comment: str = Field(..., min_length=10, max_length=2000, description="Review text")


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    user_name: str
    hotel_id: int
    hotel_name: Optional[str] = None
    booking_id: int
    rating: int
    comment: str
    status: str
    created_at: Optional[str] = None


class FavoriteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    hotel_id: int
    hotel_name: Optional[str] = None
    hotel_city: Optional[str] = None
    hotel_country: Optional[str] = None
    hotel_hero_image: Optional[str] = None
    hotel_star_rating: Optional[float] = None
