# Carrier Design Reference (Quick Navigation)

**For all Owner-Operator stories:** Use these files as your source of truth.

---

## 📋 Master Reference Files

### 1. **Carrier Design System** (Master Design Tokens)
📄 **File:** `docs/standards/CARRIER_DESIGN_SYSTEM.md`  
**Use when:** Starting any new OO story  
**Contains:**
- Color palette (all approved colors)
- Typography system (font sizes, weights)
- Spacing tokens (padding, margins, gaps)
- Component library (button styles, badges, cards)
- Viewport math (40/60 split, no-scroll rules)
- Interaction patterns (modals, tabs, confirmations)

**Copy-paste from here:** Colors, sizes, fonts

---

### 2. **HFD Rules for Carrier Stories** (Process Guide)
📄 **File:** `docs/roles/CARRIER_HFD_RULES.md`  
**Use when:** HFD is designing an OO story  
**Contains:**
- Pre-work gate verification checklist
- 5-phase design workflow
- Mobile device verification protocol (MANDATORY)
- Pitfalls to avoid
- Component reuse checklist
- Sign-off requirements

**Follow this for:** Every single OO story design

---

### 3. **US-730-0 Design Spec** (Real Example)
📄 **File:** `docs/hfd/US-730-0_Carrier_Dashboard_Design_Spec.md`  
**Use when:** You need a complete example  
**Shows:**
- How to structure a design spec
- How to map AC to UI elements
- How to apply design tokens
- How to write mobile verification checklist
- No-scroll dashboard implementation

**Use as template:** Copy structure for new OO stories

---

## 🎯 Quick Start for New OO Stories

### For HFD (Designing)
1. Read: `docs/roles/CARRIER_HFD_RULES.md`
2. Reference: `docs/standards/CARRIER_DESIGN_SYSTEM.md`
3. Example: `docs/hfd/US-730-0_Carrier_Dashboard_Design_Spec.md`
4. Verify: Mobile device testing checklist (from rules)
5. Lock: Add to Jira with sign-off comment

### For CODER (Implementing)
1. Read: Locked design spec (`docs/hfd/US-###_Design_Spec.md`)
2. Reference: `docs/standards/CARRIER_DESIGN_SYSTEM.md` (copy tokens)
3. Test: iOS 375px real device before PR
4. Verify: Touch targets ≥48px, colors match palette

### For REVIEWER (Auditing)
1. Check: Design spec exists and is locked
2. Verify: Mobile constraints followed (no deviations)
3. Test: Touch target sizing (use browser tools)
4. Confirm: Colors match CARRIER_DESIGN_SYSTEM.md
5. Approve: Only if all mobile verification passes

---

## 📌 Key Standards (Remember These)

### Design Tokens (Copy-Paste)
```
Primary Background: #121212
Surface Background: #1A1A1A
Bronze Accent: #B08D57
Success: #27AE60
Warning: #F39C12
Danger: #E74C3C

Font: Sora (display), Inter (body)
Touch Target: 48×48px MINIMUM
Header: 56px
Button: 48px height
Spacing: 8px, 16px, 24px, 32px
```

### Rules (Never Break These)
- ✅ **Mobile First:** iPhone 375px is primary
- ✅ **No Vertical Scroll:** Content fits 100vh (use tabs/modals)
- ✅ **48px Minimum:** All touch targets
- ✅ **Glove-Friendly:** Test with actual gloves
- ✅ **Sunlight Readable:** WCAG AAA contrast (7:1+)
- ✅ **Tap Only:** No swipe, no long-press
- ✅ **Device Verification:** Mandatory before sign-off

### Red Flags (Escalate Immediately)
- ❌ Touch target <48px → HFD rework required
- ❌ Custom color outside palette → CHG ticket required
- ❌ Vertical scroll for hero → Redesign with tabs
- ❌ No mobile device verification → Cannot sign off
- ❌ Design changed mid-CODER phase → CHG ticket + new story

---

## 🔗 Where to Find Things

| Need | File | Location |
|------|------|----------|
| **Colors, fonts, sizes** | CARRIER_DESIGN_SYSTEM.md | docs/standards/ |
| **How to design OO story** | CARRIER_HFD_RULES.md | docs/roles/ |
| **Full design example** | US-730-0_Design_Spec.md | docs/hfd/ |
| **Project-level mandate** | CLAUDE.md | (root, see "CARRIER DESIGN" section) |
| **Story file template** | US-730_Carrier_Dashboard_MVP.md | docs/business/stories/ |

---

## 📊 Checklist: Before Starting Any OO Story

**HFD:**
- [ ] Read CARRIER_HFD_RULES.md (entire file)
- [ ] Read story AC (INVEST standard)
- [ ] Check CARRIER_DESIGN_SYSTEM.md for existing components
- [ ] Plan mobile verification (3 hours budget)
- [ ] Block time for device testing

**CODER:**
- [ ] Read locked design spec completely
- [ ] Copy tokens from CARRIER_DESIGN_SYSTEM.md
- [ ] Set up iPhone 375px test environment
- [ ] Plan Lighthouse testing (LCP <2s)

**REVIEWER:**
- [ ] Read CARRIER_HFD_RULES.md (verification section)
- [ ] Check CARRIER_DESIGN_SYSTEM.md (palette compliance)
- [ ] Test on real device or simulator
- [ ] Measure touch targets (browser tools)

---

## 🚀 Phase 7a & Beyond: Consistency Guaranteed

**With these standards, every OO story will:**
- ✅ Look consistent (same colors, fonts, components)
- ✅ Feel consistent (same interactions, no surprises)
- ✅ Work consistently (mobile-first, glove-friendly, readable)
- ✅ Perform consistently (fast, no jank, <2s load)

**No more one-off designs.** Scaffolding applies to US-730, US-731, Phase 8, Phase 9, etc.

---

## 📞 Questions?

| Question | Answer Location |
|----------|-----------------|
| "What color should I use?" | CARRIER_DESIGN_SYSTEM.md (palette section) |
| "How do I design for OO?" | CARRIER_HFD_RULES.md (workflow section) |
| "What's the viewport math?" | CARRIER_DESIGN_SYSTEM.md (viewport math section) |
| "Do I need to test on device?" | CARRIER_HFD_RULES.md (phase 4: mandatory) |
| "Can I change the design mid-CODER?" | No. CHG ticket + new story required. |
| "What buttons should I use?" | CARRIER_DESIGN_SYSTEM.md (component library) |
| "Do I need 48px touch targets?" | Yes, always. Non-negotiable. |
| "Can I use a different font?" | No. Sora + Inter only. CHG required to change. |

---

**Status:** REFERENCE GUIDE (Updated 2026-06-23)  
**Authority:** HFD + CLAUDE.md Sequential Lock Protocol  
**Applies To:** All Owner-Operator (US-730+) stories
