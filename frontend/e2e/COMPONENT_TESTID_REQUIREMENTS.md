# Component data-testid Requirements

**For refactored tests to work, all interactive elements MUST have data-testid attributes.**

This document specifies which components need updating and what data-testid values to use.

---

## Login Component (LoginPage.tsx)

The login form needs these data-testid attributes:

```jsx
// frontend/src/pages/LoginPage.tsx

<form data-testid="login-form">
  <div>
    <label htmlFor="email">Email</label>
    <input
      id="email"
      type="email"
      placeholder="your@email.com"
      data-testid="email-input"  // ← REQUIRED
      {...form.register('email')}
    />
    {form.formState.errors.email && (
      <span data-testid="email-input-error">  {/* ← REQUIRED */}
        {form.formState.errors.email.message}
      </span>
    )}
  </div>

  <div>
    <label htmlFor="password">Password</label>
    <input
      id="password"
      type="password"
      placeholder="••••••••"
      data-testid="password-input"  // ← REQUIRED
      {...form.register('password')}
    />
    {form.formState.errors.password && (
      <span data-testid="password-input-error">  {/* ← REQUIRED */}
        {form.formState.errors.password.message}
      </span>
    )}
  </div>

  <button type="submit" data-testid="login-submit-btn">  {/* ← REQUIRED */}
    Sign In
  </button>
</form>

{/* Error message container for backend rejection */}
{loginError && (
  <div role="alert" data-testid="login-error-message">  {/* ← REQUIRED */}
    {loginError}
  </div>
)}
```

---

## Dashboard Component (DashboardPage.tsx or MainLayout.tsx)

After successful login, expect a dashboard container:

```jsx
// frontend/src/pages/DashboardPage.tsx (or wherever authenticated users land)

export function DashboardPage() {
  return (
    <div data-testid="dashboard-container">  {/* ← REQUIRED */}
      <header>
        <h1>Dashboard</h1>
      </header>
      {/* Rest of dashboard content */}
    </div>
  );
}
```

---

## Adding data-testid: Quick Reference

### Pattern 1: Form Inputs
```jsx
<input
  type="email"
  data-testid="email-input"
  {...register('email')}
/>
```

### Pattern 2: Form Error Messages
```jsx
{formState.errors.email && (
  <span data-testid="email-input-error">
    {formState.errors.email.message}
  </span>
)}
```

### Pattern 3: Buttons
```jsx
<button data-testid="login-submit-btn">Sign In</button>
```

### Pattern 4: Success/Error Alerts
```jsx
{errorMessage && (
  <div data-testid="login-error-message" role="alert">
    {errorMessage}
  </div>
)}
```

### Pattern 5: Page Containers
```jsx
<div data-testid="dashboard-container">
  {/* Page content */}
</div>
```

---

## Naming Convention

- **Inputs:** `{field-name}-input`
  - `email-input`, `password-input`, `phone-input`

- **Error messages:** `{field-name}-input-error`
  - `email-input-error`, `password-input-error`

- **Buttons:** `{action}-{element}-btn`
  - `login-submit-btn`, `register-next-btn`, `forgot-password-link`

- **Containers:** `{page-name}-container`
  - `dashboard-container`, `load-board-container`, `profile-container`

- **Alert messages:** `{action}-{type}-message`
  - `login-error-message`, `success-notification`, `warning-banner`

---

## Verification Checklist

Before running tests, verify all components have required data-testid:

```bash
# Search for required selectors in your components
grep -r 'data-testid="email-input"' frontend/src/
grep -r 'data-testid="password-input"' frontend/src/
grep -r 'data-testid="login-submit-btn"' frontend/src/
grep -r 'data-testid="dashboard-container"' frontend/src/

# If any return 0 results, those components need updating
```

---

## Testing the Updates

After adding data-testid attributes:

```bash
# Run the refactored login test
cd frontend
npm run test:e2e -- login-integration-refactored.spec.ts

# Expect output:
# ✓ should render login form in <100ms on initial load
# ✓ should display error message on failed login
# ✓ (etc.)
```

If tests still fail with "element not found", cross-check:
1. Selector name in test (`[data-testid="email-input"]`)
2. Attribute in component (`data-testid="email-input"`)
3. Both should match exactly (case-sensitive)

---

## References

- **Page Object Model Pattern:** Tests use selectors defined here
- **Testing Standards:** [`.claude/rules/testing_standards.md`](.claude/rules/testing_standards.md)
- **Playwright Best Practices:** https://playwright.dev/docs/best-practices

---

**These attributes are mandatory per the testing standards. PR review will reject missing data-testid attributes.**
