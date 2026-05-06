# Shipper Persona
**Version:** 1.0  
**Last Updated:** 2026-04-27  
**Status:** Phase 7 Foundation  

---

## 📋 Persona Overview

A **Shipper** is a freight company (or freight broker) that posts loads to the board for owner/operators to claim. They need trust signals—payment speed, reliability, equipment quality—to make confident decisions about which carriers to use.

---

## 🔴 [CRITICAL] Validation Flags (Phase 7)

| Flag | Requirement | Source | Validation Rule | Phase | Status |
|------|-------------|--------|-----------------|-------|--------|
| **SH-CRIT-1** | State as 2-letter code (dropdown validation) | 59 | User selects state from dropdown; no free text | 7 | ✅ US-706 |
| **SH-CRIT-2** | Cancel confirmation dialog | 60 | Cancelling load must show: "This will notify the trucker and free their load slot" | 7 | ⚠️ Pending AC |
| **SH-CRIT-3** | Average payment speed (90-day) | 183 | Must calculate: avg(payment_confirmed_at - delivered_at) over last 90 days | 7b | 🔴 US-712 |

---

## 📊 Core Domain Fields (Phase 7)

### Shipper Account Profile
**Entity:** `Shipper`  
**Scope:** Shipper company details and settings

| Field | Type | Constraints | Validation |
|-------|------|-------------|-----------|
| `id` | VARCHAR(36) UUID | PK, NOT NULL | UUID4 |
| `tenantId` | VARCHAR(36) UUID | NOT NULL, FK | Implicit via TenantContextHolder |
| `userId` | VARCHAR(36) UUID | NOT NULL, FK → User | Must be SHIPPER role |
| `companyName` | VARCHAR(255) | NOT NULL | Non-empty |
| `state` | CHAR(2) | NOT NULL | **[SH-CRIT-1]** Two-letter code (AL, CA, TX, etc.) |
| `phone` | VARCHAR(20) | NOT NULL | E.164 format; validated |
| `paymentMethod` | ENUM | NOT NULL | ACH, CREDIT_CARD, CHECK |
| `paymentCycle` | ENUM | NOT NULL | IMMEDIATE, NET_7, NET_14, NET_30 |
| `createdAt` | TIMESTAMPTZ | NOT NULL | Immutable |
| `updatedAt` | TIMESTAMPTZ | NOT NULL | Updated on edit |
| `deletedAt` | TIMESTAMPTZ | NULLABLE | Soft delete |

**Validation Rules:**
- `state` must be selected from predefined 50-state + DC dropdown (no free text)
- `phone` must be valid E.164 format
- `paymentCycle` defaults to NET_7 (safest for truckers)
- Cannot delete shipper account with active CLAIMED loads

---

### Shipper Reputation (Value Object / Separate Table)
**Entity:** `ShipperReputation`  
**Scope:** Trust metrics visible to truckers on the load board

| Field | Type | Constraints | Validation |
|-------|------|-------------|-----------|
| `id` | VARCHAR(36) UUID | PK, NOT NULL | UUID4 |
| `tenantId` | VARCHAR(36) UUID | NOT NULL, FK | Implicit |
| `shipperId` | VARCHAR(36) UUID | NOT NULL, FK | Must exist |
| `averagePaymentSpeedDays` | DECIMAL(5,2) | NULLABLE | **[SH-CRIT-3]** Calculated over last 90 days |
| `completedLoadCount` | INT | NOT NULL | >= 0; total DELIVERED loads |
| `cancelledLoadCount` | INT | NOT NULL | >= 0; loads cancelled while CLAIMED |
| `openDisputeCount` | INT | NOT NULL | >= 0; payment disputes not resolved |
| `lastCalculatedAt` | TIMESTAMPTZ | NULLABLE | When metrics were last updated |
| `createdAt` | TIMESTAMPTZ | NOT NULL | Immutable |
| `updatedAt` | TIMESTAMPTZ | NOT NULL | Updated on metric change |
| `deletedAt` | TIMESTAMPTZ | NULLABLE | Soft delete |

**Validation Rules:**
- `averagePaymentSpeedDays` is nullable (new shipper); if set, must be >= 0
- `completedLoadCount` must be non-negative
- `cancelledLoadCount` must be non-negative
- `openDisputeCount` must be non-negative
- Metrics are read-only (updated via background event handler, not user-facing API)

---

## 📋 Reputation Metrics Explained

### Average Payment Speed [SH-CRIT-3]
**Calculation:**
```sql
SELECT AVG(EXTRACT(EPOCH FROM (payment_confirmed_at - delivered_at)) / 86400)
FROM payments
WHERE shipper_id = ?
  AND payment_confirmed_at IS NOT NULL
  AND delivered_at IS NOT NULL
  AND delivered_at >= NOW() - INTERVAL '90 days'
  AND deleted_at IS NULL
```

**Display Logic:**
```java
if (completedLoadCount == 0) {
  return "New shipper — no rating yet";
}
if (averagePaymentSpeedDays == null) {
  return "No completed payments";
}
int days = (int) Math.round(averagePaymentSpeedDays);
return String.format("Typically pays in %d day%s", days, days == 1 ? "" : "s");
```

**Risk Indicators:**
- **New Shipper:** `completedLoadCount < 3` → Flag for trucker caution
- **High Risk:** `cancelledLoadCount > 2` OR `openDisputeCount > 2` → Red badge
- **Unreliable Payer:** `averagePaymentSpeedDays > 30` → Yellow badge

---

## 📋 Load Posting Flow

### Posting Validation [SH-CRIT-1, SH-CRIT-2]

**Step 1: Validate State Code**
```java
// State must be from dropdown, not free text
if (!US_STATES.contains(request.getState())) {
  throw new ValidationException("Invalid state. Must select from dropdown.");
}
```

**Step 2: Warn on Cancellation**
**[SH-CRIT-2]** When shipper clicks "Cancel Load" (if load is CLAIMED):
```
┌─────────────────────────────────────┐
│ ⚠️  Cancel Load?                     │
├─────────────────────────────────────┤
│ This will notify the assigned        │
│ trucker and free their load slot.    │
│                                      │
│ [Cancel] [Keep Load]                │
└─────────────────────────────────────┘
```

**Backend validation:**
```java
if (load.getStatus() == LoadStatus.CLAIMED) {
  if (!userConfirmedCancellation) {
    throw new CancellationConfirmationRequired();
  }
  // Send event: LoadCancelledEvent(loadId, truckerId)
  // Trucker receives notification
}
```

---

## 🏢 Preferred Carrier Management

### Preferred Carrier List (Optional Feature)
**Entity:** `PreferredCarrier`  
**Scope:** Curated list of trusted truckers for direct assignment

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | VARCHAR(36) UUID | PK |
| `shipperId` | VARCHAR(36) UUID | FK → User |
| `truckerId` | VARCHAR(36) UUID | FK → User |
| `tenantId` | VARCHAR(36) UUID | Implicit |
| `addedAt` | TIMESTAMPTZ | Immutable |
| `deletedAt` | TIMESTAMPTZ | Soft delete |

**Rules:**
- Shipper can add any O/O to preferred list (no reciprocal needed)
- Shipper can direct-assign loads to preferred carriers (bypasses open board)
- Removal is soft-delete (audit trail)

---

### Blocked Carrier List (Optional Feature)
**Entity:** `BlockedCarrier`  
**Scope:** Carriers hidden from this shipper's board visibility

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | VARCHAR(36) UUID | PK |
| `shipperId` | VARCHAR(36) UUID | FK → User |
| `truckerId` | VARCHAR(36) UUID | FK → User |
| `tenantId` | VARCHAR(36) UUID | Implicit |
| `reason` | TEXT | NULLABLE; e.g., "Poor equipment condition" |
| `blockedAt` | TIMESTAMPTZ | Immutable |
| `deletedAt` | TIMESTAMPTZ | Soft delete |

**Rules:**
- Shipper can block any O/O (prevents them from seeing shipper's future loads)
- Blocked carriers cannot claim shipper's open loads
- Soft delete preserves audit trail

---

## 🔐 Multi-Tenancy & RLS

**Critical Rule:** All queries must include implicit tenant filtering via `TenantContextHolder`.

**Option 2 Pattern (DTO + TenantContextHolder):**
```java
// Service layer implicitly uses tenant context
@Cacheable("shipperReputation", key="#shipperId", ttl=3600)
public ShipperReputation getShipperReputation(String shipperId) {
  String tenantId = TenantContextHolder.getTenantId();
  return repository.findByTenantIdAndShipperId(tenantId, shipperId);
}
```

**Repository Layer (RLS-Aware):**
```java
public interface ShipperReputationRepository extends JpaRepository<...> {
  ShipperReputation findByTenantIdAndShipperIdAndDeletedAtIsNull(
      String tenantId, String shipperId);
  
  @Query("SELECT s FROM ShipperReputationEntity s " +
         "WHERE s.tenantId = ?1 AND s.shipperId = ?2 AND s.deletedAt IS NULL")
  ShipperReputation findActiveReputation(String tenantId, String shipperId);
}
```

---

## ✅ Phase 7 Implementation Checklist

- [x] **SH-CRIT-1:** State dropdown validation (US-706)
- [ ] **SH-CRIT-2:** Cancel confirmation dialog AC (US-706)
- [ ] **SH-CRIT-3:** Average payment speed (90-day) (US-712)
- [x] **Preferred Carriers:** Infrastructure ready (US-707/708)
- [x] **Blocked Carriers:** Infrastructure ready (US-709)
- [x] **Public Profile:** Ready for visibility (US-710)

---

## 📚 Related Stories
- **US-706:** Load Posting Validation Prompts (Shipper)
- **US-707:** Shipper Preferred Carrier List
- **US-708:** Direct Load Assignment to Carrier
- **US-709:** Block Carrier (Prevent Visibility)
- **US-710:** View Carrier Public Profile (History)
- **US-712:** View Shipper Public Profile (Payment Speed, Rating)
