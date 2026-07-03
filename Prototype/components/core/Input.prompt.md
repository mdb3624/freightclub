Styled form input with label, helper text, and error state. Follows §6.3 atomic specs: 40px height, 4px radius, bronze focus ring.

```jsx
<Input label="Origin State" placeholder="e.g. TX" />
<Input label="Pay Rate" helper="Enter dollars per mile" />
<Input label="Email" error="Invalid email address" value="bad@" />
<Input label="Disabled field" disabled value="Read only" />
```

Always provide `label` for accessibility. Use `error` for validation feedback, `helper` for guidance.
