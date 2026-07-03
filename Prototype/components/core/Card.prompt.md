Universal widget container implementing §6.5 atomic specs — white bg, #D0D0D0 border, 8px radius, 24px padding, subtle shadow.

```jsx
<Card>Content here</Card>
<Card persona="carrier" padding="md">Dark surface card</Card>
<Card hover onClick={() => navigate('/loads/123')}>Clickable load card</Card>
```

The shipper variant (default) enforces §6.5 exactly. The carrier variant uses dark surface tokens.
Use `padding="none"` for cards with full-bleed table content.
