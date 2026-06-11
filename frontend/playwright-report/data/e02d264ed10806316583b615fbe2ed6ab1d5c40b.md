# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-dashboard-home.spec.ts >> Shipper Dashboard Home Golden Path (US-760/US-761/US-762) >> US-761 AC-1: dashboard home displays KPI tiles backed by the summary endpoint
- Location: e2e\shipper-dashboard-home.spec.ts:30:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="dashboard-grid"]')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('[data-testid="dashboard-grid"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - heading "Something went wrong" [level=1] [ref=e5]
    - paragraph [ref=e6]: An unexpected error occurred. Please refresh the page.
    - button "Refresh" [ref=e7] [cursor=pointer]
  - generic [ref=e10]:
    - generic [ref=e11]: "[plugin:vite:react-babel] /app/src/pages/ShipperDashboardHome.tsx: Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>? (408:4) 411 |"
    - generic [ref=e12]: /app/src/pages/ShipperDashboardHome.tsx:408:4
    - generic [ref=e13]: "406| </div> 407| </div> 408| </div> | ^ 409| ) 410| }"
    - generic [ref=e14]: at constructor (/app/node_modules/@babel/parser/lib/index.js:365:19) at TypeScriptParserMixin.raise (/app/node_modules/@babel/parser/lib/index.js:6616:19) at TypeScriptParserMixin.jsxParseElementAt (/app/node_modules/@babel/parser/lib/index.js:4754:18) at TypeScriptParserMixin.jsxParseElement (/app/node_modules/@babel/parser/lib/index.js:4761:17) at TypeScriptParserMixin.parseExprAtom (/app/node_modules/@babel/parser/lib/index.js:4771:19) at TypeScriptParserMixin.parseExprSubscripts (/app/node_modules/@babel/parser/lib/index.js:11098:23) at TypeScriptParserMixin.parseUpdate (/app/node_modules/@babel/parser/lib/index.js:11083:21) at TypeScriptParserMixin.parseMaybeUnary (/app/node_modules/@babel/parser/lib/index.js:11063:23) at TypeScriptParserMixin.parseMaybeUnary (/app/node_modules/@babel/parser/lib/index.js:9854:18) at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (/app/node_modules/@babel/parser/lib/index.js:10916:61) at TypeScriptParserMixin.parseExprOps (/app/node_modules/@babel/parser/lib/index.js:10921:23) at TypeScriptParserMixin.parseMaybeConditional (/app/node_modules/@babel/parser/lib/index.js:10898:23) at TypeScriptParserMixin.parseMaybeAssign (/app/node_modules/@babel/parser/lib/index.js:10848:21) at /app/node_modules/@babel/parser/lib/index.js:9792:39 at TypeScriptParserMixin.tryParse (/app/node_modules/@babel/parser/lib/index.js:6924:20) at TypeScriptParserMixin.parseMaybeAssign (/app/node_modules/@babel/parser/lib/index.js:9792:18) at /app/node_modules/@babel/parser/lib/index.js:10817:39 at TypeScriptParserMixin.allowInAnd (/app/node_modules/@babel/parser/lib/index.js:12443:12) at TypeScriptParserMixin.parseMaybeAssignAllowIn (/app/node_modules/@babel/parser/lib/index.js:10817:17) at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (/app/node_modules/@babel/parser/lib/index.js:12510:17) at TypeScriptParserMixin.parseParenAndDistinguishExpression (/app/node_modules/@babel/parser/lib/index.js:11692:28) at TypeScriptParserMixin.parseExprAtom (/app/node_modules/@babel/parser/lib/index.js:11348:23) at TypeScriptParserMixin.parseExprAtom (/app/node_modules/@babel/parser/lib/index.js:4776:20) at TypeScriptParserMixin.parseExprSubscripts (/app/node_modules/@babel/parser/lib/index.js:11098:23) at TypeScriptParserMixin.parseUpdate (/app/node_modules/@babel/parser/lib/index.js:11083:21) at TypeScriptParserMixin.parseMaybeUnary (/app/node_modules/@babel/parser/lib/index.js:11063:23) at TypeScriptParserMixin.parseMaybeUnary (/app/node_modules/@babel/parser/lib/index.js:9854:18) at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (/app/node_modules/@babel/parser/lib/index.js:10916:61) at TypeScriptParserMixin.parseExprOps (/app/node_modules/@babel/parser/lib/index.js:10921:23) at TypeScriptParserMixin.parseMaybeConditional (/app/node_modules/@babel/parser/lib/index.js:10898:23) at TypeScriptParserMixin.parseMaybeAssign (/app/node_modules/@babel/parser/lib/index.js:10848:21) at TypeScriptParserMixin.parseMaybeAssign (/app/node_modules/@babel/parser/lib/index.js:9803:20) at TypeScriptParserMixin.parseExpressionBase (/app/node_modules/@babel/parser/lib/index.js:10801:23) at /app/node_modules/@babel/parser/lib/index.js:10797:39 at TypeScriptParserMixin.allowInAnd (/app/node_modules/@babel/parser/lib/index.js:12438:16) at TypeScriptParserMixin.parseExpression (/app/node_modules/@babel/parser/lib/index.js:10797:17) at TypeScriptParserMixin.parseReturnStatement (/app/node_modules/@babel/parser/lib/index.js:13159:28) at TypeScriptParserMixin.parseStatementContent (/app/node_modules/@babel/parser/lib/index.js:12815:21) at TypeScriptParserMixin.parseStatementContent (/app/node_modules/@babel/parser/lib/index.js:9525:18) at TypeScriptParserMixin.parseStatementLike (/app/node_modules/@babel/parser/lib/index.js:12784:17) at TypeScriptParserMixin.parseStatementListItem (/app/node_modules/@babel/parser/lib/index.js:12764:17) at TypeScriptParserMixin.parseBlockOrModuleBlockBody (/app/node_modules/@babel/parser/lib/index.js:13333:61) at TypeScriptParserMixin.parseBlockBody (/app/node_modules/@babel/parser/lib/index.js:13326:10) at TypeScriptParserMixin.parseBlock (/app/node_modules/@babel/parser/lib/index.js:13314:10) at TypeScriptParserMixin.parseFunctionBody (/app/node_modules/@babel/parser/lib/index.js:12117:24) at TypeScriptParserMixin.parseFunctionBodyAndFinish (/app/node_modules/@babel/parser/lib/index.js:12103:10) at TypeScriptParserMixin.parseFunctionBodyAndFinish (/app/node_modules/@babel/parser/lib/index.js:9189:18) at /app/node_modules/@babel/parser/lib/index.js:13462:12 at TypeScriptParserMixin.withSmartMixTopicForbiddingContext (/app/node_modules/@babel/parser/lib/index.js:12420:14) at TypeScriptParserMixin.parseFunction (/app/node_modules/@babel/parser/lib/index.js:13461:10
    - generic [ref=e15]:
      - text: Click outside, press Esc key, or fix the code to dismiss.
      - text: You can also disable this overlay by setting
      - code [ref=e16]: server.hmr.overlay
      - text: to
      - code [ref=e17]: "false"
      - text: in
      - code [ref=e18]: vite.config.ts
      - text: .
```

# Test source

```ts
  1  | import { Page, Locator, expect } from '@playwright/test'
  2  | 
  3  | /**
  4  |  * Page Object for the Shipper Dashboard Home (US-760: KPI strip, carrier-search
  5  |  * lane panel). Encapsulates selectors/navigation only — assertions live in the
  6  |  * spec file per testing_standards.md POM rules.
  7  |  */
  8  | export class ShipperDashboardHomePageObject {
  9  |   readonly page: Page
  10 |   readonly grid: Locator
  11 |   readonly kpiActiveShipments: Locator
  12 |   readonly kpiEstimatedCostPerMile: Locator
  13 |   readonly kpiOnTimeCarrierPct: Locator
  14 |   readonly carrierSearchPanel: Locator
  15 |   readonly originInput: Locator
  16 |   readonly destinationInput: Locator
  17 |   readonly searchSubmitBtn: Locator
  18 |   readonly searchResults: Locator
  19 |   readonly searchEmptyState: Locator
  20 | 
  21 |   constructor(page: Page) {
  22 |     this.page = page
  23 |     this.grid = page.locator('[data-testid="dashboard-grid"]')
  24 |     this.kpiActiveShipments = page.locator('[data-testid="kpi-tile-activeShipments"]')
  25 |     this.kpiEstimatedCostPerMile = page.locator('[data-testid="kpi-tile-estimatedCostPerMile"]')
  26 |     this.kpiOnTimeCarrierPct = page.locator('[data-testid="kpi-tile-onTimeCarrierPct"]')
  27 |     this.carrierSearchPanel = page.locator('[data-testid="carrier-search-panel"]')
  28 |     this.originInput = page.locator('[data-testid="carrier-search-origin-input"]')
  29 |     this.destinationInput = page.locator('[data-testid="carrier-search-destination-input"]')
  30 |     this.searchSubmitBtn = page.locator('[data-testid="carrier-search-submit-btn"]')
  31 |     this.searchResults = page.locator('[data-testid="carrier-search-results"]')
  32 |     this.searchEmptyState = page.locator('[data-testid="carrier-search-empty"]')
  33 |   }
  34 | 
  35 |   async goto() {
  36 |     await this.page.goto('/dashboard/shipper', { waitUntil: 'domcontentloaded' })
  37 |   }
  38 | 
  39 |   async waitForGridReady() {
> 40 |     await expect(this.grid).toBeVisible({ timeout: 10000 })
     |                             ^ Error: expect(locator).toBeVisible() failed
  41 |   }
  42 | 
  43 |   async searchLane(origin: string, destination: string) {
  44 |     await this.originInput.fill(origin)
  45 |     await this.destinationInput.fill(destination)
  46 |     await this.searchSubmitBtn.click()
  47 |   }
  48 | 
  49 |   resultRow(carrierId: string): Locator {
  50 |     return this.page.locator(`[data-testid="carrier-search-result-${carrierId}"]`)
  51 |   }
  52 | }
  53 | 
```