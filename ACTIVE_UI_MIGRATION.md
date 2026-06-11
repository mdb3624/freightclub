# Master UI Migration State Canvas

**Project Target:** Complete UI/UX overhaul of the FreightClub Logistics Platform, cleanly separating mobile operator tools from desktop administrative modules.
**Core Branding Assets:** `docs/standard/brand_assets/web_logo.png` & `docs/standard/brand_assets/web_logo_favicon.png`

---

## 🚦 Dual-Track Pipeline Progress Tracker

- [ ] **STAGE 1: Business Analyst (BA) Sign-off**
  - *Requirement:* Explicitly define business rule profiles separating mobile Carrier constraints from desktop Shipper administrative workflows.
  - *Output Log:* - [ ] **STAGE 2: Architect (ARCH) Sign-off**
  - *Requirement:* Verify database schemas, Flyway migrations, and API payloads support user theme states without blending mobile and desktop telemetry parameters.
  - *Output Log:* - [ ] **STAGE 3: Human Factors Designer (HFD) Sign-off**
  - *Path Context:* Operating from `docs/roles/HUMAN_FACTORS_DESIGNER.md`
  - *Verification Tasks:*
    - [ ] **Carrier Track:** Audit layout against `docs/standard/brand_assets/Carrier Style Guide.md` (Verify `#121212` dark theme, metallic copper accents, pill-shaped geometries, and oversized touch targets).
    - [ ] **Shipper Track:** Audit layout against `docs/standard/brand_assets/Shipper & Administrator Style Guide.md` (Verify `#EFEBE0` cream canvas, white panels, sharp rectangular containers, asymmetric split grid, and "Quiet Hierarchy").
    - [ ] **Field Contract Table:** Complete the field-to-column contract mapping for *both* views using strict PowerShell formatting rules.
  - *Output Log:* - [ ] **STAGE 4: Coder Implementation**
  - *Verification Tasks:*
    - [ ] Implement responsive, touch-friendly components for Carrier mobile views.
    - [ ] Implement dense, high-clarity data grids for Shipper desktop views.
    - [ ] Inject explicit ARIA roles and verify strict compliance with design system hex color codes.
  - *Output Log:* - [ ] **STAGE 5: Reviewer Verification (Playwright E2E Testing)**
  - *Verification Tasks:*
    - [ ] Run mobile visual regression tests. Capture full-page screenshot to: `test-results/evidence/carrier_mobile_final.png`
    - [ ] Run desktop visual regression tests. Capture full-page screenshot to: `test-results/evidence/shipper_desktop_final.png`
  - *Output Log:* - [ ] **STAGE 6: Librarian Merge**
  - *Requirement:* Audit the codebase for directory correctness. Ensure no mobile token rules or assets have leaked into desktop layout containers, close any active CHG-### tickets, and approve the clean merge.
  - *Output Log:* ```

### Why this structure protects your token limit tomorrow:
By presenting the tasks as explicit sub-checkboxes under **Stage 3**, **Stage 4**, and **Stage 5**, your future CrewAI or LangGraph task runners won't have to guess if they are finished. They will read this file, see that *both* tracks require an independent proof check, and log their actions cleanly without spinning in circles or generating unnecessary conversational tokens.