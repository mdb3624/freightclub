# Component Specification: Carrier Profiles UI (US-701)

**Purpose:** Detailed implementation spec for React components (Vite + React Query + Tailwind)  
**Status:** ✅ CODER_READY

---

## Component Tree

```
<CarrierProfileHub />
  ├── <ProfileHeader /> (Status + ratings)
  ├── <TabNav /> (Equipment | Lanes | Availability)
  │
  ├── [EQUIPMENT TAB]
  │   ├── <EquipmentList />
  │   │   └── <EquipmentCard /> (repeating)
  │   └── <AddEquipmentButton />
  │       └── <EquipmentModal />
  │           └── <EquipmentForm />
  │
  ├── [LANES TAB]
  │   ├── <LaneList />
  │   │   └── <LaneCard /> (repeating)
  │   └── <AddLaneButton />
  │       └── <LaneModal />
  │           └── <LaneForm />
  │
  └── [AVAILABILITY TAB]
      └── <AvailabilityCard />
          └── <AvailabilityForm />

<PublicCarrierProfile /> (Shipper-facing)
  ├── <ProfileHeader /> (Name + rating)
  ├── <EquipmentSummary />
  ├── <LanesSummary />
  ├── <HistorySummary />
  └── <ActionButtons /> (Contact, View History)
```

---

## Component Specifications

### 1. CarrierProfileHub (Container)

**Props:** None (uses React Query hooks)

**State:**
- `activeTab`: "equipment" | "lanes" | "availability"
- `isLoading`: boolean
- `error`: string | null

**Data Hooks:**
```typescript
const { data: equipment, isLoading: eqLoading } = useQuery({
  queryKey: ['equipment', truckerId],
  queryFn: () => getEquipment(truckerId),
});

const { data: lanes, isLoading: laneLoading } = useQuery({
  queryKey: ['lanes', truckerId],
  queryFn: () => getLanes(truckerId),
});

const { data: availability, isLoading: avLoading } = useQuery({
  queryKey: ['availability', truckerId],
  queryFn: () => getAvailability(truckerId),
});
```

**Accessibility:**
```html
<main role="main" aria-label="Carrier Profile Management">
  <h1>My Carrier Profile</h1>
  <nav aria-label="Profile tabs">
    <ul role="tablist">
      <li role="presentation">
        <button role="tab" aria-selected={activeTab === 'equipment'}>
          Equipment
        </button>
      </li>
    </ul>
  </nav>
</main>
```

---

### 2. EquipmentForm (Modal)

**Props:**
```typescript
interface EquipmentFormProps {
  equipment?: CarrierEquipmentDTO;
  onSubmit: (data: CarrierEquipmentDTO) => Promise<void>;
  onCancel: () => void;
}
```

**Validation Schema (Zod):**
```typescript
const equipmentSchema = z.object({
  equipmentType: z.enum(['FLATBED', 'DRY_VAN', 'REFRIGERATED', 'TANKER', 'SPECIALIZED']),
  lengthFeet: z.number().min(1, "Length must be positive"),
  widthFeet: z.number().min(1, "Width must be positive"),
  heightFeet: z.number().min(1, "Height must be positive"),
  capacityLbs: z.number().min(1, "Capacity must be positive"),
  equipmentCondition: z.enum(['GOOD', 'FAIR', 'NEEDS_REPAIR']),
  yearModel: z.string().optional(),
});
```

**Tailwind Classes (Dark Mode):**
```css
Form Background: bg-slate-800
Input Fields: bg-slate-900 border-slate-700 text-white
Labels: text-slate-100
Helper Text: text-slate-400
Error Text: text-red-400
Success Button: bg-blue-600 hover:bg-blue-700 text-white
Touch Target: h-12 (48px minimum)
```

**Accessibility:**
```html
<form aria-label="Add Equipment">
  <fieldset>
    <legend>Equipment Type *</legend>
    <select aria-required="true" aria-label="Equipment type">...</select>
  </fieldset>
  <fieldset>
    <legend>Dimensions (feet) *</legend>
    <input aria-label="Length in feet" type="number" required />
  </fieldset>
  {errors.lengthFeet && (
    <p role="alert" className="text-red-400">
      {errors.lengthFeet.message}
    </p>
  )}
</form>
```

---

### 3. LaneForm (Modal)

**Props:**
```typescript
interface LaneFormProps {
  lane?: CarrierLaneDTO;
  onSubmit: (data: CarrierLaneDTO) => Promise<void>;
  onCancel: () => void;
}
```

**Validation Schema (Zod):**
```typescript
const laneSchema = z.object({
  originRegion: z.string().min(1, "Origin region required"),
  destinationRegion: z.string().min(1, "Destination region required"),
  minRateCents: z.number().optional(),
  frequencyPreference: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'ANY']),
});
```

**Region Options (Select Dropdown):**
```typescript
const regionOptions = [
  "Southeast",
  "California",
  "Texas",
  "Northeast",
  "Midwest",
  "Great Plains",
  "Southwest",
];
```

---

### 4. AvailabilityForm (Card)

**Props:**
```typescript
interface AvailabilityFormProps {
  availability?: CarrierAvailabilityDTO;
  onSubmit: (data: CarrierAvailabilityDTO) => Promise<void>;
}
```

**Validation Schema (Zod):**
```typescript
const availabilitySchema = z.object({
  availableDays: z.enum(['MON_FRI', 'WEEKENDS', 'MON_SUN', 'CUSTOM']),
  availableStartTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM
  availableEndTime: z.string().regex(/^\d{2}:\d{2}$/),
  timeZone: z.enum(['EST', 'CST', 'MST', 'PST']),
  currentlyOnLoad: z.boolean(),
});
```

**Time Input Component:**
- Use native HTML `<input type="time" />` for mobile optimization
- Display as HH:MM (24-hour format)

**Status Badge (Real-time):**
```typescript
function getStatusBadge(availability: CarrierAvailabilityDTO) {
  if (availability.currentlyOnLoad) {
    return <span className="bg-amber-500 text-white px-3 py-1 rounded">🟡 On Load</span>;
  }
  const isAvailable = isCurrentlyAvailable(availability);
  return isAvailable 
    ? <span className="bg-teal-500 text-white px-3 py-1 rounded">🟢 Available</span>
    : <span className="bg-red-500 text-white px-3 py-1 rounded">🔴 Unavailable</span>;
}
```

---

### 5. EquipmentCard (Read-Only)

**Props:**
```typescript
interface EquipmentCardProps {
  equipment: CarrierEquipmentDTO;
  onEdit: (equipment: CarrierEquipmentDTO) => void;
  onDelete: (equipmentId: string) => void;
}
```

**Layout:**
```
┌─────────────────────────────────┐
│ 🚛 Flatbed 48'                  │
│ Capacity: 45,000 lbs            │
│ Condition: ✓ Good               │
│ [Edit] [Delete]                 │
└─────────────────────────────────┘
```

**Tailwind:**
```css
Card: bg-slate-900 border border-slate-700 rounded-lg p-4
Title: text-white font-bold text-lg
Metadata: text-slate-300 text-sm
Buttons: bg-blue-600 hover:bg-blue-700 h-10 px-4 rounded
```

---

### 6. LaneCard (Read-Only)

**Props:**
```typescript
interface LaneCardProps {
  lane: CarrierLaneDTO;
  onEdit: (lane: CarrierLaneDTO) => void;
  onDelete: (laneId: string) => void;
}
```

**Layout:**
```
┌────────────────────────────┐
│ SE → CA                    │
│ Min Rate: $1.75/mi         │
│ Frequency: Weekly          │
│ [Edit] [Deactivate]        │
└────────────────────────────┘
```

---

### 7. PublicCarrierProfile (Read-Only, Shipper-Facing)

**Props:**
```typescript
interface PublicCarrierProfileProps {
  truckerId: string;
}
```

**Data Hooks:**
```typescript
const { data: profile } = useQuery({
  queryKey: ['publicProfile', truckerId],
  queryFn: () => getPublicProfile(truckerId),
});
```

**Sections:**
1. **Header:** Name + Rating (large, high-contrast)
2. **Status:** Availability indicator + "Last seen"
3. **Equipment:** List of equipment (no sensitive fields)
4. **Lanes:** List of preferred lanes
5. **History:** Load completion count + active loads
6. **Actions:** Contact button, View history

**Sensitive Data Filtering:**
```typescript
function sanitizeProfile(profile: CarrierAvailabilityDTO) {
  // Remove: bank, email, phone, insurance
  // Keep: name, rating, equipment, lanes, availability, history
  return {
    truckerId: profile.truckerId,
    name: profile.name,
    rating: profile.rating,
    equipment: profile.equipment, // Equipment data only
    lanes: profile.lanes, // Lane data only
    availability: profile.availability, // Availability only
    history: profile.history, // Load history only
  };
}
```

---

## API Integration

### React Query Hooks

```typescript
// GET /api/v1/profile/equipment
export function useEquipment(truckerId: string) {
  return useQuery({
    queryKey: ['equipment', truckerId],
    queryFn: () => axios.get(`/api/v1/profile/equipment?truckerId=${truckerId}`),
  });
}

// POST /api/v1/profile/equipment
export function useAddEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CarrierEquipmentDTO) =>
      axios.post('/api/v1/profile/equipment', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

// PUT /api/v1/profile/equipment/{id}
export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CarrierEquipmentDTO }) =>
      axios.put(`/api/v1/profile/equipment/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

// DELETE /api/v1/profile/equipment/{id} (soft delete)
export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (equipmentId: string) =>
      axios.delete(`/api/v1/profile/equipment/${equipmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

// Similar for lanes, availability, and public profile
```

---

## Error Handling & User Feedback

### Toast Notifications (Sonner)

```typescript
// Success
toast.success('Equipment added successfully');

// Error
toast.error(error.response?.data?.message || 'Failed to add equipment');

// Loading (optional)
const toastId = toast.loading('Saving equipment...');
// Later: toast.success('Saved!', { id: toastId });
```

### Confirmation Dialogs (Delete)

```typescript
<ConfirmDialog
  title="Delete Equipment?"
  description="This action cannot be undone."
  onConfirm={handleDelete}
  onCancel={handleCancel}
  confirmLabel="Delete"
  confirmColor="red"
/>
```

---

## Mobile-Specific Optimizations

### Touch Targets
```css
/* All interactive elements */
.button, .input, .select {
  min-height: 48px;
  min-width: 48px;
  margin: 12px; /* Spacing between targets */
}
```

### Responsive Layout
```typescript
// Tailwind breakpoints
<div className="flex flex-col lg:flex-row">
  {/* Mobile: stacked; Desktop: side-by-side */}
</div>
```

### High-Glare Optimization
```css
/* High contrast for readability */
.text-primary { color: #ffffff; } /* 21:1 contrast on navy */
.bg-primary { background-color: #0b1220; } /* Deep navy */
.border { border-color: #334155; } /* Mid grey */
```

---

## Testing Checklist (For CODER)

- [ ] Form validation displays errors inline with `role="alert"`
- [ ] Submit buttons disabled during `isLoading`
- [ ] Delete actions show confirmation dialog
- [ ] Successful submissions show toast + refetch data
- [ ] Failed submissions show error toast with message
- [ ] Touch targets are ≥48px × 48px
- [ ] Color contrast meets WCAG AA (4.5:1 for small text)
- [ ] Tab order is logical (top → bottom, left → right)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces form errors
- [ ] Loading spinners display during data fetch
- [ ] Empty states show helpful messages

---

**Ready for Implementation:** ✅ All specifications complete and accessible.
