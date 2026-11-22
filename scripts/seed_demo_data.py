import sys
import os
from datetime import date, timedelta
from decimal import Decimal

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models import (
    User, UserRole,
    Hotel,
    RoomType,
    RoomInventory,
    Amenity,
    Review, ReviewStatus,
    Booking, BookingStatus,
    BookingRoom
)
from app.core.security import hash_password
from app.core.logging import logger


def seed_database():
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users
        existing_admin = db.query(User).filter_by(email="admin@globestay.com").first()
        if existing_admin:
            logger.info("Database already seeded. Skipping initial seeding.")
            return

        logger.info("Seeding users...")
        users = [
            User(
                full_name="GlobeStay Administrator",
                email="admin@globestay.com",
                password_hash=hash_password("AdminPass123!"),
                role=UserRole.ADMIN,
                is_active=True,
            ),
            User(
                full_name="Alexander Wright",
                email="customer@globestay.com",
                password_hash=hash_password("CustomerPass123!"),
                role=UserRole.CUSTOMER,
                is_active=True,
            ),
            User(
                full_name="Sarah Chen",
                email="sarah.chen@example.com",
                password_hash=hash_password("CustomerPass123!"),
                role=UserRole.CUSTOMER,
                is_active=True,
            ),
        ]
        db.add_all(users)
        db.flush()

        # 2. Seed Amenities
        logger.info("Seeding amenities...")
        amenities_data = [
            ("Onsen Hot Spring", "wellness", "flame"),
            ("Infinity Pool", "wellness", "waves"),
            ("Michelin Star Dining", "dining", "utensils"),
            ("High-Speed Wi-Fi", "hotel", "wifi"),
            ("Luxury Spa", "wellness", "sparkles"),
            ("Private Beach", "hotel", "sun"),
            ("Butler Service", "hotel", "bell"),
            ("Concierge Desk", "hotel", "compass"),
            ("Valet Parking", "hotel", "car"),
            ("Airport Chauffeur", "hotel", "plane"),
            ("Fitness Center", "wellness", "dumbbell"),
            ("Traditional Afternoon Tea", "dining", "coffee"),
        ]
        amenities = []
        for name, cat, icon in amenities_data:
            amenity = Amenity(name=name, category=cat, icon=icon)
            db.add(amenity)
            amenities.append(amenity)
        db.flush()

        # 3. Seed Hotels
        logger.info("Seeding international hotels...")
        hotels_data = [
            {
                "name": "The Otemachi Sanctuary",
                "tagline": "Elevated urban sanctuary with panoramic Imperial Garden views",
                "description": "Perched high above the financial heart of Tokyo, this landmark retreat combines traditional washi paper screens and granite onsen baths with cutting-edge Japanese minimalism.",
                "address": "The Otemachi Tower, 1-5-6 Otemachi, Chiyoda-ku",
                "city": "Tokyo",
                "country": "Japan",
                "country_code": "JP",
                "latitude": 35.6882,
                "longitude": 139.7645,
                "star_rating": 5.0,
                "base_currency": "USD",
                "hero_image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
                ],
                "category": "Luxury",
                "cancellation_policy": "Free Cancellation",
                "rooms": [
                    ("Deluxe King Imperial Suite", "Panoramic garden views with deep soaking cedar tub.", 2, "1 King Bed", Decimal("520.00"), 10),
                    ("Skyline Executive Twin", "Corner suite with floor-to-ceiling Tokyo skyline panoramas.", 3, "2 Double Beds", Decimal("640.00"), 8),
                    ("Imperial Grand Penthouse", "Private rooftop onsen terrace and dedicated butler.", 4, "2 King Beds", Decimal("1250.00"), 4),
                ],
                "amenity_indices": [0, 1, 2, 3, 4, 6, 7]
            },
            {
                "name": "Hôtel Plaza Vendôme",
                "tagline": "Classic 19th-century Parisian grand palace near the Louvre",
                "description": "Impeccable Haussmann architecture, gilded chandeliers, and discreet royal service right on Place Vendôme.",
                "address": "15 Place Vendôme, 1st Arrondissement",
                "city": "Paris",
                "country": "France",
                "country_code": "FR",
                "latitude": 48.8675,
                "longitude": 2.3294,
                "star_rating": 5.0,
                "base_currency": "USD",
                "hero_image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
                ],
                "category": "Luxury",
                "cancellation_policy": "Free Cancellation",
                "rooms": [
                    ("Prestige Vendôme Room", "French velvet curtains, marble fireplace, and courtyard views.", 2, "1 King Bed", Decimal("640.00"), 12),
                    ("Haussmann Balcony Suite", "Wrought-iron balcony looking towards the Eiffel Tower.", 2, "1 King Bed", Decimal("890.00"), 6),
                    ("Royal Tuileries Suite", "Opulent master bedroom, salon, and antique furnishings.", 4, "2 King Beds", Decimal("1650.00"), 3),
                ],
                "amenity_indices": [2, 3, 4, 6, 7, 8, 11]
            },
            {
                "name": "The Palm Royale Residence",
                "tagline": "Beachfront luxury with direct Arabian Gulf shoreline access",
                "description": "Situated on the crest of Palm Jumeirah, featuring private cabanas, private marina berths, and signature suites with skyline views.",
                "address": "Crescent West, Palm Jumeirah",
                "city": "Dubai",
                "country": "United Arab Emirates",
                "country_code": "AE",
                "latitude": 25.1124,
                "longitude": 55.1389,
                "star_rating": 5.0,
                "base_currency": "USD",
                "hero_image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
                ],
                "category": "Resort",
                "cancellation_policy": "Flexible",
                "rooms": [
                    ("Palm Horizon Suite", "Direct views of the Dubai Marina skyline and private balcony.", 2, "1 King Bed", Decimal("475.00"), 15),
                    ("Beachfront Plunge Villa", "Step straight onto the private white sand beach.", 3, "1 King Bed + 1 Daybed", Decimal("780.00"), 8),
                    ("Royal Palm Penthouse", "360-degree Arabian Gulf terrace with infinity pool.", 6, "3 King Beds", Decimal("2100.00"), 2),
                ],
                "amenity_indices": [1, 2, 3, 4, 5, 6, 7, 8, 9]
            },
            {
                "name": "The Greenwich Heritage Hotel",
                "tagline": "Boutique cobblestone aesthetic in historic downtown New York",
                "description": "Exposed brick, hand-loomed Tibetan rugs, and an intimate subterranean Japanese bathhouse in TriBeCa.",
                "address": "377 Greenwich Street, TriBeCa",
                "city": "New York",
                "country": "United States",
                "country_code": "US",
                "latitude": 40.7193,
                "longitude": -74.0098,
                "star_rating": 5.0,
                "base_currency": "USD",
                "hero_image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80"
                ],
                "category": "Boutique",
                "cancellation_policy": "Free Cancellation",
                "rooms": [
                    ("Courtyard Studio", "Quiet courtyard garden views with bespoke walnut wood finishes.", 2, "1 Queen Bed", Decimal("480.00"), 10),
                    ("TriBeCa Loft King", "High timber ceilings, wood-burning fireplace, and soaking tub.", 2, "1 King Bed", Decimal("620.00"), 8),
                    ("The Greenwich Penthouse", "Reclaimed stone and terracotta sanctuary with private veranda.", 4, "2 King Beds", Decimal("1450.00"), 3),
                ],
                "amenity_indices": [1, 3, 4, 7, 8, 10]
            },
            {
                "name": "Ayung Valley Rainforest Villas",
                "tagline": "Suspended infinity pools cascading over sacred jungle canopies",
                "description": "An architectural tribute to Balinese craftsmanship. Each private teak villa features an open-air plunge pool overlooking the mist of the Ayung River valley.",
                "address": "Banjar Baung, Sayan, Ubud",
                "city": "Bali",
                "country": "Indonesia",
                "country_code": "ID",
                "latitude": -8.5192,
                "longitude": 115.2415,
                "star_rating": 5.0,
                "base_currency": "USD",
                "hero_image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
                ],
                "category": "Resort",
                "cancellation_policy": "Free Cancellation",
                "rooms": [
                    ("One-Bedroom Jungle Plunge Villa", "Private infinity pool overlooking tropical bamboo forest.", 2, "1 King Bed", Decimal("310.00"), 12),
                    ("Riverfront Sanctuary Villa", "Direct river sounds with open-concept carved living space.", 3, "1 King Bed", Decimal("450.00"), 8),
                    ("Two-Bedroom Royal Estate", "Bi-level estate with private meditation deck and chef service.", 4, "2 King Beds", Decimal("890.00"), 4),
                ],
                "amenity_indices": [1, 2, 3, 4, 6, 7, 9]
            },
            {
                "name": "The Mayfair Georgian Court",
                "tagline": "Aristocratic English charm overlooking Berkeley Square",
                "description": "Original fireplaces, bespoke Savile Row tailored upholstery, and an award-winning afternoon tea salon.",
                "address": "22 Berkeley Square, Mayfair",
                "city": "London",
                "country": "United Kingdom",
                "country_code": "GB",
                "latitude": 51.5095,
                "longitude": -0.1448,
                "star_rating": 5.0,
                "base_currency": "USD",
                "hero_image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
                ],
                "category": "Boutique",
                "cancellation_policy": "Free Cancellation",
                "rooms": [
                    ("Classic Georgian King", "Heritage English prints with heated Italian marble bathrooms.", 2, "1 King Bed", Decimal("410.00"), 14),
                    ("Berkeley Square Suite", "Double-aspect windows overlooking green parkland.", 2, "1 King Bed", Decimal("590.00"), 7),
                    ("The Royal Mayfair Suite", "Private dining salon, library, and dedicated butler.", 4, "2 King Beds", Decimal("1350.00"), 2),
                ],
                "amenity_indices": [2, 3, 4, 6, 7, 8, 11]
            },
        ]

        today = date.today()

        for h_data in hotels_data:
            hotel = Hotel(
                name=h_data["name"],
                tagline=h_data["tagline"],
                description=h_data["description"],
                address=h_data["address"],
                city=h_data["city"],
                country=h_data["country"],
                country_code=h_data["country_code"],
                latitude=h_data["latitude"],
                longitude=h_data["longitude"],
                star_rating=h_data["star_rating"],
                base_currency=h_data["base_currency"],
                hero_image=h_data["hero_image"],
                images=h_data["images"],
                category=h_data["category"],
                cancellation_policy=h_data["cancellation_policy"],
                status="active"
            )
            # Attach selected amenities
            hotel.amenities = [amenities[idx] for idx in h_data["amenity_indices"] if idx < len(amenities)]
            db.add(hotel)
            db.flush()

            # Create Room Types and 60 days of atomic inventory for each
            for r_name, r_desc, r_occ, r_beds, r_price, r_inv in h_data["rooms"]:
                room_type = RoomType(
                    hotel_id=hotel.id,
                    name=r_name,
                    description=r_desc,
                    maximum_occupancy=r_occ,
                    bed_configuration=r_beds,
                    base_price=r_price,
                    currency="USD",
                    total_inventory_count=r_inv,
                    status="active"
                )
                db.add(room_type)
                db.flush()

                # Generate 60 days of daily atomic inventory
                inventory_list = []
                for day_offset in range(60):
                    stay_date = today + timedelta(days=day_offset)
                    inv = RoomInventory(
                        room_type_id=room_type.id,
                        stay_date=stay_date,
                        total_rooms=r_inv,
                        held_rooms=0,
                        booked_rooms=0,
                        version=1
                    )
                    inventory_list.append(inv)
                db.add_all(inventory_list)

        db.commit()

        # 4. Create sample confirmed booking and verified review for Alexander Wright
        alexander = db.query(User).filter_by(email="customer@globestay.com").first()
        first_hotel = db.query(Hotel).first()
        first_room = db.query(RoomType).filter_by(hotel_id=first_hotel.id).first()

        sample_booking = Booking(
            booking_reference="GS-2026-DEMO1",
            user_id=alexander.id,
            hotel_id=first_hotel.id,
            status=BookingStatus.CONFIRMED,
            check_in=today - timedelta(days=5),
            check_out=today - timedelta(days=2),
            guest_count=2,
            base_currency="USD",
            display_currency="USD",
            exchange_rate=Decimal("1.0000"),
            subtotal=first_room.base_price * 3,
            taxes=Decimal("150.00"),
            fees=Decimal("45.00"),
            discount=Decimal("0.00"),
            total_amount=(first_room.base_price * 3) + Decimal("195.00"),
        )
        db.add(sample_booking)
        db.flush()

        # Price snapshot
        db.add(BookingRoom(
            booking_id=sample_booking.id,
            room_type_id=first_room.id,
            quantity=1,
            price_snapshot=first_room.base_price,
            currency="USD"
        ))

        # Verified Review
        sample_review = Review(
            user_id=alexander.id,
            hotel_id=first_hotel.id,
            booking_id=sample_booking.id,
            rating=5,
            comment="An unforgettable stay. The onsen hot spring was exceptional and check-in was seamless.",
            status=ReviewStatus.APPROVED
        )
        db.add(sample_review)
        db.commit()

        logger.info("Successfully seeded users, hotels, room types, 60-day inventory, and demo bookings!")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
