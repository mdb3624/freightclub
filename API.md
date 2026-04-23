# FreightClub REST API Reference

Base URL: `http://localhost:9090/api/v1` (dev)

All authenticated endpoints require `Authorization: Bearer <access_token>` header unless noted otherwise.

---

## Authentication — `/api/v1/auth`

> These endpoints are public (no auth required). Rate-limited to 10 req/min/IP.

### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secret123",
  "role": "SHIPPER",
  "tenantName": "Acme Freight",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

- `role`: `"SHIPPER"` or `"TRUCKER"`
- Shippers create a new tenant. Truckers require a `joinCode` to join an existing tenant.

**Response `201`:**
```json
{
  "accessToken": "<jwt>",
  "expiresIn": 900,
  "user": {
    "id": "<uuid>",
    "email": "user@example.com",
    "role": "SHIPPER",
    "tenantId": "<uuid>"
  }
}
```
Also sets `Set-Cookie: refreshToken=<token>; HttpOnly; SameSite=Strict`

---

### POST /auth/login

**Request:**
```json
{ "email": "user@example.com", "password": "secret123" }
```

**Response `200`:** Same shape as `/register`. Sets refresh cookie.

---

### POST /auth/refresh

Exchange a valid refresh token (from HTTP-only cookie) for a new access token. Rotates the refresh token.

**Request:** No body. Refresh cookie sent automatically by browser.

**Response `200`:**
```json
{ "accessToken": "<new_jwt>", "expiresIn": 900 }
```
Sets new `Set-Cookie: refreshToken=...`

---

### POST /auth/logout

Revokes the refresh token and clears the cookie.

**Response `204`** No Content

---

## Loads (Shipper) — `/api/v1/loads`

> All endpoints require role `SHIPPER`.

### POST /loads

Create and immediately publish a load.

**Request:**
```json
{
  "originAddress1": "123 Main St",
  "originCity": "Dallas",
  "originState": "TX",
  "originZip": "75201",
  "destinationAddress1": "456 Oak Ave",
  "destinationCity": "Houston",
  "destinationState": "TX",
  "destinationZip": "77001",
  "pickupDateFrom": "2026-04-10T08:00:00Z",
  "pickupDateTo": "2026-04-10T17:00:00Z",
  "deliveryDateFrom": "2026-04-11T08:00:00Z",
  "deliveryDateTo": "2026-04-11T17:00:00Z",
  "weightLbs": 45000,
  "equipmentType": "DRY_VAN",
  "lengthFt": 48,
  "widthIn": 102,
  "heightIn": 110,
  "payRate": 2500.00,
  "payRateType": "FLAT",
  "paymentTerms": "NET_30",
  "specialRequirements": "Liftgate required",
  "overweightAcknowledged": false
}
```

- `payRateType`: `"FLAT"` or `"PER_MILE"`
- `equipmentType`: `"DRY_VAN"`, `"REEFER"`, `"FLATBED"`, `"STEP_DECK"`, etc.
- `overweightAcknowledged`: required `true` if `weightLbs` > 80,000

**Response `201`:** `LoadResponse` (see schema below)

---

### POST /loads/draft

Create a load in `DRAFT` status (not visible on board).

**Request:** Same as `POST /loads`

**Response `201`:** `LoadResponse`

---

### POST /loads/{id}/publish

Publish a draft load to make it visible on the board.

**Response `200`:** `LoadResponse`

---

### GET /loads

List the authenticated shipper's loads (paginated).

**Query params:**
- `status` — filter by status: `DRAFT`, `PUBLISHED`, `CLAIMED`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`
- `page` (default 0), `size` (default 20)

**Response `200`:**
```json
{
  "content": [ /* LoadSummaryResponse[] */ ],
  "totalElements": 42,
  "totalPages": 3,
  "number": 0
}
```

---

### GET /loads/{id}

Get full load details.

**Response `200`:** `LoadResponse`

---

### PUT /loads/{id}

Update a load (only allowed in `DRAFT` or `PUBLISHED` status).

**Request:** Same fields as `POST /loads` (all optional — partial update not supported; send full object).

**Response `200`:** `LoadResponse`

---

### PATCH /loads/{id}/cancel

Cancel a load with a reason.

**Request:**
```json
{ "cancelReason": "Shipment no longer needed" }
```

**Response `200`:** `LoadResponse`

---

### GET /loads/{id}/events

Get the immutable status timeline for a load.

**Response `200`:**
```json
[
  {
    "id": "<uuid>",
    "eventType": "CREATED",
    "actorId": "<uuid>",
    "note": null,
    "createdAt": "2026-04-04T10:00:00Z"
  }
]
```

Event types: `CREATED`, `PUBLISHED`, `CLAIMED`, `PICKED_UP`, `DELIVERED`, `CANCELLED`

---

### GET /loads/counts

Returns per-status load counts for the shipper dashboard.

**Response `200`:**
```json
{
  "DRAFT": 2,
  "PUBLISHED": 5,
  "CLAIMED": 1,
  "IN_TRANSIT": 3,
  "DELIVERED": 14,
  "CANCELLED": 1
}
```

---

## Load Board (Trucker) — `/api/v1/board`

> All endpoints require role `TRUCKER`.

### GET /board

Paginated, filterable list of `PUBLISHED` loads.

**Query params:**
- `originState` — 2-letter state/province code
- `destinationState`
- `equipmentType`
- `minWeightLbs`, `maxWeightLbs`
- `minPayRate`, `maxPayRate`
- `pickupDateFrom`, `pickupDateTo`
- `page` (default 0), `size` (default 20)

**Response `200`:** Paginated `LoadSummaryResponse[]` with profitability fields for the authenticated trucker.

---

### GET /board/available-states

Returns the list of origin and destination states that have at least one published load.

**Response `200`:**
```json
{
  "originStates": ["TX", "CA", "IL"],
  "destinationStates": ["TX", "FL", "NY"]
}
```

---

### GET /board/{id}

Get full details of a published load (or claimed load if the trucker holds it).

**Response `200`:** `LoadResponse`

---

### GET /board/my-load

Returns the trucker's currently active load (`CLAIMED` or `IN_TRANSIT`), or `null`.

**Response `200`:** `LoadResponse` or `null`

---

### GET /board/my-history

Returns the trucker's delivered and cancelled load history (paginated).

**Query params:** `page`, `size`

**Response `200`:** Paginated `LoadSummaryResponse[]`

---

### POST /board/{id}/claim

Claim a published load. Uses `SELECT FOR UPDATE` to prevent concurrent claims.

**Response `200`:** `LoadResponse` (status = `CLAIMED`, trucker contact visible)

**Response `409`:** Load already claimed.

---

### POST /board/{id}/pickup

Mark load as picked up (`CLAIMED` → `IN_TRANSIT`).

**Response `200`:** `LoadResponse`

---

### POST /board/{id}/deliver

Mark load as delivered (`IN_TRANSIT` → `DELIVERED`).

**Response `200`:** `LoadResponse`

---

### GET /board/{id}/events

Get the status timeline for a load the trucker is involved with.

**Response `200`:** Same as `GET /loads/{id}/events`

---

## Profile — `/api/v1/profile`

> Requires authentication. Both roles supported.

### GET /profile

Returns the authenticated user's full profile.

**Response `200`:**
```json
{
  "id": "<uuid>",
  "email": "user@example.com",
  "role": "TRUCKER",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "555-123-4567",
  "dotNumber": "1234567",
  "truckType": "DRY_VAN",
  "trailerType": "48_FOOT",
  "maxWeightCapacityLbs": 45000,
  "monthlyFixedCosts": 3500.00,
  "fuelCostPerGallon": 4.20,
  "milesPerGallon": 6.5,
  "maintenanceCostPerMile": 0.12,
  "monthlyMilesTarget": 10000,
  "targetMarginPerMile": 0.30,
  "notifyEmail": true,
  "notifySms": false,
  "notifyInApp": true
}
```

---

### PUT /profile

Update the authenticated user's profile. Send all fields (full update).

**Response `200`:** Updated profile (same shape as GET)

---

## Ratings — `/api/v1/ratings`

### POST /ratings/{loadId}/trucker
**Role:** SHIPPER

Rate the trucker who delivered a load.

**Request:**
```json
{ "stars": 5, "comment": "Great communication and on-time delivery." }
```

**Response `201`:** Rating record

---

### POST /ratings/{loadId}/shipper
**Role:** TRUCKER

Rate the shipper for a delivered load.

**Request:** Same as above.

**Response `201`:** Rating record

---

### GET /ratings/{loadId}/mine

Check whether the authenticated user has already rated this load.

**Response `200`:**
```json
{ "rated": true, "stars": 4, "comment": "Good experience." }
```

---

### GET /ratings/my-received

List all ratings the authenticated user has received.

**Response `200`:** `Rating[]`

---

### GET /ratings/my-summary

Get the authenticated user's aggregate rating.

**Response `200`:**
```json
{ "averageStars": 4.7, "totalRatings": 23 }
```

---

### GET /ratings/trucker/{userId}/summary

Public summary for any trucker (authenticated access).

**Response `200`:** Same as `/my-summary`

---

### GET /ratings/shipper/{userId}/profile

Public reputation profile for a shipper.

**Response `200`:**
```json
{
  "averageStars": 4.5,
  "totalRatings": 12,
  "totalLoadsPosted": 45,
  "paymentSpeed": "NET_30"
}
```

---

## Notifications — `/api/v1/notifications`

> Requires authentication.

### GET /notifications

List the authenticated user's notifications (paginated).

**Query params:** `page`, `size`, `unreadOnly` (boolean)

**Response `200`:**
```json
[
  {
    "id": "<uuid>",
    "type": "LOAD_CLAIMED",
    "content": "Trucker John Smith claimed your load to Houston.",
    "readAt": null,
    "createdAt": "2026-04-04T14:00:00Z"
  }
]
```

Notification types: `LOAD_CLAIMED`, `LOAD_PICKED_UP`, `LOAD_DELIVERED`, `LOAD_CANCELLED`

---

### GET /notifications/unread-count

**Response `200`:** `{ "count": 3 }`

---

### PATCH /notifications/{id}/read

Mark a single notification as read.

**Response `200`:** Updated notification

---

### PATCH /notifications/read-all

Mark all notifications as read.

**Response `204`** No Content

---

## Documents — `/api/v1/documents`

> Stubs — not fully functional end-to-end (S3 storage not provisioned).

### GET /documents/{loadId}

List all documents for a load.

**Response `200`:**
```json
[
  {
    "id": "<uuid>",
    "documentType": "BOL_GENERATED",
    "originalFilename": "bol-load-abc.pdf",
    "fileSizeBytes": 102400,
    "createdAt": "2026-04-04T10:00:00Z"
  }
]
```

Document types: `BOL_GENERATED`, `BOL_PHOTO`, `POD_PHOTO`, `ISSUE_PHOTO`

---

### POST /documents/{loadId}/bol-photo
**Role:** TRUCKER

Upload a BOL photo (multipart/form-data). Required before marking as picked up.

**Request:** `multipart/form-data` with `file` field.

**Response `201`:** Document record

---

### POST /documents/{loadId}/pod-photo
**Role:** TRUCKER

Upload a POD photo (multipart/form-data). Required before marking as delivered.

**Request:** `multipart/form-data` with `file` field.

**Response `201`:** Document record

---

### POST /documents/{loadId}/issue
**Role:** TRUCKER

Report an in-transit issue with optional photo.

**Request:** `multipart/form-data` with `description` (text) and optional `file` field.

**Response `201`:** Document record

---

### GET /documents/file/{documentId}

Download a document file.

**Response `200`:** File content (binary stream, `Content-Type` set per file)

---

### GET /documents/{loadId}/export

Export a full load PDF (load details + timeline).

**Response `200`:** PDF binary stream *(stub — not yet implemented)*

---

## Market Data — `/api/v1/market`

> Public — no authentication required.

### GET /market/diesel-prices

Returns current national diesel prices from the EIA Open Data API v2. Cached server-side for 6 hours.

**Response `200`:**
```json
{
  "west": {
    "price": 4.21,
    "previousPrice": 4.18,
    "delta": 0.03,
    "weekEnding": "2026-03-31"
  },
  "south": {
    "price": 3.98,
    "previousPrice": 4.05,
    "delta": -0.07,
    "weekEnding": "2026-03-31"
  },
  "stale": false,
  "cachedAt": "2026-04-04T10:00:00Z"
}
```

- `stale: true` when cache age > 48 hours
- `delta` is positive (price increased) or negative (price decreased)

---

## Common Response Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `204` | Success, no content |
| `400` | Validation error — check `errors` array in response body |
| `401` | Missing or invalid access token |
| `403` | Authenticated but wrong role for this endpoint |
| `404` | Resource not found (or not visible to this tenant) |
| `409` | Conflict — e.g., load already claimed |
| `429` | Rate limit exceeded (auth endpoints only) |
| `500` | Internal server error |

### Error Response Shape (`4xx`)
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "weightLbs", "message": "must be greater than 0" }
  ]
}
```

---

## `LoadResponse` Schema

```json
{
  "id": "<uuid>",
  "status": "PUBLISHED",
  "shipper": { "id": "<uuid>", "name": "Acme Freight", "phone": "..." },
  "trucker": null,
  "originAddress1": "123 Main St",
  "originAddress2": null,
  "originCity": "Dallas",
  "originState": "TX",
  "originZip": "75201",
  "destinationAddress1": "456 Oak Ave",
  "destinationAddress2": null,
  "destinationCity": "Houston",
  "destinationState": "TX",
  "destinationZip": "77001",
  "pickupDateFrom": "2026-04-10T08:00:00Z",
  "pickupDateTo": "2026-04-10T17:00:00Z",
  "deliveryDateFrom": "2026-04-11T08:00:00Z",
  "deliveryDateTo": "2026-04-11T17:00:00Z",
  "weightLbs": 45000,
  "equipmentType": "DRY_VAN",
  "lengthFt": 48,
  "widthIn": 102,
  "heightIn": 110,
  "payRate": 2500.00,
  "payRateType": "FLAT",
  "paymentTerms": "NET_30",
  "distanceMiles": 245,
  "specialRequirements": null,
  "cancelReason": null,
  "overweightAcknowledged": false,
  "createdAt": "2026-04-04T10:00:00Z",
  "updatedAt": "2026-04-04T10:00:00Z"
}
```

> Trucker contact info (`trucker` field) is populated only after the load is `CLAIMED`.
