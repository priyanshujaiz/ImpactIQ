# ImpactIQ — Engine

> Python (FastAPI) Scoring & Optimization Engine

The engine is the **AI brain** of ImpactIQ. It is a stateless FastAPI microservice responsible for:

1. **Zone need scoring** — urgency, severity, people, coverage gap, and trend-delta weighting
2. **Volunteer suitability** — real-world Haversine distance, skill match, availability, reliability, relocation cost
3. **Allocation optimization** — globally optimal **Hungarian algorithm** (scipy linear assignment)
4. **Simulation** — what-if analysis with accurate impact scores for both fixed and free assignments

The engine does **not** touch the database. It receives data from the backend, computes results, and returns them as JSON.

---

## 📋 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Algorithms](#algorithms)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Setup](#setup)
7. [How It Connects to the Backend](#how-it-connects-to-the-backend)

---

## Tech Stack

| Category   | Technology           |
|------------|----------------------|
| Language   | Python 3             |
| Framework  | FastAPI              |
| Server     | Uvicorn (ASGI)       |
| Validation | Pydantic v2          |
| Math       | Python `math`, NumPy, SciPy |
| Env        | venv                 |

---

## Project Structure

```
engine/
├── main.py                        # FastAPI app, router registration, health check
├── requirements.txt               # Python dependencies
├── models/
│   ├── zone.py                    # Zone Pydantic model (camelCase aliases)
│   ├── volunteer.py               # Volunteer Pydantic model (camelCase aliases)
│   ├── allocation.py              # Allocation result model
│   └── request_models.py          # Combined request bodies
├── routes/
│   ├── zone_routes.py             # POST /engine/score/zones
│   ├── volunteer_routes.py        # POST /engine/score/volunteers
│   ├── optimizer_routes.py        # POST /engine/optimize
│   └── simulation_routes.py       # POST /engine/simulate
├── services/
│   ├── zone_service.py            # need score (urgency + people + severity + coverage gap + trend)
│   ├── volunteer_service.py       # suitability matrix (Haversine distance + relocation cost)
│   ├── optimizer_service.py       # Hungarian algorithm (globally optimal) + greedy fallback
│   └── simulation_service.py      # baseline vs proposed — real impactScore for fixed assignments
└── utils/
    └── debug_helper.py            # build_error(), safe_dict() — structured error helpers
```

---

## Algorithms

### 1. Zone Need Score (`zone_service.py`) — v2

Computes a **priority score** for each zone based on **five weighted inputs**:

```
need_score =
  0.30 × urgency^1.5
+ 0.20 × log(people_affected + 1)
+ 0.20 × severity
+ 0.20 × log(people_affected / max(current_volunteers, 1) + 1)   ← coverage gap
+ 0.10 × max(trend_delta, 0)                                      ← worsening trend bonus
```

| Weight | Input                | Why                                                        |
|--------|----------------------|---------------------------------------------------------|
| 0.30   | `urgency^1.5`        | Non-linear — high urgency escalates faster               |
| 0.20   | `log(people+1)`      | Log-scale prevents massive population from dominating    |
| 0.20   | `severity`           | Declared severity contribution                           |
| 0.20   | `log(coverage_gap+1)`| **NEW**: zones with few volunteers per person score higher |
| 0.10   | `max(trend_delta, 0)`| **NEW**: worsening situations get a priority boost        |

All inputs are clamped to `≥ 0`. `current_volunteers` defaults to `1` to avoid division by zero.

---

### 2. Volunteer Suitability (`volunteer_service.py`) — v2

Builds a **volunteer × zone suitability matrix**. For each (volunteer, zone) pair:

```
suitability =
  0.40 × skill_match
+ 0.25 × distance_score        ← Haversine km, not Euclidean degrees
+ 0.15 × availability
+ 0.10 × reliability
+ 0.10 × relocation_cost       ← NEW: penalise displacing already-deployed volunteers
```

| Weight | Component          | Calculation                                                        |
|--------|--------------------|-------------------------------------------------------------------|
| 0.40   | `skill_match`      | `|skills ∩ need_type| / |need_type|`                             |
| 0.25   | `distance_score`   | `1 / (1 + 0.1 × haversine_km)` — real-world km, not lat/lng diff  |
| 0.15   | `availability`     | `1.0` available, `0.3` busy (partial credit), `0.0` otherwise    |
| 0.10   | `reliability`      | `reliability_score` clamped to `[0, 1]`                          |
| 0.10   | `relocation_cost`  | **NEW**: `1.0` if undeployed / already here, `0.8` if being moved |

---

### 3. Hungarian Algorithm Optimizer (`optimizer_service.py`) — v2

Replaces the old greedy loop with a **globally optimal linear assignment** using `scipy.optimize.linear_sum_assignment`.

**Why it's better than greedy:**
- The old greedy approach was **order-dependent** — the first volunteer always got the best pick, making results inconsistent.
- The Hungarian algorithm considers **all volunteers simultaneously** and finds the assignment that maximises total impact across the entire plan.

**How it works:**
1. Compute `impact_matrix[i][j] = need_score[j] × suitability(volunteer_i, zone_j)` for all pairs
2. Expand zone columns into **slots** (`ceil(n_volunteers / n_zones) + 1` per zone) so multiple volunteers can be assigned to the same zone
3. Run `linear_sum_assignment(-impact_matrix)` to maximise total impact
4. Map slot indices back to zone IDs

```
max Σ impact_matrix[i][j]   s.t. each volunteer assigned to exactly one slot
```

- **Complexity:** O(n³) via scipy — handles real-world volunteer/zone counts with ease
- **Fallback:** if scipy is unavailable, automatically falls back to the original greedy algorithm

**Output schema — unchanged:**
```json
{
  "success": true,
  "allocation": [
    { "volunteerId": "...", "zoneId": "...", "impactScore": 3.14, "suitability": 0.72 }
  ],
  "total_impact": 18.5
}
```

> **Note:** Output keys use **camelCase** to match Drizzle ORM field names expected by the backend.

**Error Response (any stage failure):**
```json
{
  "success": false,
  "stage": "hungarian_solve",
  "error": "..."
}
```

---

### 4. Simulation (`simulation_service.py`) — v2

Compares a **baseline allocation** vs a proposed set of changes:

- Runs the Hungarian optimizer for the full baseline
- For proposed changes, splits volunteers into **fixed** (user-forced moves) and **free** (re-optimised)
- Computes **real `impactScore` and `suitability`** for fixed assignments (previously these were hardcoded to `0`, making all proposals look worse than they actually were)
- `total_impact = fixed_impact + re_optimised_impact` — accurate accounting for both groups
- The backend then computes `proposalEfficiency` and uses Gemini to analyze the result

**Output schema — unchanged:**
```json
{
  "baseline": 18.5,
  "new": 19.2,
  "delta": 0.7,
  "finalPlan": [
    { "volunteerId": "v1", "zoneId": "z1", "impactScore": 3.14, "suitability": 0.72 }
  ]
}
```

---

## API Endpoints

Base URL: `http://localhost:8000`

All engine-specific routes are prefixed with `/engine`.

---

### `GET /`
Health check — returns `{ "message": "root api" }`

### `GET /health`
Returns `{ "status": "ok" }`

---

### `POST /engine/score/zones`

Compute need scores for a list of zones.

**Request:**
```json
{
  "zones": [
    {
      "id": "uuid", "zoneId": "Z-001", "name": "North Camp",
      "lat": 28.6, "lng": 77.2,
      "urgency": 8, "peopleAffected": 500, "severity": 7,
      "needType": ["medical", "food"]
    }
  ]
}
```

> Fields accept both camelCase and snake_case due to `populate_by_name = True` on models.

**Response:**
```json
{
  "zones": [
    { "id": "uuid", "need_score": 18.432 }
  ]
}
```

---

### `POST /engine/score/volunteers`

Build a suitability matrix for all volunteer-zone pairs.

**Request:** `{ "volunteers": [...], "zones": [...] }`

**Response:**
```json
{
  "matrix": {
    "volunteer_id_1": {
      "zone_id_1": 0.72,
      "zone_id_2": 0.41
    }
  }
}
```

---

### `POST /engine/optimize`

Run the globally optimal allocation (Hungarian algorithm).

**Request:** `{ "volunteers": [...], "zones": [...] }`

**Response:**
```json
{
  "success": true,
  "allocation": [
    { "volunteerId": "v1", "zoneId": "z1", "impactScore": 3.14, "suitability": 0.72 }
  ],
  "total_impact": 18.5
}
```

---

### `POST /engine/simulate`

Run a what-if simulation against a proposed set of changes.

**Request:**
```json
{
  "zones": [...],
  "volunteers": [...],
  "changes": [
    { "volunteerId": "V1", "toZone": "Z2" }
  ]
}
```

**Response:**
```json
{
  "baseline": 18.5,
  "new": 19.2,
  "delta": 0.7
}
```

---

## Data Models

### `Zone` (`models/zone.py`)

Accepts **camelCase** from the backend (Drizzle ORM field names) via Pydantic `alias` fields. `populate_by_name = True` allows both snake_case and camelCase.

| Field                | Type          | Alias (camelCase)    | Notes                    |
|----------------------|---------------|----------------------|--------------------------|
| `id`                 | `str`         | —                    | DB UUID                  |
| `zone_id`            | `str`         | `zoneId`             | Human-readable ID        |
| `name`               | `str?`        | —                    | Optional                 |
| `lat`, `lng`         | `float`       | —                    | Coordinates              |
| `urgency`            | `int`         | —                    | 1–10                     |
| `people_affected`    | `int`         | `peopleAffected`     |                          |
| `severity`           | `int`         | —                    | 1–10                     |
| `need_type`          | `List[str]`   | `needType`           | e.g. `["medical","food"]`|
| `need_score`         | `float?`      | `needScore`          | Optional, default 0      |
| `current_volunteers` | `int?`        | `currentVolunteers`  | Optional, default 0      |
| `trend_delta`        | `float?`      | `trendDelta`         | Optional, default 0      |
| `status`             | `str?`        | —                    | Optional                 |

### `Volunteer` (`models/volunteer.py`)

| Field              | Type                              | Alias (camelCase)  | Notes                          |
|--------------------|-----------------------------------|--------------------|--------------------------------|
| `id`               | `str`                             | —                  |                                |
| `name`             | `str?`                            | —                  | Optional                       |
| `skills`           | `List[str]`                       | —                  | e.g. `["medical","logistics"]` |
| `lat`, `lng`       | `float`                           | —                  | Current location               |
| `availability`     | `str`                             | —                  | `"available"` / `"unavailable"`|
| `reliability_score`| `float`                           | `reliabilityScore` | 0.0–1.0                        |
| `current_zone_id`  | `str?`                            | `currentZoneId`    | Optional current assignment    |
| `status`           | `Literal["active","inactive","deleted"]?` | — | Optional, default `"active"`  |

---

## Setup

```bash
# 1. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
uvicorn main:app --reload
# → http://localhost:8000
# → Docs: http://localhost:8000/docs
```

**Dependencies:**
- `fastapi`
- `uvicorn`
- `pydantic`
- `numpy`
- `scipy` ← required for Hungarian algorithm (`linear_sum_assignment`)

---

## How It Connects to the Backend

The backend calls the engine over HTTP for two operations:

```
Backend (Node.js :3000)
  └─ allocation.service.js
  │    └─ engine.service.js → axios.post("http://localhost:8000/engine/optimize", { zones, volunteers })
  │         └─ optimizer_service.py → returns { success, allocation, total_impact }
  │
  └─ simulation.service.js
  │    └─ axios.post("http://localhost:8000/engine/simulate", { zones, volunteers, changes })
  │         └─ simulation_service.py → returns { baseline, new, delta }
  │
  └─ report.service.js (zone score recompute)
       └─ engine.service.js → axios.post("http://localhost:8000/engine/score/zones", { zones })
            └─ zone_service.py → returns { zones: [{ id, need_score }] }
```

The backend is the **only** entry point for clients. The engine is a **stateless compute service** — it never reads or writes the database.

---

*Status: Phase 3 Complete ✅ — Engine intelligence upgraded: Hungarian algorithm optimizer (globally optimal, replaces greedy), Haversine real-world distance, 5-factor suitability scoring (incl. relocation cost + busy partial credit), 5-factor zone need score (incl. coverage gap + trend delta), simulation impactScore bug fixed. All API schemas unchanged. Verified via smoke tests.*
