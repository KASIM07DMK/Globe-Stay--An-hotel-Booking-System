"""
Seed 20 real luxury landmark hotels across major global cities:
Tokyo, Paris, New York, London, Dubai, Bali, Rome, Singapore, Kyoto, Santorini
Includes real coordinates, addresses, room types, and 30 days of inventory.
"""
import datetime
from decimal import Decimal
from app.database.session import SessionLocal
from app.models import Hotel, RoomType, Amenity, RoomInventory

REAL_HOTELS = [
    # TOKYO, JAPAN
    {
        "name": "Aman Tokyo",
        "tagline": "Sanctuary atop the Otemachi Tower with panoramic Mt. Fuji and Imperial Palace views",
        "description": "Rising high above the bustling financial district, Aman Tokyo pairs traditional washi paper lanterns, granite deep-soaking ofuro tubs, and camphor wood finishes with serene minimalist Japanese design.",
        "address": "The Otemachi Tower, 1-5-6 Otemachi, Chiyoda-ku",
        "city": "Tokyo",
        "country": "Japan",
        "country_code": "JP",
        "latitude": 35.6882,
        "longitude": 139.7645,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Deluxe Imperial Suite", "description": "High floor suite with floor-to-ceiling views of the Imperial Palace.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("680.00")},
            {"name": "Premier Corner Onsen Room", "description": "Features authentic Hinoki cedar hot bath and Mt. Fuji silhouette.", "occupancy": 3, "beds": "2 Queen Beds", "price": Decimal("850.00")}
        ]
    },
    {
        "name": "The Ritz-Carlton Tokyo",
        "tagline": "Elevated penthouse luxury occupying Tokyo Midtown's top floors",
        "description": "Perched on the 45th through 53rd floors in Roppongi, featuring Michelin-starred dining, 360-degree skyline vistas, and an acclaimed Club Lounge overlooking Tokyo Tower.",
        "address": "Tokyo Midtown, 9-7-1 Akasaka, Minato-ku",
        "city": "Tokyo",
        "country": "Japan",
        "country_code": "JP",
        "latitude": 35.6664,
        "longitude": 139.7314,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Tokyo Tower View Club Suite", "description": "Direct unobstructed vista of the illuminated Tokyo Tower.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("720.00")},
            {"name": "Club Grand Deluxe", "description": "Spacious marble bath with 600-thread count Egyptian linens.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("590.00")}
        ]
    },

    # PARIS, FRANCE
    {
        "name": "Hôtel de Crillon, Rosewood Hotel",
        "tagline": "18th-century Parisian palace overlooking the historic Place de la Concorde",
        "description": "Commissioned by King Louis XV in 1758, this crown jewel of Parisian grand hotels combines neoclassical French glamour with bespoke Karl Lagerfeld-designed grand apartments.",
        "address": "10 Place de la Concorde, 8th arr.",
        "city": "Paris",
        "country": "France",
        "country_code": "FR",
        "latitude": 48.8672,
        "longitude": 2.3217,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Concorde Historic Salon Suite", "description": "Soaring ceilings, gilded moldings, and views of the Eiffel Tower.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1100.00")},
            {"name": "Premier Courtyard Chamber", "description": "Overlooking the tranquil inner garden court of white marble.", "occupancy": 2, "beds": "1 Queen Bed", "price": Decimal("750.00")}
        ]
    },
    {
        "name": "Le Bristol Paris",
        "tagline": "The epitome of French art de vivre with a courtyard garden and rooftop pool",
        "description": "Located on Rue du Faubourg Saint-Honoré, Le Bristol boasts four Michelin stars, an enchanting French formal garden, and a yacht-styled rooftop indoor pool with views over Montmartre.",
        "address": "112 Rue du Faubourg Saint-Honoré, 8th arr.",
        "city": "Paris",
        "country": "France",
        "country_code": "FR",
        "latitude": 48.8718,
        "longitude": 2.3146,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Deluxe Garden View Chamber", "description": "Direct perspective of the 1,200 sqm interior garden oasis.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("980.00")},
            {"name": "Saint-Honoré Prestige Suite", "description": "Lavish Parisian sitting room with antique Louis XV furnishings.", "occupancy": 3, "beds": "1 King + 1 Sofa", "price": Decimal("1450.00")}
        ]
    },

    # NEW YORK, USA
    {
        "name": "The Plaza Hotel New York",
        "tagline": "The timeless Fifth Avenue icon reigning over Central Park South",
        "description": "Centuries of storied royalty, luminaries, and grand balls define The Plaza. Enjoy afternoon tea at The Palm Court, Champagne Bar service, and lavish Guerlain Spa treatments.",
        "address": "768 5th Ave, Central Park South",
        "city": "New York",
        "country": "United States",
        "country_code": "US",
        "latitude": 40.7645,
        "longitude": -73.9745,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "11:00",
        "hero_image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Central Park One-Bedroom Suite", "description": "Floor-to-ceiling vistas across Central Park's grand canopy.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("950.00")},
            {"name": "Edwardian Grand Deluxe Room", "description": "Opulent chandeliers, 24k gold-plated fixtures, and wet bar.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("680.00")}
        ]
    },
    {
        "name": "The Greenwich Hotel",
        "tagline": "Robert De Niro's artisanal Tribeca haven with Shibui subterranean bamboo spa",
        "description": "Individually appointed with reclaimed Tuscan terracotta, Tibetan silk rugs, and Moroccan tiles, this beloved Tribeca sanctuary offers unparalleled privacy and neighborhood warmth.",
        "address": "377 Greenwich St, Tribeca",
        "city": "New York",
        "country": "United States",
        "country_code": "US",
        "latitude": 40.7196,
        "longitude": -74.0097,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Boutique",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Studio Suite with Fireplace", "description": "Wood-burning fireplace, reclaimed hemlock timbers, and rain shower.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("790.00")},
            {"name": "Greenwich Courtyard King", "description": "Overlooks the lush greenery of the private brick courtyard.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("620.00")}
        ]
    },

    # LONDON, UNITED KINGDOM
    {
        "name": "The Connaught Mayfair",
        "tagline": "Quintessential Mayfair elegance with two-Michelin-star Hélène Darroze and world #1 bar",
        "description": "At the beating heart of Mayfair village, The Connaught blends British heritage with contemporary flair, world-renowned bespoke butler service, and the Aman Spa London.",
        "address": "16 Carlos Pl, Mayfair",
        "city": "London",
        "country": "United Kingdom",
        "country_code": "GB",
        "latitude": 51.5098,
        "longitude": -0.1495,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Mayfair Heritage Suite", "description": "Dedicated 24-hour butler, bespoke martini cart service, and walk-in wardrobe.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("890.00")},
            {"name": "Deluxe King Room", "description": "Italian marble bathroom with heated floors and Dyson amenities.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("640.00")}
        ]
    },
    {
        "name": "The Savoy London",
        "tagline": "The Strand's eternal theatrical grand dame on the banks of the River Thames",
        "description": "Opened in 1889 by Richard D'Oyly Carte, The Savoy was Britain's first luxury hotel. Celebrated for Gordon Ramsay's Savoy Grill, Beaufort Bar, and peerless Art Deco Thames suites.",
        "address": "Strand, Covent Garden",
        "city": "London",
        "country": "United Kingdom",
        "country_code": "GB",
        "latitude": 51.5104,
        "longitude": -0.1206,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Thames Riverview Art Deco Suite", "description": "Breathtaking panorama of London Eye, South Bank, and Big Ben.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("860.00")},
            {"name": "Edwardian Deluxe Room", "description": "Classic English aesthetics with clawfoot soaking tub.", "occupancy": 2, "beds": "1 Queen Bed", "price": Decimal("580.00")}
        ]
    },

    # DUBAI, UAE
    {
        "name": "Burj Al Arab Jumeirah",
        "tagline": "The world's iconic sail-shaped 7-star ultra-luxury hotel on its own island",
        "description": "Hovering above the Arabian Gulf, this architectural marvel features 24-karat gold interiors, duplex suites with private butlers, Rolls-Royce airport transfers, and an infinity pool terrace over the ocean.",
        "address": "Jumeirah St, Umm Suqeim 3",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "country_code": "AE",
        "latitude": 25.1412,
        "longitude": 55.1852,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "One-Bedroom Deluxe Duplex Suite", "description": "170 sqm duplex with panoramic Arabian Gulf vista and Hermès amenities.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1450.00")},
            {"name": "Panoramic Ocean Club Suite", "description": "Curved floor-to-ceiling glass wrapping around the sea horizon.", "occupancy": 3, "beds": "1 King + 1 Rollaway", "price": Decimal("1850.00")}
        ]
    },
    {
        "name": "One&Only The Palm Dubai",
        "tagline": "Boutique beachfront enclave of Moorish and Andalusian palatial villas",
        "description": "Nestled on the quiet crescent tip of the Palm Jumeirah, offering private marina access, lush landscaped fountains, Guerlain Spa treatments, and dining by Yannick Alléno.",
        "address": "West Crescent, Palm Jumeirah",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "country_code": "AE",
        "latitude": 25.1097,
        "longitude": 55.1328,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1512953059089-688b1f0cb97b?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1512953059089-688b1f0cb97b?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Resort",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Palm Beach Pool Villa", "description": "Private plunge pool surrounded by shaded daybeds and palm gardens.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1250.00")},
            {"name": "Palm Manor Premier Room", "description": "Oversized marble bathroom and private sea-facing balcony.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("850.00")}
        ]
    },

    # BALI, INDONESIA
    {
        "name": "Mandapa, a Ritz-Carlton Reserve",
        "tagline": "Tranquil sanctuary along the Ayung River among Ubud's emerald rice terraces",
        "description": "A secluded retreat where luxury converges with Balinese spirituality. Experience riverfront bamboo dining at Kubu, open-air wellness pavilions, and private villa butler service.",
        "address": "Jl. Raya Kedewatan, Banjar Kedewatan, Ubud, Gianyar",
        "city": "Bali",
        "country": "Indonesia",
        "country_code": "ID",
        "latitude": -8.4872,
        "longitude": 115.2472,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Resort",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "One-Bedroom Riverfront Pool Villa", "description": "Private infinity pool overlooking the rushing sacred Ayung River.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("750.00")},
            {"name": "Mandapa Rice Terrace Suite", "description": "Expansive terrace overlooking centuries-old emerald paddies.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("540.00")}
        ]
    },
    {
        "name": "Bulgari Resort Bali",
        "tagline": "Cliffside Italian-Balinese jewel perched 150 meters above the Indian Ocean",
        "description": "Standing on a secluded dramatic limestone cliff in Uluwatu, this resort features hand-cut volcanic stone villas, an incline elevator to a private beach, and world-class Il Ristorante dining.",
        "address": "Jl. Goa Lempeh, Banjar Dinas Kangin, Pecatu, Uluwatu",
        "city": "Bali",
        "country": "Indonesia",
        "country_code": "ID",
        "latitude": -8.8465,
        "longitude": 115.1432,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Resort",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Ocean Cliff View Pool Villa", "description": "Uninterrupted 180-degree ocean views with private plunge pool.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("920.00")},
            {"name": "Premier Ocean Villa", "description": "Open-air living pavilion and black terrazzo outdoor shower.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("780.00")}
        ]
    },

    # ROME, ITALY
    {
        "name": "Hotel de Russie, a Rocco Forte Hotel",
        "tagline": "Piazza del Popolo's grand palazzo famed for its Secret Garden and Stravinskij Bar",
        "description": "Beloved by artists, royals, and discerning travelers, this landmark combines classical Roman statues with terracotta terraces, Mediterranean citrus gardens, and luxurious Italian marble suites.",
        "address": "Via del Babuino 9, Spagna",
        "city": "Rome",
        "country": "Italy",
        "country_code": "IT",
        "latitude": 41.9099,
        "longitude": 12.4777,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Secret Garden Terraced Suite", "description": "Spacious sun-drenched terrace overlooking the historic tiers of greenery.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("880.00")},
            {"name": "Classic Deluxe Double", "description": "Carrara marble bathroom with mosaic tiling and Italian bath amenities.", "occupancy": 2, "beds": "1 Queen Bed", "price": Decimal("620.00")}
        ]
    },
    {
        "name": "Hotel Eden, Dorchester Collection",
        "tagline": "Rooftop panoramic vista over the Eternal City and St. Peter's Basilica",
        "description": "Perched steps from the Spanish Steps and Villa Borghese since 1889, Hotel Eden showcases Italian fine craftsmanship, Michelin-starred cuisine at La Terrazza, and high Roman society charm.",
        "address": "Via Ludovisi 49, Via Veneto",
        "city": "Rome",
        "country": "Italy",
        "country_code": "IT",
        "latitude": 41.9056,
        "longitude": 12.4883,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Villa Borghese Suite", "description": "Floor-to-ceiling windows overlooking the tranquil park gardens.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("820.00")},
            {"name": "Prestige Room with City View", "description": "Golden marble bathroom with double rain shower.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("590.00")}
        ]
    },

    # SINGAPORE
    {
        "name": "Raffles Hotel Singapore",
        "tagline": "The grand colonial monument and birthplace of the legendary Singapore Sling",
        "description": "First opened in 1887, Raffles is the very spirit of tropical colonial grandeur. Features restored teak verandas, private courtyard gardens, and the famous Long Bar.",
        "address": "1 Beach Rd, Downtown Core",
        "city": "Singapore",
        "country": "Singapore",
        "country_code": "SG",
        "latitude": 1.2949,
        "longitude": 103.8545,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Courtyard Suite with Butler Service", "description": "Direct access to lush tropical verandas with 24-hour Raffles butler.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("920.00")},
            {"name": "Palm Court Colonial Suite", "description": "14-foot ceilings, heritage oriental carpets, and freestanding bathtub.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1150.00")}
        ]
    },
    {
        "name": "Marina Bay Sands",
        "tagline": "World-famous rooftop infinity pool spanning three soaring hotel towers",
        "description": "An architectural marvel dominating Singapore's skyline. Crowned by the Sands SkyPark, celebrity chef restaurants by Wolfgang Puck and Gordon Ramsay, and direct access to Gardens by the Bay.",
        "address": "10 Bayfront Ave, Marina Bay",
        "city": "Singapore",
        "country": "Singapore",
        "country_code": "SG",
        "latitude": 1.2834,
        "longitude": 103.8607,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "11:00",
        "hero_image": "https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Resort",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Club Room Marina Bay View", "description": "Access to Club55 lounge and guaranteed 57th floor infinity pool entry.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("680.00")},
            {"name": "Grand Orchid Suite", "description": "Spacious dining salon, private powder room, and complimentary minibar.", "occupancy": 3, "beds": "1 King Bed", "price": Decimal("990.00")}
        ]
    },

    # KYOTO, JAPAN
    {
        "name": "The Ritz-Carlton Kyoto",
        "tagline": "Meiji-period serenity on the tranquil banks of the Kamogawa River",
        "description": "Honoring traditional ryokan craftsmanship with zen rock gardens, bonsai courtyards, and Pierre Hermé patisserie treats, set against views of the eastern Higashiyama mountains.",
        "address": "Kamogawa Nijo-Ohashi Hotori, Nakagyo-ku",
        "city": "Kyoto",
        "country": "Japan",
        "country_code": "JP",
        "latitude": 35.0125,
        "longitude": 135.7712,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Kamogawa River View Suite", "description": "Floor-to-ceiling windows framing the weeping willows of the river.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("840.00")},
            {"name": "Zen Garden Deluxe Chamber", "description": "Features a private dry rock garden terrace and Hinoki wood aroma.", "occupancy": 2, "beds": "2 Twin Beds", "price": Decimal("690.00")}
        ]
    },
    {
        "name": "Aman Kyoto",
        "tagline": "Secret forest moss gardens and hot spring pavilions in historic Takagamine",
        "description": "Hidden within an ancient moss-covered cedar forest at the foot of Hidari Daimonji hill, Aman Kyoto offers mineral-rich onsen waters and Kaiseki dining using mountain herbs.",
        "address": "1 Okitayama Washimine-cho, Kita-ku",
        "city": "Kyoto",
        "country": "Japan",
        "country_code": "JP",
        "latitude": 35.0512,
        "longitude": 135.7289,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Resort",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Washimine Forest Pavilion", "description": "Tucked among cryptomeria cedar trees with tatami living lounge.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1120.00")},
            {"name": "Hot Spring Onsen Suite", "description": "Private thermal mineral spring tub fed by natural underground spring.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1350.00")}
        ]
    },

    # SANTORINI, GREECE
    {
        "name": "Canaves Oia Suites",
        "tagline": "Whitewashed cliffside cave suites carved into the dramatic Caldera rocks",
        "description": "Elegantly carved into the caldera cliff edge in Oia, Canaves offers world-famous infinity pool sunset views, private plunge pools, and private yacht charters around the volcanic Aegean islands.",
        "address": "Main Street, Oia, Thira",
        "city": "Santorini",
        "country": "Greece",
        "country_code": "GR",
        "latitude": 36.4618,
        "longitude": 25.3753,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "11:00",
        "hero_image": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Boutique",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Infinity Caldera Pool Suite", "description": "Private infinity plunge pool cantilevered over the azure Aegean.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("780.00")},
            {"name": "Honeymoon Cave Suite", "description": "Sculpted organic cave walls, rain shower, and sunset deck.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("950.00")}
        ]
    },
    {
        "name": "Grace Hotel, Auberge Resorts Collection",
        "tagline": "Pristine white sanctuary perched high on Imerovigli's volcanic clifftop",
        "description": "Famous for its panoramic tiered infinity pool overlooking Skaros Rock, Grace Hotel delivers Champagne sunset tastings, Mediterranean culinary excellence at Varoulko Santorini, and cliffside yoga.",
        "address": "Imerovigli, Thira",
        "city": "Santorini",
        "country": "Greece",
        "country_code": "GR",
        "latitude": 36.4347,
        "longitude": 25.4222,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Boutique",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Grace Deluxe Sea View Suite", "description": "Expansive terrace with heated plunge pool facing the volcanic crater.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("840.00")},
            {"name": "Superior Caldera Room", "description": "Minimalist cycladic styling with custom king bedding.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("650.00")}
        ]
    }
]

def seed_20_hotels():
    db = SessionLocal()
    try:
        # Check existing hotel names to avoid duplicates
        existing_names = {h.name.lower() for h in db.query(Hotel).all()}
        amenities = db.query(Amenity).all()
        
        today = datetime.date.today()
        created_count = 0

        for h_data in REAL_HOTELS:
            if h_data["name"].lower() in existing_names:
                continue

            rooms_data = h_data.pop("rooms")
            
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
                check_in_time=h_data["check_in_time"],
                check_out_time=h_data["check_out_time"],
                hero_image=h_data["hero_image"],
                images=h_data["images"],
                category=h_data["category"],
                cancellation_policy=h_data["cancellation_policy"],
                status="active"
            )
            # Attach 4-6 amenities
            hotel.amenities = amenities[:6]
            db.add(hotel)
            db.flush()

            # Create Room Types & 45 days of inventory
            for r_info in rooms_data:
                rt = RoomType(
                    hotel_id=hotel.id,
                    name=r_info["name"],
                    description=r_info["description"],
                    maximum_occupancy=r_info["occupancy"],
                    bed_configuration=r_info["beds"],
                    base_price=r_info["price"],
                    currency="USD",
                    total_inventory_count=8,
                    status="active"
                )
                db.add(rt)
                db.flush()

                # Generate 45 days of inventory
                for day_offset in range(45):
                    inv_date = today + datetime.timedelta(days=day_offset)
                    inv = RoomInventory(
                        room_type_id=rt.id,
                        stay_date=inv_date,
                        total_rooms=8,
                        held_rooms=0,
                        booked_rooms=0,
                        version=1
                    )
                    db.add(inv)

            created_count += 1
            existing_names.add(hotel.name.lower())

        db.commit()
        total_hotels = db.query(Hotel).count()
        print(f"SUCCESS: Seeded {created_count} new hotels. Total active hotels in DB: {total_hotels}")

    except Exception as e:
        db.rollback()
        print(f"ERROR seeding hotels: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_20_hotels()
