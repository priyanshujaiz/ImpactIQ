# ImpactIQ — Backend

> **Node.js (Express) REST API — Auth, Persistence, Gemini AI & Engine Orchestration**

The backend is the **primary entry point** for all clients. It handles authentication, owns the PostgreSQL database, integrates Gemini AI for report parsing and analysis, and orchestrates calls to the Python engine for allocation optimization.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Auth & Roles](#auth--roles)
8. [Data Flow](#data-flow)
9. [Setup & Running Locally](#setup--running-locally)
10. [Environment Variables](#environment-variables)
11. [Migrations](#migrations)

---

## Project Overview

ImpactIQ follows a **data → intelligence → decision pipeline**:

```
Field Reports → Gemini Parse → Zone Update → Allocation Engine → Simulation → Alerts
```

| Layer     | What it does                                              |
|-----------|-----------------------------------------------------------|
| Input     | Raw field reports parsed by Gemini AI                     |
| State     | Zone crisis info + volunteer profiles (PostgreSQL)        |
| Decision  | Calls Python engine → Gemini explanation → saves to DB   |
| Analysis  | What-if simulations with Gemini trade-off analysis        |
| Monitoring| Auto rule-based + Gemini alert generation on zones        |

---

## Tech Stack

| Category        | Technology                            |
|-----------------|---------------------------------------|
| Runtime         | Node.js (ESM modules)                 |
| Framework       | Express.js v5                         |
| ORM             | Drizzle ORM                           |
| Database        | PostgreSQL 15 (via Docker)            |
| Auth            | JWT (`jsonwebtoken`) + bcrypt         |
| DB Client       | `pg` (node-postgres)                  |
| Engine Bridge   | `axios` (HTTP calls to Python engine) |
| AI Integration  | `@google/genai` (Gemini API)         |
| Dev Server      | nodemon                               |
| Migrations      | drizzle-kit                           |
| Config          | dotenv                                |

---

## Project Structure

```
backend/
├── src/
│   ├── app.js                          # Express app — middleware + route mounting
│   ├── server.js                       # HTTP server entry point (dotenv + listen)
│   ├── config/                         # (reserved for future config modules)
│   │
│   ├── controllers/
│   │   ├── auth.controller.js          # register & login handlers
│   │   ├── zone.controller.js          # CRUD + recompute scores + zone volunteers/history
│   │   ├── volunteer.controller.js     # CRUD + location/availability/assign/history
│   │   ├── report.controller.js        # ingest + get + delete field reports
│   │   ├── allocation.controller.js    # run + current + history + get + apply
│   │   ├── simulation.controller.js    # run + get + delete simulations
│   │   ├── alert.controller.js         # poll + get + active + resolve alerts
│   │   └── metrics.controller.js       # summary + zones + history metrics
│   │
│   ├── db/
│   │   ├── index.js                    # Drizzle DB connection (pg Pool)
│   │   └── schema.js                   # All 7 table definitions (single source of truth)
│   │
│   ├── middleware/
│   │   └── auth.middleware.js          # `protect` (JWT) + `authorizeRoles` (RBAC)
│   │
│   ├── routes/
│   │   ├── auth.route.js               # POST /api/v1/auth/register & /login
│   │   ├── zone.route.js               # CRUD + /volunteers + /history + /recompute-score
│   │   ├── volunteer.route.js          # CRUD + /location + /availability + /assign + /available
│   │   ├── report.route.js             # POST /ingest, GET /, GET /:id, DELETE /:id
│   │   ├── allocation.route.js         # /run + /current + /history + /:id + /:id/apply
│   │   ├── simulation.route.js         # POST / + GET / + GET /:id + DELETE /:id
│   │   ├── alert.route.js              # /poll + GET / + /active + PATCH /:id/resolve
│   │   └── metrics.route.js            # /summary + /zones + /history
│   │
│   ├── services/
│   │   ├── auth.service.js             # registerUser & loginUser business logic
│   │   ├── zone.services.js            # Zone CRUD, volunteers, history, recompute scores
│   │   ├── volunteer.service.js        # Volunteer CRUD, location, availability, assign
│   │   ├── report.service.js           # Gemini parse → zone upsert → score recompute
│   │   ├── allocation.service.js       # Run → engine → Gemini explain → save → apply
│   │   ├── simulation.service.js       # Engine simulate → Gemini analysis → save
│   │   ├── alert.service.js            # Rule-based + Gemini alert generation
│   │   ├── metrics.service.js          # Summary, zone status, impact history
│   │   ├── engine.service.js           # HTTP bridge to Python engine (optimize + score)
│   │   └── gemini.service.js           # parseFieldReport, generateExplanation,
│   │                                   #   analyzeSimulation, generateAlerts
│   │
│   └── utils/
│       ├── hash.util.js                # bcrypt hash + compare (salt rounds = 10)
│       ├── token.util.js               # JWT sign (payload: id, email, role; expires 7d)
│       └── validator.util.js           # shared auth body checks (email + password required)
│
├── drizzle/                            # Auto-generated SQL migrations
├── docker-compose.yml                  # PostgreSQL 15 container config
├── drizzle.config.js                   # Drizzle-kit config
├── package.json
├── .env                                # Environment variables (not committed)
└── .gitignore
```

---

## Architecture

### Request Flow

```
┌──────────────────────────────────────────────────────┐
│                      CLIENT                          │
└────────────────────────┬─────────────────────────────┘
                         │ HTTP
                         ▼
┌──────────────────────────────────────────────────────┐
│               EXPRESS APP  (app.js)                  │
│  /api/v1/auth        → auth.route.js                 │
│  /api/v1/zones       → zone.route.js                 │
│  /api/v1/volunteers  → volunteer.route.js            │
│  /api/v1/reports     → report.route.js               │
│  /api/v1/allocations → allocation.route.js           │
│  /api/v1/simulations → simulation.route.js           │
│  /api/v1/alerts      → alert.route.js                │
│  /api/v1/metrics     → metrics.route.js              │
└──────────────────────────┬───────────────────────────┘
                           │
         ┌─────────────────┼────────────────────┐
         ▼                 ▼                    ▼
  auth.service      allocation.service    report.service
  (bcrypt+JWT)     (engine + Gemini)   (Gemini + engine)
         │                 │                    │
         ▼                 ▼                    ▼
  db/index.js      engine.service.js    gemini.service.js
  (PostgreSQL)     (FastAPI :8000)      (@google/genai)
```

### Design Patterns

- **Controller → Service → DB** separation (no business logic in controllers)
- **ESM modules** throughout (`"type": "module"` in `package.json`)
- **JWT Bearer Token** auth via `Authorization: Bearer <token>` header
- **Role-Based Access Control** via `authorizeRoles(...roles)` middleware
- **Drizzle ORM** for type-safe, code-first schema management
- **Engine bridge** as a dedicated service layer (`engine.service.js`)
- **Gemini AI** as a dedicated service layer (`gemini.service.js`)
- Password is never returned in any API response

---

## Database Schema

### Entity Relationship Overview

```
USERS ──── (N) FIELD_REPORTS ──── (N:1) ZONES ◄──── (N) VOLUNTEERS
  │                                        │
  │                                        └──── (1:N) ALERTS
  │
  └──── (N:1) SIMULATIONS ◄──── (N:1) ALLOCATIONS
```

---

### `users` Table

| Column       | Type        | Notes                                                             |
|--------------|-------------|-------------------------------------------------------------------|
| `id`         | `uuid` PK   | Auto-generated                                                    |
| `name`       | `text`      |                                                                   |
| `email`      | `text`      | Unique                                                            |
| `password`   | `text`      | bcrypt hashed                                                     |
| `role`       | `enum`      | `ADMIN` \| `COORDINATOR` \| `SUPERVISOR` \| `VOLUNTEER` (default) |
| `created_at` | `timestamp` | Auto                                                              |

---

### `zones` Table

The **core decision entity** — everything revolves around zones.

| Column               | Type        | Notes                              |
|----------------------|-------------|------------------------------------|
| `id`                 | `uuid` PK   |                                    |
| `zone_id`            | `text`      | Human-readable zone identifier     |
| `name`               | `text`      |                                    |
| `lat`, `lng`         | `real`      | Coordinates                        |
| `urgency`            | `integer`   | Scale 1–10                         |
| `people_affected`    | `integer`   |                                    |
| `severity`           | `integer`   | Scale 1–10                         |
| `need_type`          | `text[]`    | Array of need categories           |
| `need_score`         | `real`      | Derived priority score (default 0) |
| `current_volunteers` | `integer`   | Current assignment count           |
| `trend_delta`        | `real`      | Change in urgency over time        |
| `status`             | `text`      | `active` (default)                 |
| `created_at`         | `timestamp` | Auto                               |

---

### `volunteers` Table

| Column              | Type        | Notes                                           |
|---------------------|-------------|-------------------------------------------------|
| `id`                | `uuid` PK   |                                                 |
| `name`              | `text`      |                                                 |
| `skills`            | `text[]`    | Array of skill tags                             |
| `lat`, `lng`        | `real`      | Current location                                |
| `availability`      | `text`      | `"available"` (default)                         |
| `reliability_score` | `real`      | Historical reliability (default 0)              |
| `current_zone_id`   | `uuid` FK   | → `zones.id` (current assignment)              |
| `status`            | `text`      | `"active"` (default) — soft-delete support      |
| `created_at`        | `timestamp` | Auto                                            |

---

### `field_reports` Table

Real-world data ingestion, parsed by Gemini AI.

| Column              | Type        | Notes                                          |
|---------------------|-------------|------------------------------------------------|
| `id`                | `uuid` PK   |                                                |
| `raw_text`          | `text`      | Original unstructured field note               |
| `extracted_data`    | `json`      | Gemini-parsed structured data                  |
| `zone_id`           | `uuid` FK   | → `zones.id`                                   |
| `submitted_by`      | `uuid` FK   | → `users.id`                                   |
| `gemini_confidence` | `real`      | AI confidence score 0–1                        |
| `status`            | `text`      | `pending` \| `processed` \| `rejected`         |
| `created_at`        | `timestamp` | Auto                                           |

---

### `allocations` Table

Stores AI-generated deployment decisions.

| Column               | Type        | Notes                                                      |
|----------------------|-------------|------------------------------------------------------------|
| `id`                 | `uuid` PK   |                                                            |
| `allocation_plan`    | `json`      | `[{ volunteerId, zoneId, impactScore, suitability }]`      |
| `total_impact_score` | `real`      | Overall system impact metric                               |
| `gemini_explanation` | `text`      | JSON string with `global_summary` + per-assignment reasons |
| `strategy_hints`     | `text`      | Gemini situation analysis (future)                         |
| `triggered_by`       | `text`      | `auto` \| `manual` \| `report_ingestion`                   |
| `created_at`         | `timestamp` | Auto                                                       |

---

### `simulations` Table

What-if analysis comparing proposed changes vs a baseline allocation.

| Column                   | Type        | Notes                                    |
|--------------------------|-------------|------------------------------------------|
| `id`                     | `uuid` PK   |                                          |
| `baseline_allocation_id` | `uuid` FK   | → `allocations.id`                       |
| `proposed_changes`       | `json`      | `[{ volunteerId, toZone }]`              |
| `baseline_impact`        | `real`      | Original plan's impact score             |
| `simulated_impact`       | `real`      | Impact with proposed changes             |
| `impact_delta`           | `real`      | `simulated - baseline`                   |
| `gemini_analysis`        | `text`      | JSON: recommendation, risks, benefits    |
| `ai_confidence`          | `real`      | 0–100                                    |
| `proposal_efficiency`    | `real`      | `(simulated / baseline) × 100`           |
| `created_by`             | `uuid` FK   | → `users.id`                             |
| `created_at`             | `timestamp` | Auto                                     |

---

### `alerts` Table

Auto-generated zone alerts (rule-based + Gemini-enriched).

| Column             | Type        | Notes                             |
|--------------------|-------------|-----------------------------------|
| `id`               | `uuid` PK   |                                   |
| `zone_id`          | `uuid` FK   | → `zones.id`                      |
| `type`             | `text`      | `critical` \| `warning` \| `info` |
| `message`          | `text`      | Gemini-generated alert message    |
| `suggested_action` | `text`      | Gemini-generated action           |
| `status`           | `text`      | `active` \| `resolved`            |
| `created_at`       | `timestamp` | Auto                              |

**Alert Rules:**
- `urgency >= 8` or `need_score > 50` → `critical`
- `current_volunteers < 2` → `warning`
- Duplicate active alerts for same zone+type are suppressed

---

## API Endpoints

Base URL: `http://localhost:<PORT>/api/v1`

> Default PORT: `3000`

All endpoints except `/auth/register` and `/auth/login` require **`Authorization: Bearer <token>`**.

---

### Auth — `/api/v1/auth`

| Method | Path        | Auth | Body                                               | Response           |
|--------|-------------|------|----------------------------------------------------|--------------------|
| POST   | `/register` | None | `{ name, email, password, role? }`                 | `201` user object  |
| POST   | `/login`    | None | `{ email, password }`                              | `200` user + token |

> `role` accepts: `"ADMIN"` | `"COORDINATOR"` | `"SUPERVISOR"` | `"VOLUNTEER"` (default).

**Register Response `201`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "id": "uuid", "email": "john@example.com", "role": "VOLUNTEER" }
}
```

**Login Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "VOLUNTEER", "name": "John" },
    "token": "<jwt_token>"
  }
}
```

---

### Zones — `/api/v1/zones`

| Method | Path                 | Roles              | Description                                    |
|--------|----------------------|--------------------|------------------------------------------------|
| POST   | `/`                  | ADMIN              | Create a zone                                  |
| GET    | `/`                  | ADMIN, COORDINATOR | List all zones                                 |
| GET    | `/:id`               | ADMIN, COORDINATOR | Get a single zone (by DB `id`)                 |
| PUT    | `/:id`               | ADMIN              | Update zone fields (by DB `id`)                |
| DELETE | `/:id`               | ADMIN              | Delete a zone (by DB `id`)                     |
| GET    | `/:id/volunteers`    | ADMIN, COORDINATOR | Get volunteers currently in this zone          |
| GET    | `/:id/history`       | ADMIN, COORDINATOR | Get allocation history for zone                |
| POST   | `/recompute-score`   | ADMIN, COORDINATOR | Recompute need scores for all zones via engine |

---

### Volunteers — `/api/v1/volunteers`

| Method | Path                   | Roles               | Description                     |
|--------|------------------------|---------------------|---------------------------------|
| POST   | `/`                    | ADMIN, COORDINATOR  | Create a volunteer              |
| GET    | `/`                    | ADMIN, COORDINATOR  | List volunteers (query filters) |
| GET    | `/:id`                 | ADMIN, COORDINATOR  | Get a single volunteer          |
| PUT    | `/:id`                 | ADMIN, COORDINATOR  | Update volunteer fields         |
| DELETE | `/:id`                 | ADMIN               | Delete a volunteer              |
| PATCH  | `/:id/location`        | All authenticated   | Update `{ lat, lng }`           |
| PATCH  | `/:id/availability`    | All authenticated   | Update `{ availability }`       |
| PATCH  | `/:id/assign`          | ADMIN, COORDINATOR  | Assign to zone `{ zoneId }`     |
| PATCH  | `/:id/unassign`        | ADMIN, COORDINATOR  | Unassign from zone (clears `currentZoneId`, resets `availability`, decrements zone count) |
| GET    | `/available`           | ADMIN, COORDINATOR  | List available volunteers       |
| GET    | `/:id/history`         | All authenticated   | Volunteer assignment history    |

---

### Field Reports — `/api/v1/reports`

| Method | Path        | Auth            | Description                                                  |
|--------|-------------|-----------------|--------------------------------------------------------------|
| POST   | `/ingest`   | Any             | Ingest raw field report text — Gemini parses → zone upsert → score recompute |
| GET    | `/`         | Any             | List all reports                                             |
| GET    | `/:id`      | Any             | Get a single report                                          |
| DELETE | `/:id`      | Any             | Delete a report                                              |

**POST `/ingest` Request:**
```json
{ "rawText": "Zone Z-001 is critical with 500 people affected. Urgency 9, medical and food needed." }
```

**Response `201`:**
```json
{
  "message": "Report processed successfully",
  "zone": { ...updatedZone },
  "report": { "id": "uuid", "rawText": "...", "extractedData": {...}, "status": "processed" }
}
```

> **Pipeline:** `rawText` → Gemini `parseFieldReport` → zone upsert in DB → engine `scoreZones` → zone `need_score` updated → report saved.

---

### Allocations — `/api/v1/allocations`

| Method | Path           | Roles              | Description                                  |
|--------|----------------|--------------------|----------------------------------------------|
| POST   | `/run`         | ADMIN, COORDINATOR | Run full allocation pipeline                 |
| GET    | `/current`     | ADMIN, COORDINATOR | Get the most recent allocation               |
| GET    | `/history`     | ADMIN, COORDINATOR | Get all historical allocations               |
| GET    | `/:id`         | ADMIN, COORDINATOR | Get a specific allocation                    |
| PATCH  | `/:id/apply`   | ADMIN, COORDINATOR | Apply an allocation: update volunteers + zones in DB |

**POST `/run` Response `201`:**
```json
{
  "message": "Allocation generated successfully",
  "allocation": {
    "id": "uuid",
    "allocation_plan": [
      { "volunteerId": "...", "zoneId": "...", "impactScore": 3.14, "suitability": 0.72 }
    ],
    "total_impact_score": 18.5,
    "gemini_explanation": "{ \"global_summary\": \"...\", \"assignments\": [...] }",
    "triggered_by": "manual",
    "created_at": "..."
  }
}
```

> **Pipeline:** Fetch zones + volunteers → engine `/engine/optimize` → Gemini `generateExplanation` → saved to `allocations` table.

> **PATCH `/:id/apply`**: Resets all volunteer assignments and zone volunteer counts, then re-applies the given allocation plan to the live DB state.

---

### Simulations — `/api/v1/simulations`

| Method | Path     | Roles              | Description                      |
|--------|----------|--------------------|----------------------------------|
| POST   | `/`      | ADMIN, COORDINATOR | Run a what-if simulation         |
| GET    | `/`      | ADMIN, COORDINATOR | Get simulations for current user |
| GET    | `/:id`   | ADMIN, COORDINATOR | Get a specific simulation        |
| DELETE | `/:id`   | ADMIN, COORDINATOR | Delete a simulation              |

**POST `/` Request:**
```json
{
  "baselineAllocationId": "uuid",
  "proposedChanges": [
    { "volunteerId": "v1", "toZone": "zone-uuid" }
  ]
}
```

**Response `201`:**
```json
{
  "message": "Simulation completed",
  "simulation": {
    "baseline_impact": 18.5,
    "simulated_impact": 19.2,
    "impact_delta": 0.7,
    "proposal_efficiency": 103.78,
    "gemini_analysis": "{ \"recommendation\": \"proposed\", \"analysis\": \"...\", \"risks\": [...], \"benefits\": [...] }",
    "ai_confidence": 88
  }
}
```

> **Pipeline:** Fetch baseline allocation → fetch all zones + volunteers → engine `/engine/simulate` → Gemini `analyzeSimulation` → saved to `simulations` table.

---

### Alerts — `/api/v1/alerts`

| Method | Path            | Roles              | Description                          |
|--------|-----------------|--------------------|--------------------------------------|
| POST   | `/poll`         | ADMIN, COORDINATOR | Run rule check on all zones → generate alerts |
| GET    | `/`             | ADMIN, COORDINATOR | List all alerts                      |
| GET    | `/active`       | ADMIN, COORDINATOR | List only active alerts              |
| PATCH  | `/:id/resolve`  | ADMIN, COORDINATOR | Mark an alert as resolved            |

**POST `/poll` Response:**
```json
[
  {
    "id": "uuid",
    "zone_id": "uuid",
    "type": "critical",
    "message": "Zone Z-001 is critically understaffed...",
    "suggested_action": "Deploy 3 additional medical volunteers immediately.",
    "status": "active"
  }
]
```

---

### Metrics — `/api/v1/metrics`

| Method | Path        | Roles              | Description                          |
|--------|-------------|--------------------|--------------------------------------|
| GET    | `/summary`  | ADMIN, COORDINATOR | System-wide snapshot                 |
| GET    | `/zones`    | ADMIN, COORDINATOR | Per-zone urgency + volunteer status  |
| GET    | `/history`  | ADMIN, COORDINATOR | Time-series of allocation impact     |

**GET `/summary` Response:**
```json
{
  "totalZones": 5,
  "totalVolunteers": 12,
  "activeAlerts": 2,
  "avgNeedScore": 23.45,
  "totalImpact": 18.5,
  "allocationEfficiency": 96.34
}
```

**GET `/zones` Response:**
```json
[
  { "id": "uuid", "zoneId": "Z-001", "urgency": 9, "needScore": 52.3,
    "currentVolunteers": 1, "status": "critical" }
]
```

**GET `/history` Response:**
```json
[
  { "timestamp": "2024-01-01T12:00:00Z", "impact": 18.5 }
]
```

---

## Auth & Roles

### `protect` Middleware

All protected routes require:
```
Authorization: Bearer <token>
```

Verifies JWT with `JWT_SECRET`, attaches `req.user = { id, email, role }` to the request.

### `authorizeRoles(...roles)` Middleware

Checks `req.user.role` against the allowed roles list. Returns `403 Forbidden` if the user's role is not permitted.

| Role         | Typical Access                              |
|--------------|---------------------------------------------|
| `ADMIN`      | Full access to all routes                   |
| `COORDINATOR`| Read + operational routes (no delete zones) |
| `SUPERVISOR` | Planned for future scope                    |
| `VOLUNTEER`  | Self-service (location, availability)       |

---

## Gemini AI Integration

The `gemini.service.js` provides four AI functions powered by `gemini-2.5-flash-lite`:

| Function               | Used In              | Purpose                                           |
|------------------------|----------------------|---------------------------------------------------|
| `parseFieldReport`     | `report.service`     | Extract structured zone data from raw text        |
| `generateExplanation`  | `allocation.service` | Explain per-volunteer assignments + generate `dashboard_insight` (≤60-word compact summary for dashboard card) |
| `analyzeSimulation`    | `simulation.service` | Analyze trade-offs between baseline & proposed    |
| `generateAlerts`       | `alert.service`      | Generate human-readable alert messages & actions  |

`generateExplanation` returns `{ dashboard_insight, global_summary, assignments[] }`. The `dashboard_insight` field is purpose-built for the compact dashboard `AIInsightBox` — no raw IDs, ≤60 words.

All Gemini calls use `temperature: 0.2` and return strict JSON. Gemini failures are non-fatal in the allocation and report pipelines (logged as warnings).

---

## Data Flow

```
1. User submits rawText → POST /api/v1/reports/ingest
2. Gemini parses rawText → zone_id, urgency, need_type, etc.
3. Zone upserted in PostgreSQL (created or updated)
4. Engine recomputes need scores → zones.need_score updated
5. POST /api/v1/allocations/run triggered
6. Backend fetches zones + volunteers from PostgreSQL
7. Engine: zone scoring + suitability matrix + greedy optimizer
8. Engine returns { allocation, total_impact }
9. Gemini generates explanation for allocation plan
10. Allocation saved to DB
11. PATCH /:id/apply → volunteers + zones updated in DB
12. POST /api/v1/simulations → propose changes
13. Engine simulates baseline vs proposed
14. Gemini analyzes trade-offs
15. POST /api/v1/alerts/poll → rule check + Gemini alert messages
```

---

## Setup & Running Locally

### 1. Start PostgreSQL (Docker)

```bash
cd backend
docker-compose up -d
```

- **Host:** `localhost:5433`
- **Database:** `impactiq`
- **User/Password:** `admin` / `password`

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure `.env`

```env
DATABASE_URL=postgresql://admin:password@localhost:5433/impactiq
JWT_SECRET=your_super_secret_key
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Migrations

```bash
npm run migrate
```

### 5. Start Dev Server

```bash
npm run dev
# → http://localhost:3000
```

> **Also start the engine** (`cd ../engine && uvicorn main:app --reload`) before calling allocation or simulation endpoints.

---

## Environment Variables

| Variable        | Description                        |
|-----------------|------------------------------------|
| `DATABASE_URL`  | PostgreSQL connection string        |
| `JWT_SECRET`    | JWT signing secret                  |
| `PORT`          | Express server port (default 3000)  |
| `GEMINI_API_KEY`| Google Gemini API key (required)    |

---

## Migrations

Drizzle-kit migrations in `drizzle/`:

```bash
npm run generate   # Generate SQL from schema changes
npm run migrate    # Apply pending migrations
```

---

*Status: Phase 3 Complete ✅ — All 8 route groups live (auth, zones, volunteers, reports, allocations, simulations, alerts, metrics). New: `PATCH /volunteers/:id/unassign` route (decrements zone count, resets availability), zone delete guard (blocks if volunteers assigned), `dashboard_insight` field in Gemini allocation explanation, Gemini model updated to `gemini-2.5-flash-lite`. RBAC enforced, full data integrity pipeline operational.*
