"""
Phase 10: Email Notification Adapter
Console-logger implementation (SMTP ready for production).
"""
import logging
from datetime import date
from typing import Optional

logger = logging.getLogger("globestay.notifications")
logging.basicConfig(level=logging.INFO, format="[NOTIFY] %(message)s")


def _log_email(to: str, subject: str, body: str) -> None:
    """Console logger – replace with SMTP/SendGrid in prod."""
    separator = "─" * 60
    logger.info("\n%s\n📧 TO: %s\n📌 SUBJECT: %s\n\n%s\n%s", separator, to, subject, body, separator)


def send_booking_confirmation(
    to_email: str,
    guest_name: str,
    booking_reference: str,
    hotel_name: str,
    check_in: date,
    check_out: date,
    total_amount: float,
    currency: str = "USD",
) -> None:
    nights = (check_out - check_in).days
    body = f"""
Dear {guest_name},

Your reservation at GlobeStay has been CONFIRMED! 🎉

  Booking Reference : {booking_reference}
  Hotel             : {hotel_name}
  Check-In          : {check_in.strftime('%d %b %Y')}
  Check-Out         : {check_out.strftime('%d %b %Y')}
  Duration          : {nights} night{'s' if nights != 1 else ''}
  Total Charged     : {currency} {total_amount:.2f}

Please present this confirmation at the hotel front desk.

Safe travels,
GlobeStay International Reservations
"""
    _log_email(to_email, f"GlobeStay – Booking Confirmed: {booking_reference}", body)


def send_booking_cancellation(
    to_email: str,
    guest_name: str,
    booking_reference: str,
    hotel_name: str,
    reason: Optional[str] = None,
    refund_amount: Optional[float] = None,
    currency: str = "USD",
) -> None:
    refund_line = (
        f"  Refund Amount     : {currency} {refund_amount:.2f} (3-5 business days)\n"
        if refund_amount is not None
        else "  Refund            : Per cancellation policy\n"
    )
    reason_line = f"  Reason            : {reason}\n" if reason else ""
    body = f"""
Dear {guest_name},

Your booking has been CANCELLED.

  Booking Reference : {booking_reference}
  Hotel             : {hotel_name}
{reason_line}{refund_line}
If you did not request this cancellation, please contact support@globestay.com immediately.

GlobeStay International Reservations
"""
    _log_email(to_email, f"GlobeStay – Booking Cancelled: {booking_reference}", body)


def send_payment_receipt(
    to_email: str,
    guest_name: str,
    booking_reference: str,
    amount: float,
    currency: str,
    provider_reference: str,
) -> None:
    body = f"""
Dear {guest_name},

Payment received — thank you!

  Booking Reference : {booking_reference}
  Amount Charged    : {currency} {amount:.2f}
  Transaction ID    : {provider_reference}

Your booking is now confirmed. See your dashboard for details.

GlobeStay International Reservations
"""
    _log_email(to_email, f"GlobeStay – Payment Receipt #{provider_reference}", body)


def send_password_reset(to_email: str, guest_name: str, reset_token: str) -> None:
    body = f"""
Dear {guest_name},

A password reset was requested for your GlobeStay account.

  Reset Token : {reset_token}
  Expires in  : 30 minutes

If you did not request this, please ignore this email.

GlobeStay Security Team
"""
    _log_email(to_email, "GlobeStay – Password Reset Request", body)

