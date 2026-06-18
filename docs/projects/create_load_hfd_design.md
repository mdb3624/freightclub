# UI/UX Design Specification: Load Creation Interface (US-103-v2)

**To:** HFD and CODER Teams

**From:** Lead UI/UX Human Factors Engineer

**Subject:** Implementation Specification for Load Creation Workflow

**Date:** 2026-06-17

As we migrate the Load Creation workflow to the **Phase 10 Command Center**, this design prioritizes the "2-minute load" goal for power users. We will leverage the **"Classic Cream & Metallic Bronze"** aesthetic defined in the _Shipper & Administrator Style Guide_ to ensure cognitive load is minimized through consistent, high-contrast, and density-optimized UI patterns.

## 1. Visual Hierarchy & Layout Strategy

Following the **Asymmetric Split Grid** pattern, the load creation interface will prioritize vertical flow for the primary input fields while maintaining a fixed "Summary/Actions" sidebar on the right to provide immediate feedback on calculated fields (e.g., Distance, Estimated Total).

### 1.1 Container & Surface Logic

- **Canvas:** `#EFEBE0` (Classic Cream).
    
- **Form Modules:** All inputs must be contained within "Widget Cards" ().
    
    - **Border:** 1px solid `#D0D0D0`.
        
    - **Radius:** 8px.
        
    - **Padding:** 24px (space-lg).
        

### 1.2 Form Component Specifications

Every input component must strictly adhere to the **Atomic Specifications** (Phase 10+):

- **Input Height:** 40px.
    
- **Border Radius:** 4px.
    
- **Focus State:** 2px border in `#B08D57` (Brand Bronze).
    
- **Helper Text:** 12px, italic, `#636E72`.
    

## 2. Workflow Interaction Design (US-103-v2)

### 2.1 The "Quick-Load" Interaction Loop

To facilitate the 2-minute creation goal, we utilize a **Multi-Stage Vertical Progression**:

1. **Address Identification (AC-2, AC-9):** Use a combined "Type/Search" input. Typing triggers an auto-complete search of the user's specific `tenant_id` Address Book.
    
    - _System Hint:_ If no match, display "Save to Address Book?" toggle.
        
2. **Date/Time Validation (AC-3):** Inputs must use a unified date-time picker. Validation occurs _on-blur_ of the final window field, triggering red inline errors if the logic (`Earliest Pickup < Latest Delivery`) is violated.
    
3. **Cargo & Regulatory (AC-4, AC-5):**
    
    - **Weight Input:** Number input with suffix "lbs".
        
    - **Overweight Logic:** If input > 80,000, immediately inject an `alert-warning` block containing the checkbox for permit acknowledgment. **Color:** `#F39C12` (Safety Amber).
        

### 2.2 Responsive Feedback (AC-7, AC-8, AC-10)

- **Distance/Total Calculation:** Located in the right-hand persistent sidebar. Updates in real-time as the user tabs through inputs.
    
- **Submission State:** The "Create Load" button must feature a loading spinner. Upon success, navigate to the Dashboard and trigger a toast notification or highlight the newly created row in the Shipment Status Panel (US-822).
    

## 3. Atomic UI Components Checklist

| **Component**      | **Specification**                                         | **Reference** |
| ------------------ | --------------------------------------------------------- | ------------- |
| **Primary Button** | Metallic Bronze gradient, rounded 4px-8px, shadow enabled |               |
| **Semantic Error** | Text color: `#E74C3C` (Danger Red)                        |               |
| **Grid Spacing**   | Multiple of 8px (e.g., 16px vertical gap)                 |               |
| **Typography**     | Inter/Roboto (UI), Sora (Headings)                        |               |

## 4. Engineering & Governance Mandates

**CRITICAL NOTE TO HFD/CODER:**

The following constraints are non-negotiable for Phase 10 integration:

- **Spacing:** All padding/margin/gap values must be multiples of 8px (4, 8, 16, 24, 32). Any other values (e.g., 10px, 12px) will be flagged as **Defects** by the Design System Governance.
    
- **Row/Input Heights:** Form inputs MUST be 40px, and Table rows MUST be 48px.
    
- **Color Palette:** You are strictly forbidden from using custom hex codes. Use only the semantic colors defined in §6.1.
    

> **UX Expert Note:** The design must ensure that the "Address Book" feature (AC-9) is clearly distinct from free-text entry to ensure users don't inadvertently create duplicate entries. Using a distinct icon (e.g., a "saved" bookmark icon) for address book entries is recommended.

How would you like to proceed with the wireframing of the "Address Book" integration—would you like a high-fidelity mockup of the dropdown interaction or a flowchart detailing the `tenant_id` filtering logic?