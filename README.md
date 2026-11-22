# GlobeStay — International Hotel Booking and Reservation Management System

![GlobeStay Banner](https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80)

GlobeStay is a secure, modern, full-stack international accommodation reservation and hotel inventory management platform. Built using an MVC-inspired architecture with dedicated Service and Repository layers, GlobeStay ensures zero overbooking through atomic row-level inventory holds, supports multi-currency exchange rates, and provides seamless sandbox payment reconciliation.

---

## 🌟 Key Features

- **Enterprise MVC Architecture**: Clean decoupling between Presentation (React), HTTP Controllers (FastAPI), Business Services, Repositories (SQLAlchemy 2.0), and Database Models.
- **Transactional Inventory Engine**: Strict date-ordered row locks (`SELECT ... FOR UPDATE`) and temporary hold mechanisms to prevent double-booking.
- **International Multi-Currency Support**: Native handling of base hotel currencies vs. customer display currencies with tracked conversion rates.
- **Provider-Agnostic Adapters**: Pluggable interfaces for Hotel Inventory Suppliers, Payment Gateways (Sandbox), Transactional Emails (Console/SMTP), and Geocoding Maps.
- **Role-Based Access Control (RBAC)**: Secure authorization separating Guest browsing, Authenticated Customer operations, and Administrative management.
- **Automated Testing & Containerization**: End-to-end integration and concurrency testing suites with Docker Compose orchestration.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query v5, React Router v6, React Hook Form, Zod, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Uvicorn |
| **Database** | PostgreSQL 16 (production/docker), SQLite fallback for zero-dependency local testing |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX, Vitest |
| **DevOps** | Docker, Docker Compose, Multi-stage Container Builds |

---

## 📂 Project Directory Structure

```
Hotel Booking System/
├── frontend/                     # React + TypeScript + Vite + Tailwind SPA
│   ├── public/                   # Static assets & favicon.svg
│   ├── src/
│   │   ├── app/                  # App, Router, and Provider configs
│   │   ├── components/           # UI components, layout, search, booking
│   │   ├── features/             # Feature slices (auth, hotels, bookings)
│   │   ├── pages/                # Customer and Admin views
│   │   ├── services/             # API clients (Axios / Fetch)
│   │   └── styles/               # Tailwind CSS theme & tokens
│   ├── Dockerfile                # Production Nginx multi-stage build
│   └── package.json
│
├── backend/                      # FastAPI + SQLAlchemy 2.0 REST API
│   ├── app/
│   │   ├── api/v1/               # Versioned API routes
│   │   ├── controllers/          # Request validation & HTTP status mapping
│   │   ├── core/                 # Config, security, logging, exceptions
│   │   ├── database/             # Session factory & declarative base
│   │   ├── dependencies/         # Auth & DB dependency injection
│   │   ├── integrations/         # Payment, email, map, and supplier adapters
│   │   ├── models/               # SQLAlchemy relational entities
│   │   ├── repositories/         # Database persistence abstractions
│   │   ├── schemas/              # Pydantic v2 request/response schemas
│   │   ├── services/             # Domain rules, pricing, inventory holds
│   │   └── main.py               # Application factory & lifespan
│   ├── tests/                    # Unit, integration, and API tests
│   ├── Dockerfile                # Python 3.11 production container
│   └── requirements.txt
│
├── docs/                         # Architecture, schema, and API documentation
│   ├── architecture.md
│   ├── database-schema.md
│   ├── setup-guide.md
│   └── security.md
│
├── scripts/                      # Database seeders & demo data utilities
├── .env.example                  # Environment variable template
├── .gitignore
├── docker-compose.yml            # Multi-container orchestration
└── README.md
```

---

## 🚀 Quick Start

### Option A: Local Development (Fast)

#### 1. Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m pytest tests/api/test_health.py -v
python -m uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: `http://localhost:8000/api/v1/docs`

#### 2. Frontend
```bash
cd frontend
npm install
npm run build
npm run dev
```
- Web Application: `http://localhost:5173`

---

### Option B: Docker Compose

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 📋 Development Roadmap

- [x] **Phase 1: Environment & Project Skeleton**
  - Clean project directory scaffolding for frontend, backend, docs, scripts.
  - Core FastAPI application with CORS, structured logging, lifespan handlers, and `/api/v1/health` endpoint.
  - React + TypeScript + Vite frontend configured with Tailwind CSS (deep midnight navy & royal blue palette), Lucide icons, and TanStack Query.
  - Initial tests written and passing (`pytest tests/api/test_health.py` 100% pass).
  - Frontend build verified (`npm run build` 0 errors).
- [x] **Phase 2: Frontend Design System & Homepage**
  - Hero with global destination search and calendar pickers.
  - Featured properties grid with dynamic filters (Luxury, Resort, Boutique).
  - Currency switcher, trust guarantees, customer testimonials, and newsletter subscription.
- [x] **Phase 3: SQLAlchemy Models, Migrations & Seed Data**
  - 10 relational entities: Users, Hotels, RoomTypes, RoomInventory, Bookings, BookingRooms, Guests, Payments, Reviews, Favorites.
  - Comprehensive seed script with luxury international destinations (Tokyo, Paris, Bali, Dubai, New York, London).
- [x] **Phase 4: Hotel Search & Details APIs**
  - Multi-criteria property search with price ranges, star/guest rating filters, and pagination.
  - Detailed property endpoint with suite options, full amenities, verified reviews, and slug resolvers.
- [x] **Phase 5: Authentication & Authorization (RBAC)**
  - JWT token access & refresh rotation with role-based guard (Admin vs Customer).
  - Tabbed login & 1-Click access for Admin (`admin@globestay.com`) and Traveler (`customer@globestay.com`).
  - Dark luxury theme across all application screens.
- [x] **Phase 6: Availability & Transactional Inventory Reservations**
  - Real-time room inventory availability by date range (`GET /api/v1/hotels/{id}/availability`).
  - Row-level lock ordering to eliminate overbooking and deadlocks.
  - 15-minute temporary holds with automated hold reaping (`POST /api/v1/bookings/reconcile-holds`).
  - Admin room inventory matrix with capacity editor and hold reconciler (`/admin/rooms`).
- [x] **Phase 7: Booking Engine, Cancellation & History & Receipt Invoicing**
  - Complete booking lifecycle & status state machine (`PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`).
  - Cancellation reason capture, automatic room inventory release, and payment refund processing.
  - Official Tax Invoice & Travel Voucher modal with printable layout.
  - Customer reservation portfolio (`/my-bookings`) and booking details (`/bookings/:id`).
  - 22/22 backend tests passing including full cancellation lifecycle.
- [ ] **Phase 8: Payment Sandbox & Webhook Reconciliation**
- [ ] **Phase 9: Customer & Admin Dashboards**
- [ ] **Phase 10: Currency Conversion, Maps & Email Notifications**
- [ ] **Phase 11: Comprehensive Test Suite & Concurrency Verification**
- [ ] **Phase 12: Production Deployment & Final Documentation**
