
# Functional Specification: FreightClub Shipper Dashboard (v1.0)

## 1. Project Overview

The objective is to deploy a high-efficiency Shipper Dashboard that functions as a "Command Center." The interface must allow for **high-density data monitoring** and **rapid operational execution** on laptop displays. The core aesthetic is the **"Classic Cream & Metallic Bronze"** brand identity.

## 2. Global System Requirements (Non-Negotiables)

- **Multi-Tenant Isolation:** All data queries must pass through the `TenantContextHolder` to ensure no cross-company data leakage.
    
- **Data Integrity:** Use "Soft Deletes" for all load removals; audit trails must be maintained.
    
- **Performance:** The UI must support high-volume load lists via a **pinned header** and **scrollable operational container** to prevent page bloating.
    

## 3. UI/UX Style Directives

- **Canvas:** `#EFEBE0` (Classic Cream).
    
- **Containers:** `#FFFFFF` (Flat White).
    
- **Actions:** Dimensional metallic bronze gradient with inner shadow/gloss.
    
- **Typography:** Sans-serif (Inter/Roboto) with high-contrast `#1A1A1A` for data.
    
- **Responsiveness:** The layout must be fluid. When load counts exceed viewable space, the system must trigger a localized scroll bar rather than expanding the page height.
    

## 4. Functional Module Requirements

|**Module**|**Purpose**|**Functional Requirements**|
|---|---|---|
|**Header (Global)**|Navigation/Alerts|Incorporate **Tiered Notification Bell** (Logic: Red = Critical/Urgent, Standard = Informational).|
|**KPI Summary**|Business Health|Must display: `Active Shipments`, `Est. Cost/Mile`, `On-Time Rate`. Real-time data sync required.|
|**Shipment Status**|Ops Monitoring|Must be **"Status-First"** ordered (Delayed > Claimed > Delivered). Must utilize row-level actions for tracking.|
|**Action Zone**|Workflow|Quick access to "Create New Load," "Get Quote," "Carrier Network," "Documents Portal."|
|**Carrier Feed**|Partnership|Display preferred carriers with "Assign Load" shortcut buttons for friction-free booking.|

## 5. Critical Validation Matrix (Phase 7)

_BA team must implement these as strictly enforced validation rules:_

|**ID**|**Feature**|**Rule**|
|---|---|---|
|**SH-CRIT-1**|State Input|**Must** be a dropdown selection (2-letter code). No free-text allowed.|
|**SH-CRIT-2**|Cancel Load|Must trigger modal: _"This will notify the trucker and free their load slot"_.|
|**SH-CRIT-3**|Trust Metrics|Display 90-day avg payment speed (formula: `avg(payment_confirmed_at - delivered_at)`).|

## 6. Workflow Definitions

### **A. "Get a Quote" Workflow**

1. **Input:** Shipper enters Origin, Destination, Weight, Equipment Type.
    
2. **Processing:** System calls pricing engine (historical data + regional fuel benchmarks).
    
3. **Output:** Display estimated market rate.
    
4. **Conversion:** Provide immediate button to "Publish Load" which auto-generates the Bill of Lading (BOL).
    

### **B. Tiered Notification Logic**

- **T1 (Critical):** Modal pop-up (e.g., Hazmat alert, load cancellation).
    
- **T2 (Urgent):** Bell dropdown (Red indicator) (e.g., Reported issue on active load).
    
- **T3 (Informational):** Standard badge (e.g., Load delivered, payment confirmed).
    

## 7. BA Action Items

1. **Map the Permissions:** Define what standard team members can see vs. account owners regarding sensitive financial/reputation data.
    
2. **Define Edge Cases:** What happens to the "On-Time Rate" or "Payment Speed" if the shipper is brand new (0 data points)? Define the "Empty State" UI.
    
3. **Audit Logs:** Ensure the BA defines the logging requirements for every "Soft Delete" action taken by a user.