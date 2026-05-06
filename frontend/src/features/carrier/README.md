# Carrier Profiles Feature (US-701)

React frontend implementation for FreightClub carrier profile management.

## Quick Start

### Install Dependencies
```bash
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod sonner
```

### Usage

```typescript
import { CarrierProfileHub } from '@/features/carrier';

function App() {
  return <CarrierProfileHub truckerId="trucker-1" />;
}
```

## Architecture

### Directory Structure
```
src/features/carrier/
├── components/
│   ├── CarrierProfileHub.tsx         # Main container
│   ├── ProfileHeader.tsx              # Status badge
│   ├── tabs/
│   │   ├── EquipmentTab.tsx          # ✅ Complete
│   │   ├── LanesTab.tsx              # ⏳ In progress
│   │   └── AvailabilityTab.tsx       # ⏳ In progress
│   ├── cards/
│   │   ├── EquipmentCard.tsx         # ✅ Complete
│   │   └── LaneCard.tsx              # ⏳ In progress
│   ├── modals/
│   │   ├── EquipmentModal.tsx        # ✅ Complete
│   │   └── LaneModal.tsx             # ⏳ In progress
│   ├── PublicCarrierProfile.tsx      # ⏳ In progress
│   └── index.ts
├── hooks/
│   └── useCarrierProfile.ts          # ✅ All hooks complete
├── schemas/
│   └── carrier.schemas.ts             # ✅ Zod validation
└── __tests__/
    ├── hooks.test.ts                 # ✅ Hook tests
    └── EquipmentModal.test.tsx       # ✅ Component tests
```

### Data Flow

```
CarrierProfileHub (Container)
  ├─ useEquipment() → EquipmentTab → EquipmentCard
  ├─ useLanes() → LanesTab → LaneCard
  └─ useAvailability() → AvailabilityTab
```

### Form Validation

All forms use **Zod** for schema validation with **React Hook Form** for state management:

```typescript
import { equipmentFormSchema } from '@/features/carrier/schemas';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(equipmentFormSchema),
});
```

## Component APIs

### CarrierProfileHub
Main container component managing all tabs and data.

**Props:**
```typescript
interface CarrierProfileHubProps {
  truckerId: string; // Required: current user's trucker ID
}
```

**Features:**
- Tabbed interface (Equipment | Lanes | Availability)
- Real-time data syncing via React Query
- Loading states
- Error handling with toast notifications

### EquipmentTab
List and manage equipment inventory.

**Features:**
- Display equipment cards
- Add new equipment via modal
- Edit equipment details
- Soft delete with confirmation
- Empty state messaging

### LanesTab (⏳ In Progress)
List and manage preferred lanes.

**Features:**
- Display lane cards (origin → destination)
- Add new lanes via modal
- Edit lane details
- Deactivate lanes
- Minimum rate display

### AvailabilityTab (⏳ In Progress)
Set/update availability window.

**Features:**
- Days selection (Mon-Fri, Weekends, Every day)
- Time range picker
- Time zone selector
- "Currently on load" toggle
- Real-time status indicator

### PublicCarrierProfile (⏳ In Progress)
Read-only profile viewed by shippers.

**Features:**
- Trucker name & rating
- Equipment summary
- Preferred lanes
- Load history
- Status indicator
- Contact button

## Testing

### Unit Tests
```bash
npm test -- hooks.test.ts
npm test -- EquipmentModal.test.tsx
```

### Coverage
```bash
npm test -- --coverage
```

**Target:** 80% branch coverage (JaCoCo)

### Test Structure
- `hooks.test.ts` — React Query hook testing with mocked axios
- `EquipmentModal.test.tsx` — Form validation and submission
- Component accessibility (ARIA, keyboard navigation)

## Styling

Uses **Tailwind CSS** with dark mode design system:

### Color Tokens
- **Primary:** Kinetic Blue (`#2563EB`)
- **Accent:** Teal (`#00E5A8`)
- **Warning:** Amber (`#F59E0B`)
- **Error:** Red (`#EF4444`)
- **Background:** Navy (`#0B1220`)

### Touch Targets
Minimum 48px × 48px for mobile usability (high-glare cab environments)

## Accessibility

### WCAG 2.1 Compliance
- [x] Semantic HTML (form, fieldset, legend)
- [x] ARIA roles & labels
- [x] Error messages with `role="alert"`
- [x] 7:1 color contrast
- [x] Keyboard navigation (Tab, Enter, Escape)
- [x] Screen reader support

### Testing
```typescript
// Example: verify ARIA attributes
expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
expect(screen.getByLabelText('Equipment Type *')).toHaveAttribute('aria-required', 'true');
```

## API Integration

All API calls go through React Query hooks:

```typescript
const { data: equipment } = useEquipment(truckerId);
const { mutateAsync: addEquipment } = useAddEquipment();

// Usage
await addEquipment({
  equipmentType: 'FLATBED',
  lengthFeet: 48,
  // ...
});
```

### Endpoints
- `GET /api/v1/profile/equipment` — List equipment
- `POST /api/v1/profile/equipment` — Add equipment
- `PUT /api/v1/profile/equipment/{id}` — Update equipment
- `DELETE /api/v1/profile/equipment/{id}` — Delete equipment
- `GET /api/v1/profile/lanes` — List lanes
- `POST /api/v1/profile/lanes` — Add lane
- `PUT /api/v1/profile/lanes/{id}` — Update lane
- `DELETE /api/v1/profile/lanes/{id}` — Delete lane
- `GET /api/v1/profile/availability` — Get availability
- `PUT /api/v1/profile/availability` — Set availability
- `GET /api/v1/trucker/{id}/public-profile` — Public profile

## Error Handling

### Form Validation
```typescript
{errors.equipmentType && (
  <p role="alert" className="text-red-400">
    {errors.equipmentType.message}
  </p>
)}
```

### API Errors
```typescript
try {
  await addEquipment.mutateAsync(data);
  toast.success('Equipment added');
} catch (error) {
  toast.error('Failed to add equipment');
}
```

## Performance

### Caching Strategy (Backend)
- Equipment: 1 hour TTL
- Lanes: 1 hour TTL
- Availability: 30 min TTL
- Public Profile: 2 hour TTL

### Frontend Optimization
- React Query manages data caching & invalidation
- Memoization on components with expensive renders
- Debounced form inputs (if needed)

## Browser Support

- Chrome/Edge (latest 2 versions)
- Safari (latest 2 versions)
- Firefox (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:9090
```

## Troubleshooting

### "Equipment not found" error
Check that the backend is running on port 9090 and the equipment ID is valid.

### Modal not closing
Ensure `onClose` callback is properly bound and `setIsModalOpen(false)` is called.

### Validation not working
Verify Zod schema matches form field names exactly.

## Contributing

See `IMPLEMENTATION_STATUS.md` for current progress and next steps.

## License

Part of FreightClub project (2026)
