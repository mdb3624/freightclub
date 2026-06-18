# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: us-826-messages-alerts.spec.ts >> US-826: Messages & Alerts Panel E2E Tests >> should render correctly on tablet viewport (US-826 AC-10b)
- Location: e2e\us-826-messages-alerts.spec.ts:567:3

# Error details

```
Error: apiRequestContext.post: getaddrinfo ENOTFOUND backend-test
Call log:
  - → POST http://backend-test:9091/api/test/auth/register
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.15 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 232

```

# Test source

```ts
  1   | /**
  2   |  * Test Data Seeder — API-driven database fixture pattern
  3   |  *
  4   |  * Replaces UI-driven test setup with direct REST API calls.
  5   |  * Maintains foreign key dependency ordering to prevent constraint violations.
  6   |  *
  7   |  * Usage:
  8   |  *   const seeder = new TestDataSeeder(page);
  9   |  *   const user = await seeder.createTestUser({ email: 'test@example.com' });
  10  |  *   const tenant = await seeder.createTenant({ name: 'Test Company' });
  11  |  *   const load = await seeder.createLoad({ tenantId: tenant.id, carrierId: carrier.id });
  12  |  */
  13  | 
  14  | import { APIRequestContext, Page, request as playwrightRequest } from '@playwright/test';
  15  | 
  16  | interface TestUser {
  17  |   id: string;
  18  |   email: string;
  19  |   password: string;
  20  |   firstName: string;
  21  |   lastName: string;
  22  |   role: 'SHIPPER' | 'TRUCKER' | 'ADMIN';
  23  |   tenantId: string;
  24  |   companyName?: string;
  25  |   refreshToken?: string;
  26  |   accessToken?: string;
  27  | }
  28  | 
  29  | interface TestTenant {
  30  |   id: string;
  31  |   name: string;
  32  |   legalName: string;
  33  |   createdAt: string;
  34  | }
  35  | 
  36  | interface TestCarrier {
  37  |   id: string;
  38  |   truckerId: string;
  39  |   companyName: string;
  40  |   equipment: string[];
  41  |   tenantId: string;
  42  | }
  43  | 
  44  | interface TestLoad {
  45  |   id: string;
  46  |   shipmentId: string;
  47  |   shipper: string;
  48  |   pickupLocation: string;
  49  |   dropoffLocation: string;
  50  |   weight: number;
  51  |   equipmentType: string;
  52  |   rate: number;
  53  |   createdAt: string;
  54  |   tenantId: string;
  55  | }
  56  | 
  57  | export class TestDataSeeder {
  58  |   private apiContext: APIRequestContext;
  59  |   private backendUrl: string;
  60  |   private createdResources: Map<string, any[]> = new Map(); // Track created resources for cleanup
  61  |   private accessToken: string | null = null;
  62  | 
  63  |   constructor(
  64  |     apiContext: APIRequestContext,
  65  |     backendUrl: string = process.env.TEST_BACKEND_URL || 'http://backend-test:9091'
  66  |   ) {
  67  |     this.apiContext = apiContext;
  68  |     this.backendUrl = backendUrl;
  69  |   }
  70  | 
  71  |   /**
  72  |    * Create a test user via /api/test/auth/register endpoint
  73  |    * DEPENDS ON: None (root entity)
  74  |    * NOTE: Creates a fresh APIRequestContext to avoid auth state interference
  75  |    */
  76  |   async createTestUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
  77  |     const uniqueId = Date.now();
  78  |     const defaults: TestUser = {
  79  |       id: `user-${uniqueId}`,
  80  |       email: `e2e-test-${uniqueId}@freightclub.local`,
  81  |       password: 'E2ETestPassword123!',
  82  |       firstName: 'E2E',
  83  |       lastName: 'Test',
  84  |       role: 'SHIPPER',
  85  |       tenantId: `tenant-${uniqueId}`,
  86  |       companyName: `E2E Test Company ${uniqueId}`,
  87  |     };
  88  | 
  89  |     const userData = { ...defaults, ...overrides };
  90  | 
  91  |     // Create a fresh APIRequestContext without auth state to avoid interference
  92  |     const freshContext = await playwrightRequest.newContext();
  93  |     try {
> 94  |       const response = await freshContext.post(
      |                                           ^ Error: apiRequestContext.post: getaddrinfo ENOTFOUND backend-test
  95  |         `${this.backendUrl}/api/test/auth/register`,
  96  |         {
  97  |           data: userData,
  98  |         }
  99  |       );
  100 | 
  101 |       if (!response.ok()) {
  102 |         const text = await response.text();
  103 |         throw new Error(
  104 |           `Failed to create test user: ${response.status()} ${text}`
  105 |         );
  106 |       }
  107 | 
  108 |       const body = await response.json();
  109 |       this.accessToken = body.accessToken;
  110 | 
  111 |       // Extract refresh token from Set-Cookie header
  112 |       const setCookieHeader = response.headers()['set-cookie'];
  113 |       let refreshToken = '';
  114 |       if (setCookieHeader) {
  115 |         refreshToken = setCookieHeader.split(';')[0].split('=')[1] || '';
  116 |       }
  117 | 
  118 |       const user: TestUser = {
  119 |         ...userData,
  120 |         id: body.user.id,
  121 |         tenantId: body.user.tenantId,
  122 |         accessToken: body.accessToken,
  123 |         refreshToken
  124 |       };
  125 | 
  126 |       this.trackResource('users', user);
  127 |       return user;
  128 |     } finally {
  129 |       await freshContext.dispose();
  130 |     }
  131 |   }
  132 | 
  133 |   /**
  134 |    * Create a carrier profile via /api/v1/carriers endpoint
  135 |    * DEPENDS ON: Tenant (via multi-tenancy context) and User
  136 |    */
  137 |   async createCarrier(
  138 |     tenantId: string,
  139 |     userId: string,
  140 |     overrides: Partial<TestCarrier> = {}
  141 |   ): Promise<TestCarrier> {
  142 |     const uniqueId = Date.now();
  143 |     const defaults: TestCarrier = {
  144 |       id: `carrier-${uniqueId}`,
  145 |       truckerId: `trucker-${uniqueId}`,
  146 |       companyName: `E2E Carrier ${uniqueId}`,
  147 |       equipment: ['FLATBED', 'DRY_VAN'],
  148 |       tenantId,
  149 |     };
  150 | 
  151 |     const carrierData = { ...defaults, ...overrides };
  152 | 
  153 |     const response = await this.apiContext.post(`${this.backendUrl}/api/v1/carriers`, {
  154 |       data: {
  155 |         truckerId: carrierData.truckerId,
  156 |         companyName: carrierData.companyName,
  157 |         equipment: carrierData.equipment,
  158 |       },
  159 |       headers: this.getTenantHeaders(tenantId),
  160 |     });
  161 | 
  162 |     if (!response.ok()) {
  163 |       throw new Error(
  164 |         `Failed to create carrier: ${response.status()} ${await response.text()}`
  165 |       );
  166 |     }
  167 | 
  168 |     const body = await response.json();
  169 |     const carrier: TestCarrier = { ...carrierData, id: body.id };
  170 | 
  171 |     this.trackResource('carriers', carrier);
  172 |     return carrier;
  173 |   }
  174 | 
  175 |   /**
  176 |    * Create a load via /api/v1/loads endpoint
  177 |    * DEPENDS ON: Tenant (multi-tenancy context)
  178 |    * Note: Does NOT depend on carrier — carrier association is optional at creation
  179 |    */
  180 |   async createLoad(
  181 |     tenantId: string,
  182 |     overrides: Partial<TestLoad> = {}
  183 |   ): Promise<TestLoad> {
  184 |     const uniqueId = Date.now();
  185 |     const defaults: TestLoad = {
  186 |       id: `load-${uniqueId}`,
  187 |       shipmentId: `shipment-${uniqueId}`,
  188 |       shipper: 'E2E Test Shipper',
  189 |       pickupLocation: 'Chicago, IL',
  190 |       dropoffLocation: 'Detroit, MI',
  191 |       weight: 5000,
  192 |       equipmentType: 'DRY_VAN',
  193 |       rate: 1500,
  194 |       createdAt: new Date().toISOString(),
```