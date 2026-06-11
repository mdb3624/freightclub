# UI Design: Load Status Transitions (US-105)

**Role:** Human Factors Designer  
**Story:** US-105  
**Status:** DESIGN_APPROVED

---

## 🎨 Design Philosophy

The transition from "Claimed" to "Delivered" is a critical real-world milestone. The UI must prevent accidental transitions while ensuring the trucker knows exactly *why* an action is blocked (the "Document Gate").

### Key Interaction Patterns
1. **The Document Gate:** Buttons for "Mark as Picked Up" and "Mark as Delivered" remain in a `disabled` state with clear instructional tooltips until the required photo (BOL or POD) is detected in the document list.
2. **Double-Confirmation:** A non-modal, inline confirmation banner appears when an action is triggered to prevent fat-finger errors on mobile devices in high-glare environments.
3. **Status Feedback:** Immediate navigation to the dashboard provides closure to the trucker.

---

## 📱 Component Layout (TruckerLoadDetailPage)

### 1. State: CLAIMED (Awaiting Pick Up)
- **Document Section:** Prominently displays "BOL Photo Required".
- **Action Button (Primary):**
  - Label: `Upload BOL Photo to Continue` (if `!hasBolPhoto`)
  - Label: `Mark as Picked Up` (if `hasBolPhoto`)
  - Variant: `Primary`
- **Confirmation:** Inline banner with amber warning background.

### 2. State: IN_TRANSIT (Awaiting Delivery)
- **Document Section:** Prominently displays "POD Photo Required".
- **Action Button (Primary):**
  - Label: `Upload POD Photo to Continue` (if `!hasPodPhoto`)
  - Label: `Mark as Delivered` (if `hasPodPhoto`)
  - Variant: `Primary`
- **Confirmation:** Inline banner with amber warning background.

---

## ♿ Accessibility & HFD Standards

- **Touch Targets:** All action buttons are a minimum of `48px` height (exceeding the `44px` sm/md standard).
- **Color Contrast:** Confirmation banners use `amber-50` background with `amber-900` text to ensure readability in sunlight.
- **ARIA Labels:** Dialog-role wrappers around the confirmation banner with `aria-labelledby` for screen readers.
- **Micro-copy:** Action-oriented text like "Yes, I have the load" instead of generic "OK".

---

## 📊 UI Contract Verification

| UI Element | Property | Mapping |
| :--- | :--- | :--- |
| **Pickup Button** | `disabled` | `!hasBolPhoto` |
| **Delivery Button** | `disabled` | `!hasPodPhoto` |
| **Confirm Banner** | `role` | `dialog` |
| **Loading State** | `isLoading` | `isPickingUp || isDelivering` |

---

## Sign-Off

- **HFD:** ✅ Design complete (Gemini CLI)
- **Architect:** ✅ Design aligned
- **Coder:** ⬜ Ready for Implementation
