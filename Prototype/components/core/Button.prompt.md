Bronze-gradient CTA button used across both Shipper and Carrier personas in FreightClub.

```jsx
<Button variant="primary" size="md">Create Load</Button>
<Button variant="secondary" size="md" persona="carrier">Cancel</Button>
<Button variant="danger" size="sm">Delete</Button>
<Button isLoading>Saving…</Button>
```

Variants: `primary` (bronze gradient, tactile shadow) · `secondary` (outlined) · `ghost` (text only) · `danger` (red)
Sizes: `sm` 28px · `md` 36px · `lg` 48px (carrier touch target minimum)
Persona: `shipper` or `carrier` — affects secondary/ghost surface color
