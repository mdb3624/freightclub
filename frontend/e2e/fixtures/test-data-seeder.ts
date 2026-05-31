/**
 * Test Data Seeder — API-driven database fixture pattern
 *
 * Replaces UI-driven test setup with direct REST API calls.
 * Maintains foreign key dependency ordering to prevent constraint violations.
 *
 * Usage:
 *   const seeder = new TestDataSeeder(page);
 *   const user = await seeder.createTestUser({ email: 'test@example.com' });
 *   const tenant = await seeder.createTenant({ name: 'Test Company' });
 *   const load = await seeder.createLoad({ tenantId: tenant.id, carrierId: carrier.id });
 */

import { APIRequestContext, Page } from '@playwright/test';

interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'SHIPPER' | 'CARRIER' | 'ADMIN';
  tenantId: string;
}

interface TestTenant {
  id: string;
  name: string;
  legalName: string;
  createdAt: string;
}

interface TestCarrier {
  id: string;
  truckerId: string;
  companyName: string;
  equipment: string[];
  tenantId: string;
}

interface TestLoad {
  id: string;
  shipmentId: string;
  shipper: string;
  pickupLocation: string;
  dropoffLocation: string;
  weight: number;
  equipmentType: string;
  rate: number;
  createdAt: string;
  tenantId: string;
}

export class TestDataSeeder {
  private apiContext: APIRequestContext;
  private backendUrl: string;
  private createdResources: Map<string, any[]> = new Map(); // Track created resources for cleanup

  constructor(apiContext: APIRequestContext, backendUrl: string = 'http://localhost:9091') {
    this.apiContext = apiContext;
    this.backendUrl = backendUrl;
  }

  /**
   * Create a test user via /api/test/auth/register endpoint
   * DEPENDS ON: None (root entity)
   */
  async createTestUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    const uniqueId = Date.now();
    const defaults: TestUser = {
      id: `user-${uniqueId}`,
      email: `e2e-test-${uniqueId}@freightclub.local`,
      password: 'E2ETestPassword123!',
      firstName: 'E2E',
      lastName: 'Test',
      role: 'SHIPPER',
      tenantId: `tenant-${uniqueId}`,
    };

    const userData = { ...defaults, ...overrides };

    const response = await this.apiContext.post(
      `${this.backendUrl}/api/test/auth/register`,
      {
        data: {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          companyName: `E2ETest-${uniqueId}`,
        },
      }
    );

    if (!response.ok()) {
      throw new Error(
        `Failed to create test user: ${response.status()} ${await response.text()}`
      );
    }

    const body = await response.json();
    const user: TestUser = { ...userData, id: body.userId, tenantId: body.tenantId };

    this.trackResource('users', user);
    return user;
  }

  /**
   * Create a carrier profile via /api/v1/carriers endpoint
   * DEPENDS ON: Tenant (via multi-tenancy context) and User
   */
  async createCarrier(
    tenantId: string,
    userId: string,
    overrides: Partial<TestCarrier> = {}
  ): Promise<TestCarrier> {
    const uniqueId = Date.now();
    const defaults: TestCarrier = {
      id: `carrier-${uniqueId}`,
      truckerId: `trucker-${uniqueId}`,
      companyName: `E2E Carrier ${uniqueId}`,
      equipment: ['FLATBED', 'DRY_VAN'],
      tenantId,
    };

    const carrierData = { ...defaults, ...overrides };

    const response = await this.apiContext.post(`${this.backendUrl}/api/v1/carriers`, {
      data: {
        truckerId: carrierData.truckerId,
        companyName: carrierData.companyName,
        equipment: carrierData.equipment,
      },
      headers: this.getTenantHeaders(tenantId),
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to create carrier: ${response.status()} ${await response.text()}`
      );
    }

    const body = await response.json();
    const carrier: TestCarrier = { ...carrierData, id: body.id };

    this.trackResource('carriers', carrier);
    return carrier;
  }

  /**
   * Create a load via /api/v1/loads endpoint
   * DEPENDS ON: Tenant (multi-tenancy context)
   * Note: Does NOT depend on carrier — carrier association is optional at creation
   */
  async createLoad(
    tenantId: string,
    overrides: Partial<TestLoad> = {}
  ): Promise<TestLoad> {
    const uniqueId = Date.now();
    const defaults: TestLoad = {
      id: `load-${uniqueId}`,
      shipmentId: `shipment-${uniqueId}`,
      shipper: 'E2E Test Shipper',
      pickupLocation: 'Chicago, IL',
      dropoffLocation: 'Detroit, MI',
      weight: 5000,
      equipmentType: 'DRY_VAN',
      rate: 1500,
      createdAt: new Date().toISOString(),
      tenantId,
    };

    const loadData = { ...defaults, ...overrides };

    const response = await this.apiContext.post(`${this.backendUrl}/api/v1/loads`, {
      data: {
        shipmentId: loadData.shipmentId,
        shipper: loadData.shipper,
        pickupLocation: loadData.pickupLocation,
        dropoffLocation: loadData.dropoffLocation,
        weight: loadData.weight,
        equipmentType: loadData.equipmentType,
        rate: loadData.rate,
      },
      headers: this.getTenantHeaders(tenantId),
    });

    if (!response.ok()) {
      throw new Error(`Failed to create load: ${response.status()} ${await response.text()}`);
    }

    const body = await response.json();
    const load: TestLoad = { ...loadData, id: body.id };

    this.trackResource('loads', load);
    return load;
  }

  /**
   * Cleanup all created resources (reverse order of creation)
   * Call in test.afterEach() to teardown state
   */
  async cleanup(): Promise<void> {
    // Delete in reverse dependency order: loads → carriers → users
    const resourceDeletionOrder = ['loads', 'carriers', 'users'];

    for (const resourceType of resourceDeletionOrder) {
      const resources = this.createdResources.get(resourceType) || [];
      for (const resource of resources) {
        try {
          await this.deleteResource(resourceType, resource.id, resource.tenantId);
        } catch (error) {
          console.warn(`Failed to delete ${resourceType} ${resource.id}:`, error);
        }
      }
    }

    this.createdResources.clear();
  }

  /**
   * Get tenant context headers for multi-tenancy
   */
  private getTenantHeaders(tenantId: string): Record<string, string> {
    return {
      'X-Tenant-ID': tenantId, // If your backend uses header-based tenant context
    };
  }

  /**
   * Track created resources for cleanup
   */
  private trackResource(type: string, resource: any): void {
    if (!this.createdResources.has(type)) {
      this.createdResources.set(type, []);
    }
    this.createdResources.get(type)!.push(resource);
  }

  /**
   * Generic delete method
   */
  private async deleteResource(type: string, id: string, tenantId?: string): Promise<void> {
    let endpoint = '';
    switch (type) {
      case 'loads':
        endpoint = `/api/v1/loads/${id}`;
        break;
      case 'carriers':
        endpoint = `/api/v1/carriers/${id}`;
        break;
      case 'users':
        // Users typically can't be deleted via normal API; use test endpoint if available
        endpoint = `/api/test/users/${id}`;
        break;
    }

    const response = await this.apiContext.delete(`${this.backendUrl}${endpoint}`, {
      headers: tenantId ? this.getTenantHeaders(tenantId) : {},
    });

    if (!response.ok()) {
      console.warn(
        `Failed to delete ${type} ${id}: ${response.status()} ${await response.text()}`
      );
    }
  }
}
