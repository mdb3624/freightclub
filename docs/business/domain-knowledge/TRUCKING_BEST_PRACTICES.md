# Trucking Industry Domain Knowledge Base (BA Reference)

**Purpose:** A curated, human-reviewed set of trucking-industry facts BA consults before writing Acceptance Criteria for a story. Entries are added deliberately (a research task or CHG ticket), not generated automatically per-story — see `docs/roles/BUSINESS_ANALYST.md` Mandatory Workflow step 3.

**Rule for any AC that cites an entry here:** name the entry directly in the story doc (e.g., "Per KB: carrier-trust-signals"). Don't restate the fact without the pointer — traceability is the point.

**Adding a new entry:** confirm the claim against at least one real, dated source (not a single vendor blog) before adding it here. Log the addition in the story or CHG ticket that prompted it.

---

## carrier-trust-signals

**Topic:** Carrier vetting / carrier discovery UI (any page where a shipper or broker evaluates a carrier)

**Fact:** The baseline trust signals a party evaluating a carrier expects are: MC/DOT authority status (Active/Revoked/Inactive), insurance-on-file verification status, and FMCSA safety rating (Satisfactory/Conditional/Unsatisfactory/Not Rated — "Not Rated" is common for newer/smaller carriers and should not be treated as a red flag). A story that presents carrier cards or profiles for evaluation without at least acknowledging these three fields (even if deferred to Out of Scope) is missing a standard requirement, not making a stylistic choice.

**Source:** [USA Truckload Shipping — Carrier Vetting Process](https://usatruckloadshipping.com/carrier-vetting-process/), [CarrierCheck — Freight Broker's Complete Carrier Vetting Guide 2026](https://carrierchk.com/blog/freight-broker-carrier-vetting-guide), [PFA Protects — Motor Carrier Vetting Guide](https://pfaprotects.com/2025/04/10/how-to-vet-motor-carriers-to-ensure-success/)

**Added:** 2026-07-25, via CHG-863 / US-862 (`docs/changes/CHG-863.md`, `docs/business/stories/US-862_Carrier_Trust_Compliance_Signals.md`) — found retroactively against the already-shipped US-848 Carrier Network Page, which deferred all three fields to Out of Scope with no tracking ticket.

**Applies to stories:** US-848 (retroactively flagged, tracked as CHG-863), US-862 (the story that implements this), and any future carrier-discovery/vetting UI.

---

## load-board-search-filters

**Topic:** Load/carrier search & matching UI

**Fact:** Standard load-board filter sets across the industry are: origin, destination, equipment type, weight, rate-per-mile, and pickup date/timeframe. This is confirmed, not aspirational — matches what shipped in US-848's BR-3 (minus the rating filter, tracked separately per CHG-863).

**Source:** [AltexSoft — Load Boards: Functionality Overview](https://www.altexsoft.com/blog/load-boards/), [FreightWaves Checkpoint — Best Load Boards for Freight Brokers](https://www.freightwaves.com/checkpoint/load-boards-freight-brokers/)

**Added:** 2026-07-25, via the CHG-863 research pass (confirmation, not a new requirement — logged so future BA work doesn't re-derive it).

**Applies to stories:** US-848 and any future load/carrier search UI.
