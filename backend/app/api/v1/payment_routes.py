from typing import List, Optional
from fastapi import APIRouter, Depends, Path, Header
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_current_user
from app.models import User
from app.services.payment_service import PaymentService
from app.schemas.payment_review_schema import (
    ProcessPaymentRequest, PaymentOut, PaymentWebhookPayload, WebhookResponse
)

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("", response_model=PaymentOut, status_code=201,
             summary="Process payment for a booking (sandbox)")
def process_payment(
    data: ProcessPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PaymentService(db)
    return service.process_payment(current_user.id, data)


@router.get("/booking/{booking_id}", response_model=List[PaymentOut],
            summary="Get payments for a booking")
def get_booking_payments(
    booking_id: int = Path(..., ge=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PaymentService(db)
    return service.get_booking_payments(current_user.id, booking_id)


@router.post("/webhook", response_model=WebhookResponse,
             summary="Phase 8: Asynchronous payment gateway webhook reconciliation")
def payment_webhook(
    payload: PaymentWebhookPayload,
    x_webhook_signature: Optional[str] = Header(None, alias="X-Webhook-Signature"),
    db: Session = Depends(get_db)
):
    service = PaymentService(db)
    return service.handle_webhook(payload, signature=x_webhook_signature)
