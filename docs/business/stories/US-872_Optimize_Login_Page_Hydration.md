# US-872: Optimize Login Page Hydration to <100ms

> **Renumbering Note (CHG-868, 2026-09-01):** Recovered from old **US-756** (Jira FREIG-52 → FREIG-132), whose ID collided with an unrelated `Story_Map.md` Phase 9 entry ("Document Upload (Insurance, CDL, Medical)") — this story was never cataloged there. Content preserved verbatim from the original draft except this note.

**Status:** READY_FOR_DESIGN  
**Priority:** HIGH  
**Effort:** 13 points (8-12 hours)  
**Impact:** Critical performance improvement, reduced bounce rate

---

## User Story

As a **user**, I need the login page to load in under 100ms on first visit so that I can authenticate quickly without waiting for the application to initialize.

---

## Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|-----------|
| AC1 | First hydration completes in <100ms | Lighthouse DevTools measurement |
| AC2 | Login form fully functional and interactive | Manual testing: form submission works |
| AC3 | No 401 errors on initial page load | Network tab shows no auth API calls on `/` route |
| AC4 | Main application loads asynchronously after login | User can interact immediately after auth |
| AC5 | All existing login functionality preserved | Test: password reset, signup, remember me work |
| AC6 | Mobile performance <150ms | DevTools on mobile simulation |
| AC7 | No regression in main app performance | Main bundle size unchanged |
| AC8 | Production deployment with zero downtime | Blue-green deployment verification |

---

## Business Rules

1. **First-time users** must see login page in <100ms (hard requirement)
2. **Repeat visitors** with valid auth cookie bypass login (redirect to dashboard)
3. **Login form** must support: email/password, remember me, password reset
4. **Mobile users** target <150ms (network slower than desktop)
5. **No feature loss** - all auth flows must work identically
6. **Backward compatibility** - main app code unchanged
7. **Rollback plan** required (can switch between old/new app)

---

## Technical Constraints

- **React version:** Keep 18.x (no downgrade)
- **No SSR:** Backend not available for pre-rendering
- **Webpack/Vite:** Stay on Vite (no bundler change)
- **Bundle target:** Login app <15KB uncompressed
- **No breaking changes** to existing APIs or stores
- **Must support:** Chrome 90+, Safari 14+, Firefox 88+

---

## Definition of Done

- [ ] Separate login app created with <15KB bundle
- [ ] DevTools Lighthouse confirms <100ms hydration
- [ ] All AC criteria verified
- [ ] Zero regression tests pass
- [ ] Deployed to production
- [ ] Monitoring shows load time improvement
- [ ] Rollback procedure documented
- [ ] LIBRARIAN sign-off complete

---

## Success Metrics

**Primary:**
- Login page hydration: <100ms (median)
- 95th percentile: <200ms

**Secondary:**
- Bounce rate: -5% (fewer users leaving before login)
- Mobile load time: <150ms
- Core Web Vitals: FCP <1s, LCP <2.5s

---

## Edge Cases

1. User has valid auth cookie → skip login, go to dashboard
2. User with slow network (3G) → graceful degradation, still <150ms
3. User on old browser → fallback to main app, no login optimization
4. Server maintenance → static login page still loads
5. CORS error on auth check → show login form anyway

---

## Notes

- This is the most impactful performance win available (10x faster than current)
- Strategy: Separate minimal app for login, load main app asynchronously post-auth
- No backend changes required (auth flow unchanged)
- Team decision: Option 1 (Separate Login App) chosen for lowest risk + guaranteed success
- ⚠️ **Cross-check before implementation:** `docs/business/stories/US-855_Marketing_Home_Page_And_Login_Modal.md` (DONE) already deleted a standalone `login-app` Vite micro-app that was "never wired into nginx/deployment" and consolidated login into an in-page modal on the main app. This story's "separate login app" strategy may directly conflict with that shipped decision — BA must re-verify scope/relevance before this moves to design, not assume the original 2026-04-era plan still applies.
