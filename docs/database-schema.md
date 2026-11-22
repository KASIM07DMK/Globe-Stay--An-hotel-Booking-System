# GlobeStay Database Schema Specification

This document details the relational schema, tables, constraints, foreign keys, and indexes implemented in GlobeStay.

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : "places"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ FAVORITES : "saves"
    HOTELS ||--o{ ROOM_TYPES : "offers"
    HOTELS ||--o{ HOTEL_AMENITIES : "features"
    AMENITIES ||--o{ HOTEL_AMENITIES : "categorized"
    HOTELS ||--o{ REVIEWS : "receives"
    HOTELS ||--o{ FAVORITES : "saved_by"
    ROOM_TYPES ||--o{ ROOM_INVENTORY : "tracks_daily"
    BOOKINGS ||--o{ BOOKING_ROOMS : "contains"
    ROOM_TYPES ||--o{ BOOKING_ROOMS : "reserved_in"
    BOOKINGS ||--o{ GUESTS : "includes"
    BOOKINGS ||--o{ PAYMENTS : "billed_by"
    BOOKINGS ||--o| REVIEWS : "verified_for"

    USERS {
        int id PK
        string email UK
        string password_hash
        string full_name
        string role
        boolean is_active
        datetime created_at
    }

    HOTELS {
        int id PK
        string name
        string city
        string country
        string country_code
        float latitude
        float longitude
        float star_rating
        string base_currency
        string status
    }

    ROOM_TYPES {
        int id PK
        int hotel_id FK
        string name
        int maximum_occupancy
        string bed_configuration
        decimal base_price
        string currency
    }

    ROOM_INVENTORY {
        int id PK
        int room_type_id FK
        date stay_date
        int total_rooms
        int held_rooms
        int booked_rooms
        int version
    }

    BOOKINGS {
        int id PK
        string booking_reference UK
        int user_id FK
        int hotel_id FK
        string status
        date check_in
        date check_out
        decimal total_amount
    }

    BOOKING_ROOMS {
        int id PK
        int booking_id FK
        int room_type_id FK
        int quantity
        decimal price_snapshot
        string currency
    }

    PAYMENTS {
        int id PK
        int booking_id FK
        string provider
        string idempotency_key UK
        decimal amount
        string status
    }

    REVIEWS {
        int id PK
        int user_id FK
        int hotel_id FK
        int booking_id FK,UK
        int rating
        string comment
    }
```

## Integrity Constraints
1. **Zero Overbooking Composite Uniqueness**:
   `room_inventory` enforces `UniqueConstraint("room_type_id", "stay_date", name="uq_room_type_stay_date")`. Daily inventory per room type cannot be duplicated or bypassed.
2. **One Verified Review Per Booking**:
   `reviews.booking_id` has a unique foreign key constraint ensuring that each completed reservation can only produce a single verified review.
3. **Idempotent Payment Processing**:
   `payments.idempotency_key` is unique and indexed, preventing double-charging or duplicate webhook recording.
4. **Historical Price Snapshot**:
   `booking_rooms.price_snapshot` freezes the room rate agreed at the time of reservation. Subsequent changes to `room_types.base_price` never alter historical or confirmed bookings.
