# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shipper-dashboard.spec.ts >> Shipper Dashboard Golden Path (US-715) >> should load dashboard without errors (US-715 AC-6)
- Location: e2e\shipper-dashboard.spec.ts:196:3

# Error details

```
Error: Failed to create test user: 500 
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
  14  | import { APIRequestContext, Page } from '@playwright/test';
  15  | 
  16  | interface TestUser {
  17  |   id: string;
  18  |   email: string;
  19  |   password: string;
  20  |   firstName: string;
  21  |   lastName: string;
  22  |   role: 'SHIPPER' | 'CARRIER' | 'ADMIN';
  23  |   tenantId: string;
  24  | }
  25  | 
  26  | interface TestTenant {
  27  |   id: string;
  28  |   name: string;
  29  |   legalName: string;
  30  |   createdAt: string;
  31  | }
  32  | 
  33  | interface TestCarrier {
  34  |   id: string;
  35  |   truckerId: string;
  36  |   companyName: string;
  37  |   equipment: string[];
  38  |   tenantId: string;
  39  | }
  40  | 
  41  | interface TestLoad {
  42  |   id: string;
  43  |   shipmentId: string;
  44  |   shipper: string;
  45  |   pickupLocation: string;
  46  |   dropoffLocation: string;
  47  |   weight: number;
  48  |   equipmentType: string;
  49  |   rate: number;
  50  |   createdAt: string;
  51  |   tenantId: string;
  52  | }
  53  | 
  54  | export class TestDataSeeder {
  55  |   private apiContext: APIRequestContext;
  56  |   private backendUrl: string;
  57  |   private createdResources: Map<string, any[]> = new Map(); // Track created resources for cleanup
  58  | 
  59  |   constructor(apiContext: APIRequestContext, backendUrl: string = 'http://localhost:9091') {
  60  |     this.apiContext = apiContext;
  61  |     this.backendUrl = backendUrl;
  62  |   }
  63  | 
  64  |   /**
  65  |    * Create a test user via /api/test/auth/register endpoint
  66  |    * DEPENDS ON: None (root entity)
  67  |    */
  68  |   async createTestUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
  69  |     const uniqueId = Date.now();
  70  |     const defaults: TestUser = {
  71  |       id: `user-${uniqueId}`,
  72  |       email: `e2e-test-${uniqueId}@freightclub.local`,
  73  |       password: 'E2ETestPassword123!',
  74  |       firstName: 'E2E',
  75  |       lastName: 'Test',
  76  |       role: 'SHIPPER',
  77  |       tenantId: `tenant-${uniqueId}`,
  78  |     };
  79  | 
  80  |     const userData = { ...defaults, ...overrides };
  81  | 
  82  |     const response = await this.apiContext.post(
  83  |       `${this.backendUrl}/api/test/auth/register`,
  84  |       {
  85  |         data: {
  86  |           email: userData.email,
  87  |           password: userData.password,
  88  |           firstName: userData.firstName,
  89  |           lastName: userData.lastName,
  90  |           role: userData.role,
  91  |           companyName: `E2ETest-${uniqueId}`,
  92  |         },
  93  |       }
  94  |     );
  95  | 
  96  |     if (!response.ok()) {
> 97  |       throw new Error(
      |             ^ Error: Failed to create test user: 500 
  98  |         `Failed to create test user: ${response.status()} ${await response.text()}`
  99  |       );
  100 |     }
  101 | 
  102 |     const body = await response.json();
  103 |     const user: TestUser = { ...userData, id: body.userId, tenantId: body.tenantId };
  104 | 
  105 |     this.trackResource('users', user);
  106 |     return user;
  107 |   }
  108 | 
  109 |   /**
  110 |    * Create a carrier profile via /api/v1/carriers endpoint
  111 |    * DEPENDS ON: Tenant (via multi-tenancy context) and User
  112 |    */
  113 |   async createCarrier(
  114 |     tenantId: string,
  115 |     userId: string,
  116 |     overrides: Partial<TestCarrier> = {}
  117 |   ): Promise<TestCarrier> {
  118 |     const uniqueId = Date.now();
  119 |     const defaults: TestCarrier = {
  120 |       id: `carrier-${uniqueId}`,
  121 |       truckerId: `trucker-${uniqueId}`,
  122 |       companyName: `E2E Carrier ${uniqueId}`,
  123 |       equipment: ['FLATBED', 'DRY_VAN'],
  124 |       tenantId,
  125 |     };
  126 | 
  127 |     const carrierData = { ...defaults, ...overrides };
  128 | 
  129 |     const response = await this.apiContext.post(`${this.backendUrl}/api/v1/carriers`, {
  130 |       data: {
  131 |         truckerId: carrierData.truckerId,
  132 |         companyName: carrierData.companyName,
  133 |         equipment: carrierData.equipment,
  134 |       },
  135 |       headers: this.getTenantHeaders(tenantId),
  136 |     });
  137 | 
  138 |     if (!response.ok()) {
  139 |       throw new Error(
  140 |         `Failed to create carrier: ${response.status()} ${await response.text()}`
  141 |       );
  142 |     }
  143 | 
  144 |     const body = await response.json();
  145 |     const carrier: TestCarrier = { ...carrierData, id: body.id };
  146 | 
  147 |     this.trackResource('carriers', carrier);
  148 |     return carrier;
  149 |   }
  150 | 
  151 |   /**
  152 |    * Create a load via /api/v1/loads endpoint
  153 |    * DEPENDS ON: Tenant (multi-tenancy context)
  154 |    * Note: Does NOT depend on carrier — carrier association is optional at creation
  155 |    */
  156 |   async createLoad(
  157 |     tenantId: string,
  158 |     overrides: Partial<TestLoad> = {}
  159 |   ): Promise<TestLoad> {
  160 |     const uniqueId = Date.now();
  161 |     const defaults: TestLoad = {
  162 |       id: `load-${uniqueId}`,
  163 |       shipmentId: `shipment-${uniqueId}`,
  164 |       shipper: 'E2E Test Shipper',
  165 |       pickupLocation: 'Chicago, IL',
  166 |       dropoffLocation: 'Detroit, MI',
  167 |       weight: 5000,
  168 |       equipmentType: 'DRY_VAN',
  169 |       rate: 1500,
  170 |       createdAt: new Date().toISOString(),
  171 |       tenantId,
  172 |     };
  173 | 
  174 |     const loadData = { ...defaults, ...overrides };
  175 | 
  176 |     const response = await this.apiContext.post(`${this.backendUrl}/api/v1/loads`, {
  177 |       data: {
  178 |         shipmentId: loadData.shipmentId,
  179 |         shipper: loadData.shipper,
  180 |         pickupLocation: loadData.pickupLocation,
  181 |         dropoffLocation: loadData.dropoffLocation,
  182 |         weight: loadData.weight,
  183 |         equipmentType: loadData.equipmentType,
  184 |         rate: loadData.rate,
  185 |       },
  186 |       headers: this.getTenantHeaders(tenantId),
  187 |     });
  188 | 
  189 |     if (!response.ok()) {
  190 |       throw new Error(`Failed to create load: ${response.status()} ${await response.text()}`);
  191 |     }
  192 | 
  193 |     const body = await response.json();
  194 |     const load: TestLoad = { ...loadData, id: body.id };
  195 | 
  196 |     this.trackResource('loads', load);
  197 |     return load;
```