
To equip your team with the necessary specifications, I have broken down the dashboard into its functional components. Each section below defines the **Purpose**, **User Interaction**, **Expected Data/API Payload**, and **System Behavior**.

### **Functional Specification: Dashboard Component Mapping**

|**Section**|**Purpose**|**Data Expected**|**Functional Behavior**|
|---|---|---|---|
|**Global Header**|Identity & Alerts|`User Session`, `Unread Count`|Displays branding and the **Tiered Notification Bell**. Bell click triggers an overlay listing alerts sorted by urgency (T1 > T3).|
|**KPI Module**|Business Health|`Integer` (Active Shipments), `Decimal` (Cost/Mile), `Percentage` (On-Time)|Fixed-position cards. Data must be aggregated from the `ShipperReputation` and load service APIs.|
|**Shipment List**|Ops Management|`LoadID` (UUID), `Status` (Enum), `Rating` (Float)|**Status-First** ordering: Delayed (Red) > Claimed (Yellow) > Delivered (Green). Clicking a row opens a "Details Drawer."|
|**Action Zone**|Workflow Start|`N/A` (Buttons)|Houses primary actions. "Create New Load" opens a form with **SH-CRIT-1** validation (State = 2-letter dropdown).|
|**Carrier Search**|Network Access|`State` (Dropdown), `Equipment Type` (Enum)|User input fields. On click, triggers a filtered query through `TenantContextHolder` to show only relevant carriers.|
|**Preferred Feed**|Rapid Assignment|`Name` (String), `Rating` (Star), `Availability` (Bool)|Displays trusted operators. "Assign Load" button triggers an immediate `POST` request to lock the load to the selected trucker.|

### **Detailed Functional Logic for Key Components**

#### **1. The "Operational" Shipment List (Data Requirements)**

- **Source:** The backend must fetch data using a `GET` request filtered by the current `TenantContextHolder` to ensure multi-tenancy isolation.
    
- **Logic:** The list must implement **Lazy Loading**. For the first 20 records, it fetches and renders. As the user scrolls to the end, the frontend triggers a subsequent fetch for the next page of results.
    
- **Visual Logic:** The "Progress" visual is a simple range calculation (`percentage_complete = (current_steps / total_steps) * 100`).
    

#### **2. "Get a Quote" Workflow**

- **Data Inputs:** * `Origin_State` (2-letter dropdown), `Destination_State` (2-letter dropdown).
    
    - `Weight` (Decimal/Numeric).
        
    - `Equipment_Type` (Dropdown: Flatbed, Reefer, Box Truck).
        
- **Backend Process:** This triggers a call to the historical freight pricing engine.
    
- **Output:** Returns a formatted `Currency` string. If the user proceeds to "Publish Load," the system must call the BOL (Bill of Lading) generation service to return a PDF document URL.
    

#### **3. Critical Validation Rules (Phase 7 Compliance)**

These must be enforced at the UI/API level to prevent data corruption:

- **State Integrity:** No free-text input is allowed for locations. The UI must strictly bind the State field to a validated `[XX]` 2-letter code dropdown.
    
- **Cancellation Safety:** Any user attempt to delete a load in `CLAIMED` status must result in the following UI interaction:
    
    1. User clicks "Cancel."
        
    2. System triggers a blocking Modal: _"This will notify the assigned trucker and free their load slot. Are you sure?"_
        
    3. Only on "Confirm" does the `SOFT DELETE` (archival) execute in the DB.
        

#### **4. Notification Tiering Logic (for the Bell Icon)**

The Bell notification dropdown needs to handle different API payload structures:

- **Urgent (T2):** Payload contains `severity: "URGENT"` and `action_required: true`. These must be highlighted with a red background in the dropdown.
    
- **Informational (T3):** Payload contains `severity: "INFO"`. These are displayed as standard text items.
    

### **Recommendations for the BA Team**

1. **Define the "Empty State":** What does the screen look like for a new shipper with 0 active loads? (Recommendation: Show a "Start by creating your first load" prompt with a call-to-action button).
    
2. **Performance Budgets:** Since this is a dashboard for office workers, ensure the load list refresh rate is optimized. (Recommendation: Poll for updates every 30-60 seconds, or use WebSockets for real-time status changes).
    
3. **Permission Tiers:** Does the "Assign Load" button in the Preferred Carrier Feed appear for all users, or only for account managers?
    
