# Puppeteer Integration Test Screenshots

This directory contains timestamped screenshots from automated Puppeteer integration tests.

## Structure

Screenshots are organized by test run timestamp in ISO format: `YYYY-MM-DDTHH-MM-SS`

Each test run directory contains:
- `dashboard-success.png` - Screenshot of the shipper dashboard after successful login

## Latest Test Results

Run the automated test to generate new screenshots:

```bash
cd frontend
node verify-fixes.cjs
```

## Test Coverage

The Puppeteer test verifies:
✅ Login flow (email/password authentication)
✅ JWT token validation
✅ Dashboard redirect after login
✅ Load statistics display (count of open/claimed/in-transit/delivered loads)
✅ Load list table rendering
✅ Multi-tenant isolation (correct shipper data loaded)

## Screenshot History

Each run creates a new timestamped directory, allowing historical tracking of:
- UI changes
- Regression detection
- Feature validation across versions
