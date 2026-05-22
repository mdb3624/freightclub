# SEC-001: Authorization Gate Design

**Story:** SEC-001 — Add @PreAuthorize Annotations to DELETE/PUT Endpoints  
**Designed By:** Architect  
**Date:** 2026-05-22

---

## Overview

Replace silent multi-tenant violations with explicit authorization gates at the endpoint layer. Three patterns:
1. Controller `@PreAuthorize` → delegates to service-layer `isOwner()` check
2. Service layer verifies `resource.tenant_id == TenantContextHolder.getTenantId()`
3. Unauthorized requests return 403 Forbidden (never 404, to prevent tenant enumeration)

---

## Architecture Diagram

```
Request → SecurityFilter (auth) → Controller
                                      ↓
                              @PreAuthorize annotation
                                      ↓
                          Call: @loadService.isOwner(#id)
                                      ↓
                          LoadService.isOwner(id)
                                      ↓
                    Load load = repository.findById(id)
                                      ↓
                    if (load.getTenantId() == TenantContextHolder.getTenantId())
                            YES → allow → proceed
                            NO  → throw AccessDeniedException → 403 Forbidden
```

---

## Service Layer Design

### Pattern: isOwner(id) Method

Each service implements a single authorization check:

```
Service.isOwner(resourceId: String): Boolean
├─ Retrieve resource by ID
├─ Check: resource.tenantId == TenantContextHolder.getTenantId()
└─ Return true/false (never throw; let @PreAuthorize throw on false)
```

**Services to implement (one isOwner per service):**
- LoadService.isOwner(loadId)
- ProfileService.isOwner(profileId)
- DocumentService.isOwner(documentId)

---

## Controller Annotation Pattern

| Endpoint | Method | Annotation | Service Call |
|---|---|---|---|
| DELETE /loads/{id} | deleteLoad(id) | `@PreAuthorize("@loadService.isOwner(#id)")` | LoadService.isOwner(id) |
| PUT /loads/{id} | updateLoad(id, req) | `@PreAuthorize("@loadService.isOwner(#id)")` | LoadService.isOwner(id) |
| POST /loads/{id}/publish | publishLoad(id) | `@PreAuthorize("@loadService.isOwner(#id)")` | LoadService.isOwner(id) |
| DELETE /profiles/{id} | deleteProfile(id) | `@PreAuthorize("@profileService.isOwner(#id)")` | ProfileService.isOwner(id) |
| PUT /profiles/{id} | updateProfile(id, req) | `@PreAuthorize("@profileService.isOwner(#id)")` | ProfileService.isOwner(id) |
| DELETE /documents/{id} | deleteDocument(id) | `@PreAuthorize("@documentService.isOwner(#id)")` | DocumentService.isOwner(id) |
| PUT /documents/{id} | updateDocument(id, req) | `@PreAuthorize("@documentService.isOwner(#id)")` | DocumentService.isOwner(id) |

---

## Multi-Tenancy Enforcement

```
TenantContextHolder (per-request context)
└─ Set by JPA interceptor at request start
└─ getTenantId() returns current tenant UUID

LoadService.isOwner(loadId)
├─ Load load = loadRepository.findById(loadId) [may return empty, OK]
├─ if (load.isEmpty()) return false [no resource = unauthorized]
├─ if (load.get().getTenantId().equals(TenantContextHolder.getTenantId())) return true
└─ else return false
```

---

## Error Handling

| Scenario | Response | Reason |
|---|---|---|
| User owns resource, @PreAuthorize passes | 200 OK (or 204 if DELETE) | Authorized, proceed |
| User does NOT own resource | 403 Forbidden + error body | Unauthorized (never 404 — prevents tenant enumeration) |
| Resource does not exist (any user) | 403 Forbidden + error body | Treat as "unauthorized" — consistent response |
| TenantContextHolder not set | 401 Unauthorized | Auth filter failed; user not authenticated |

---

## Database Queries (No Schema Changes)

- No new columns required (tenant_id already present on all tables)
- No new indexes required (tenant_id indexed in multi-column indexes)
- Repository query example: `findById(id)` leverages existing primary key

---

## Scope

**In Scope:**
- 7 endpoints across 3 controllers (LoadController, ProfileController, DocumentController)
- One isOwner() method per service (LoadService, ProfileService, DocumentService)

**Out of Scope:**
- Modifying GET endpoints (read-only, no authorization needed — RLS handles)
- Modifying POST create endpoints (no ownership check needed on new resources)
- Role-based authorization (ADMIN, USER, etc. — INVEST forbids this, use data-driven ownership)

---

## Definition of Done (Architect Sign-Off)

- [ ] Authorization flow diagram (this doc) complete
- [ ] All 7 endpoints mapped to isOwner() calls
- [ ] Service method signatures defined
- [ ] Error response codes specified (403, not 404)
- [ ] TenantContextHolder integration pattern confirmed
- [ ] Ready for Coder: test-first implementation (4 unit tests minimum)

---

**Architect Approval:** READY FOR CODER  
**Next Phase:** Coder writes tests (testUnauthorizedDelete, testAuthorizedDelete, testUnauthorizedUpdate, testAuthorizedUpdate)
