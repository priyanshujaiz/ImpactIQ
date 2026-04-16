# ImpactIQ — Resource Allocation System

> AI-powered volunteer deployment and crisis zone resource optimization

ImpactIQ is a three-service monorepo for intelligent, real-time allocation of volunteers to crisis zones. It combines a React operator dashboard, a Node.js REST API (with Gemini AI and PostgreSQL), and a Python scoring and optimization engine.

---

## Monorepo Structure

```
Resource_Allocation/
├── frontend/      React 19 + Vite + TailwindCSS v4 — operator dashboard
├── backend/       Node.js (Express) REST API + PostgreSQL + Auth + Gemini AI
└── engine/        Python (FastAPI) AI scoring & optimization engine
```

| Service      | Language   | Framework       | Role                                                                     |
|--------------|------------|-----------------|--------------------------------------------------------------------------|
| **frontend** | JavaScript | React 19 + Vite | Operator dashboard — zones, volunteers, allocations, reports, metrics    |
| **backend**  | Node.js    | Express v5      | REST API, authentication, RBAC, DB persistence, Gemini AI, orchestration |
| **engine**   | Python     | FastAPI         | Zone scoring, volunteer suitability, allocation optimization, simulation  |

---

## Documentation

| Component | README |
|-----------|--------|
| Frontend (React Dashboard) | [`frontend/README.md`](./frontend/README.md) |
| Backend (Express API + Gemini + Database) | [`backend/README.md`](./backend/README.md) |
| Engine (Python Scoring & Optimizer) | [`engine/README.md`](./engine/README.md) |

---

## Service Architecture

```
Browser
  │
  ▼  HTTP (Vite dev server :5173)
Frontend (React)
  │  axios → http://127.0.0.1:3000/api/v1  (JWT on every request)
  ▼
Backend (Express · :3000)
  │  Parses field reports via Gemini AI → zone upsert
  │  Fetches zones + volunteers from PostgreSQL
  │  POSTs to Engine for optimize / simulate / score
  │  Calls Gemini for explanation, analysis, and alerts
  │  Saves results (allocations, simulations, alerts) to DB
  ▼
Engine (FastAPI · :8000)
  │  Stateless compute: zone scoring, Hungarian optimizer, simulation
  ▼
Backend receives result → saves to DB → responds to frontend
```

The backend is the single entry point for all frontend requests. It owns the database and orchestrates calls to the engine and Gemini. The engine is stateless — it never reads or writes the database.

---

## Quick Start

### 1. Start PostgreSQL

```bash
cd backend
docker-compose up -d
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run migrate
npm run dev
# http://localhost:3000
```

### 3. Start the Engine

```bash
cd engine
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn main:app --reload
# http://localhost:8000
```

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

---

## Environment Variables

**`backend/.env`:**
```env
DATABASE_URL=postgresql://admin:password@localhost:5433/impactiq
JWT_SECRET=your_super_secret_key
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
```

The frontend has no `.env` — the base URL is set in `frontend/src/utils/constants.js`.

---

## API Surface

All routes are under `http://localhost:3000/api/v1`. Every endpoint except `/auth/register` and `/auth/login` requires `Authorization: Bearer <token>`.

| Route Prefix    | Description                                             |
|-----------------|---------------------------------------------------------|
| `/auth`         | Register and login                                       |
| `/zones`        | CRUD, volunteers per zone, history, recompute scores    |
| `/volunteers`   | CRUD, location, availability, zone assignment           |
| `/reports`      | Ingest raw field text (Gemini parse → zone upsert)     |
| `/allocations`  | Run optimizer, view history, apply allocation to DB     |
| `/simulations`  | What-if analysis (engine + Gemini trade-off analysis)  |
| `/alerts`       | Rule-based and Gemini alert generation and resolution  |
| `/metrics`      | System summary, zone status, impact history            |

---

## Frontend Pages

| Route         | Page        | Description                                                             |
|---------------|-------------|-------------------------------------------------------------------------|
| `/login`      | Login       | JWT authentication                                                      |
| `/register`   | Register    | Role picker (ADMIN / COORDINATOR / SUPERVISOR / VOLUNTEER) + form      |
| `/dashboard`  | Dashboard   | Summary cards, impact chart, alerts, zone preview, AI insight           |
| `/zones`      | Zones       | CRUD with search, sort, modal form, expandable volunteer panel          |
| `/volunteers` | Volunteers  | List with availability filter, assign/unassign, location update, delete |
| `/allocation` | Allocation  | Run engine, view AI explanation, apply plan to DB                       |
| `/simulation` | Simulation  | What-if: baseline picker + change builder + AI trade-off results        |
| `/reports`    | Reports     | Submit raw field text, Gemini-parsed results, delete report             |

---

## Feature Status

| Feature                          | Status      |
|----------------------------------|-------------|
| Authentication (Login/Register)  | Complete    |
| Role-Based Access Control (RBAC) | Complete    |
| Database Schema (7 tables)       | Complete    |
| Zone CRUD API and UI             | Complete    |
| Volunteer CRUD API and UI        | Complete    |
| Zone Need Scoring (5-factor)     | Complete    |
| Volunteer Suitability (5-factor) | Complete    |
| Allocation — Hungarian Optimizer | Complete    |
| Allocation Apply Pipeline        | Complete    |
| Simulation Engine                | Complete    |
| Simulation UI                    | Complete    |
| Field Report Ingestion           | Complete    |
| Gemini AI Integration            | Complete    |
| Alert System                     | Complete    |
| Metrics API                      | Complete    |
| React Dashboard (8 pages)        | Complete    |
| Scheduled Auto-Allocation        | Planned     |
| Role-scoped UI permissions       | Planned     |
