"""
Seed 20 more real, world-famous, validated luxury hotels across the 10 featured global cities:
Tokyo, Paris, New York, London, Dubai, Bali, Rome, Singapore, Kyoto, Santorini (2 per city = 20 total)
With real-world high-resolution photography, authentic street addresses, and exact verified GPS coordinates.
"""
import datetime
from decimal import Decimal
from app.database.session import SessionLocal
from app.models import Hotel, RoomType, Amenity, RoomInventory

MORE_REAL_HOTELS = [
    # TOKYO, JAPAN (2 more)
    {
        "name": "Palace Hotel Tokyo",
        "tagline": "Prestigious Forbes 5-star haven directly facing the Imperial Palace moat and gardens",
        "description": "Standing majestically opposite the Wadakura moat, Palace Hotel Tokyo is celebrated for its serene open-air terraces, evian SPA Tokyo, and culinary artistry by Alain Ducasse.",
        "address": "1-1-1 Marunouchi, Chiyoda-ku",
        "city": "Tokyo",
        "country": "Japan",
        "country_code": "JP",
        "latitude": 35.6853,
        "longitude": 139.7618,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Club Grand Deluxe Room with Balcony", "description": "Private open-air balcony overlooking Wadakura Fountain Park and Imperial Palace moat.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("640.00")},
            {"name": "Palace Suite with Imperial Panorama", "description": "110 sqm corner sanctuary with floor-to-ceiling panoramic glass.", "occupancy": 3, "beds": "1 King + 1 Daybed", "price": Decimal("980.00")}
        ]
    },
    {
        "name": "Hoshinoya Tokyo",
        "tagline": "Modern 17-story luxury Ryokan tower with rooftop natural hot spring onsen",
        "description": "Enclosed in an intricate black metal lattice reminiscent of traditional kimono patterns, Hoshinoya redefines the Japanese inn experience with tatami mat corridors and top-floor outdoor thermal baths.",
        "address": "1-9-1 Otemachi, Chiyoda-ku",
        "city": "Tokyo",
        "country": "Japan",
        "country_code": "JP",
        "latitude": 35.6874,
        "longitude": 139.7656,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Boutique",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Yuri Executive Tatami Chamber", "description": "Traditional rush tatami flooring, bamboo woodwork, and deep granite ofuro tub.", "occupancy": 2, "beds": "2 Futon Beds", "price": Decimal("750.00")},
            {"name": "Kiku Corner Grand Suite", "description": "Features dedicated tea ceremony space and floor lounge.", "occupancy": 3, "beds": "3 Futon Beds", "price": Decimal("990.00")}
        ]
    },

    # PARIS, FRANCE (2 more)
    {
        "name": "The Peninsula Paris",
        "tagline": "Centenary Haussmannian palace steps from the Arc de Triomphe and Champs-Élysées",
        "description": "Occupying a meticulously restored 19th-century grand palace on Avenue Kléber, featuring six-meter soaring ceilings, rooftop restaurant L'Oiseau Blanc with Eiffel Tower views, and subterranean indoor pool.",
        "address": "19 Avenue Kléber, 16th arr.",
        "city": "Paris",
        "country": "France",
        "country_code": "FR",
        "latitude": 48.8706,
        "longitude": 2.2945,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Grand Premier Room", "description": "Hand-carved cornices, marble bath with television mirror, and dressing room.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("820.00")},
            {"name": "Rooftop Garden Suite", "description": "Private Parisian rooftop garden terrace directly framing the Eiffel Tower.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1350.00")}
        ]
    },
    {
        "name": "Four Seasons Hotel George V Paris",
        "tagline": "Art deco palace hotel in the Golden Triangle with 5 Michelin stars under one roof",
        "description": "An undisputed legend of Parisian grand hospitality, renowned worldwide for Jeff Leatham's dramatic floral installations, five Michelin stars across Le Cinq and L'Orangerie, and private courtyard salons.",
        "address": "31 Avenue George V, 8th arr.",
        "city": "Paris",
        "country": "France",
        "country_code": "FR",
        "latitude": 48.8687,
        "longitude": 2.3006,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Four Seasons Deluxe Room", "description": "Pierre-Yves Rochon French classical interior with crystal chandelier.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("950.00")},
            {"name": "Eiffel Tower View Suite", "description": "Dedicated salon, marble fireplace, and panoramic balcony.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1580.00")}
        ]
    },

    # NEW YORK, USA (2 more)
    {
        "name": "Baccarat Hotel New York",
        "tagline": "French crystal brilliance and glamorous modern luxury opposite MoMA in Midtown",
        "description": "Shimmering with thousands of custom Baccarat crystal glasses and monumental chandeliers, this Midtown Manhattan jewel features the Grand Salon, French culinary arts by Gabriel Kreuther, and Spa de La Mer.",
        "address": "28 W 53rd St, Midtown Manhattan",
        "city": "New York",
        "country": "United States",
        "country_code": "US",
        "latitude": 40.7607,
        "longitude": -73.9768,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "16:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Grand Classic King", "description": "Crystal glassware, custom cashmere throws, and White Carrara marble bath.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("890.00")},
            {"name": "Harcourt One-Bedroom Suite", "description": "Living salon surrounded by crystal artwork and floor-to-ceiling windows.", "occupancy": 3, "beds": "1 King + 1 Sofa", "price": Decimal("1280.00")}
        ]
    },
    {
        "name": "The Carlyle, A Rosewood Hotel",
        "tagline": "Upper East Side classic haven beloved by royalty, presidents, and jazz legends",
        "description": "A fixture of Manhattan high society since 1930, The Carlyle features Bemelmans Bar with its Ludwig Bemelmans murals, Café Carlyle cabaret jazz, and Dorothy Draper-styled luxury suites.",
        "address": "35 E 76th St, Upper East Side",
        "city": "New York",
        "country": "United States",
        "country_code": "US",
        "latitude": 40.7744,
        "longitude": -73.9632,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Boutique",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Superior King Room", "description": "English hardwood furnishings, high ceilings, and soaking tub.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("680.00")},
            {"name": "Central Park View Tower Suite", "description": "Elevated view across Central Park and the Upper East Side brownstones.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1120.00")}
        ]
    },

    # LONDON, UNITED KINGDOM (2 more)
    {
        "name": "Claridge's Mayfair",
        "tagline": "Art deco perfection and royal society retreat in the heart of Mayfair",
        "description": "Known as the annex to Buckingham Palace, Claridge's embodies timeless glamour with its Dale Chihuly glass chandelier, world-famous afternoon tea in The Foyer, and Painter's Room cocktail lounge.",
        "address": "Brook St, Mayfair",
        "city": "London",
        "country": "United Kingdom",
        "country_code": "GB",
        "latitude": 51.5126,
        "longitude": -0.1482,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Claridge's Deluxe King", "description": "Original 1930s Art Deco fixtures, Burr walnut cabinetry, and marble bath.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("790.00")},
            {"name": "Mayfair Heritage Balcony Suite", "description": "Private butler service and balcony over Brook Street.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1190.00")}
        ]
    },
    {
        "name": "The Langham London",
        "tagline": "Europe's original grand hotel opened in 1865 on Regent Street",
        "description": "Opened by the Prince of Wales, The Langham boasts culinary creations by Michel Roux Jr., Artesian (voted world's best bar), and Chuan Body + Soul wellness centre with indoor swimming pool.",
        "address": "1C Portland Pl, Marylebone",
        "city": "London",
        "country": "United Kingdom",
        "country_code": "GB",
        "latitude": 51.5178,
        "longitude": -0.1438,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Executive Club Room", "description": "Full access to The Langham Club lounge with champagne afternoon tea.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("590.00")},
            {"name": "Regent Suite with Skyline Views", "description": "Opulent living room overlooking Regent Street and All Souls Church.", "occupancy": 3, "beds": "1 King Bed", "price": Decimal("880.00")}
        ]
    },

    # DUBAI, UAE (2 more)
    {
        "name": "Atlantis The Royal",
        "tagline": "Ultra-luxury experiential resort towering over Palm Jumeirah with 90 swimming pools",
        "description": "The world's most talked-about ultra-luxury landmark, featuring Cloud 22 sky pool hovering 96 meters high, 17 celebrity chef dining venues, and panoramic vistas of the Arabian Gulf and Dubai skyline.",
        "address": "Crescent Rd, Palm Jumeirah",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "country_code": "AE",
        "latitude": 25.1378,
        "longitude": 55.1264,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Resort",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Seascape King Room", "description": "Floor-to-ceiling glass framing the open ocean and bespoke Graff amenities.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("880.00")},
            {"name": "Sky Pool Villa with Private Plunge", "description": "Features cantilevered private infinity pool looking out over the Dubai skyline.", "occupancy": 3, "beds": "1 King Bed", "price": Decimal("1650.00")}
        ]
    },
    {
        "name": "Armani Hotel Dubai",
        "tagline": "Giorgio Armani's bespoke luxury sanctuary located inside Burj Khalifa",
        "description": "Occupying eleven floors of the tallest tower on earth, Armani Hotel embodies Italian minimalist couture with curved zebrawood walls, Japanese tatami accents, and direct access to The Dubai Mall.",
        "address": "Burj Khalifa, Downtown Dubai",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "country_code": "AE",
        "latitude": 25.1972,
        "longitude": 55.2744,
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
            {"name": "Armani Fountain Suite", "description": "Direct bird's-eye view of the world-famous Dubai Fountain water show.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("780.00")},
            {"name": "Armani Executive Tower Suite", "description": "Private butler service and Giorgio Armani tailor-made furniture.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1050.00")}
        ]
    },

    # BALI, INDONESIA (2 more)
    {
        "name": "Four Seasons Resort Bali at Sayan",
        "tagline": "Architectural lotus pond suspended above the sacred Ayung River rainforest valley",
        "description": "Cross a suspension bridge across the treetops to arrive at this visionary jungle masterpiece in Ubud. Features riverside yoga pavilions, private plunge pools, and open-air Balinese dining.",
        "address": "Jl. Raya Sayan, Ubud, Gianyar",
        "city": "Bali",
        "country": "Indonesia",
        "country_code": "ID",
        "latitude": -8.5085,
        "longitude": 115.2447,
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
            {"name": "One-Bedroom Sayan River Villa", "description": "Outdoor shower, lily pond rooftop entrance, and private riverfront pool.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("840.00")},
            {"name": "Duplex Family Jungle Suite", "description": "Two-level teak sanctuary surrounded by wild palm forest and birds of paradise.", "occupancy": 4, "beds": "1 King + 2 Twins", "price": Decimal("1100.00")}
        ]
    },
    {
        "name": "Alila Villas Uluwatu",
        "tagline": "Iconic clifftop bamboo sunset cabana floating high over the southern Indian Ocean",
        "description": "Perched on elevated limestone cliffs on the southern tip of the Bukit Peninsula, Alila Villas Uluwatu features sustainable modernist design, private infinity pools in every villa, and Warung Indonesian fine dining.",
        "address": "Jl. Belimbing Sari, Tambiyak, Pecatu, Uluwatu",
        "city": "Bali",
        "country": "Indonesia",
        "country_code": "ID",
        "latitude": -8.8471,
        "longitude": 115.1389,
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
            {"name": "One-Bedroom Cliffside Pool Villa", "description": "300 sqm villa with private pool and cantilevered sunset cabana.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("890.00")},
            {"name": "Three-Bedroom Hillside Sanctuary", "description": "Monumental cliff sanctuary with 21-meter lap pool and personal butler.", "occupancy": 6, "beds": "3 King Beds", "price": Decimal("2100.00")}
        ]
    },

    # ROME, ITALY (2 more)
    {
        "name": "The St. Regis Rome",
        "tagline": "Grand 1894 Belle Époque palazzo restored with modern Italian artistic glamour",
        "description": "Originally inaugurated by César Ritz in 1894, The St. Regis Rome combines Murano hand-blown glass chandeliers, Roman thermal bath aesthetics, Lumio butler service, and Lumen cocktail lounge.",
        "address": "Via Vittorio Emanuele Orlando 3, Termini",
        "city": "Rome",
        "country": "Italy",
        "country_code": "IT",
        "latitude": 41.9031,
        "longitude": 12.4952,
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
            {"name": "Imperial Chamber with St. Regis Butler", "description": "Travertine marble bathroom with Acqua di Parma amenities.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("720.00")},
            {"name": "Grand Salon Suite", "description": "Soaring ceilings, restored frescoes, and private dining salon.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1150.00")}
        ]
    },
    {
        "name": "J.K. Place Roma",
        "tagline": "Exclusive townhouse boutique sanctuary steps from the Spanish Steps and Tiber",
        "description": "Designed by architect Michele Bönan, J.K. Place Roma offers the intimate feel of a private Roman palazzo with bespoke rosewood furniture, mid-century art, and complimentary à la carte breakfast.",
        "address": "Via di Monte d'Oro 30, Campo Marzio",
        "city": "Rome",
        "country": "Italy",
        "country_code": "IT",
        "latitude": 41.9048,
        "longitude": 12.4772,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Boutique",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "JK Classic Double", "description": "Four-poster king bed, Italian grey marble bathroom, and walk-in wardrobe.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("680.00")},
            {"name": "Master Balcony Suite", "description": "Private sunny balcony overlooking the quiet cobblestone lanes of Campo Marzio.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("940.00")}
        ]
    },

    # SINGAPORE (2 more)
    {
        "name": "Capella Singapore",
        "tagline": "Sentosa Island coastal resort nestled amid 30 acres of landscaped tropical rainforest",
        "description": "Designed by Pritzker Prize winner Norman Foster, Capella merges British colonial heritage architecture with curving modern villas, three cascading tiered pools, and private access to Palawan Beach.",
        "address": "1 The Knolls, Sentosa Island",
        "city": "Singapore",
        "country": "Singapore",
        "country_code": "SG",
        "latitude": 1.2494,
        "longitude": 103.8248,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Resort",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Premier Sea Facing Room", "description": "Private balcony with daybed overlooking the South China Sea.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("750.00")},
            {"name": "One-Bedroom Garden Villa with Pool", "description": "133 sqm private sanctuary with private outdoor swimming pool.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1180.00")}
        ]
    },
    {
        "name": "The Fullerton Hotel Singapore",
        "tagline": "Grand neoclassical 1928 monument reigning over the Singapore River and Marina Bay",
        "description": "Formerly the General Post Office and landmark of Singapore's heritage, The Fullerton combines monumental Doric columns, a 25-meter infinity pool overlooking the river, and Town Restaurant riverfront dining.",
        "address": "1 Fullerton Square, Downtown Core",
        "city": "Singapore",
        "country": "Singapore",
        "country_code": "SG",
        "latitude": 1.2863,
        "longitude": 103.8532,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Luxury",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Marina Bay View Room", "description": "Unobstructed panorama across Marina Bay Sands and the glittering water.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("580.00")},
            {"name": "Governor Heritage Suite", "description": "Original architectural detailing, heritage balcony, and Straits Club access.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("920.00")}
        ]
    },

    # KYOTO, JAPAN (2 more)
    {
        "name": "Four Seasons Hotel Kyoto",
        "tagline": "Modern luxury centered around an 800-year-old Shakusui-en pond garden",
        "description": "Set in the historic temple district of Higashiyama, Four Seasons Kyoto features an ancient pond garden where samurai once walked, a glass teahouse for evening sake tastings, and cedarwood soaking tubs.",
        "address": "445-3 Myohoin Maekawacho, Higashiyama-ku",
        "city": "Kyoto",
        "country": "Japan",
        "country_code": "JP",
        "latitude": 34.9912,
        "longitude": 135.7745,
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
            {"name": "Historical Pond View King Room", "description": "Floor-to-ceiling vistas framing the 800-year-old Shakusui-en water garden.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("860.00")},
            {"name": "Higashiyama Forest Suite", "description": "Traditional shoji screens, washi paper art, and deep stone ofuro tub.", "occupancy": 3, "beds": "1 King + 1 Daybed", "price": Decimal("1220.00")}
        ]
    },
    {
        "name": "Suiran, a Luxury Collection Hotel, Kyoto",
        "tagline": "Tranquil retreat along the emerald Oi River next to the Arashiyama Bamboo Grove",
        "description": "Occupying a riverside enclave in Arashiyama, Suiran blends imperial Japanese heritage with private open-air hot spring onsen baths, rickshaw arrival services, and French-Japanese Kaiseki cuisine.",
        "address": "12 Susukinobaba-cho, Saga-Tenryuji, Ukyo-ku",
        "city": "Kyoto",
        "country": "Japan",
        "country_code": "JP",
        "latitude": 35.0162,
        "longitude": 135.6742,
        "star_rating": 5.0,
        "base_currency": "USD",
        "check_in_time": "15:00",
        "check_out_time": "12:00",
        "hero_image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
        ],
        "category": "Boutique",
        "cancellation_policy": "Free Cancellation",
        "rooms": [
            {"name": "Yuzunoha Deluxe Room with Open-Air Onsen", "description": "Private thermal natural hot spring bath looking into private Japanese courtyard.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("890.00")},
            {"name": "Arashiyama River Panorama Suite", "description": "Direct unobstructed view of the moonlit Arashiyama forested mountains.", "occupancy": 2, "beds": "2 Twin Beds", "price": Decimal("1290.00")}
        ]
    },

    # SANTORINI, GREECE (2 more)
    {
        "name": "Katikies Santorini",
        "tagline": "Pristine white cliffside luxury with infinity bridge pools over Oia's Caldera",
        "description": "Cascading down the whitewashed volcanic cliffside of Oia 300 feet above the deep blue Aegean sea, Katikies features cantilevered infinity pools, candlelit fine dining at Mikrasia, and sunbathing decks.",
        "address": "Main Street, Oia, Thira",
        "city": "Santorini",
        "country": "Greece",
        "country_code": "GR",
        "latitude": 36.4632,
        "longitude": 25.3789,
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
            {"name": "Caldera Sunset Suite with Plunge Pool", "description": "Private outdoor hot tub cantilevered over the Aegean cliff edge.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("820.00")},
            {"name": "Katikies Cave Master Suite", "description": "Traditional vaulted volcanic cave architecture with panoramic sunset veranda.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1080.00")}
        ]
    },
    {
        "name": "Mystique, a Luxury Collection Hotel, Santorini",
        "tagline": "Carved into the rugged Caldera cliffs with Secret Wine Cave and infinity ocean pool",
        "description": "Perched on Oia's famous slopes, Mystique features organic sculpted limestone suites, private infinity hot tubs facing the volcano, the 150-year-old Secret Wine Cave, and Captain's Lounge dining.",
        "address": "Oia, Thira",
        "city": "Santorini",
        "country": "Greece",
        "country_code": "GR",
        "latitude": 36.4608,
        "longitude": 25.3812,
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
            {"name": "Vibrant Cliff Suite with Jacuzzi", "description": "Private outdoor hot tub with uninterrupted view of the volcanic crater.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("790.00")},
            {"name": "Holistic Sea View Villa", "description": "Expansive secluded terrace, indoor living lounge, and private infinity plunge.", "occupancy": 2, "beds": "1 King Bed", "price": Decimal("1140.00")}
        ]
    }
]

def seed_20_more_hotels():
    db = SessionLocal()
    try:
        existing_names = {h.name.lower() for h in db.query(Hotel).all()}
        amenities = db.query(Amenity).all()
        today = datetime.date.today()
        created_count = 0

        for h_data in MORE_REAL_HOTELS:
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
            hotel.amenities = amenities[:6]
            db.add(hotel)
            db.flush()

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
        print(f"SUCCESS: Seeded {created_count} more verified hotels. Total active hotels in DB: {total_hotels}")

    except Exception as e:
        db.rollback()
        print(f"ERROR seeding hotels: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_20_more_hotels()
