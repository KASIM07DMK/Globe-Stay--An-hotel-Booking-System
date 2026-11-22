"""
Update the original 6 hotels with real-world luxury hotel names, high-resolution photography, authentic addresses, and accurate GPS coordinates.
"""
from app.database.session import SessionLocal
from app.models import Hotel

UPDATES = {
    1: {
        "name": "The Peninsula Tokyo",
        "tagline": "Glamorous modern Japanese landmark facing the Imperial Palace and Hibiya Park",
        "description": "Standing opposite the Imperial Palace and Hibiya Park, The Peninsula Tokyo features landmark lantern-inspired architecture, Peter restaurant rooftop views, and fleet of bespoke Rolls-Royces.",
        "address": "1-8-1 Yurakucho, Chiyoda-ku",
        "city": "Tokyo",
        "country": "Japan",
        "country_code": "JP",
        "latitude": 35.6744,
        "longitude": 139.7617,
        "hero_image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    2: {
        "name": "Ritz Paris",
        "tagline": "The legendary palace of Place Vendôme immortalized by César Ritz and Coco Chanel",
        "description": "Synonymous with French luxury since 1898, the Ritz Paris features the Salon Proust, Bar Hemingway, the Grand Jardin formal French garden, and the subterranean Ritz Club & Spa.",
        "address": "15 Place Vendôme, 1st arr.",
        "city": "Paris",
        "country": "France",
        "country_code": "FR",
        "latitude": 48.8683,
        "longitude": 2.3294,
        "hero_image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    3: {
        "name": "Jumeirah Al Naseem",
        "tagline": "Contemporary beachside haven with direct Burj Al Arab views and turtle lagoon",
        "description": "Perched on its own private stretch of Madinat Jumeirah beach, featuring open-plan sea-facing suites, private cabana adult pools, and world-class culinary venues including Rockfish.",
        "address": "Jumeirah St, Umm Suqeim 3",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "country_code": "AE",
        "latitude": 25.1384,
        "longitude": 55.1878,
        "hero_image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    4: {
        "name": "The Mark Hotel New York",
        "tagline": "Upper East Side fashion capital and Jacques Grange masterpiece steps from Central Park",
        "description": "The quintessential Upper East Side luxury hotel, famed for Jean-Georges Vongerichten dining, Frédéric Fekkai salon, custom black-and-white striped pedicabs, and Met Gala celebrity suites.",
        "address": "25 E 77th St, Upper East Side",
        "city": "New York",
        "country": "United States",
        "country_code": "US",
        "latitude": 40.7749,
        "longitude": -73.9631,
        "hero_image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    5: {
        "name": "Amandari Bali",
        "tagline": "Traditional Balinese village retreat nestled above the Ayung River gorge in Ubud",
        "description": "Designed as an authentic Balinese village with curving riverstone pathways and alang-alang thatched roofs, Amandari features open-air garden suites, infinity pool, and temple procession ceremonies.",
        "address": "Jl. Raya Kedewatan, Ubud, Gianyar",
        "city": "Bali",
        "country": "Indonesia",
        "country_code": "ID",
        "latitude": -8.4905,
        "longitude": 115.2443,
        "hero_image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    6: {
        "name": "The Dorchester London",
        "tagline": "Mayfair landmark reigning over Hyde Park since 1931 with three-Michelin-starred Alain Ducasse",
        "description": "Standing on Park Lane since 1931, The Dorchester is a symbol of British society, world-famous for afternoon tea at The Promenade, Alain Ducasse at The Dorchester, and Vesper Bar.",
        "address": "53 Park Ln, Mayfair",
        "city": "London",
        "country": "United Kingdom",
        "country_code": "GB",
        "latitude": 51.5074,
        "longitude": -0.1528,
        "hero_image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80"
        ]
    }
}

def update_hotels():
    db = SessionLocal()
    try:
        for hotel_id, data in UPDATES.items():
            hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
            if hotel:
                for k, v in data.items():
                    setattr(hotel, k, v)
        db.commit()
        print("SUCCESS: Updated the 6 original hotels with real-world landmark data and coordinates.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_hotels()
