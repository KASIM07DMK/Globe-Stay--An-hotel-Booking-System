# GlobeStay Setup and Running Guide

## Prerequisites
- Node.js >= 18 (Tested with v24)
- Python >= 3.11 (Tested with v3.14)
- Docker & Docker Compose (Optional for containerized run)

---

## 1. Quick Local Setup (Without Docker)

### Backend Setup
1. Open a terminal in `backend/`:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # Linux / macOS:
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Copy environment file:
   ```bash
   # From root:
   cp .env.example .env
   ```Stop
3. Run database migrations or initial table creation:
   ```bash
   python -m scripts.seed_demo_data
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API Docs will be accessible at: `http://localhost:8000/docs`

### Frontend Setup
1. Open a terminal in `frontend/`:
   ```bash
   npm install
   npm run dev
   ```
2. Access the web application at: `http://localhost:5173`

---

## 2. Docker Compose Setup

Run the full stack with PostgreSQL database, backend, and frontend:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 3. Demo Credentials
Seeded demo user accounts are provided for testing:
- **Admin**: `admin@globestay.com` / `AdminPass123!`
- **Customer**: `customer@globestay.com` / `CustomerPass123!`
- **Guest / Demo User**: `sarah.chen@example.com` / `CustomerPass123!`
