# US-715: Shipper Dashboard — Design Specification

**Status:** DESIGN_APPROVED  
**Phase:** 7  
**Depends On:** US-101 (Core load registration), US-103 (Load CRUD)  
**Date:** 2026-05-19

---

## 1. Overview

**Goal:** Shippers can view all posted loads at a glance with status summaries and dense information layout optimized for laptop use.

**Scope:** Single-page dashboard showing load summary strip (4 colored cards) + sortable, paginated load table with inline actions (Edit, Cancel, View Details).

**Success Metrics:**
- Page load <100ms (parallel API calls, cached)
- All loads visible without scrolling horizontally (dense columns)
- Shipper can manage loads (edit, cancel, sort, filter) in <5 clicks

---

## 2. Architecture & Data Flow

### 2.1 Data Sources

Two parallel API endpoints:

**Endpoint 1: Load Statistics**
```
GET /api/v1/shipper/loads/stats?view=active|all
```
- **Parameters:** `view=active` (default) | `view=all`
- **Response:** 
```json
{
  "active": { "open": 12, "claimed": 8, "inTransit": 3, "delivered": 42 },
  "all": { "draft": 2, "open": 12, "claimed": 8, "inTransit": 3, "delivered": 42, "cancelled": 5 }
}
```
- **Purpose:** Fast summary for the 4-card strip
- **Caching:** 2m TTL via React Query
- **Invalidation:** On load create/update/delete, immediately refetch

**Endpoint 2: Load List (Paginated)**
```
GET /api/v1/shipper/loads?page=0&limit=20&view=active|all&sort=pickupDate&order=asc
```
- **Parameters:**
  - `page` (0-indexed)
  - `limit` (default: 20)
  - `view` (`active` | `all`)
  - `sort` (`pickupDate`, `status`, `payRate`, `distance`)
  - `order` (`asc` | `desc`)
- **Response:**
```json
{
  "loads": [
    {
      "id": "LOAD-001",
      "origin": { "city": "San Jose", "state": "CA" },
      "destination": { "city": "Phoenix", "state": "AZ" },
      "pickupWindow": { "earliest": "2026-05-20T08:00", "latest": "2026-05-20T17:00" },
      "status": "OPEN",
      "payRate": { "amount": 1200, "unit": "flat" },
      "claimedBy": null,
      "createdAt": "2026-05-19T10:30:00Z"
    }
  ],
  "pagination": { "page": 0, "limit": 20, "total": 147 }
}
```
- **Caching:** 2m TTL
- **Invalidation:** On mutation, invalidate cache + refetch
- **Query:** Include `deleted_at IS NULL` (soft delete filtering)
- **RLS:** Backend enforces `tenant_id` filtering via `TenantContextHolder`

### 2.2 Component Hierarchy

```
ShipperDashboard (page)
├── Header ("Shipper Dashboard" + "Post Load" button)
├── TabToggle (Active View / All Loads View)
├── SummaryStrip (4 colored cards: Open, Claimed, In Transit, Delivered)
│   └── useLoadStats(view) — fetches /api/v1/shipper/loads/stats
├── LoadTable
│   ├── useLoadBoard(page, view, sort, search) — fetches /api/v1/shipper/loads
│   ├── TableHeader (sortable columns)
│   ├── TableRows (load records + action buttons)
│   └── Pagination (prev/next, page numbers)
├── SearchBar (search by load ID or destination)
└── ErrorBoundary (catch and display errors with retry)
```

### 2.3 State Management

- **Tab View (Active/All):** URL query param `?view=active|all`, React Router state
- **Sort:** URL query param `?sort=pickupDate&order=asc`
- **Page:** URL query param `?page=0`
- **Search:** Local state (debounced, cleared on view/sort/page change)
- **Auth:** User role + tenantId from Zustand `useAuthStore`

---

## 3. UI Layout & Components

### 3.1 Page Structure (Laptop-Optimized)

```
┌─────────────────────────────────────────────────────────────────┐
│  Shipper Dashboard                               [+ Post Load]   │
├─────────────────────────────────────────────────────────────────┤
│  [Active View]     [All Loads View]                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌────────┐│
│  │   OPEN      │  │   CLAIMED    │  │  IN TRANSIT │  │DELIVERED
│  │    12       │  │      8       │  │      3      │  │   42    │
│  └─────────────┘  └──────────────┘  └─────────────┘  └────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Search: [____________________]                                  │
├─────────────────────────────────────────────────────────────────┤
│ ID    │Origin      │Dest        │Pickup Window     │Status │Pay  │
├───────┼────────────┼────────────┼──────────────────┼───────┼─────┤
│LOAD-1 │San Jose,CA │Phoenix,AZ  │5/20 8am–5pm      │OPEN   │$1.2k│
│LOAD-2 │Portland,OR │LA,CA       │5/21 6am–2pm      │CLAIMED│$850 │
│LOAD-3 │...         │...         │...               │...    │...  │
├───────┴────────────┴────────────┴──────────────────┴───────┴─────┤
│ ◀ Previous  Page 1 of 8 (147 total)  Next ▶                      │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Summary Strip (4 Cards)

Each card shows:
- **Color-coded badge** (green for Open, orange for Claimed, blue for In Transit, gray for Delivered)
- **Label** (OPEN, CLAIMED, IN_TRANSIT, DELIVERED)
- **Count** (number, right-aligned)
- **Click to filter** (clicking a card should filter table to that status, optional future enhancement)

**Implementation:**
- Use TailwindCSS grid: `grid-cols-4` on laptop, stacks on mobile (but MVP is laptop-first)
- Counts fetched from `/api/v1/shipper/loads/stats` endpoint
- Refresh on tab view toggle (Active/All)

### 3.3 Load Table Columns

| Column | Width | Sortable | Searchable | Notes |
|--------|-------|----------|-----------|-------|
| **ID** | 80px | Yes | Yes (primary search) | Load ID as link to detail view |
| **Origin** | 120px | No | Yes (secondary search) | "City, ST" format |
| **Destination** | 120px | No | Yes (secondary search) | "City, ST" format |
| **Pickup Window** | 150px | Yes | No | "Earliest–Latest" (e.g., "5/20 8am–5pm") |
| **Status** | 100px | Yes | No | Colored badge (DRAFT, OPEN, CLAIMED, IN_TRANSIT, DELIVERED, CANCELLED) |
| **Pay Rate** | 80px | Yes | No | Flat ("$1.2k") or per-mile ("$2.50/mi") |
| **Claimed By** | 120px | No | No | Trucker name (if CLAIMED/IN_TRANSIT/DELIVERED), empty if OPEN/DRAFT |
| **Actions** | 120px | No | No | 3 inline buttons (Edit, Cancel, View Details) |

**Total width:** ~900px (fits 1366px laptop screens with sidebar/nav)

### 3.4 Inline Action Buttons

Per row, show up to 3 buttons:
- **Edit** (pencil icon): enabled if status ∈ [DRAFT, OPEN, CLAIMED] → navigate to `/shipper/loads/:id/edit`
- **Cancel** (X icon): enabled if status ∉ [DELIVERED, CANCELLED, DRAFT] → confirm dialog → `DELETE /api/v1/shipper/loads/:id`
- **View Details** (→ arrow): always enabled → navigate to `/shipper/loads/:id` or open modal

**Button styling:** Compact, icon-only, 30px square, hover effect

### 3.5 Search Bar

- **Placeholder:** "Search by Load ID or destination city"
- **Behavior:** 
  - Case-insensitive substring match
  - Debounced (300ms) to avoid excessive re-renders
  - Resets when view/sort/page changes
  - Searches frontend-side on current page (not API-level) for MVP

### 3.6 Pagination

- **Buttons:** ◀ Previous | Page 1 of 8 (147 total) | Next ▶
- **Direct page nav:** Numbered buttons (1, 2, 3, ..., 8)
- **Limit:** 20 loads per page
- **Update URL:** `?page=0` in query params

### 3.7 Empty State

If the shipper has zero loads in the current view:
```
╔════════════════════════════════════════╗
║  No loads yet.                         ║
║  Start by posting your first load.     ║
║                                        ║
║        [+ Post a Load]                 ║
╚════════════════════════════════════════╝
```

### 3.8 Error State

If API fails (network error, 5xx):
```
┌─────────────────────────────────────────┐
│ ⚠️ Failed to load loads. Last updated:  │
│    May 19, 10:30 AM (cached data shown)│
│                      [Retry]            │
└─────────────────────────────────────────┘
```
- Show cached data (if available) + error message
- "Retry" button calls the API again
- If no cache, show "No data available" + retry

---

## 4. Behavior & Interactions

### 4.1 Tab Toggle (Active View / All Loads View)

- **Active View** (default): Shows stats for OPEN, CLAIMED, IN_TRANSIT, DELIVERED; table filters to these statuses
- **All Loads View**: Shows stats for all statuses including DRAFT, CANCELLED; table shows all
- **Behavior**: Clicking tab resets page to 0, preserves search/sort

### 4.2 Sorting

- **Default:** Pickup Date (asc)
- **Column headers clickable:** Click to sort by that column
- **Icon toggle:** ▲ (asc) / ▼ (desc) next to sorted column
- **URL param:** `?sort=pickupDate&order=asc`

### 4.3 Filtering & Search

- **Tab filter:** Active/All loads (controls summary strip + table)
- **Search:** Substring match on Load ID or destination city (debounced, client-side)
- **Future:** Date range, origin state, equipment type (deferred to US-716)

### 4.4 Row Actions

**Edit Button:**
- Enabled only for DRAFT, OPEN, CLAIMED loads
- Disabled (grayed out) for IN_TRANSIT, DELIVERED, CANCELLED
- Click → navigate to `/shipper/loads/:id/edit`
- Backend validation: Load must be editable status + owned by tenant

**Cancel Button:**
- Enabled for all statuses except DELIVERED, CANCELLED, DRAFT
- Click → confirmation dialog:
  ```
  Confirm: Cancel load LOAD-001?
  This will notify the claimed trucker and free their slot.
  [Cancel Action] [Confirm]
  ```
- On confirm → `DELETE /api/v1/shipper/loads/:id` → remove from table + refetch
- On error → show error toast + retry

**View Details Button:**
- Always enabled
- Click → navigate to `/shipper/loads/:id` (full detail page, not modal)
- Show full load record: all fields, shipper/trucker contact info, timeline
- Back button returns to dashboard with scroll position preserved

### 4.5 Mutations & Cache Invalidation

**On Load Create:**
1. Frontend navigates to `/shipper/loads/new`
2. On success → `/dashboard/shipper` (redirected)
3. Cache invalidated: `/shipper/loads` + `/shipper/loads/stats`
4. Table refetches and shows new load at top

**On Load Edit:**
1. Frontend navigates to `/shipper/loads/:id/edit`
2. On success → `/dashboard/shipper`
3. Cache invalidated + refetch

**On Load Cancel (Delete):**
1. Inline button shows confirmation
2. On confirm → `DELETE /api/v1/shipper/loads/:id`
3. Optimistic UI: remove row immediately
4. On success: confirmed, refetch to sync
5. On error: show error + restore row from cache

---

## 5. Caching & Performance

### 5.1 React Query Configuration

```typescript
// useLoadStats hook
useQuery({
  queryKey: ['shipper-loads-stats', view],
  queryFn: () => apiGet(`/shipper/loads/stats?view=${view}`),
  staleTime: 120000,      // 2 minutes
  cacheTime: 300000,       // 5 minutes
  retry: 1,
})

// useLoadBoard hook
useQuery({
  queryKey: ['shipper-loads', page, view, sort, order, search],
  queryFn: () => apiGet(`/shipper/loads?page=${page}&...`),
  staleTime: 120000,
  cacheTime: 300000,
  retry: 1,
})
```

### 5.2 Invalidation Strategy

On mutation (create, update, delete load):
```typescript
queryClient.invalidateQueries(['shipper-loads-stats'])
queryClient.invalidateQueries(['shipper-loads'])
```

### 5.3 Performance Targets

- **Initial page load:** <100ms (stats + first page loads in parallel, served from cache on repeat visits)
- **Tab switch:** <50ms (cached, immediate re-render with different data)
- **Sort/pagination:** <50ms (client-side sort, server-side pagination)
- **Search:** <200ms (debounced input, client-side filter)
- **Mutation:** Optimistic UI updates (instant feedback), then sync in background

---

## 6. Error Handling

| Scenario | Behavior |
|----------|----------|
| Network error on load | Show cached data + error banner + retry |
| 401 Unauthorized | Redirect to `/login` (via auth interceptor) |
| 403 Forbidden | Show "Access Denied" error |
| 404 Load not found | Remove from table silently (already claimed/deleted by another user) |
| 500 Server error | Error banner + retry option |
| Empty result | Show "No loads yet" empty state + CTA button |

---

## 7. Testing Strategy

### 7.1 Unit Tests (Frontend)
- ShipperDashboard component renders summary strip + table
- Tab toggle updates URL params and refetches
- Sort by column changes URL and query
- Search input debounces and filters
- Action buttons enabled/disabled based on load status
- Empty state displays when no loads

### 7.2 Integration Tests
- Full flow: load dashboard → see loads → edit one → cancel another → verify cache invalidation + refetch
- Error handling: simulate API 500 → show cached data + retry works
- Pagination: navigate pages, verify URL params preserved

### 7.3 E2E Tests (Playwright)
- Login as shipper@test.com
- Navigate to `/dashboard/shipper`
- Verify summary counts match table
- Create load → dashboard refetches and shows it
- Cancel load → dashboard removes it
- Tab toggle works (Active/All views)

### 7.4 Performance Tests
- Page load <100ms (measure via Lighthouse or React DevTools)
- Tab switch <50ms
- Search debounce works (no excessive re-renders)

---

## 8. Acceptance Criteria Mapping

| AC | Implementation |
|---|---|
| AC1: Load Summary Strip | SummaryStrip component using `/shipper/loads/stats` endpoint |
| AC2: Load Table | LoadTable component with sortable columns, pagination, soft delete filtering |
| AC3: Quick Actions | Inline buttons (Edit, Cancel, View Details) with status-based enabling |
| AC4: Filtering & Search | Tab toggle (Active/All) + search by ID/destination (client-side MVP) |
| AC5: Empty State | EmptyState component shown when zero loads in view |
| AC6: Caching | React Query 2m TTL, cache invalidation on mutations |

---

## 9. Scope & Future Work

### MVP (This Story - US-715)
- ✅ Summary strip (4 cards)
- ✅ Load table with pickup date sort
- ✅ Inline action buttons
- ✅ Tab toggle (Active/All)
- ✅ Search by ID/destination
- ✅ Pagination
- ✅ Error handling + cached fallback
- ✅ <100ms load time

### Future Stories (Deferred)
- **US-716:** Advanced filtering (date range, origin state, equipment type)
- **US-717:** Load analytics (earnings by lane, top destinations)
- **US-718:** Recurring load scheduling UI
- **US-719:** Preferred carrier list integration

---

## 10. Security & Compliance

- **RLS:** Backend enforces `tenant_id` filtering; shipper sees only own loads
- **Soft Deletes:** `deleted_at IS NULL` in all queries
- **Auth:** JWT validation on all endpoints; token refresh on 401
- **CORS:** Backend allows frontend origin
- **No-Lombok:** Standard Java POJOs for DTOs

---

**Design Approved By:** [User] | **Date:** 2026-05-19  
**Implementation Ready:** Yes | **Blocked By:** None
