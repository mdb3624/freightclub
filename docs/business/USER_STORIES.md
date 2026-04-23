# 📝 User Stories: Resilience Logistics Platform

## 🏗️ Module 1: Onboarding & Identity (The Foundation)
| ID | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- |
| **US-101** | **As a New User**, I want to register my company using a USDOT number, so that my identity is instantly verified against FMCSA records. | 1. System fetches legal name and authority status from FMCSA API.<br>2. Registration is blocked if USDOT is inactive or invalid. |
| **US-102** | **As a Tenant Admin**, I want to invite team members to my organization, so they can manage loads under our shared RLS boundary. | 1. Invites are linked to the sender's `tenant_id`.<br>2. Invited users inherit the organization's security context. |

## 📦 Module 2: Load Management (The Core)
| ID | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- |
| **US-201** | **As a Shipper**, I want to create a load draft, so I can finalize details before making it visible to carriers. | 1. Load is saved with status `DRAFT`.<br>2. Drafts are invisible to all other tenants. |
| **US-202** | **As a Shipper**, I want to publish a load, so that matching carriers are notified and can begin claiming it. | 1. Status changes to `PUBLISHED`.<br>2. Transactional Outbox event is fired for matching. |

## 🧠 Module 3: Intelligent Auto-Match (The Brain)
| ID | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- |
| **US-301** | **As a Dispatcher**, I want the system to pair my loads with carriers based on equipment and radius, so I don't have to call 50 people. | 1. Uses PostGIS for 50-mile radius matching.<br>2. Supports Equipment Hierarchy (Reefer can take Dry Van). |
| **US-302** | **As a Carrier**, I want to see a "Net Profit" estimate on every match, so I can see if the lane is worth the fuel and time. | 1. Calculation: (Rate - (Distance * CostPerMile)).<br>2. Must maintain Complexity ≤ 10 in the calculator. |

## 🚛 Module 4: Execution & Tracking (The Operation)
| ID | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- |
| **US-401** | **As a Carrier**, I want to claim a load digitally, so that I can secure the freight without waiting for a returned rate-con. | 1. Claiming locks the load to the carrier.<br>2. Status transitions to `CLAIMED` via atomic transaction. |
| **US-402** | **As a Shipper**, I want to track the truck via Geo-fencing, so I know exactly when the load arrives and if detention pay is triggered. | 1. Automatic status update to `ARRIVED` when crossing Geo-fence.<br>2. Timer starts for detention billing after 2 hours. |

## 💰 Module 5: Settlement & Finance (The Value)
| ID | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- |
| **US-501** | **As a Carrier**, I want to upload a BOL via my phone, so that I can trigger the payment process immediately upon delivery. | 1. Support for PWA document capture/upload.<br>2. Status transitions to `DELIVERED` upon document verification. |
| **US-502** | **As a Tenant Auditor**, I want an immutable ledger of all financial events, so I can reconcile my books with zero data-integrity doubts. | 1. All price changes or fee additions are logged to the audit trail.<br>2. Records are protected by append-only RLS policies. |