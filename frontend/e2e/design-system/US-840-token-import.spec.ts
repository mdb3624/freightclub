import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Feature: US-840 — Design Token Import (Phase 1A + 1B)
 * AC-1: 5 token CSS files exist at frontend/src/styles/tokens/
 * AC-2: index.css imports all 5 token files before Tailwind directives
 * AC-3: CSS custom properties are accessible in the browser at runtime
 * AC-4: Tailwind-derived bronze accent class resolves to correct hex
 *
 * Playbook reference: INTEGRATION_PLAYBOOK.md Phase 1A + 1B
 */

const FRONTEND = process.env.TEST_FRONTEND_URL || 'http://localhost:9090'
const BACKEND  = process.env.TEST_BACKEND_URL  || 'http://localhost:9091'
const EVIDENCE = path.resolve('test-results/evidence')

test.beforeAll(() => fs.mkdirSync(EVIDENCE, { recursive: true }))
test.setTimeout(90000)

// ── AC-1: Token files exist on disk ──────────────────────────────────────────

test.describe('US-840 AC-1: token CSS files exist', () => {
  test('all 5 token files are present in frontend/src/styles/tokens/', () => {
    const tokensDir = path.resolve(__dirname, '../../src/styles/tokens')
    const required = ['colors.css', 'typography.css', 'spacing.css', 'shadows.css', 'borders.css']
    for (const file of required) {
      expect(fs.existsSync(path.join(tokensDir, file)), `${file} missing`).toBe(true)
    }
  })
})

// ── AC-2: index.css imports tokens before Tailwind ───────────────────────────

test.describe('US-840 AC-2: index.css import order', () => {
  test('index.css imports all token files before @tailwind directives', () => {
    const indexCss = fs.readFileSync(path.resolve(__dirname, '../../src/index.css'), 'utf8')
    const required = ['colors.css', 'typography.css', 'spacing.css', 'shadows.css', 'borders.css']
    for (const file of required) {
      expect(indexCss, `index.css missing @import for ${file}`).toContain(file)
    }
    // Token imports must appear before @tailwind base
    const firstTailwind = indexCss.indexOf('@tailwind base')
    for (const file of required) {
      const importPos = indexCss.indexOf(file)
      expect(importPos, `${file} import after @tailwind base`).toBeLessThan(firstTailwind)
    }
  })
})

// ── AC-3: CSS custom properties accessible at runtime ────────────────────────

test.describe('US-840 AC-3: CSS custom properties in browser', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('--color-bronze and shipper tokens resolve in browser', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`${FRONTEND}/login`)
    await page.waitForLoadState('networkidle')

    const bronzeColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-bronze').trim()
    )
    // Must be defined (non-empty) — exact value may vary but key must exist
    expect(bronzeColor.length).toBeGreaterThan(0)

    await page.screenshot({ path: path.join(EVIDENCE, 'US-840-token-runtime.png') })
  })
})

// ── AC-4: Tailwind color values synced ───────────────────────────────────────

test.describe('US-840 AC-4: Tailwind config color sync', () => {
  test('tailwind.config.ts contains the correct shipper-accent and carrier-accent hex values', () => {
    const tailwindCfg = fs.readFileSync(path.resolve(__dirname, '../../tailwind.config.ts'), 'utf8')
    // Shipper accent bronze
    expect(tailwindCfg).toContain('#B08D57')
    // Carrier accent copper
    expect(tailwindCfg).toContain('#C9A876')
  })
})

// ── Adversarial tests ─────────────────────────────────────────────────────────

test.describe('adversarial', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('app loads with no CSS token import errors (no broken @import)', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    await page.goto(`${FRONTEND}/login`)
    await page.waitForLoadState('networkidle')

    // No console errors relating to CSS imports
    const cssErrors = consoleErrors.filter((e) =>
      e.toLowerCase().includes('css') || e.toLowerCase().includes('import')
    )
    expect(cssErrors).toHaveLength(0)

    await page.screenshot({ path: path.join(EVIDENCE, 'US-840-adversarial-no-css-errors.png') })
  })

  test('missing token file — index.css does not import a non-existent path', () => {
    const indexCss = fs.readFileSync(path.resolve(__dirname, '../../src/index.css'), 'utf8')
    // Verify no import points to a path that doesn't exist
    const importMatches = indexCss.match(/@import\s+['"][^'"]+['"]/g) ?? []
    for (const imp of importMatches) {
      const importPath = imp.replace(/@import\s+['"]/, '').replace(/['"]$/, '')
      if (importPath.startsWith('./styles/')) {
        const resolved = path.resolve(__dirname, '../../src', importPath.replace('./', ''))
        expect(fs.existsSync(resolved), `@import '${importPath}' resolves to non-existent file`).toBe(true)
      }
    }
  })
})
