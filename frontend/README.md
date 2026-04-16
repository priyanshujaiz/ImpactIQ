# ImpactIQ — Frontend

> React 19 · Vite · TailwindCSS v4 · Recharts — Crisis Zone Resource Allocation Dashboard

The frontend is the **operator dashboard** for ImpactIQ. It provides a fully styled management interface for zones, volunteers, allocations, simulations, field reports, and real-time system metrics — all backed by the Express REST API.

---

## 📋 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Design System](#design-system)
3. [Project Structure](#project-structure)
4. [Routing & Auth Guard](#routing--auth-guard)
5. [Pages](#pages)
6. [Shared Component Library](#shared-component-library)
7. [Services (API Layer)](#services-api-layer)
8. [Backend API Mapping](#backend-api-mapping)
9. [Setup & Running Locally](#setup--running-locally)

---

## Tech Stack

| Category      | Technology                                |
|---------------|-------------------------------------------|
| Framework     | React 19                                  |
| Build Tool    | Vite 6                                    |
| Styling       | TailwindCSS v4 (via `@tailwindcss/vite`)  |
| Routing       | react-router-dom v7                       |
| HTTP Client   | axios (request/response interceptors)     |
| Charts        | Recharts v3                               |
| Icons         | lucide-react                              |
| Toasts        | react-hot-toast                           |
| Dates         | date-fns                                  |
| Utilities     | clsx, tailwind-merge                      |
| Font          | Plus Jakarta Sans (Google Fonts)          |
| Language      | JavaScript (ESM)                          |

---

## Design System

The entire UI is built on a **CSS custom properties token system** defined in `src/index.css`. All components consume these tokens — no magic hex values in component files.

### Color Tokens

| Token                     | Value         | Usage                                  |
|---------------------------|---------------|----------------------------------------|
| `--color-bg`              | `#f8fafc`     | Page canvas background                 |
| `--color-card`            | `#ffffff`     | Card / panel background                |
| `--color-card-bg`         | `#f8fafc`     | Card inner background (inputs, rows)   |
| `--color-border`          | `#e2e8f0`     | Borders, dividers                      |
| `--color-primary`         | `#2563eb`     | CTA buttons, active states             |
| `--color-primary-light`   | `#dbeafe`     | Skill tag / badge backgrounds          |
| `--color-sidebar`         | `#0f172a`     | Sidebar, login left panel              |
| `--color-danger`          | `#dc2626`     | Alerts, destructive actions            |
| `--color-danger-bg`       | `#fef2f2`     | Alert badge backgrounds                |
| `--color-success`         | `#16a34a`     | Positive trends, "available" status    |
| `--color-success-bg`      | `#f0fdf4`     | Success badge backgrounds              |
| `--color-warning`         | `#d97706`     | Warning alerts, "busy" status          |
| `--color-text-primary`    | `#0f172a`     | Headings, primary values               |
| `--color-text-secondary`  | `#475569`     | Body text                              |
| `--color-text-muted`      | `#94a3b8`     | Labels, timestamps, helper text        |

### Typography

- **Font:** Plus Jakarta Sans (300–700 weights via Google Fonts preconnect in `index.html`)
- **Scale:** 11px labels → 13px body → 15px card titles → 26–38px page headings

### Utilities

- `--shadow-card` / `--shadow-modal` — consistent elevation
- `--radius-sm` / `--radius-md` — 8px / 14px border radius
- `.shimmer` class — skeleton loader animation (keyframe shimmer gradient)
- `.pulse` — animated red dot for alert badge in sidebar

### StatusBadge Color Map

| Status value  | Color       |
|---------------|-------------|
| `critical`    | Red         |
| `high`        | Amber/orange|
| `warning`     | Amber       |
| `medium`      | Blue        |
| `available`   | Green       |
| `active`      | Green       |
| `low`         | Green       |
| `busy`        | Amber       |
| `pending`     | Blue        |
| `processed`   | Green       |
| `rejected`    | Red         |
| `offline`     | Gray        |

---

## Project Structure

```
frontend/
├── index.html                    # Plus Jakarta Sans preconnect + Google Fonts
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                  # React entry point
    ├── index.css                 # Design token system + shimmer/pulse animations
    ├── App.jsx                   # Router + ProtectedRoute guard
    │
    ├── pages/
    │   ├── Login.jsx             # Split dark/white layout — branding left, form right
    │   ├── Register.jsx          # Role selector cards + full registration form
    │   ├── Dashboard.jsx         # Overview: metrics, chart, AI insight (compact), bottom panels
    │   ├── Zones.jsx             # Zone grid: search + sort + UrgencyBar cards + Modal CRUD
    │   ├── Volunteers.jsx        # DataTable: pill tabs + assign/unassign + location modal + add modal
    │   ├── Allocation.jsx        # ActionCards (Run/Apply) + summary + DataTable + AI (full)
    │   ├── Simulation.jsx        # What-if: baseline picker + change builder + AI results + history
    │   └── Reports.jsx           # Split layout: ingest form left, history right + delete
    │
    ├── components/
    │   ├── layouts/
    │   │   ├── AppLayout.jsx     # Fixed shell: sidebar + topbar + scrollable canvas
    │   │   ├── Sidebar.jsx       # Navy bg, Lucide icons, FlaskConical simulation link, user footer
    │   │   └── Topbar.jsx        # Search bar (⌘K), bell + badge, page title, avatar
    │   │
    │   ├── shared/               # Centralized reusable components
    │   │   ├── SummaryCard.jsx   # Metric card: icon + value + trend badge + danger state
    │   │   ├── StatusBadge.jsx   # Semantic color pill (critical/high/available/busy/…)
    │   │   ├── UrgencyBar.jsx    # 4px top strip for zone cards
    │   │   ├── PageHeader.jsx    # Consistent title/subtitle/actions layout per page
    │   │   ├── Modal.jsx         # Accessible overlay: ESC close, scroll lock, backdrop
    │   │   ├── DataTable.jsx     # Sortable, striped, shimmer-loading table
    │   │   ├── EmptyState.jsx    # Centered icon/message/CTA for empty lists
    │   │   └── AIInsightBox.jsx  # Purple card: compact (dashboard) + full (allocation) modes
    │   │
    │   ├── dashboard/
    │   │   ├── SummaryCard.jsx        # Re-exports shared/SummaryCard
    │   │   ├── AIInsightBox.jsx       # Re-exports shared/AIInsightBox
    │   │   ├── ImpactChart.jsx        # AreaChart + blue gradient + date-fns tooltip
    │   │   ├── AlertsList.jsx         # Alert rows: type icon, StatusBadge, relative time
    │   │   ├── ZonesPreview.jsx       # Top-5 zones by urgency: name + code + vol count
    │   │   └── AllocationPreview.jsx  # Assignments: real names via zoneMap/volMap
    │   │
    │   ├── zones/
    │   │   ├── ZoneCard.jsx      # UrgencyBar + stat pills + needType tags + volunteer panel toggle
    │   │   ├── ZoneForm.jsx      # 2-col grid with needType → null when empty
    │   │   └── ZoneModal.jsx     # Re-exports shared/Modal
    │   │
    │   ├── volunteers/
    │   │   ├── VolunteerForm.jsx # name, skills (comma→array), lat/lng, availability
    │   │   └── VolunteerModal.jsx# Re-exports shared/Modal
    │   │
    │   ├── allocation/
    │   │   ├── AllocationSummary.jsx  # 3-stat strip: Impact · TriggeredBy · CreatedAt
    │   │   ├── AllocationTable.jsx    # DataTable: name lookups + suitability StatusBadge
    │   │   └── AIInsightBox.jsx       # Re-exports shared/AIInsightBox
    │   │
    │   └── reports/
    │       ├── ReportForm.jsx         # 8-row textarea, char count, Loader2 spinner
    │       ├── ReportCard.jsx         # Header + trash delete + confidence badge + expand toggle
    │       └── ExtractedDataView.jsx  # Null-safe label:value pairs for extracted data
    │
    ├── services/
    │   ├── api.js                # Axios instance + JWT interceptor + 401 redirect
    │   ├── auth.service.js       # login(), register(name, email, password, role), logout()
    │   ├── zone.service.js       # getZones(), createZone(), updateZone(), deleteZone(), getZoneVolunteers(id)
    │   ├── volunteer.service.js  # getVolunteers(), CRUD + assignVolunteer(), unassignVolunteer(), updateLocation()
    │   ├── allocation.service.js # getCurrentAllocation(), runAllocation(), applyAllocation()
    │   ├── report.service.js     # ingestReport(rawText), getReports(), deleteReport(id)
    │   ├── simulation.service.js # runSimulation(), getSimulations(), deleteSimulation(), getAllocationHistory()
    │   └── metrics.service.js    # getSummary(), getHistory(), getZoneMetrics(), getActiveAlerts()
    │
    └── utils/
        └── constants.js          # BASE_URL = "http://127.0.0.1:3000/api/v1"
```

---

## Routing & Auth Guard

```jsx
// App.jsx
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};
```

All routes except `/login` and `/register` are wrapped in `ProtectedRoute`. Unknown paths redirect to `/dashboard`.

| Route          | Component    | Protected |
|----------------|--------------|-----------|
| `/login`       | `Login`      | No        |
| `/register`    | `Register`   | No        |
| `/dashboard`   | `Dashboard`  | Yes       |
| `/zones`       | `Zones`      | Yes       |
| `/volunteers`  | `Volunteers` | Yes       |
| `/allocation`  | `Allocation` | Yes       |
| `/simulation`  | `Simulation` | Yes       |
| `/reports`     | `Reports`    | Yes       |
| `*`            | → `/dashboard` | —       |

The API response interceptor in `api.js` handles session expiry — any `401` automatically clears `localStorage` and redirects to `/login`.

---

## Pages

### Login (`/login`)

**Layout:** Full-screen 52/48 split.

**Left panel** (`#0f172a` dark navy):
- Radial glow blobs, ImpactIQ logo
- Headline + 3 metric pills + 4 feature rows

**Right panel** (white):
- Email + password with Eye/EyeOff toggle
- Error box on failed login, `Loader2` spinner while submitting
- **"Don't have an account? Create one"** link → `/register`

**Auth flow:** `POST /api/v1/auth/login` → stores `token` + `user` in `localStorage`.

---

### Register (`/register`)

**Layout:** Same 48/52 dark-navy / white split as Login.

**Left panel:** Role legend (emoji + label + description for each of the 4 roles).

**Right panel:**
- Full Name + Email fields
- Password + Confirm Password (side-by-side grid), shared show/hide toggle
- **2×2 Role selector cards** — visual cards for `VOLUNTEER` 🙋 / `COORDINATOR` 📋 / `SUPERVISOR` 🔭 / `ADMIN` 🛡️
- Client-side validation: min 6-char password, passwords must match, all fields required
- Success state (green checkmark) → auto-redirects to `/login` after 1.8s

**Auth flow:** `POST /api/v1/auth/register` with `{ name, email, password, role }`.

---

### Dashboard (`/dashboard`)

Loads **7 API calls in parallel** via `Promise.all` on mount.

**Layout:**
- **Row 1:** 5 metric SummaryCards (Zones / Volunteers / Alerts / Impact Score / Efficiency)
- **Row 2:** ImpactChart (60%) + AIInsightBox **compact mode** (40%)
- **Row 3:** AlertsList + ZonesPreview + AllocationPreview (3-col grid)

`AIInsightBox` in `compact={true}` mode shows `dashboard_insight` (60-word prose, no raw IDs) plus an assignment count + impact score strip.

`ZonesPreview` shows `zone.name` (with `zoneId` code as muted subtitle), not the raw ID code.

---

### Zones (`/zones`)

- Search + sort grid of `ZoneCard` components
- Add / Edit / Delete with Modal + ZoneForm (backend error messages surfaced in toasts)
- **Zone delete guard:** backend blocks deletion if volunteers are still assigned (error shown in toast)
- **ZoneCard volunteer panel:** click "N volunteers assigned" → lazy-fetches `GET /zones/:id/volunteers` → expandable list with volunteer name + availability badge. Only fetches once per expand.
- `ZoneForm` sends `needType: null` when blank (not `[]`)

---

### Volunteers (`/volunteers`)

- **Pill filter tabs:** All · Available · Busy with live counts
- **DataTable** columns: Name · Skills (tags) · Availability · **Assigned Zone (name + code)** · Reliability · Actions
- **Assign** button → zone picker modal → `PATCH /volunteers/:id/assign`
- **Unassign** button (only shown when volunteer has an assigned zone) → confirm dialog → `PATCH /volunteers/:id/unassign` → decrements zone count, resets availability
- **Location** button → lat/lng modal → `PATCH /volunteers/:id/location`
- **Delete** with confirm dialog
- Backend errors (e.g., uniqueness, assignment failures) shown in toasts
- **Assigned Zone column:** shows `zone.name` as primary text + `zone.zoneId` code as muted subtitle

---

### Allocation (`/allocation`)

Loads current allocation + zones + volunteers in parallel.

**ActionCards:**
| Card            | API                             | Notes                       |
|-----------------|---------------------------------|-----------------------------|
| Run Allocation  | `POST /allocations/run`         | `toast.loading` while running |
| Apply Allocation| `PATCH /allocations/:id/apply`  | Disabled until plan exists  |

**Below cards:** AllocationSummary + AllocationTable + AIInsightBox (`compact={false}` — full mode with `global_summary` + per-assignment bullets).

---

### Simulation (`/simulation`)

**What-if analysis page** — model volunteer movements before committing.

**Left panel (40%) — Setup:**
1. **Baseline picker** — dropdown of all allocation history (date + assignment count), auto-selects most recent
2. **Change builder** — dynamic rows of `[Volunteer ▼] → [Target Zone ▼]` with `+Add Movement` / `×Remove`
3. **Run Simulation** button (purple, `FlaskConical` icon)

**Right panel (60%) — Results:**
- **Impact strip:** Baseline score → Simulated score with ↑↓ delta badge, efficiency %, AI confidence
- **Gemini AI Trade-off Analysis:** recommendation badge (✅ Apply / ⚠️ Keep baseline), analysis prose, benefits/risks grid, baseline vs proposal confidence scores
- **History list:** all past runs, clickable to restore results, shows time-ago + delta + recommendation + efficiency + delete button

**API:** `POST /simulations` with `{ baselineAllocationId, proposedChanges: [{ volunteerId, toZone }] }`

---

### Reports (`/reports`)

**Split layout** (40% form / 60% history).

- **ReportForm:** textarea, char count, `toast.loading` → success/error
- **ReportCard:** timestamp + AI confidence badge + StatusBadge + **trash delete button** (confirm dialog → `DELETE /reports/:id`)
- `ExtractedDataView`: null-safe label:value pairs

---

## Shared Component Library

### `AIInsightBox` — Two Modes

```jsx
// Dashboard — compact prose summary (dashboard_insight)
<AIInsightBox allocation={allocation} compact={true} />

// Allocation page — full detail
<AIInsightBox allocation={allocation} isLoading={running} compact={false} />
```

| Prop       | Default | Behaviour |
|------------|---------|-----------|
| `compact`  | `false` | `true` → shows `dashboard_insight` + stat strip. `false` → shows `global_summary` + assignment bullets |
| `isLoading`| `false` | Shows shimmer skeleton |

The `dashboard_insight` field is generated by Gemini as a ≤60-word plain-language summary (no raw IDs).

---

## Services (API Layer)

All services use a shared `api.js` axios instance:
- **Base URL:** `http://127.0.0.1:3000/api/v1`
- **Timeout:** 10 000 ms
- **Request interceptor:** attaches `Authorization: Bearer <token>` from `localStorage`
- **Response interceptor:** on `401` → clears storage, redirects to `/login`

| Service                | Exported Functions |
|------------------------|-------------------|
| `auth.service.js`      | `login(email, password)`, `register(name, email, password, role)`, `logout()` |
| `zone.service.js`      | `getZones()`, `createZone(data)`, `updateZone(id, data)`, `deleteZone(id)`, `getZoneVolunteers(id)` |
| `volunteer.service.js` | `getVolunteers()`, `createVolunteer(data)`, `updateVolunteer(id, data)`, `deleteVolunteer(id)`, `assignVolunteer(id, zoneId)`, `unassignVolunteer(id)`, `updateLocation(id, data)` |
| `allocation.service.js`| `getCurrentAllocation()`, `runAllocation()`, `applyAllocation(id)` |
| `report.service.js`    | `ingestReport(rawText)`, `getReports()`, `deleteReport(id)` |
| `simulation.service.js`| `runSimulation(baselineId, changes)`, `getSimulations()`, `deleteSimulation(id)`, `getAllocationHistory()` |
| `metrics.service.js`   | `getSummary()`, `getHistory()`, `getZoneMetrics()`, `getActiveAlerts()`, `getCurrentAllocation()` |

---

## Backend API Mapping

| Frontend Action                | Method | Backend Endpoint                    |
|--------------------------------|--------|-------------------------------------|
| Login                          | POST   | `/auth/login`                       |
| Register                       | POST   | `/auth/register`                    |
| Get all zones                  | GET    | `/zones`                            |
| Create zone                    | POST   | `/zones`                            |
| Update zone                    | PUT    | `/zones/:id`                        |
| Delete zone (guarded)          | DELETE | `/zones/:id`                        |
| Get volunteers in zone         | GET    | `/zones/:id/volunteers`             |
| Get all volunteers             | GET    | `/volunteers`                       |
| Create volunteer               | POST   | `/volunteers`                       |
| Update volunteer               | PUT    | `/volunteers/:id`                   |
| Delete volunteer               | DELETE | `/volunteers/:id`                   |
| Assign volunteer to zone       | PATCH  | `/volunteers/:id/assign`            |
| **Unassign volunteer from zone** | PATCH | `/volunteers/:id/unassign`         |
| Update volunteer location      | PATCH  | `/volunteers/:id/location`          |
| Ingest field report            | POST   | `/reports/ingest`                   |
| Get all reports                | GET    | `/reports`                          |
| **Delete report**              | DELETE | `/reports/:id`                      |
| Get current allocation         | GET    | `/allocations/current`              |
| Run allocation                 | POST   | `/allocations/run`                  |
| Apply allocation               | PATCH  | `/allocations/:id/apply`            |
| Get allocation history         | GET    | `/allocations/history`              |
| **Run what-if simulation**     | POST   | `/simulations`                      |
| **Get simulations**            | GET    | `/simulations`                      |
| **Delete simulation**          | DELETE | `/simulations/:id`                  |
| Get metrics summary            | GET    | `/metrics/summary`                  |
| Get impact history             | GET    | `/metrics/history`                  |
| Get zone metrics               | GET    | `/metrics/zones`                    |
| Get active alerts              | GET    | `/alerts/active`                    |

---

## Data Integrity Notes

### Zone Name vs Zone ID vs Zone UUID

The `zones` table has three distinct fields:
- `zones.id` — UUID (DB primary key, what `volunteers.currentZoneId` references)
- `zones.zoneId` — text code (e.g. "ZONE-A1", human-readable external ID)
- `zones.name` — text (human-readable friendly name)

All UI components display `zone.name` (falling back to `zone.zoneId` if name is null) and never show raw UUIDs.

### Unassign Volunteer Flow

```
PATCH /volunteers/:id/unassign
  → zones.currentVolunteers -= 1
  → volunteers.currentZoneId = null
  → volunteers.availability = "available"
```

### Zone Delete Guard

`DELETE /zones/:id` checks for volunteers with `currentZoneId = zone.id` before soft-deleting. Returns `400` with a clear error message if any are found.

---

## Setup & Running Locally

### Prerequisites

- Backend running at `http://localhost:3000`
- Python engine running at `http://localhost:8000`

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

*Status: All 9 UI phases complete ✅ — Login, Register, Dashboard, Zones, Volunteers, Allocation, Simulation, Reports implemented with consistent design tokens, shimmer loaders, toast notifications, data integrity guards, and verified API contracts.*
