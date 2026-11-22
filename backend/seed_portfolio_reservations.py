"""
Seed real sample bookings in each state (Confirmed, Pending Payment, and Cancelled)
across diverse destination hotels for customer@globestay.com (user_id=2).
"""
import uuid
import datetime
from decimal import Decimal
from app.database.session import SessionLocal
from app.models import Booking, BookingStatus, Hotel, User

# Diverse luxury hotels to showcase across the portfolio:
# 1. Aman Tokyo (Tokyo, Japan)
# 2. Hôtel de Crillon (Paris, France)
# 3. Burj Al Arab Jumeirah (Dubai, UAE)
# 4. The Plaza Hotel New York (New York, USA)
# 5. Mandapa, a Ritz-Carlton Reserve (Bali, Indonesia)
# 6. The Connaught Mayfair (London, UK)
# 7. Hotel de Russie (Rome, Italy)
# 8. Marina Bay Sands (Singapore, Singapore)
# 9. Canaves Oia Suites (Santorini, Greece)
# 10. The Ritz-Carlton Kyoto (Kyoto, Japan)

PORTFOLIO_SAMPLES = [
    # CONFIRMED STAYS (Upcoming and Verified)
    {
        "hotel_name": "Aman Tokyo",
        "status": BookingStatus.CONFIRMED,
        "ref": "GS-CONF-AMAN-TYO",
        "check_in_offset": 12,
        "nights": 4,
        "subtotal": Decimal("2720.00"),
        "total": Decimal("3128.00"),
    },
    {
        "hotel_name": "Hôtel de Crillon, Rosewood Hotel",
        "status": BookingStatus.CONFIRMED,
        "ref": "GS-CONF-CRILLON-PAR",
        "check_in_offset": 25,
        "nights": 3,
        "subtotal": Decimal("3300.00"),
        "total": Decimal("3795.00"),
    },
    {
        "hotel_name": "Burj Al Arab Jumeirah",
        "status": BookingStatus.CONFIRMED,
        "ref": "GS-CONF-BURJ-DXB",
        "check_in_offset": 45,
        "nights": 3,
        "subtotal": Decimal("4350.00"),
        "total": Decimal("5002.50"),
    },
    {
        "hotel_name": "The Plaza Hotel New York",
        "status": BookingStatus.CONFIRMED,
        "ref": "GS-CONF-PLAZA-NYC",
        "check_in_offset": 60,
        "nights": 4,
        "subtotal": Decimal("3800.00"),
        "total": Decimal("4370.00"),
    },
    {
        "hotel_name": "Marina Bay Sands",
        "status": BookingStatus.CONFIRMED,
        "ref": "GS-CONF-MBS-SIN",
        "check_in_offset": 80,
        "nights": 3,
        "subtotal": Decimal("2040.00"),
        "total": Decimal("2346.00"),
    },

    # PENDING PAYMENT (Active Hold & Room Lock Reserved)
    {
        "hotel_name": "Mandapa, a Ritz-Carlton Reserve",
        "status": BookingStatus.PENDING_PAYMENT,
        "ref": "GS-PEND-MANDAPA-DPS",
        "check_in_offset": 18,
        "nights": 5,
        "subtotal": Decimal("3750.00"),
        "total": Decimal("4312.50"),
    },
    {
        "hotel_name": "Canaves Oia Suites",
        "status": BookingStatus.PENDING_PAYMENT,
        "ref": "GS-PEND-CANAVES-JTR",
        "check_in_offset": 35,
        "nights": 4,
        "subtotal": Decimal("3120.00"),
        "total": Decimal("3588.00"),
    },
    {
        "hotel_name": "The Ritz-Carlton Kyoto",
        "status": BookingStatus.PENDING_PAYMENT,
        "ref": "GS-PEND-RITZ-KYO",
        "check_in_offset": 50,
        "nights": 3,
        "subtotal": Decimal("2520.00"),
        "total": Decimal("2898.00"),
    },

    # CANCELLED RESERVATIONS (With full refund details)
    {
        "hotel_name": "The Connaught Mayfair",
        "status": BookingStatus.CANCELLED,
        "ref": "GS-CANC-CONNAUGHT-LON",
        "check_in_offset": -10,
        "nights": 2,
        "subtotal": Decimal("1780.00"),
        "total": Decimal("2047.00"),
        "reason": "Change of travel dates & flight rescheduling",
    },
    {
        "hotel_name": "Hotel de Russie, a Rocco Forte Hotel",
        "status": BookingStatus.CANCELLED,
        "ref": "GS-CANC-RUSSIE-FCO",
        "check_in_offset": -22,
        "nights": 3,
        "subtotal": Decimal("2640.00"),
        "total": Decimal("3036.00"),
        "reason": "Business meeting relocated to Milan",
    }
]

def seed_portfolio():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "customer@globestay.com").first()
        if not user:
            print("Customer user not found.")
            return

        today = datetime.date.today()
        created_count = 0

        for item in PORTFOLIO_SAMPLES:
            # Check if reference already exists
            existing = db.query(Booking).filter(Booking.booking_reference == item["ref"]).first()
            if existing:
                continue

            hotel = db.query(Hotel).filter(Hotel.name == item["hotel_name"]).first()
            if not hotel:
                # fallback partial match
                hotel = db.query(Hotel).filter(Hotel.name.like(f"%{item['hotel_name'][:8]}%")).first()

            if not hotel:
                print(f"Hotel not found: {item['hotel_name']}")
                continue

            check_in = today + datetime.timedelta(days=item["check_in_offset"])
            check_out = check_in + datetime.timedelta(days=item["nights"])

            booking = Booking(
                booking_reference=item["ref"],
                user_id=user.id,
                hotel_id=hotel.id,
                status=item["status"],
                check_in=check_in,
                check_out=check_out,
                guest_count=2,
                base_currency="USD",
                display_currency="USD",
                exchange_rate=Decimal("1.0000"),
                subtotal=item["subtotal"],
                taxes=item["subtotal"] * Decimal("0.12"),
                fees=Decimal("45.00"),
                discount=Decimal("0.00"),
                total_amount=item["total"],
                cancellation_reason=item.get("reason"),
                hold_expires_at=datetime.datetime.now() + datetime.timedelta(minutes=30) if item["status"] == BookingStatus.PENDING_PAYMENT else None,
                created_at=datetime.datetime.now() - datetime.timedelta(days=abs(item["check_in_offset"]) + 5)
            )
            db.add(booking)
            created_count += 1

        db.commit()
        print(f"SUCCESS: Seeded {created_count} rich portfolio reservations across Confirmed, Pending Payment, and Cancelled.")
    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_portfolio()
